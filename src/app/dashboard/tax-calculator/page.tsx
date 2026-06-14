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
      <section className="animate-fade-in-up rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Tax calculator</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Business Tax Calculator</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
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
      </section>

      <section className="rounded-[2rem] border border-border bg-card/90 p-4 shadow-sm">
        <TaxCalculatorClient fiscalYears={serializedFiscalYears} />
      </section>
    </div>
  );
}
