'use client';

import { useState, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowRight, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  deleteServiceProfile,
  updateServicePeriodStatus,
  updateServicePeriodAmount,
  updateServicePeriodDataField,
} from './actions';
import { CopyButton } from '@/components/ui/copy-button';
import { useToast } from '@/hooks/use-toast';

export type ServiceProfileData = {
  id: string;
  organizationId: string | null;
  categoryId: string;
  portalUserId: string | null;
  portalDecryptedPassword?: string | null;
  client: {
    id: string;
    name: string;
  } | null;
  organization: {
    id: string;
    name: string;
    client: { name: string };
  } | null;
  category: {
    id: string;
    name: string;
    frequency: string;
  };
  _count: { servicePeriods: number };
  createdAt: Date;
  servicePeriods: Array<{
    id: string;
    period: string;
    paymentAmount: number | null;
    isPaid: boolean;
    status: string | null;
    periodData: any;
  }>;
};

// Memoized period sorting helper
const getPeriodsSorted = (periods: ServiceProfileData['servicePeriods']) =>
  [...periods].sort((a, b) => b.period.localeCompare(a.period));

const formatAmount = (amount: number | null | undefined) =>
  new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'BDT',
  }).format(amount ?? 0);

function buildPortalLink(url: string, userId?: string | null, password?: string | null) {
  try {
    const parsed = new URL(url);
    if (userId) parsed.searchParams.set('username', userId);
    if (password) parsed.searchParams.set('password', password);
    return parsed.toString();
  } catch {
    return url;
  }
}

// Option Lists
const needPrintOptions = [
  { value: 'NO', label: 'NO' },
  { value: 'YES', label: 'YES' },
];

const vatStatusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'VAT', label: 'VAT' },
  { value: 'WITHOUT VAT', label: 'WITHOUT VAT' },
  { value: 'close', label: 'close' },
];

const submitStatusOptions = [
  { value: 'NOT SUBMITTED', label: 'NOT SUBMITTED' },
  { value: 'NIL SUBMITTED', label: 'NIL SUBMITTED' },
  { value: 'VAT SUBMITTED', label: 'VAT SUBMITTED' },
  { value: 'PRINTED NIL', label: 'PRINTED NIL' },
  { value: 'PRINTED RETURN', label: 'PRINTED RETURN' },
  { value: 'SENT TO WHATSAPP', label: 'SENT TO WHATSAPP' },
  { value: 'APPLICATION INITIATING', label: 'APPLICATION INITIATING' },
  { value: 'UNDER REVIEW', label: 'UNDER REVIEW' },
  { value: 'REJECTED', label: 'REJECTED' },
];

const tinNidSyncStatusOptions = [
  { value: 'None', label: 'None' },
  { value: 'TIN Updated', label: 'TIN Updated' },
  { value: 'NID Updated', label: 'NID Updated' },
  { value: 'Pending', label: 'Pending' },
];

// Color Maps
const needPrintColors: Record<string, string> = {
  NO: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
  YES: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
};

const vatStatusColors: Record<string, string> = {
  VAT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800',
  'WITHOUT VAT': 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-200 dark:border-sky-800',
  close: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
};

const submitColors: Record<string, string> = {
  'NOT SUBMITTED': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
  'NIL SUBMITTED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800',
  'VAT SUBMITTED': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800',
  'PRINTED NIL': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800',
  'PRINTED RETURN': 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-200 dark:border-purple-800',
  'SENT TO WHATSAPP': 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border border-teal-200 dark:border-teal-800',
  'APPLICATION INITIATING': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800',
  'UNDER REVIEW': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
  REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800',
};

const tinNidSyncColors: Record<string, string> = {
  'TIN Updated': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800',
  'NID Updated': 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-200 dark:border-sky-800',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
  None: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
};

interface GenericDropdownProps {
  periodId: string;
  fieldName: string;
  currentValue: string;
  options: Array<{ value: string; label: string }>;
  colorMap?: Record<string, string>;
  placeholder?: string;
}

function GenericPeriodDropdown({
  periodId,
  fieldName,
  currentValue,
  options,
  colorMap = {},
  placeholder = 'Select',
}: GenericDropdownProps) {
  const { toast } = useToast();
  const [val, setVal] = useState(currentValue);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newVal: string) => {
    setLoading(true);
    try {
      let result;
      if (fieldName === 'status') {
        result = await updateServicePeriodStatus(periodId, newVal);
      } else {
        result = await updateServicePeriodDataField(periodId, fieldName, newVal);
      }

      if (result.success) {
        setVal(newVal);
        toast({
          title: 'Field updated',
          description: `Successfully updated to ${newVal}.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update field',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const colorClass = colorMap[val] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700';

  return (
    <Select value={val} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className={`w-full min-w-[125px] h-8 text-xs font-semibold rounded px-2 ${colorClass}`}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : null}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs font-semibold">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ExpectedAmountInput({ periodId, initialAmount }: { periodId: string; initialAmount: number }) {
  const { toast } = useToast();
  const [val, setVal] = useState(initialAmount === 0 ? '' : initialAmount.toString());
  const [saving, setSaving] = useState(false);

  const handleBlurOrEnter = async (newVal: string) => {
    const amt = parseFloat(newVal) || 0;
    if (amt === initialAmount) return;

    setSaving(true);
    try {
      const result = await updateServicePeriodAmount(periodId, amt);
      if (result.success) {
        toast({
          title: 'Amount updated',
          description: `Expected amount updated to BDT ${amt}.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update amount',
        });
        setVal(initialAmount === 0 ? '' : initialAmount.toString());
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update amount.',
      });
      setVal(initialAmount === 0 ? '' : initialAmount.toString());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1 relative w-[95px]">
      <span className="text-xs text-muted-foreground font-semibold">৳</span>
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => handleBlurOrEnter(val)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleBlurOrEnter(val);
            e.currentTarget.blur();
          }
        }}
        disabled={saving}
        placeholder="0"
        className="w-full h-8 text-xs font-semibold px-2 pr-6"
      />
      {saving && (
        <Loader2 className="h-3 w-3 animate-spin absolute right-2 text-muted-foreground" />
      )}
    </div>
  );
}

export const columns: ColumnDef<ServiceProfileData>[] = [
  {
    id: 'owner',
    accessorFn: (row) => row.organization?.name || row.client?.name || 'Unassigned',
    header: 'Client / Organization',
    cell: ({ row }) => {
      const profile = row.original;
      const label = profile.organization?.name || profile.client?.name || 'Unassigned';
      const href = profile.organizationId
        ? `/dashboard/organizations/${profile.organizationId}`
        : profile.client?.id
          ? `/dashboard/clients/${profile.client.id}`
          : `/dashboard/services/${profile.id}`;

      return (
        <Link href={href} className="text-primary hover:underline font-semibold text-sm">
          {label}
        </Link>
      );
    },
  },
  {
    accessorKey: 'portalUserId',
    header: 'User ID',
    cell: ({ row }) => {
      const val = row.original.portalUserId;
      return (
        <div className="flex items-center gap-1.5">
          {val ? (
            <>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate max-w-[110px]">{val}</span>
              <CopyButton value={val} label="User ID" />
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Not Set</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'portalPassword',
    header: 'Password',
    cell: ({ row }) => {
      const val = row.original.portalDecryptedPassword;
      return (
        <div className="flex items-center gap-1.5">
          {val ? (
            <>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate max-w-[110px]">{val}</span>
              <CopyButton value={val} label="Password" />
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Not Set</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'needPrint',
    header: 'Need Print',
    cell: ({ row }) => {
      const profile = row.original;
      const sortedPeriods = useMemo(
        () => getPeriodsSorted(profile.servicePeriods),
        [profile.servicePeriods]
      );
      const latestPeriod = sortedPeriods[0] || null;

      if (!latestPeriod) return <span className="text-xs text-muted-foreground">No Periods</span>;

      const periodData = (latestPeriod.periodData as Record<string, any>) || {};
      const currentNeedPrint = periodData.needPrint || 'NO';

      return (
        <GenericPeriodDropdown
          key={`needPrint-${latestPeriod.id}`}
          periodId={latestPeriod.id}
          fieldName="needPrint"
          currentValue={currentNeedPrint}
          options={needPrintOptions}
          colorMap={needPrintColors}
        />
      );
    },
  },
  {
    id: 'vatStatus',
    header: 'VAT Status',
    cell: ({ row }) => {
      const profile = row.original;
      const sortedPeriods = useMemo(
        () => getPeriodsSorted(profile.servicePeriods),
        [profile.servicePeriods]
      );
      const latestPeriod = sortedPeriods[0] || null;

      if (!latestPeriod) return <span className="text-xs text-muted-foreground">No Periods</span>;

      const periodData = (latestPeriod.periodData as Record<string, any>) || {};
      const currentVatStatus = periodData.vatStatus || 'Pending';

      return (
        <GenericPeriodDropdown
          key={`vatStatus-${latestPeriod.id}`}
          periodId={latestPeriod.id}
          fieldName="vatStatus"
          currentValue={currentVatStatus}
          options={vatStatusOptions}
          colorMap={vatStatusColors}
        />
      );
    },
  },
  {
    id: 'submitStatus',
    header: 'Submit Status',
    cell: ({ row }) => {
      const profile = row.original;
      const sortedPeriods = useMemo(
        () => getPeriodsSorted(profile.servicePeriods),
        [profile.servicePeriods]
      );
      const latestPeriod = sortedPeriods[0] || null;

      if (!latestPeriod) return <span className="text-xs text-muted-foreground">No Periods</span>;

      return (
        <GenericPeriodDropdown
          key={`submitStatus-${latestPeriod.id}`}
          periodId={latestPeriod.id}
          fieldName="status"
          currentValue={latestPeriod.status || 'NOT SUBMITTED'}
          options={submitStatusOptions}
          colorMap={submitColors}
        />
      );
    },
  },
  {
    id: 'lastMonthStatus',
    header: 'Last Month Status',
    cell: ({ row }) => {
      const profile = row.original;
      const sortedPeriods = useMemo(
        () => getPeriodsSorted(profile.servicePeriods),
        [profile.servicePeriods]
      );
      const previousPeriod = sortedPeriods[1] || null;

      if (!previousPeriod) return <span className="text-xs text-muted-foreground">No History</span>;

      return (
        <GenericPeriodDropdown
          key={`lastMonthStatus-${previousPeriod.id}`}
          periodId={previousPeriod.id}
          fieldName="status"
          currentValue={previousPeriod.status || 'NOT SUBMITTED'}
          options={submitStatusOptions}
          colorMap={submitColors}
        />
      );
    },
  },
  // {
  //   id: 'tinNidSyncStatus',
  //   header: 'TIN NID Sync Status',
  //   cell: ({ row }) => {
  //     const profile = row.original;
  //     const sortedPeriods = [...profile.servicePeriods].sort((a, b) => b.period.localeCompare(a.period));
  //     const latestPeriod = sortedPeriods[0] || null;

  //     if (!latestPeriod) return <span className="text-xs text-muted-foreground">No Periods</span>;

  //     const periodData = (latestPeriod.periodData as Record<string, any>) || {};
  //     const currentSyncStatus = periodData.tinNidSyncStatus || 'None';

  //     return (
  //       <GenericPeriodDropdown
  //         key={`tinNidSync-${latestPeriod.id}`}
  //         periodId={latestPeriod.id}
  //         fieldName="tinNidSyncStatus"
  //         currentValue={currentSyncStatus}
  //         options={tinNidSyncStatusOptions}
  //         colorMap={tinNidSyncColors}
  //       />
  //     );
  //   },
  // },
  // {
  //   id: 'expectedAmount',
  //   header: 'Expected Amt',
  //   cell: ({ row }) => {
  //     const profile = row.original;
  //     const sortedPeriods = [...profile.servicePeriods].sort((a, b) => b.period.localeCompare(a.period));
  //     const latestPeriod = sortedPeriods[0] || null;

  //     if (!latestPeriod) return <span className="text-xs text-muted-foreground">No Periods</span>;

  //     return (
  //       <ExpectedAmountInput
  //         key={`expectedAmt-${latestPeriod.id}`}
  //         periodId={latestPeriod.id}
  //         initialAmount={latestPeriod.paymentAmount || 0}
  //       />
  //     );
  //   },
  // },
  // {
  //   id: 'portalLink',
  //   header: 'Portal',
  //   cell: ({ row }) => {
  //     const profile = row.original;
  //     const portalUrl = profile.category.portalUrl?.trim();
  //     if (!portalUrl) return <span className="text-xs text-muted-foreground">No URL</span>;

  //     const decryptedPassword = profile.portalDecryptedPassword || '';
  //     const portalLink = buildPortalLink(portalUrl, profile.portalUserId, decryptedPassword);

  //     return (
  //       <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-xs font-semibold px-2">
  //         <a href={portalLink} target="_blank" rel="noopener noreferrer">
  //           Login
  //           <ExternalLink className="h-3 w-3" />
  //         </a>
  //       </Button>
  //     );
  //   },
  // },
  // {
  //   id: 'periods',
  //   header: 'Billing Periods',
  //   cell: ({ row }) => (
  //     <Badge variant="secondary">{row.original._count.servicePeriods}</Badge>
  //   ),
  // },
  {
    id: 'revenue',
    header: 'Payments',
    cell: ({ row }) => {
      const totalExpected = row.original.servicePeriods.reduce(
        (sum, period) => sum + (period.paymentAmount ?? 0),
        0,
      );
      const paid = row.original.servicePeriods.reduce(
        (sum, period) => sum + (period.isPaid ? period.paymentAmount ?? 0 : 0),
        0,
      );
      const pendingCount = row.original.servicePeriods.filter((period) => !period.isPaid).length;

      return (
        <div className="space-y-1">
          <p className="text-sm font-medium">{formatAmount(totalExpected)}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[11px]">
              {formatAmount(paid)} paid
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {pendingCount} pending
            </Badge>
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/services/${profile.id}`}
                className="cursor-pointer flex items-center justify-between w-full"
              >
                View <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/services/${profile.id}/edit`}>Edit Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                if (confirm('Delete this service profile?')) {
                  const result = await deleteServiceProfile(profile.id);
                  if (!result.success) alert(result.error);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
