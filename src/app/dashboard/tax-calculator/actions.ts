'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { defaultTaxFiscalYears, defaultTaxStrategy } from '@/lib/tax-calculator';

export async function ensureDefaultTaxRules() {
  const count = await prisma.taxFiscalYear.count();

  if (count > 0) return;

  for (const fiscalYear of defaultTaxFiscalYears) {
    await prisma.taxFiscalYear.create({
      data: {
        year: fiscalYear.year,
        label: fiscalYear.label,
        description: fiscalYear.description,
        strategy: fiscalYear.strategy,
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
}

export async function getTaxFiscalYears() {
  await ensureDefaultTaxRules();

  return prisma.taxFiscalYear.findMany({
    where: { isActive: true },
    orderBy: { year: 'desc' },
    include: {
      slabs: { orderBy: { sequence: 'asc' } },
    },
  });
}

export async function getAllTaxFiscalYears() {
  await ensureDefaultTaxRules();

  return prisma.taxFiscalYear.findMany({
    orderBy: { year: 'desc' },
    include: {
      slabs: { orderBy: { sequence: 'asc' } },
    },
  });
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

function parseStrategy(raw: string) {
  if (!raw.trim()) return defaultTaxStrategy;

  const parsed = JSON.parse(raw);

  return {
    ...defaultTaxStrategy,
    ...parsed,
    assetFields: Array.isArray(parsed.assetFields) ? parsed.assetFields : defaultTaxStrategy.assetFields,
    liabilityFields: Array.isArray(parsed.liabilityFields)
      ? parsed.liabilityFields
      : defaultTaxStrategy.liabilityFields,
  };
}

export async function createTaxFiscalYear(formData: FormData) {
  try {
    const year = String(formData.get('year') || '').trim();
    const label = String(formData.get('label') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const slabs = parseSlabs(formData);
    const strategy = parseStrategy(String(formData.get('strategy') || ''));

    if (!year || !label) {
      return { success: false, error: 'Fiscal year and label are required.' };
    }

    const fiscalYear = await prisma.taxFiscalYear.create({
      data: {
        year,
        label,
        description: description || null,
        strategy,
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
    const year = String(formData.get('year') || '').trim();
    const label = String(formData.get('label') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const slabs = parseSlabs(formData);
    const strategy = parseStrategy(String(formData.get('strategy') || ''));

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
