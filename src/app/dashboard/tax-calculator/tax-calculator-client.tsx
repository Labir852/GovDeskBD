'use client';

import { useMemo, useState } from 'react';
import { Calculator, Landmark, WalletCards } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { calculateBusinessTax, defaultTaxStrategy, fmtBDT, TaxStrategy } from '@/lib/tax-calculator';

type FiscalYear = {
  id: string;
  year: string;
  label: string;
  description: string | null;
  strategy: Partial<TaxStrategy> | null;
  slabs: Array<{
    id: string;
    sequence: number;
    limitAmount: number | null;
    rate: number;
    label: string | null;
  }>;
};

type TaxCalculatorClientProps = {
  fiscalYears: FiscalYear[];
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
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        inputMode="decimal"
        min="0"
        placeholder="0"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TaxCalculatorClient({ fiscalYears }: TaxCalculatorClientProps) {
  const [fiscalYearId, setFiscalYearId] = useState(fiscalYears[0]?.id || '');
  const [mode, setMode] = useState<'profit' | 'tax'>('profit');
  const [profitInput, setProfitInput] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const [prevYearNetWealth, setPrevYearNetWealth] = useState('');
  const [furnitureOfOffice, setFurnitureOfOffice] = useState('');
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [liabilities, setLiabilities] = useState<Record<string, string>>({});

  const fiscalYear = fiscalYears.find((item) => item.id === fiscalYearId) || fiscalYears[0];
  const strategy = { ...defaultTaxStrategy, ...(fiscalYear?.strategy || {}) };
  const hasInput = mode === 'profit' ? Boolean(profitInput) : Boolean(taxInput);

  const result = useMemo(() => {
    if (!fiscalYear || !hasInput) return null;

    return calculateBusinessTax({
      mode,
      profitInput,
      taxInput,
      slabs: fiscalYear.slabs,
      strategy,
      assets,
      liabilities,
      prevYearNetWealth,
      furnitureOfOffice,
    });
  }, [
    assets,
    fiscalYear,
    furnitureOfOffice,
    hasInput,
    liabilities,
    mode,
    prevYearNetWealth,
    profitInput,
    strategy,
    taxInput,
  ]);

  const updateAsset = (key: string, value: string) => setAssets((current) => ({ ...current, [key]: value }));
  const updateLiability = (key: string, value: string) =>
    setLiabilities((current) => ({ ...current, [key]: value }));

  if (fiscalYears.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Add a fiscal year rule before using the calculator.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculator Inputs
            </CardTitle>
            <CardDescription>Choose fiscal year rules, then enter known profit or tax amount.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Fiscal Year</Label>
              <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fiscalYear?.description && <p className="text-xs text-muted-foreground">{fiscalYear.description}</p>}
            </div>

            <Tabs value={mode} onValueChange={(value) => setMode(value as 'profit' | 'tax')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profit">Net Profit</TabsTrigger>
                <TabsTrigger value="tax">Tax Amount</TabsTrigger>
              </TabsList>
              <TabsContent value="profit" className="pt-4">
                <Field
                  label="Annual Net Profit"
                  value={profitInput}
                  onChange={setProfitInput}
                  hint="Total net profit from business or profession."
                />
              </TabsContent>
              <TabsContent value="tax" className="pt-4">
                <Field
                  label="Tax Amount Paid / Payable"
                  value={taxInput}
                  onChange={setTaxInput}
                  hint="Net profit is reverse-calculated from the selected tax slabs."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletCards className="h-5 w-5" />
              Wealth Statement
            </CardTitle>
          </CardHeader>
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
        </Card>
      </div>

      <div className="space-y-6">
        {result ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Net Profit', result.netProfit],
                ['Tax Payable', result.taxAmount],
                ['Opening Capital', result.openingCapital],
                ['Cash In Hand', result.cashInHand],
              ].map(([label, value]) => (
                <Card key={label as string}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{label as string}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{fmtBDT(value as number)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Tax Breakdown</CardTitle>
                  <CardDescription>{fiscalYear.label}</CardDescription>
                </div>
                <Badge variant={result.taxAmount === 0 ? 'secondary' : 'default'}>{fmtBDT(result.taxAmount)} total</Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Income Slab</TableHead>
                      <TableHead className="text-center">Rate</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.breakdown.map((row, index) => (
                      <TableRow key={`${row.from}-${index}`}>
                        <TableCell>
                          {fmtBDT(row.from)} - {fmtBDT(row.to)}
                        </TableCell>
                        <TableCell className="text-center">{(row.rate * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right font-medium">{fmtBDT(row.tax)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2}>Total Tax Payable</TableCell>
                      <TableCell className="text-right">{fmtBDT(result.taxAmount)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
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

              <Card>
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
          <Card className="flex min-h-[360px] items-center justify-center">
            <CardContent className="p-8 text-center">
              <Landmark className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-medium">Enter {mode === 'profit' ? 'net profit' : 'tax amount'} to calculate.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Results update instantly using the selected fiscal year rules.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
