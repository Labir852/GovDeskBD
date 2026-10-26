'use client';

import { useId, useMemo, useState } from 'react';
import {
  Calculator,
  Landmark,
  WalletCards,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  calculateBusinessTax,
  defaultTaxStrategy,
  fmtBDT,
  getTaxFreeThreshold,
  TaxFiscalYearRule,
  TaxpayerCategory,
  TaxpayerStatus,
  TaxStrategy,
} from '@/lib/tax-calculator';

type TaxCalculatorClientProps = {
  fiscalYears: TaxFiscalYearRule[];
};

const assetFields = [
  ['land', 'Land'],
  ['investment', 'Investment'],
  ['motorVehicle', 'Motor Vehicle'],
  ['ornaments', 'Ornaments'],
  ['furniture', 'Furniture'],
  ['electronics', 'Electronics'],
  ['lastYearSavings', 'Last Year Savings'],
  ['bankSavings', 'Bank Savings'],
] as const;

const liabilityFields = [
  ['assetMortgage', 'Asset Mortgage'],
  ['borrow', 'Borrow'],
  ['loan', 'Loan'],
] as const;

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const id = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          ৳
        </span>
        <Input
          id={id}
          inputMode="decimal"
          min="0"
          placeholder="0"
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-8"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TaxCalculatorClient({ fiscalYears }: TaxCalculatorClientProps) {
  const [fiscalYearId, setFiscalYearId] = useState(fiscalYears[0]?.id || fiscalYears[0]?.year || '');
  const [mode, setMode] = useState<'profit' | 'tax'>('profit');
  const [profitInput, setProfitInput] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const [taxRebate, setTaxRebate] = useState('');

  // Taxpayer Category & Parameters (Income Tax Circular 2026-2027)
  const [taxpayerCategory, setTaxpayerCategory] = useState<TaxpayerCategory>('general');
  const [hasDisabledChild, setHasDisabledChild] = useState(false);
  const [disabledChildCount, setDisabledChildCount] = useState('1');
  const [taxpayerStatus, setTaxpayerStatus] = useState<TaxpayerStatus>('regular');

  const [prevYearNetWealth, setPrevYearNetWealth] = useState('');
  const [furnitureOfOffice, setFurnitureOfOffice] = useState('');
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [liabilities, setLiabilities] = useState<Record<string, string>>({});

  const fiscalYear = fiscalYears.find((item) => (item.id || item.year) === fiscalYearId) || fiscalYears[0];
  const strategy = { ...defaultTaxStrategy, ...(fiscalYear?.strategy || {}) };
  const hasInput = mode === 'profit' ? Boolean(profitInput) : Boolean(taxInput);

  // Computed current tax-free threshold for live display
  const currentThreshold = useMemo(() => {
    if (!fiscalYear) return 0;
    return getTaxFreeThreshold(
      fiscalYear,
      taxpayerCategory,
      hasDisabledChild,
      hasDisabledChild ? Number(disabledChildCount) || 1 : 0
    );
  }, [fiscalYear, taxpayerCategory, hasDisabledChild, disabledChildCount]);

  const applicableMinTax = useMemo(() => {
    if (!fiscalYear) return 5000;
    return taxpayerStatus === 'new'
      ? fiscalYear.minTaxNewTaxpayer ?? 1000
      : fiscalYear.minTaxStandard ?? 5000;
  }, [fiscalYear, taxpayerStatus]);

  const result = useMemo(() => {
    if (!fiscalYear || !hasInput) return null;

    return calculateBusinessTax({
      mode,
      profitInput,
      taxInput,
      slabs: fiscalYear.slabs,
      strategy,
      taxpayerCategory,
      hasDisabledChild,
      disabledChildCount: hasDisabledChild ? Number(disabledChildCount) || 1 : 0,
      taxpayerStatus,
      taxRebate,
      fiscalYear,
      assets,
      liabilities,
      prevYearNetWealth,
      furnitureOfOffice,
    });
  }, [
    assets,
    disabledChildCount,
    fiscalYear,
    furnitureOfOffice,
    hasDisabledChild,
    hasInput,
    liabilities,
    mode,
    prevYearNetWealth,
    profitInput,
    strategy,
    taxInput,
    taxRebate,
    taxpayerCategory,
    taxpayerStatus,
  ]);

  const updateAsset = (key: string, value: string) => setAssets((current) => ({ ...current, [key]: value }));
  const updateLiability = (key: string, value: string) =>
    setLiabilities((current) => ({ ...current, [key]: value }));
  const clearAmounts = () => {
    setProfitInput('');
    setTaxInput('');
    setTaxRebate('');
    setAssets({});
    setLiabilities({});
    setPrevYearNetWealth('');
    setFurnitureOfOffice('');
  };

  if (fiscalYears.length === 0) {
    return (
      <Card className="border-border bg-card/90">
        <CardContent className="p-8 text-center text-muted-foreground">
          Add a fiscal year rule before using the calculator.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(350px,0.85fr)_minmax(0,1.4fr)] animate-fade-in-up">
      <div className="space-y-6">
        {/* Main Inputs Card */}
        <Card className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-[1.5rem]">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Calculation setup
                </CardTitle>
                <CardDescription>
                  Choose the tax year and taxpayer details, then enter an amount to see an estimate.
                </CardDescription>
              </div>
              <button
                type="button"
                onClick={clearAmounts}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Clear all entered amounts"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear amounts
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Fiscal Year */}
            <div className="space-y-2">
              <Label htmlFor="tax-fiscal-year">Fiscal year</Label>
              <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                <SelectTrigger id="tax-fiscal-year">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((item) => (
                    <SelectItem key={item.id || item.year} value={item.id || item.year}>
                      {item.label} ({item.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fiscalYear?.description && <p className="text-xs text-muted-foreground">{fiscalYear.description}</p>}
            </div>

            {/* Separated Taxpayer Category Selection */}
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxpayer-category" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Taxpayer Category (করদাতার শ্রেণি)
                </Label>
                <Badge variant="outline" className="text-[11px] font-semibold bg-background">
                  Limit: {fmtBDT(currentThreshold)}
                </Badge>
              </div>

              <Select
                value={taxpayerCategory}
                onValueChange={(val) => setTaxpayerCategory(val as TaxpayerCategory)}
              >
                <SelectTrigger id="taxpayer-category" className="bg-background">
                  <SelectValue placeholder="Select taxpayer category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    General / Male Taxpayer (সাধারণ / পুরুষ করদাতা)
                  </SelectItem>
                  <SelectItem value="female_senior">
                    Female & 65+ Years Taxpayer (মহিলা ও ৬৫+ বছর করদাতা)
                  </SelectItem>
                  <SelectItem value="third_gender_disabled">
                    Third Gender & Disabled (তৃতীয় লিঙ্গ ও প্রতিবন্ধী ব্যক্তি)
                  </SelectItem>
                  <SelectItem value="freedom_july_fighter">
                    Freedom Fighter & July Fighter (বীর মুক্তিযোদ্ধা ও জুলাই যোদ্ধা)
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Disabled Child/Dependent Checkbox */}
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="disabledChildToggle" className="text-xs font-medium cursor-pointer">
                      Parent / Guardian of Disabled Person
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      প্রতিবন্ধী ব্যক্তির পিতা/মাতা/আইনানুগ অভিভাবক (+৳৫০,০০০)
                    </p>
                  </div>
                  <Switch
                    id="disabledChildToggle"
                    checked={hasDisabledChild}
                    onCheckedChange={setHasDisabledChild}
                  />
                </div>

                {hasDisabledChild && (
                  <div className="flex items-center gap-3 pt-1">
                    <Label htmlFor="disabled-dependent-count" className="text-xs text-muted-foreground shrink-0">
                      Disabled Dependents:
                    </Label>
                    <Input
                      id="disabled-dependent-count"
                      type="number"
                      min="1"
                      max="10"
                      value={disabledChildCount}
                      onChange={(e) => setDisabledChildCount(e.target.value)}
                      className="h-8 w-20 text-xs bg-background"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      +৳{((Number(disabledChildCount) || 1) * (fiscalYear?.disabledChildAllowance ?? 50000)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Taxpayer Status (Minimum Tax) */}
            <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Taxpayer Status (ন্যূনতম কর প্রযোজ্য)
                </Label>
                <Badge variant="secondary" className="text-[11px]">
                  Min Tax: {fmtBDT(applicableMinTax)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  aria-pressed={taxpayerStatus === 'regular'}
                  onClick={() => setTaxpayerStatus('regular')}
                  className={`rounded-lg border p-2.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    taxpayerStatus === 'regular'
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <p className="font-semibold text-foreground">Regular Taxpayer</p>
                  <p className="text-[10px] text-muted-foreground">Min Tax: ৳{fiscalYear?.minTaxStandard ?? 5000}</p>
                </button>

                <button
                  type="button"
                  aria-pressed={taxpayerStatus === 'new'}
                  onClick={() => setTaxpayerStatus('new')}
                  className={`rounded-lg border p-2.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    taxpayerStatus === 'new'
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <p className="font-semibold text-foreground">New Taxpayer</p>
                  <p className="text-[10px] text-muted-foreground">Min Tax: ৳{fiscalYear?.minTaxNewTaxpayer ?? 1000}</p>
                </button>
              </div>
            </div>

            {/* Net Profit / Tax Amount Input Tabs */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'profit' | 'tax')}>
              <TabsList className="grid h-auto w-full grid-cols-2 p-1">
                <TabsTrigger value="profit" className="min-h-10 whitespace-normal text-center leading-tight">
                  I know my net profit
                </TabsTrigger>
                <TabsTrigger value="tax" className="min-h-10 whitespace-normal text-center leading-tight">
                  I know my tax amount
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profit" className="pt-4 space-y-4">
                <Field
                  label="Annual Net Profit"
                  value={profitInput}
                  onChange={setProfitInput}
                  hint="Total net profit from business or profession."
                />
                <Field
                  label="Investment Tax Rebate / Credit (কর রেয়াত - Optional)"
                  value={taxRebate}
                  onChange={setTaxRebate}
                  hint="Eligible tax rebate from investments/life insurance/provident fund."
                />
              </TabsContent>
              <TabsContent value="tax" className="pt-4">
                <Field
                  label="Tax Amount Paid / Payable"
                  value={taxInput}
                  onChange={setTaxInput}
                  hint="Net profit is reverse-calculated from the category-adjusted tax slabs."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible>
          <AccordionItem value="wealth" className="border-0">
            <Card className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-[1.5rem]">
              <AccordionTrigger className="px-6 text-left hover:no-underline">
                <span className="space-y-1">
                  <span className="flex items-center gap-2 text-base font-semibold">
                    <WalletCards className="h-5 w-5 text-primary" />
                    Wealth statement
                  </span>
                  <span className="block text-sm font-normal text-muted-foreground">
                    Optional details used to estimate your closing cash and wealth.
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {assetFields.map(([key, label]) => (
                      <Field key={key} label={label} value={assets[key] || ''} onChange={(value) => updateAsset(key, value)} />
                    ))}
                  </div>
                  <div className="grid gap-4 border-t pt-5 md:grid-cols-2 xl:grid-cols-1">
                    {liabilityFields.map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={liabilities[key] || ''}
                        onChange={(value) => updateLiability(key, value)}
                      />
                    ))}
                  </div>
                  <div className="grid gap-4 border-t pt-5 md:grid-cols-2 xl:grid-cols-1">
                    <Field
                      label="Previous Year Net Wealth"
                      value={prevYearNetWealth}
                      onChange={setPrevYearNetWealth}
                    />
                    <Field label="Furniture of Office" value={furnitureOfOffice} onChange={setFurnitureOfOffice} />
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Right Column: Calculation Results & Detailed Breakdowns */}
      <div className="space-y-6">
        {result ? (
          <>
            {/* Top Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Net Profit', result.netProfit, 'Annual Business Income'],
                ['Tax Payable', result.taxAmount, result.minTaxApplied ? 'Minimum Tax Enforced' : 'Slab Tax Payable'],
                ['Tax-Free Limit', result.taxFreeThreshold, `${result.taxpayerCategory.replace('_', ' ')} limit`],
                ['Cash In Hand', result.cashInHand, 'Calculated closing cash'],
              ].map(([label, value, sub]) => (
                <Card key={label as string} className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-xl">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label as string}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{fmtBDT(value as number)}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground truncate">{sub as string}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Circular 2026-2027 Minimum Tax Alert Banner */}
            {result.minTaxApplied && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    Minimum Tax Enforced: {fmtBDT(result.applicableMinTax)} (Income Tax Circular 2026-2027)
                  </p>
                  <p className="text-xs opacity-90 leading-relaxed">
                    Net profit of {fmtBDT(result.netProfit)} exceeds the category tax-free threshold ({fmtBDT(result.taxFreeThreshold)}).
                    Because calculated tax after rebates is less than the statutory minimum, the prescribed minimum tax of{' '}
                    <strong>{fmtBDT(result.applicableMinTax)}</strong> ({result.taxpayerStatus === 'new' ? 'New Taxpayer' : 'Regular Taxpayer'}) must still be paid.
                  </p>
                </div>
              </div>
            )}

            {!result.exceedsThreshold && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Zero Tax: Income Within Tax-Free Threshold</p>
                  <p className="text-xs opacity-90 leading-relaxed">
                    Net profit of {fmtBDT(result.netProfit)} is within the allowable tax-free threshold of {fmtBDT(result.taxFreeThreshold)}. No tax is payable.
                  </p>
                </div>
              </div>
            )}

            {/* Tax Breakdown Table */}
            <Card className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-[1.5rem]">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Tax Slabs & Breakdown</CardTitle>
                  <CardDescription>
                    {fiscalYear.label} · Category:{' '}
                    <span className="font-medium text-foreground">
                      {taxpayerCategory === 'general' && 'General / Male'}
                      {taxpayerCategory === 'female_senior' && 'Female & 65+ Years'}
                      {taxpayerCategory === 'third_gender_disabled' && 'Third Gender / Disabled'}
                      {taxpayerCategory === 'freedom_july_fighter' && 'Freedom & July Fighter'}
                    </span>
                    {hasDisabledChild && ' (+Disabled Child Allowance)'}
                  </CardDescription>
                </div>
                <Badge variant={result.taxAmount === 0 ? 'secondary' : 'default'} className="text-sm">
                  {fmtBDT(result.taxAmount)} Total
                </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Income Slab (BDT)</TableHead>
                      <TableHead className="text-center">Rate</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.breakdown.map((row, index) => (
                      <TableRow key={`${row.from}-${index}`}>
                        <TableCell>
                          {fmtBDT(row.from)} - {fmtBDT(row.to)}
                          {index === 0 && (
                            <span className="ml-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Tax-Free Threshold
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{(row.rate * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right font-medium">{fmtBDT(row.tax)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2}>Gross Calculated Slab Tax</TableCell>
                      <TableCell className="text-right font-medium">{fmtBDT(result.grossTax)}</TableCell>
                    </TableRow>
                    {result.taxRebate > 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>Less: Investment Tax Rebate / Credit</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          - {fmtBDT(result.taxRebate)}
                        </TableCell>
                      </TableRow>
                    )}
                    {result.exceedsThreshold && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          Prescribed Statutory Minimum Tax ({result.taxpayerStatus === 'new' ? 'New Taxpayer' : 'Regular'})
                        </TableCell>
                        <TableCell className="text-right font-medium">{fmtBDT(result.applicableMinTax)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={2} className="text-foreground">
                        Final Tax Payable
                        {result.minTaxApplied && ' (Minimum Tax Rule Applied)'}
                      </TableCell>
                      <TableCell className="text-right text-foreground font-bold text-base">
                        {fmtBDT(result.taxAmount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            {/* Business Calculations and Wealth Statement Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-[1.25rem]">
                <CardHeader>
                  <CardTitle>Business Calculations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Expense', result.expense, `Net Profit / ${strategy.expenseDivisor}`],
                    ['Gross Profit', result.grossProfit, 'Net Profit + Expense'],
                    ['Sale', result.sale, `Gross Profit x 100 / ${strategy.salesGrossProfitRatePercent}`],
                    ['Opening Capital', result.openingCapital, `Net Profit x ${strategy.openingCapitalMultiplier}`],
                  ].map(([label, value, hint]) => (
                    <div key={label as string} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{label as string}</p>
                        <p className="text-xs text-muted-foreground">{hint as string}</p>
                      </div>
                      <p className="font-semibold">{fmtBDT(value as number)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-[1.25rem]">
                <CardHeader>
                  <CardTitle>Wealth Statement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Gross Wealth', result.grossWealth],
                    ['Liabilities', result.totalLiabilities],
                    ['This Year Net Wealth', result.thisYearNetWealth],
                    ['Change in Net Wealth', result.changeInNetWealth],
                    ['Withdrawal', result.withdrawal],
                    ['Cash In Hand', result.cashInHand],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                      <p className="font-medium">{label as string}</p>
                      <p className="font-semibold">{fmtBDT(value as number)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-border bg-card/90 flex min-h-[360px] items-center justify-center">
            <CardContent className="p-8 text-center">
              <Landmark className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-semibold">Your tax estimate will appear here</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Enter your {mode === 'profit' ? 'annual net profit' : 'tax amount paid or payable'} on the left.
                The estimate updates automatically using the selected fiscal year and taxpayer details.
              </p>
              <Badge variant="outline" className="mt-4">Currently selected: {fiscalYear.label}</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
