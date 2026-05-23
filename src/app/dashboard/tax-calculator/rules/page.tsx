import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllTaxFiscalYears } from '../actions';
import { RulesClient } from './rules-client';
import { TaxStrategy } from '@/lib/tax-calculator';

export const metadata = {
  title: 'Tax Rules | GovDesk Admin',
};

export default async function TaxRulesPage() {
  const fiscalYears = await getAllTaxFiscalYears();
  const serializedFiscalYears = fiscalYears.map((fiscalYear) => ({
    id: fiscalYear.id,
    year: fiscalYear.year,
    label: fiscalYear.label,
    description: fiscalYear.description,
    isActive: fiscalYear.isActive,
    strategy: fiscalYear.strategy as Partial<TaxStrategy> | null,
    slabs: fiscalYear.slabs.map((slab) => ({
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
          <h1 className="text-3xl font-bold tracking-tight">Fiscal Year Tax Rules</h1>
          <p className="text-muted-foreground">
            Maintain slabs and calculation strategies used by the business tax calculator.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tax-calculator">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculator
          </Link>
        </Button>
      </div>

      <RulesClient fiscalYears={serializedFiscalYears} />
    </div>
  );
}
