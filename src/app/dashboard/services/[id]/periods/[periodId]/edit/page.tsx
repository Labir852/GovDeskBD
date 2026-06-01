'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getServicePeriodById, updateServicePeriod } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Params = {
  params: Promise<{
    id: string;
    periodId: string;
  }>;
};

export default function EditServicePeriodPage({ params }: Params) {
  const { id, periodId } = use(params as any);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [isPaid, setIsPaid] = useState(false);
  const [status, setStatus] = useState('PENDING');
  const [periodData, setPeriodData] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const record = await getServicePeriodById(periodId);
        if (!record) {
          toast({
            variant: 'destructive',
            title: 'Not found',
            description: 'Billing period not found.',
          });
          router.push(`/dashboard/services/${id}`);
          return;
        }

        setPeriod(record.period);
        setPaymentAmount(String(record.paymentAmount ?? 0));
        setIsPaid(record.isPaid);
        setStatus(record.status || 'PENDING');
        setPeriodData(record.periodData ? JSON.stringify(record.periodData, null, 2) : '');
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Unable to load billing period.',
        });
        router.push(`/dashboard/services/${id}`);
      }
    }
    load();
  }, [id, periodId, router, toast]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      JSON.parse(periodData || 'null');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid JSON',
        description: 'Period data must be valid JSON.',
      });
      setSaving(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const result = await updateServicePeriod(periodId, formData);

    if (result.success) {
      toast({
        title: 'Billing period updated',
        description: 'The billing period has been updated successfully.',
      });
      router.push(`/dashboard/services/${id}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to update billing period.',
      });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/services/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Service
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Billing Period</CardTitle>
          <CardDescription>Update the period, amount, payment status, and JSON metadata.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period">Billing Period *</Label>
              <Input id="period" name="period" value={period} onChange={(e) => setPeriod(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                name="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} name="status" required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Checkbox
                id="isPaid"
                name="isPaid"
                checked={isPaid}
                onCheckedChange={(value) => setIsPaid(Boolean(value))}
                value="true"
              />
              <Label htmlFor="isPaid" className="font-normal cursor-pointer">
                Mark as Paid
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodData">Period Data (JSON)</Label>
              <textarea
                id="periodData"
                name="periodData"
                rows={8}
                value={periodData}
                onChange={(e) => setPeriodData(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder='{"needPrint":"NO","vatStatus":"Pending"}'
              />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Billing Period
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
