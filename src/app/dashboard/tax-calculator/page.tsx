import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTaxFiscalYears } from './actions';
import { TaxCalculatorClient } from './tax-calculator-client';
import { TaxStrategy } from '@/lib/tax-calculator';

export const metadata = {
  title: 'Tax Calculator | GovDesk Admin',
};

export default async function TaxCalculatorPage() {
  const fiscalYears = await getTaxFiscalYears();
  const serializedFiscalYears = fiscalYears.map((fiscalYear) => ({
    id: fiscalYear.id,
    year: fiscalYear.year,
    label: fiscalYear.label,
    description: fiscalYear.description,
    strategy: fiscalYear.strategy as Partial<TaxStrategy> | null,
    slabs: fiscalYear.slabs.map((slab) => ({
      id: slab.id,
      sequence: slab.sequence,
      limitAmount: slab.limitAmount,
      rate: slab.rate,
      label: slab.label,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Tax Calculator</h1>
          <p className="text-muted-foreground">
            Calculate Bangladesh business return values with dynamic fiscal-year slabs and formulas.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tax-calculator/rules">
            <Settings2 className="mr-2 h-4 w-4" />
            Fiscal Year Rules
          </Link>
        </Button>
      </div>

      <TaxCalculatorClient fiscalYears={serializedFiscalYears} />
    </div>
  );
}
