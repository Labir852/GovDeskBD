'use client';

import { createServicePeriod } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { getServiceProfileById } from '../../../actions';

export default function NewServicePeriodPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    async function load() {
      try {
        const prof = await getServiceProfileById(id);
        setProfile(prof);
      } catch (err) {
        console.error('Failed to load profile details: ', err);
      }
    }
    load();
  }, [id]);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const y = currentYear - 5 + i;
    return { value: y.toString(), label: y.toString() };
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('serviceProfileId', id);

    const result = await createServicePeriod(formData);

    if (result.success) {
      toast({
        title: 'Service period created',
        description: 'The billing period has been recorded successfully.',
      });
      router.push(`/dashboard/services/${id}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to create service period.',
      });
    }
    setLoading(false);
  }

  const isMonthly =
    profile?.category?.name?.toUpperCase() === 'VAT' ||
    profile?.category?.frequency?.toUpperCase() === 'MONTHLY';

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/services/${id}`}>
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
            {isMonthly ? (
              <div className="space-y-2">
                <Label>Period *</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger id="period-month">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger id="period-year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y.value} value={y.value}>
                            {y.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <input type="hidden" name="period" value={`${selectedYear}-${selectedMonth}`} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  name="period"
                  placeholder="e.g., 2026 or 2025-2026"
                  type="text"
                  required
                />
              </div>
            )}

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
