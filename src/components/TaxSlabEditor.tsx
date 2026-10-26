'use client';

import { useMemo, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InitialSlab = {
  limitAmount: number | null;
  rate: number;
  label: string | null;
};

type Props = {
  initialSlabs?: InitialSlab[];
};

function createRow(index: number, slab?: InitialSlab) {
  return {
    id: `slab-${index}`,
    limitAmount: slab?.limitAmount != null ? String(slab.limitAmount) : '',
    rate: slab != null ? String(slab.rate) : '',
    label: slab?.label ?? '',
  };
}

export default function TaxSlabEditor({ initialSlabs }: Props = {}) {
  const [rows, setRows] = useState(() =>
    initialSlabs && initialSlabs.length > 0
      ? initialSlabs.map((slab, i) => createRow(i, slab))
      : [createRow(0)],
  );

  const canRemove = rows.length > 1;
  const rowCountLabel = useMemo(
    () => `${rows.length} slab${rows.length === 1 ? '' : 's'}`,
    [rows.length],
  );

  const addRow = () => {
    setRows((current) => [...current, createRow(current.length)]);
  };

  const removeRow = (id: string) => {
    if (!canRemove) return;
    setRows((current) => {
      const filtered = current.filter((row) => row.id !== id);
      return filtered.map((row, index) => ({ ...row, id: `slab-${index}` }));
    });
  };

  const updateRow = (id: string, field: 'limitAmount' | 'rate' | 'label', value: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Tax Slabs (ট্যাক্স স্ল্যাব)</Label>
          <p className="text-xs text-muted-foreground">
            First slab with Rate = 0% sets the general/male tax-free threshold. Other categories
            automatically substitute their own thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {rowCountLabel}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" /> Add row
          </Button>
        </div>
      </div>

      {/* Header row */}
      <div className="hidden grid-cols-[1.2fr_1fr_1.6fr_auto] gap-3 px-4 sm:grid">
        <span className="text-xs font-semibold text-muted-foreground">Upper Limit (BDT)</span>
        <span className="text-xs font-semibold text-muted-foreground">Rate (%)</span>
        <span className="text-xs font-semibold text-muted-foreground">Label / Description</span>
        <span />
      </div>

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1.2fr_1fr_1.6fr_auto] sm:items-center sm:py-2"
          >
            {/* Slab number badge (mobile) */}
            <div className="flex items-center gap-2 sm:hidden">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Slab {idx + 1}
              </span>
            </div>

            <div className="space-y-1 sm:space-y-0">
              <Label htmlFor={`slabLimitAmount-${row.id}`} className="text-xs sm:sr-only">
                Upper Limit (BDT)
              </Label>
              <Input
                id={`slabLimitAmount-${row.id}`}
                name="slabLimitAmount"
                placeholder="Leave empty for final open slab"
                type="number"
                min={0}
                inputMode="numeric"
                value={row.limitAmount}
                onChange={(e) => updateRow(row.id, 'limitAmount', e.target.value)}
              />
            </div>

            <div className="space-y-1 sm:space-y-0">
              <Label htmlFor={`slabRate-${row.id}`} className="text-xs sm:sr-only">
                Rate (%)
              </Label>
              <Input
                id={`slabRate-${row.id}`}
                name="slabRate"
                placeholder="e.g. 10"
                type="number"
                min={0}
                max={100}
                step="0.01"
                inputMode="decimal"
                value={row.rate}
                onChange={(e) => updateRow(row.id, 'rate', e.target.value)}
              />
            </div>

            <div className="space-y-1 sm:space-y-0">
              <Label htmlFor={`slabLabel-${row.id}`} className="text-xs sm:sr-only">
                Label
              </Label>
              <Input
                id={`slabLabel-${row.id}`}
                name="slabLabel"
                placeholder="e.g. পরবর্তী ৩ লাখ"
                value={row.label}
                onChange={(e) => updateRow(row.id, 'label', e.target.value)}
              />
            </div>

            <div className="flex items-center sm:justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-full text-destructive hover:bg-destructive/10 sm:w-10"
                onClick={() => removeRow(row.id)}
                disabled={!canRemove}
                title="Remove slab"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Leave the <strong>Upper Limit</strong> blank for the last slab — it becomes the
        open-ended &quot;remaining income&quot; bracket.
      </p>
    </div>
  );
}
