'use client';

import { FormEvent, useState, useTransition } from 'react';
import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { createTaxFiscalYear, updateTaxFiscalYear } from '../actions';
import { defaultTaxStrategy, TaxStrategy } from '@/lib/tax-calculator';

type FiscalYearRule = {
  id: string;
  year: string;
  label: string;
  description: string | null;
  isActive: boolean;
  strategy: Partial<TaxStrategy> | null;
  slabs: Array<{
    sequence: number;
    limitAmount: number | null;
    rate: number;
    label: string | null;
  }>;
};

type RulesClientProps = {
  fiscalYears: FiscalYearRule[];
};

const starterSlabs = JSON.stringify(
  [
    { label: 'First 375,000', limitAmount: 375000, rate: 0 },
    { label: 'Next 300,000', limitAmount: 300000, rate: 0.1 },
    { label: 'Remaining', limitAmount: null, rate: 0.3 },
  ],
  null,
  2,
);

function RuleForm({ fiscalYear }: { fiscalYear: FiscalYearRule }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(fiscalYear.isActive);

  const slabsJson = JSON.stringify(
    fiscalYear.slabs.map((slab) => ({
      label: slab.label,
      limitAmount: slab.limitAmount,
      rate: slab.rate,
    })),
    null,
    2,
  );

  const strategyJson = JSON.stringify({ ...defaultTaxStrategy, ...(fiscalYear.strategy || {}) }, null, 2);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('isActive', String(isActive));

    startTransition(async () => {
      const result = await updateTaxFiscalYear(fiscalYear.id, formData);

      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Fiscal year updated' : 'Could not update fiscal year',
        description: result.success ? `${formData.get('label')} has been saved.` : result.error,
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fiscalYear.label}</CardTitle>
        <CardDescription>{fiscalYear.year}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fiscal Year</Label>
              <Input name="year" defaultValue={fiscalYear.year} required placeholder="2027-2028" />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input name="label" defaultValue={fiscalYear.label} required placeholder="FY 2027-28" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={fiscalYear.description || ''} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive years stay saved but disappear from the calculator.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-2">
            <Label>Tax Slabs JSON</Label>
            <Textarea name="slabs" defaultValue={slabsJson} className="min-h-56 font-mono text-xs" required />
            <p className="text-xs text-muted-foreground">Use null for the final unlimited slab.</p>
          </div>

          <div className="space-y-2">
            <Label>Calculation Strategy JSON</Label>
            <Textarea name="strategy" defaultValue={strategyJson} className="min-h-56 font-mono text-xs" />
          </div>

          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : 'Save Rules'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function RulesClient({ fiscalYears }: RulesClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(true);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('isActive', String(isActive));

    startTransition(async () => {
      const result = await createTaxFiscalYear(formData);

      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Fiscal year created' : 'Could not create fiscal year',
        description: result.success ? `${formData.get('label')} is ready.` : result.error,
      });

      if (result.success) {
        (event.currentTarget as HTMLFormElement).reset();
        setIsActive(true);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Add Fiscal Year</CardTitle>
          <CardDescription>Add future tax years without touching code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Fiscal Year</Label>
                <Input name="year" required placeholder="2027-2028" />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input name="label" required placeholder="FY 2027-28" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" placeholder="Optional notes about the rule source" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Show this year in the calculator.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="space-y-2">
              <Label>Tax Slabs JSON</Label>
              <Textarea name="slabs" defaultValue={starterSlabs} className="min-h-56 font-mono text-xs" required />
            </div>

            <div className="space-y-2">
              <Label>Calculation Strategy JSON</Label>
              <Textarea
                name="strategy"
                defaultValue={JSON.stringify(defaultTaxStrategy, null, 2)}
                className="min-h-56 font-mono text-xs"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? 'Creating...' : 'Add Fiscal Year'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {fiscalYears.map((fiscalYear) => (
          <RuleForm key={fiscalYear.id} fiscalYear={fiscalYear} />
        ))}
      </div>
    </div>
  );
}
