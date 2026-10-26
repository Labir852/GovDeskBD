'use client';

import { FormEvent, useState, useTransition } from 'react';
import { Plus, Save, ShieldAlert, Users, Award, HeartHandshake, Calculator, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createTaxFiscalYear, updateTaxFiscalYear } from '../actions';
import { defaultTaxStrategy, TaxStrategy } from '@/lib/tax-calculator';
import TaxSlabEditor from '@/components/TaxSlabEditor';

type FiscalYearRule = {
  id: string;
  year: string;
  label: string;
  description: string | null;
  isActive: boolean;
  strategy: Partial<TaxStrategy> | null;
  femaleSeniorThreshold?: number | null;
  thirdGenderDisabledThreshold?: number | null;
  freedomJulyFighterThreshold?: number | null;
  disabledChildAllowance?: number | null;
  minTaxStandard?: number | null;
  minTaxNewTaxpayer?: number | null;
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

function RuleForm({
  fiscalYear,
  isExpanded,
  onToggle,
}: {
  fiscalYear: FiscalYearRule;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(fiscalYear.isActive);

  const strategy = { ...defaultTaxStrategy, ...(fiscalYear.strategy || {}) };

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
    <Card className="transition-all duration-300 hover:shadow-xl border-border bg-card/90 rounded-[1.25rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={`fiscal-year-${fiscalYear.id}-content`}
            onClick={onToggle}
            className="flex items-center gap-3 text-left"
          >
            <span>
              <CardTitle>{fiscalYear.label}</CardTitle>
              <CardDescription>{fiscalYear.year}</CardDescription>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{isActive ? 'Active' : 'Inactive'}</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </CardHeader>
      <CardContent id={`fiscal-year-${fiscalYear.id}-content`} className={isExpanded ? undefined : 'hidden'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fiscal Year</Label>
              <Input name="year" defaultValue={fiscalYear.year} required placeholder="2026-2027" />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input name="label" defaultValue={fiscalYear.label} required placeholder="FY 2026-27" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={fiscalYear.description || ''} />
          </div>

          {/* Separated Tax-Free Threshold Inputs */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Tax-Free Income Thresholds by Category (করমুক্ত আয়ের সীমা)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              General / Male taxpayer threshold is defined in the first slab (Rate = 0%). Set specific category exemptions below:
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  1. Female &amp; 65+ Years (BDT)
                </Label>
                <Input
                  name="femaleSeniorThreshold"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={fiscalYear.femaleSeniorThreshold ?? 425000}
                  placeholder="425000"
                  required
                />
                <p className="text-[11px] text-muted-foreground">মহিলা ও ৬৫+ বছর করদাতা</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  2. Third Gender &amp; Disabled (BDT)
                </Label>
                <Input
                  name="thirdGenderDisabledThreshold"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={fiscalYear.thirdGenderDisabledThreshold ?? 500000}
                  placeholder="500000"
                  required
                />
                <p className="text-[11px] text-muted-foreground">তৃতীয় লিঙ্গ ও প্রতিবন্ধী ব্যক্তি</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  3. Freedom Fighters &amp; July Fighters (BDT)
                </Label>
                <Input
                  name="freedomJulyFighterThreshold"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={fiscalYear.freedomJulyFighterThreshold ?? 525000}
                  placeholder="525000"
                  required
                />
                <p className="text-[11px] text-muted-foreground">যুদ্ধাহত মুক্তিযোদ্ধা ও জুলাই যোদ্ধা</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                    Disabled Child/Dependent Allowance (BDT)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    প্রতিবন্ধী সন্তান/পোষ্য প্রতি পিতামাতা/আইনানুগ অভিভাবকের করমুক্ত সীমা বৃদ্ধি (একজনে প্রযোজ্য)
                  </p>
                </div>
                <Input
                  name="disabledChildAllowance"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={fiscalYear.disabledChildAllowance ?? 50000}
                  placeholder="50000"
                  className="sm:w-40"
                  required
                />
              </div>
            </div>
          </div>

          {/* Minimum Tax Rules */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Minimum Tax Payable (ন্যূনতম কর - Circular 2026-2027)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              If income exceeds the tax-free threshold, minimum tax applies even if calculated tax after rebate is lower, zero, or negative.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Standard / Regular Taxpayer (BDT)</Label>
                <Input
                  name="minTaxStandard"
                  type="number"
                  min="0"
                  step="500"
                  defaultValue={fiscalYear.minTaxStandard ?? 5000}
                  placeholder="5000"
                  required
                />
                <p className="text-[11px] text-muted-foreground">নিয়মিত করদাতার ন্যূনতম কর (default: 5,000)</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">New Taxpayer (BDT)</Label>
                <Input
                  name="minTaxNewTaxpayer"
                  type="number"
                  min="0"
                  step="500"
                  defaultValue={fiscalYear.minTaxNewTaxpayer ?? 1000}
                  placeholder="1000"
                  required
                />
                <p className="text-[11px] text-muted-foreground">নতুন করদাতার ক্ষেত্রে ন্যূনতম কর (default: 1,000)</p>
              </div>
            </div>
          </div>

          {/* Tax Slabs — editable table */}
          <TaxSlabEditor initialSlabs={fiscalYear.slabs} />

          {/* Calculation Strategy — 3 simple inputs */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Business Income Calculation Settings
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Parameters used when estimating business income from turnover, sales, or capital.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Expense Divisor</Label>
                <Input
                  name="expenseDivisor"
                  type="number"
                  min="1"
                  step="0.5"
                  defaultValue={strategy.expenseDivisor ?? defaultTaxStrategy.expenseDivisor}
                  placeholder={String(defaultTaxStrategy.expenseDivisor)}
                />
                <p className="text-[11px] text-muted-foreground">আয়ের ভাগক (ব্যয় নির্ণয়ে)</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Gross Profit Rate (%)</Label>
                <Input
                  name="salesGrossProfitRatePercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  defaultValue={strategy.salesGrossProfitRatePercent ?? defaultTaxStrategy.salesGrossProfitRatePercent}
                  placeholder={String(defaultTaxStrategy.salesGrossProfitRatePercent)}
                />
                <p className="text-[11px] text-muted-foreground">বিক্রয় থেকে গ্রস মুনাফার হার</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Opening Capital Multiplier</Label>
                <Input
                  name="openingCapitalMultiplier"
                  type="number"
                  min="1"
                  step="0.5"
                  defaultValue={strategy.openingCapitalMultiplier ?? defaultTaxStrategy.openingCapitalMultiplier}
                  placeholder={String(defaultTaxStrategy.openingCapitalMultiplier)}
                />
                <p className="text-[11px] text-muted-foreground">প্রারম্ভিক মূলধনের গুণক</p>
              </div>
            </div>
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
  const [expandedFiscalYearId, setExpandedFiscalYearId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('isActive', String(isActive));

    startTransition(async () => {
      const result = await createTaxFiscalYear(formData);

      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? 'Fiscal year created' : 'Could not create fiscal year',
        description: result.success ? `${formData.get('label')} is ready.` : result.error,
      });

      if (result.success) {
        form.reset();
        setIsActive(true);
        setIsCreateDialogOpen(false);
      }
    });
  }

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fiscal Year
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Fiscal Year</DialogTitle>
              <DialogDescription>
                Define fiscal year rules with category thresholds and minimum tax parameters.
              </DialogDescription>
            </DialogHeader>
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
                <Input name="description" placeholder="Income Tax Circular reference" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Show this year in the calculator.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {/* Category Tax-Free Thresholds */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-primary" />
                Category Tax-Free Thresholds (BDT)
              </p>
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs">Female &amp; 65+ Years</Label>
                  <Input name="femaleSeniorThreshold" type="number" defaultValue={425000} placeholder="425000" required />
                </div>
                <div>
                  <Label className="text-xs">Third Gender &amp; Disabled</Label>
                  <Input name="thirdGenderDisabledThreshold" type="number" defaultValue={500000} placeholder="500000" required />
                </div>
                <div>
                  <Label className="text-xs">Freedom Fighters &amp; July Fighters (2024)</Label>
                  <Input name="freedomJulyFighterThreshold" type="number" defaultValue={525000} placeholder="525000" required />
                </div>
                <div>
                  <Label className="text-xs">Disabled Child/Dependent Allowance</Label>
                  <Input name="disabledChildAllowance" type="number" defaultValue={50000} placeholder="50000" required />
                </div>
              </div>
            </div>

            {/* Minimum Tax Settings */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                Minimum Tax Settings (BDT)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Standard (BDT)</Label>
                  <Input name="minTaxStandard" type="number" defaultValue={5000} placeholder="5000" required />
                </div>
                <div>
                  <Label className="text-xs">New Taxpayer (BDT)</Label>
                  <Input name="minTaxNewTaxpayer" type="number" defaultValue={1000} placeholder="1000" required />
                </div>
              </div>
            </div>

            {/* Tax Slabs — editable table */}
            <TaxSlabEditor />

            {/* Calculation Strategy — 3 simple inputs */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-primary" />
                Business Income Calculation Settings
              </p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Expense Divisor</Label>
                  <Input
                    name="expenseDivisor"
                    type="number"
                    min="1"
                    step="0.5"
                    defaultValue={defaultTaxStrategy.expenseDivisor}
                    placeholder={String(defaultTaxStrategy.expenseDivisor)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Gross Profit Rate (%)</Label>
                  <Input
                    name="salesGrossProfitRatePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    defaultValue={defaultTaxStrategy.salesGrossProfitRatePercent}
                    placeholder={String(defaultTaxStrategy.salesGrossProfitRatePercent)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Opening Capital Multiplier</Label>
                  <Input
                    name="openingCapitalMultiplier"
                    type="number"
                    min="1"
                    step="0.5"
                    defaultValue={defaultTaxStrategy.openingCapitalMultiplier}
                    placeholder={String(defaultTaxStrategy.openingCapitalMultiplier)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? 'Creating...' : 'Add Fiscal Year'}
            </Button>
          </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full space-y-6">
        {fiscalYears.map((fiscalYear) => (
          <div key={fiscalYear.id} className="animate-fade-in-up">
            <RuleForm
              fiscalYear={fiscalYear}
              isExpanded={expandedFiscalYearId === fiscalYear.id}
              onToggle={() =>
                setExpandedFiscalYearId((currentId) =>
                  currentId === fiscalYear.id ? null : fiscalYear.id,
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
