'use client';

import { useMemo, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function createRow(id: string) {
  return { id, limitAmount: '', rate: '', label: '' };
}

export default function TaxSlabEditor() {
  const [rows, setRows] = useState(() => [createRow(crypto.randomUUID())]);

  const canRemove = rows.length > 1;
  const rowCountLabel = useMemo(
    () => `${rows.length} slab${rows.length === 1 ? '' : 's'}`,
    [rows.length],
  );

  const addRow = () => setRows((current) => [...current, createRow(crypto.randomUUID())]);
  const removeRow = (id: string) => {
    if (!canRemove) return;
    setRows((current) => current.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Tax slabs</Label>
          <p className="text-xs text-muted-foreground">Enter each slab with an upper limit, rate, and label.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{rowCountLabel}</span>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" /> Add row
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[1.2fr_1fr_1.6fr_auto]">
            <div className="space-y-2">
              <Label htmlFor={`slabLimitAmount-${row.id}`}>Upper limit</Label>
              <Input
                id={`slabLimitAmount-${row.id}`}
                name="slabLimitAmount"
                placeholder="300000"
                type="number"
                min={0}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`slabRate-${row.id}`}>Rate (%)</Label>
              <Input
                id={`slabRate-${row.id}`}
                name="slabRate"
                placeholder="10"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`slabLabel-${row.id}`}>Label</Label>
              <Input
                id={`slabLabel-${row.id}`}
                name="slabLabel"
                placeholder="পরবর্তী ৭ লাখ"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-full text-destructive"
                onClick={() => removeRow(row.id)}
                disabled={!canRemove}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Leave unused rows blank. Use an empty upper limit for the final open-ended slab.
      </p>
    </div>
  );
}
