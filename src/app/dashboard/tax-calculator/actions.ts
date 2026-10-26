'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { defaultTaxFiscalYears, defaultTaxStrategy } from '@/lib/tax-calculator';

export async function ensureDefaultTaxRules() {
  try {
    if (!prisma.taxFiscalYear) {
      console.warn('TaxFiscalYear model not available in Prisma client');
      return;
    }

    const count = await prisma.taxFiscalYear.count();

    if (count > 0) return;

    for (const fiscalYear of defaultTaxFiscalYears) {
      await prisma.taxFiscalYear.create({
        data: {
          year: fiscalYear.year,
          label: fiscalYear.label,
          description: fiscalYear.description,
          strategy: fiscalYear.strategy ? (fiscalYear.strategy as any) : undefined,
          femaleSeniorThreshold: fiscalYear.femaleSeniorThreshold,
          thirdGenderDisabledThreshold: fiscalYear.thirdGenderDisabledThreshold,
          freedomJulyFighterThreshold: fiscalYear.freedomJulyFighterThreshold,
          disabledChildAllowance: fiscalYear.disabledChildAllowance ?? 50000,
          minTaxStandard: fiscalYear.minTaxStandard ?? 5000,
          minTaxNewTaxpayer: fiscalYear.minTaxNewTaxpayer ?? 1000,
          slabs: {
            create: fiscalYear.slabs.map((slab, index) => ({
              sequence: index + 1,
              limitAmount: slab.limitAmount,
              rate: slab.rate,
              label: slab.label,
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring default tax rules:', error);
  }
}

export async function getTaxFiscalYears() {
  try {
    await ensureDefaultTaxRules();

    if (!prisma.taxFiscalYear) {
      console.warn('TaxFiscalYear model not available');
      return [];
    }

    return await prisma.taxFiscalYear.findMany({
      where: { isActive: true },
      orderBy: { year: 'desc' },
      include: {
        slabs: { orderBy: { sequence: 'asc' } },
      },
    });
  } catch (error) {
    console.error('Error fetching tax fiscal years:', error);
    return [];
  }
}

export async function getAllTaxFiscalYears() {
  try {
    await ensureDefaultTaxRules();

    if (!prisma.taxFiscalYear) {
      console.warn('TaxFiscalYear model not available');
      return [];
    }

    return await prisma.taxFiscalYear.findMany({
      orderBy: { year: 'desc' },
      include: {
        slabs: { orderBy: { sequence: 'asc' } },
      },
    });
  } catch (error) {
    console.error('Error fetching all tax fiscal years:', error);
    return [];
  }
}

function parseSlabs(raw: string | FormData) {
  let slabs: Array<{ limitAmount?: string | number | null; rate?: string | number; label?: string | null }> = [];

  if (raw instanceof FormData) {
    const limitAmounts = raw.getAll('slabLimitAmount');
    const rates = raw.getAll('slabRate');
    const labels = raw.getAll('slabLabel');
    const rows = Math.max(limitAmounts.length, rates.length, labels.length);

    for (let index = 0; index < rows; index += 1) {
      const limitValue = String(limitAmounts[index] || '').trim();
      const rateValue = String(rates[index] || '').trim();
      const labelValue = String(labels[index] || '').trim();

      if (!limitValue && !rateValue && !labelValue) {
        continue;
      }

      slabs.push({
        limitAmount: limitValue === '' ? null : limitValue,
        rate: rateValue,
        label: labelValue || null,
      });
    }
  } else {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Slabs must be a JSON array.');
    }

    slabs = parsed.map((slab) => ({
      limitAmount: slab.limitAmount === null || slab.limitAmount === '' ? null : slab.limitAmount,
      rate: slab.rate,
      label: slab.label ?? null,
    }));
  }

  if (slabs.length === 0) {
    throw new Error('At least one tax slab is required.');
  }

  return slabs.map((slab, index) => {
    const limitAmount = slab.limitAmount === null || slab.limitAmount === '' ? null : Number(slab.limitAmount);
    const rate = Number(slab.rate);

    if (limitAmount !== null && (!Number.isFinite(limitAmount) || limitAmount < 0)) {
      throw new Error(`Invalid limitAmount at slab ${index + 1}.`);
    }

    if (!Number.isFinite(rate) || rate < 0) {
      throw new Error(`Invalid rate at slab ${index + 1}.`);
    }

    return {
      sequence: index + 1,
      limitAmount,
      rate,
      label: slab.label ? String(slab.label) : null,
    };
  });
}

function parseStrategy(raw: string | FormData) {
  if (raw instanceof FormData) {
    const rawJson = raw.get('strategy')?.toString()?.trim();
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        return {
          ...defaultTaxStrategy,
          ...parsed,
          assetFields: Array.isArray(parsed.assetFields) ? parsed.assetFields : defaultTaxStrategy.assetFields,
          liabilityFields: Array.isArray(parsed.liabilityFields)
            ? parsed.liabilityFields
            : defaultTaxStrategy.liabilityFields,
        };
      } catch {}
    }

    const expenseDivisor = raw.get('expenseDivisor') ? Number(raw.get('expenseDivisor')) : defaultTaxStrategy.expenseDivisor;
    const salesGrossProfitRatePercent = raw.get('salesGrossProfitRatePercent') ? Number(raw.get('salesGrossProfitRatePercent')) : defaultTaxStrategy.salesGrossProfitRatePercent;
    const openingCapitalMultiplier = raw.get('openingCapitalMultiplier') ? Number(raw.get('openingCapitalMultiplier')) : defaultTaxStrategy.openingCapitalMultiplier;

    return {
      ...defaultTaxStrategy,
      expenseDivisor: Number.isFinite(expenseDivisor) && expenseDivisor > 0 ? expenseDivisor : defaultTaxStrategy.expenseDivisor,
      salesGrossProfitRatePercent: Number.isFinite(salesGrossProfitRatePercent) && salesGrossProfitRatePercent > 0 ? salesGrossProfitRatePercent : defaultTaxStrategy.salesGrossProfitRatePercent,
      openingCapitalMultiplier: Number.isFinite(openingCapitalMultiplier) && openingCapitalMultiplier > 0 ? openingCapitalMultiplier : defaultTaxStrategy.openingCapitalMultiplier,
    };
  }

  if (!raw.trim()) return defaultTaxStrategy;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultTaxStrategy,
      ...parsed,
      assetFields: Array.isArray(parsed.assetFields) ? parsed.assetFields : defaultTaxStrategy.assetFields,
      liabilityFields: Array.isArray(parsed.liabilityFields)
        ? parsed.liabilityFields
        : defaultTaxStrategy.liabilityFields,
    };
  } catch {
    return defaultTaxStrategy;
  }
}

export async function createTaxFiscalYear(formData: FormData) {
  try {
    if (!prisma.taxFiscalYear) {
      return { success: false, error: 'TaxFiscalYear model not available.' };
    }

    const year = String(formData.get('year') || '').trim();
    const label = String(formData.get('label') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const slabs = parseSlabs(formData);
    const strategy = parseStrategy(formData);

    const femaleSeniorThreshold = formData.get('femaleSeniorThreshold')
      ? Number(formData.get('femaleSeniorThreshold'))
      : null;
    const thirdGenderDisabledThreshold = formData.get('thirdGenderDisabledThreshold')
      ? Number(formData.get('thirdGenderDisabledThreshold'))
      : null;
    const freedomJulyFighterThreshold = formData.get('freedomJulyFighterThreshold')
      ? Number(formData.get('freedomJulyFighterThreshold'))
      : null;
    const disabledChildAllowance = formData.get('disabledChildAllowance')
      ? Number(formData.get('disabledChildAllowance'))
      : 50000;
    const minTaxStandard = formData.get('minTaxStandard')
      ? Number(formData.get('minTaxStandard'))
      : 5000;
    const minTaxNewTaxpayer = formData.get('minTaxNewTaxpayer')
      ? Number(formData.get('minTaxNewTaxpayer'))
      : 1000;

    if (!year || !label) {
      return { success: false, error: 'Fiscal year and label are required.' };
    }

    const fiscalYear = await prisma.taxFiscalYear.create({
      data: {
        year,
        label,
        description: description || null,
        strategy,
        femaleSeniorThreshold,
        thirdGenderDisabledThreshold,
        freedomJulyFighterThreshold,
        disabledChildAllowance,
        minTaxStandard,
        minTaxNewTaxpayer,
        isActive: formData.get('isActive') !== 'false',
        slabs: { create: slabs },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'TaxFiscalYear',
        entityId: fiscalYear.id,
        details: { year, label },
      },
    });

    revalidatePath('/dashboard/tax-calculator');
    revalidatePath('/dashboard/tax-calculator/rules');
    return { success: true, fiscalYearId: fiscalYear.id };
  } catch (error) {
    console.error('Failed to create tax fiscal year:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create fiscal year.',
    };
  }
}

export async function updateTaxFiscalYear(id: string, formData: FormData) {
  try {
    if (!prisma.taxFiscalYear) {
      return { success: false, error: 'TaxFiscalYear model not available.' };
    }

    const year = String(formData.get('year') || '').trim();
    const label = String(formData.get('label') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const slabs = parseSlabs(formData);
    const strategy = parseStrategy(formData);

    const femaleSeniorThreshold = formData.get('femaleSeniorThreshold')
      ? Number(formData.get('femaleSeniorThreshold'))
      : null;
    const thirdGenderDisabledThreshold = formData.get('thirdGenderDisabledThreshold')
      ? Number(formData.get('thirdGenderDisabledThreshold'))
      : null;
    const freedomJulyFighterThreshold = formData.get('freedomJulyFighterThreshold')
      ? Number(formData.get('freedomJulyFighterThreshold'))
      : null;
    const disabledChildAllowance = formData.get('disabledChildAllowance')
      ? Number(formData.get('disabledChildAllowance'))
      : 50000;
    const minTaxStandard = formData.get('minTaxStandard')
      ? Number(formData.get('minTaxStandard'))
      : 5000;
    const minTaxNewTaxpayer = formData.get('minTaxNewTaxpayer')
      ? Number(formData.get('minTaxNewTaxpayer'))
      : 1000;

    if (!year || !label) {
      return { success: false, error: 'Fiscal year and label are required.' };
    }

    const fiscalYear = await prisma.$transaction(async (tx) => {
      await tx.taxSlab.deleteMany({ where: { fiscalYearId: id } });

      return tx.taxFiscalYear.update({
        where: { id },
        data: {
          year,
          label,
          description: description || null,
          strategy,
          femaleSeniorThreshold,
          thirdGenderDisabledThreshold,
          freedomJulyFighterThreshold,
          disabledChildAllowance,
          minTaxStandard,
          minTaxNewTaxpayer,
          isActive: formData.get('isActive') === 'true',
          slabs: { create: slabs },
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'TaxFiscalYear',
        entityId: fiscalYear.id,
        details: { year, label },
      },
    });

    revalidatePath('/dashboard/tax-calculator');
    revalidatePath('/dashboard/tax-calculator/rules');
    return { success: true };
  } catch (error) {
    console.error('Failed to update tax fiscal year:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update fiscal year.',
    };
  }
}
