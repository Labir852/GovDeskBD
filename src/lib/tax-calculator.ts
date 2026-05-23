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

export type CalculatorInput = {
  mode: 'profit' | 'tax';
  taxInput?: string | number;
  profitInput?: string | number;
  slabs: TaxSlabInput[];
  strategy?: Partial<TaxStrategy> | null;
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

export const defaultTaxFiscalYears = [
  {
    year: '2025-2026',
    label: 'FY 2025-26',
    description: 'Bangladesh business income tax slabs for assessment year 2025-26.',
    strategy: defaultTaxStrategy,
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
    description: 'Bangladesh business income tax slabs for assessment year 2026-27.',
    strategy: defaultTaxStrategy,
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

const normalizeStrategy = (strategy?: Partial<TaxStrategy> | null): TaxStrategy => ({
  ...defaultTaxStrategy,
  ...(strategy || {}),
  assetFields: Array.isArray(strategy?.assetFields) ? strategy.assetFields : defaultTaxStrategy.assetFields,
  liabilityFields: Array.isArray(strategy?.liabilityFields)
    ? strategy.liabilityFields
    : defaultTaxStrategy.liabilityFields,
});

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
  const strategy = normalizeStrategy(input.strategy);
  const netProfit =
    input.mode === 'tax'
      ? incomeFromTax(n(input.taxInput), input.slabs)
      : n(input.profitInput);
  const taxAmount = input.mode === 'tax' ? n(input.taxInput) : calcTax(netProfit, input.slabs);

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
    breakdown: taxBreakdown(netProfit, input.slabs),
  };
}

export function fmtBDT(value: number | null | undefined) {
  if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) return '-';
  const rounded = Math.round(value);
  const abs = Math.abs(rounded).toLocaleString('en-IN');
  return `${rounded < 0 ? '- ' : ''}৳${abs}`;
}
