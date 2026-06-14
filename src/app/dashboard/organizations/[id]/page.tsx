import { getOrganizationById } from '../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import DeleteOrganizationButton from './delete-button';

const formatAmount = (amount: number | null | undefined) =>
  new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'BDT',
  }).format(amount ?? 0);

const getTotals = (serviceProfiles: Array<{ servicePeriods: Array<{ paymentAmount: number | null; isPaid: boolean }> }>) => {
  const allPeriods = serviceProfiles.flatMap((profile) => profile.servicePeriods ?? []);
  const expected = allPeriods.reduce((sum, period) => sum + (period.paymentAmount ?? 0), 0);
  const paid = allPeriods.reduce((sum, period) => sum + (period.isPaid ? period.paymentAmount ?? 0 : 0), 0);
  return { expected, paid, outstanding: expected - paid };
};

export default async function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganizationById(id);

  if (!org) {
    notFound();
  }

  // Fetch the audit logs for the timeline
  const timeline = await prisma.auditLog.findMany({
    where: { entityId: org.id, entity: 'Organization' },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/organizations"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{org.name}</h1>
              <p className="text-sm text-muted-foreground">Organization profile & timeline</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-sm px-4 py-1">
              {org._count.serviceProfiles} Services
            </Badge>
            <Button variant="outline" asChild className="w-fit cursor-pointer">
              <Link href={`/dashboard/organizations/${org.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <DeleteOrganizationButton orgId={org.id} orgName={org.name} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Organization name</p>
              <p className="font-medium text-foreground">{org.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner (Client)</p>
              <Link
                href={`/dashboard/clients/${org.client.id}`}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <User className="h-4 w-4" />
                {org.client.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trade license no</p>
              <p className="font-medium text-foreground">{org.tradeLicenseNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created at</p>
              <p className="font-medium text-foreground">{new Date(org.createdAt).toLocaleDateString()}</p>
            </div>
            {org.address && (
              <div className="col-span-2 rounded-3xl border border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="mt-2 text-foreground/80">{org.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Service Summary</CardTitle>
            <CardDescription>Financial totals and active service status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              {(() => {
                const totals = getTotals(org.serviceProfiles);
                return [
                  {
                    label: 'Expected',
                    value: formatAmount(totals.expected),
                    tone: 'bg-muted text-foreground',
                  },
                  {
                    label: 'Collected',
                    value: formatAmount(totals.paid),
                    tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40',
                  },
                  {
                    label: 'Outstanding',
                    value: formatAmount(totals.outstanding),
                    tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40',
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-3xl border p-3 ${item.tone}`}>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold">{item.value}</p>
                  </div>
                ));
              })()}
            </div>
            {org.serviceProfiles.length > 0 ? (
              <ul className="space-y-3">
                {org.serviceProfiles.map((sp) => {
                  const serviceTotal = sp.servicePeriods.reduce(
                    (sum, period) => sum + (period.paymentAmount ?? 0),
                    0,
                  );
                  const servicePaid = sp.servicePeriods.reduce(
                    (sum, period) => sum + (period.isPaid ? period.paymentAmount ?? 0 : 0),
                    0,
                  );
                  const serviceOutstanding = serviceTotal - servicePaid;

                  return (
                    <li key={sp.id} className="rounded-3xl border border-border bg-muted/50 p-4 transition hover:bg-muted/80">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-foreground">{sp.category.name}</p>
                          <p className="text-sm text-muted-foreground">{sp.category.frequency}</p>
                        </div>
                        <Badge variant={serviceOutstanding > 0 ? 'secondary' : 'default'}>
                          {serviceOutstanding > 0 ? 'Pending' : 'All paid'}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em]">Total</p>
                          <p className="font-semibold text-foreground">{formatAmount(serviceTotal)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em]">Paid</p>
                          <p className="font-semibold text-foreground">{formatAmount(servicePaid)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em]">Outstanding</p>
                          <p className="font-semibold text-foreground">{formatAmount(serviceOutstanding)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No service profiles found.</p>
            )}
            <Button variant="outline" className="w-full mt-4" size="sm" asChild>
              <Link href={`/dashboard/services/new?orgId=${org.id}`}>Add Service</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>History of changes and updates for this organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length > 0 ? (
              <div className="relative border-l border-border pl-6 space-y-6 pb-4">
                {timeline.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-sky-500 ring-4 ring-background shadow-sm" />
                    <p className="text-sm font-medium text-foreground">
                      {log.action} by {log.user?.name || 'System'}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                    {log.details && (
                      <pre className="mt-2 overflow-x-auto rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
