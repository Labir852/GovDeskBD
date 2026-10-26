export type TaxSlabInput = {
  limitAmount: number | null;
  rate: number;
  label?: string | null;
};

export type TaxStrategy = {
  expenseDivisor: number;
  salesGrossProfitRatePercent: number;
  openingCapitalMultiplier: number;
  assetFields: string[];
  liabilityFields: string[];
};

export type TaxpayerCategory =
  | 'general'
  | 'female_senior'
  | 'third_gender_disabled'
  | 'freedom_july_fighter';

export type TaxpayerStatus = 'regular' | 'new';

export type TaxFiscalYearRule = {
  id?: string;
  year: string;
  label: string;
  description?: string | null;
  isActive?: boolean;
  strategy?: Partial<TaxStrategy> | null;
  femaleSeniorThreshold?: number | null;
  thirdGenderDisabledThreshold?: number | null;
  freedomJulyFighterThreshold?: number | null;
  disabledChildAllowance?: number | null;
  minTaxStandard?: number | null;
  minTaxNewTaxpayer?: number | null;
  slabs: Array<{
    id?: string;
    sequence?: number;
    limitAmount: number | null;
    rate: number;
    label?: string | null;
  }>;
};

export type CalculatorInput = {
  mode: 'profit' | 'tax';
  taxInput?: string | number;
  profitInput?: string | number;
  slabs: TaxSlabInput[];
  strategy?: Partial<TaxStrategy> | null;
  taxpayerCategory?: TaxpayerCategory;
  hasDisabledChild?: boolean;
  disabledChildCount?: number;
  taxpayerStatus?: TaxpayerStatus;
  taxRebate?: string | number;
  fiscalYear?: Partial<TaxFiscalYearRule>;
  assets: Record<string, string | number | undefined>;
  liabilities: Record<string, string | number | undefined>;
  prevYearNetWealth?: string | number;
  furnitureOfOffice?: string | number;
};

export const defaultTaxStrategy: TaxStrategy = {
  expenseDivisor: 2,
  salesGrossProfitRatePercent: 15,
  openingCapitalMultiplier: 5,
  assetFields: [
    'land',
    'investment',
    'motorVehicle',
    'ornaments',
    'furniture',
    'electronics',
    'lastYearSavings',
    'bankSavings',
  ],
  liabilityFields: ['assetMortgage', 'borrow', 'loan'],
};

export const defaultTaxFiscalYears: TaxFiscalYearRule[] = [
  {
    year: '2025-2026',
    label: 'FY 2025-26',
    description: 'Bangladesh business income tax slabs for assessment year 2025-26.',
    strategy: defaultTaxStrategy,
    femaleSeniorThreshold: 400000,
    thirdGenderDisabledThreshold: 475000,
    freedomJulyFighterThreshold: 500000,
    disabledChildAllowance: 50000,
    minTaxStandard: 5000,
    minTaxNewTaxpayer: 1000,
    slabs: [
      { limitAmount: 350000, rate: 0, label: 'First 350,000' },
      { limitAmount: 100000, rate: 0.05, label: 'Next 100,000' },
      { limitAmount: 400000, rate: 0.1, label: 'Next 400,000' },
      { limitAmount: 500000, rate: 0.15, label: 'Next 500,000' },
      { limitAmount: 500000, rate: 0.2, label: 'Next 500,000' },
      { limitAmount: 2000000, rate: 0.25, label: 'Next 2,000,000' },
      { limitAmount: null, rate: 0.3, label: 'Remaining' },
    ],
  },
  {
    year: '2026-2027',
    label: 'FY 2026-27',
    description: 'Bangladesh business income tax slabs for assessment year 2026-27 (Circular 2026-2027).',
    strategy: defaultTaxStrategy,
    femaleSeniorThreshold: 425000,
    thirdGenderDisabledThreshold: 500000,
    freedomJulyFighterThreshold: 525000,
    disabledChildAllowance: 50000,
    minTaxStandard: 5000,
    minTaxNewTaxpayer: 1000,
    slabs: [
      { limitAmount: 375000, rate: 0, label: 'First 375,000' },
      { limitAmount: 300000, rate: 0.1, label: 'Next 300,000' },
      { limitAmount: 400000, rate: 0.15, label: 'Next 400,000' },
      { limitAmount: 500000, rate: 0.2, label: 'Next 500,000' },
      { limitAmount: 2000000, rate: 0.25, label: 'Next 2,000,000' },
      { limitAmount: null, rate: 0.3, label: 'Remaining' },
    ],
  },
];

const n = (value: string | number | undefined) => Number.parseFloat(String(value ?? '')) || 0;

export const normalizeStrategy = (strategy?: Partial<TaxStrategy> | null): TaxStrategy => ({
  ...defaultTaxStrategy,
  ...(strategy || {}),
  assetFields: Array.isArray(strategy?.assetFields) ? strategy.assetFields : defaultTaxStrategy.assetFields,
  liabilityFields: Array.isArray(strategy?.liabilityFields)
    ? strategy.liabilityFields
    : defaultTaxStrategy.liabilityFields,
});

export function getTaxFreeThreshold(
  fiscalYear?: Partial<TaxFiscalYearRule> | null,
  category: TaxpayerCategory = 'general',
  hasDisabledChild = false,
  disabledChildCount = 0
): number {
  const baseSlabLimit = fiscalYear?.slabs?.[0]?.limitAmount ?? 375000;

  let threshold = baseSlabLimit;
  if (category === 'female_senior') {
    threshold = fiscalYear?.femaleSeniorThreshold ?? 425000;
  } else if (category === 'third_gender_disabled') {
    threshold = fiscalYear?.thirdGenderDisabledThreshold ?? 500000;
  } else if (category === 'freedom_july_fighter') {
    threshold = fiscalYear?.freedomJulyFighterThreshold ?? 525000;
  }

  if (hasDisabledChild && disabledChildCount > 0) {
    const allowancePerChild = fiscalYear?.disabledChildAllowance ?? 50000;
    threshold += disabledChildCount * allowancePerChild;
  }

  return threshold;
}

export function getEffectiveSlabs(
  fiscalYear?: Partial<TaxFiscalYearRule> | null,
  category: TaxpayerCategory = 'general',
  hasDisabledChild = false,
  disabledChildCount = 0
): TaxSlabInput[] {
  const originalSlabs = fiscalYear?.slabs || [];
  if (originalSlabs.length === 0) return [];

  const threshold = getTaxFreeThreshold(fiscalYear, category, hasDisabledChild, disabledChildCount);

  return originalSlabs.map((slab, idx) => {
    if (idx === 0) {
      return {
        limitAmount: threshold,
        rate: 0,
        label: `Tax-free up to ৳${threshold.toLocaleString('en-IN')}`,
      };
    }
    return {
      limitAmount: slab.limitAmount,
      rate: slab.rate,
      label: slab.label,
    };
  });
}

export function calcTax(income: number, slabs: TaxSlabInput[]) {
  let tax = 0;
  let remaining = income;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const taxable = slab.limitAmount === null ? remaining : Math.min(remaining, slab.limitAmount);
    tax += taxable * slab.rate;
    remaining -= taxable;
  }

  return tax;
}

export function incomeFromTax(targetTax: number, slabs: TaxSlabInput[]) {
  if (targetTax <= 0) return slabs[0]?.limitAmount ?? 0;

  let cumulativeTax = 0;
  let cumulativeIncome = 0;

  for (const slab of slabs) {
    if (slab.rate === 0) {
      cumulativeIncome += slab.limitAmount ?? 0;
      continue;
    }

    const maxTaxInSlab = slab.limitAmount === null ? Number.POSITIVE_INFINITY : slab.limitAmount * slab.rate;

    if (targetTax <= cumulativeTax + maxTaxInSlab || slab.limitAmount === null) {
      return cumulativeIncome + (targetTax - cumulativeTax) / slab.rate;
    }

    cumulativeTax += maxTaxInSlab;
    cumulativeIncome += slab.limitAmount;
  }

  return cumulativeIncome;
}

export function taxBreakdown(income: number, slabs: TaxSlabInput[]) {
  const rows = [];
  let remaining = income;
  let cumulativeIncome = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const amount = slab.limitAmount === null ? remaining : Math.min(remaining, slab.limitAmount);

    rows.push({
      from: cumulativeIncome,
      to: cumulativeIncome + amount,
      rate: slab.rate,
      tax: amount * slab.rate,
      label: slab.label,
    });

    cumulativeIncome += amount;
    remaining -= amount;
  }

  return rows;
}

export function calculateBusinessTax(input: CalculatorInput) {
  const strategy = normalizeStrategy(input.strategy || input.fiscalYear?.strategy);
  const taxpayerCategory: TaxpayerCategory = input.taxpayerCategory || 'general';
  const taxpayerStatus: TaxpayerStatus = input.taxpayerStatus || 'regular';
  const hasDisabledChild = Boolean(input.hasDisabledChild);
  const disabledChildCount = hasDisabledChild ? Math.max(1, Number(input.disabledChildCount) || 1) : 0;

  const fiscalYearRule: Partial<TaxFiscalYearRule> = input.fiscalYear || {
    slabs: input.slabs,
    strategy: input.strategy,
  };

  const effectiveSlabs = input.fiscalYear
    ? getEffectiveSlabs(input.fiscalYear, taxpayerCategory, hasDisabledChild, disabledChildCount)
    : input.slabs;

  const taxFreeThreshold = getTaxFreeThreshold(
    fiscalYearRule,
    taxpayerCategory,
    hasDisabledChild,
    disabledChildCount
  );

  const minTaxStandard = fiscalYearRule.minTaxStandard ?? 5000;
  const minTaxNewTaxpayer = fiscalYearRule.minTaxNewTaxpayer ?? 1000;
  const applicableMinTax = taxpayerStatus === 'new' ? minTaxNewTaxpayer : minTaxStandard;

  const netProfit =
    input.mode === 'tax'
      ? incomeFromTax(n(input.taxInput), effectiveSlabs)
      : n(input.profitInput);

  const grossTax = input.mode === 'tax' ? n(input.taxInput) : calcTax(netProfit, effectiveSlabs);
  const taxRebate = n(input.taxRebate);
  const netTaxAfterRebate = Math.max(0, grossTax - taxRebate);

  // Income Tax Circular 2026-2027 Rule:
  // If income > tax-free threshold, minimum tax applies (5,000 standard, 1,000 for new taxpayers)
  // Even if calculated tax after rebate is lower, zero, or negative.
  const exceedsThreshold = netProfit > taxFreeThreshold;
  let taxAmount = 0;
  let minTaxApplied = false;

  if (input.mode === 'tax') {
    taxAmount = n(input.taxInput);
    minTaxApplied = taxAmount === applicableMinTax && exceedsThreshold;
  } else {
    if (!exceedsThreshold) {
      taxAmount = 0;
      minTaxApplied = false;
    } else {
      if (netTaxAfterRebate < applicableMinTax) {
        taxAmount = applicableMinTax;
        minTaxApplied = true;
      } else {
        taxAmount = netTaxAfterRebate;
        minTaxApplied = false;
      }
    }
  }

  const expense = netProfit / strategy.expenseDivisor;
  const grossProfit = netProfit + expense;
  const sale = (grossProfit * 100) / strategy.salesGrossProfitRatePercent;
  const openingCapital = netProfit * strategy.openingCapitalMultiplier;

  const assetTotal = strategy.assetFields.reduce((sum, key) => sum + n(input.assets[key]), 0);
  const liabilityTotal = strategy.liabilityFields.reduce((sum, key) => sum + n(input.liabilities[key]), 0);

  const grossWealth = openingCapital + assetTotal;
  const thisYearNetWealth = grossWealth + liabilityTotal;
  const changeInNetWealth = thisYearNetWealth - n(input.prevYearNetWealth);
  const withdrawal = netProfit - changeInNetWealth;
  const cashInHand = openingCapital + netProfit - withdrawal - n(input.furnitureOfOffice);

  return {
    netProfit,
    taxAmount,
    grossTax,
    taxRebate,
    taxFreeThreshold,
    applicableMinTax,
    minTaxApplied,
    exceedsThreshold,
    taxpayerCategory,
    taxpayerStatus,
    disabledChildAllowanceApplied: hasDisabledChild ? disabledChildCount * (fiscalYearRule.disabledChildAllowance ?? 50000) : 0,
    expense,
    grossProfit,
    sale,
    openingCapital,
    grossWealth,
    totalLiabilities: liabilityTotal,
    thisYearNetWealth,
    changeInNetWealth,
    withdrawal,
    cashInHand,
    breakdown: taxBreakdown(netProfit, effectiveSlabs),
    effectiveSlabs,
  };
}

export function fmtBDT(value: number | null | undefined) {
  if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) return '-';
  const rounded = Math.round(value);
  const abs = Math.abs(rounded).toLocaleString('en-IN');
  return `${rounded < 0 ? '- ' : ''}৳${abs}`;
}
