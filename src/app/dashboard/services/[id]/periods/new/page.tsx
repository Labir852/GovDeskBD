'use client';

import { createServicePeriod, getServicePeriods } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

export default function NewServicePeriodPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('serviceProfileId', params.id);

    const result = await createServicePeriod(formData);

    if (result.success) {
      toast({
        title: 'Service period created',
        description: 'The billing period has been recorded successfully.',
      });
      router.push(`/dashboard/services/${params.id}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to create service period.',
      });
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/services/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Billing Period</CardTitle>
          <CardDescription>Record a new billing period for this service.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period">Period *</Label>
              <Input
                id="period"
                name="period"
                placeholder="e.g., 2026-01 or January 2026"
                type="text"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount ($) *</Label>
              <Input
                id="paymentAmount"
                name="paymentAmount"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="PENDING" name="status">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isPaid" name="isPaid" value="true" />
              <Label htmlFor="isPaid" className="font-normal cursor-pointer">
                Mark as Paid
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Billing Period
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
