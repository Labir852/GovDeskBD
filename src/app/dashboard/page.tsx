import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Tags,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Dashboard | GovDesk Admin',
};

export const revalidate = 15;

async function getDashboardData() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [
    clientStats,
    totalOrganizations,
    totalCategories,
    totalServiceProfiles,
    unpaidThisMonth,
    pendingPeriods,
    recentPeriods,
    recentClients,
    categoryMix,
    revenueStats,
  ] = await Promise.all([
    prisma.client.groupBy({ by: ['isActive'], _count: { id: true } }),
    prisma.organization.count(),
    prisma.category.count(),
    prisma.serviceProfile.count(),
    prisma.servicePeriod.count({ where: { period: currentMonth, isPaid: false } }),
    prisma.servicePeriod.count({
      where: {
        OR: [
          { status: { equals: 'PENDING', mode: 'insensitive' } },
          { status: { equals: 'Not Submitted', mode: 'insensitive' } },
          { status: { equals: 'Under Review', mode: 'insensitive' } },
        ],
      },
    }),
    prisma.servicePeriod.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        serviceProfile: {
          include: {
            category: true,
            client: { select: { name: true } },
            organization: {
              select: {
                name: true,
                client: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { organizations: true, serviceProfiles: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { serviceProfiles: true } } },
    }),
    prisma.servicePeriod.groupBy({
      by: ['isPaid'],
      _sum: { paymentAmount: true },
    }),
  ]);

  const totalClients = clientStats.reduce((sum, item) => sum + item._count.id, 0);
  const activeClients = clientStats.find((item) => item.isActive)?._count.id ?? 0;

  const totalRevenueCollected = revenueStats.find((r) => r.isPaid)?._sum.paymentAmount ?? 0;
  const totalRevenueOutstanding = revenueStats.find((r) => !r.isPaid)?._sum.paymentAmount ?? 0;
  const totalRevenueExpected = totalRevenueCollected + totalRevenueOutstanding;

  return {
    activeClients,
    categoryMix,
    currentMonth,
    pendingPeriods,
    recentClients,
    recentPeriods,
    totalCategories,
    totalClients,
    totalOrganizations,
    totalServiceProfiles,
    unpaidThisMonth,
    totalRevenueExpected,
    totalRevenueCollected,
    totalRevenueOutstanding,
  };
}

const formatAmount = (amount: number | null | undefined) =>
  new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'BDT',
  }).format(amount ?? 0);

const getProfileName = (period: Awaited<ReturnType<typeof getDashboardData>>['recentPeriods'][number]) =>
  period.serviceProfile.organization?.name ||
  period.serviceProfile.client?.name ||
  'Unassigned profile';

const getClientName = (period: Awaited<ReturnType<typeof getDashboardData>>['recentPeriods'][number]) =>
  period.serviceProfile.organization?.client.name || period.serviceProfile.client?.name || 'No client linked';

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: 'Active clients',
      value: data.activeClients,
      helper: `${data.totalClients} total records`,
      icon: Users,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40',
    },
    {
      label: 'Organizations',
      value: data.totalOrganizations,
      helper: 'Linked to client owners',
      icon: Building2,
      tone: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/40',
    },
    {
      label: 'Service profiles',
      value: data.totalServiceProfiles,
      helper: `${data.totalCategories} editable categories`,
      icon: BriefcaseBusiness,
      tone: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40',
    },
    {
      label: 'Needs attention',
      value: data.pendingPeriods + data.unpaidThisMonth,
      helper: `${data.unpaidThisMonth} unpaid in ${data.currentMonth}`,
      icon: AlertCircle,
      tone: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40',
    },
  ];

  const revenueCards = [
    {
      label: 'Expected revenue',
      value: formatAmount(data.totalRevenueExpected),
      helper: 'All payment terms total value',
      icon: Wallet,
      tone: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/40',
    },
    {
      label: 'Collected revenue',
      value: formatAmount(data.totalRevenueCollected),
      helper: 'Amount already marked paid',
      icon: TrendingUp,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40',
    },
    {
      label: 'Outstanding revenue',
      value: formatAmount(data.totalRevenueOutstanding),
      helper: 'Pending payments across all terms',
      icon: AlertCircle,
      tone: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-xl md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">Overview</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Dashboard</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Monitor customer accounts, recurring services, revenue, and active periods across GovDesk BD.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/services/new" prefetch={true}>
                New Service Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/clients/new" prefetch={true}>New Client</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="animate-fade-in-up transition-all duration-300 hover:shadow-xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <span className={`rounded-xl border p-2.5 ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {revenueCards.map((card) => (
          <Card key={card.label} className="animate-fade-in-up transition-all duration-300 hover:shadow-xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <span className={`rounded-xl border p-2.5 ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="animate-fade-in-up transition-all duration-300 hover:shadow-xl lg:col-span-2 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Service Periods</CardTitle>
              <p className="text-sm text-muted-foreground">Latest period submissions, fees, and payments</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/services" prefetch={true}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data.recentPeriods.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No service periods generated yet.
                </div>
              ) : (
                data.recentPeriods.map((period) => {
                  const content = (
                    <>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{getProfileName(period)}</p>
                          <Badge variant="outline" className="text-xs">
                            {period.period}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getClientName(period)} · {period.serviceProfile.category.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:justify-end">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatAmount(period.paymentAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {period.isPaid ? 'Paid' : 'Unpaid'}
                          </p>
                        </div>
                        <span
                          className={`rounded-full p-1.5 ${
                            period.isPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {period.isPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                        </span>
                      </div>
                    </>
                  );

                  return period.serviceProfileId ? (
                    <Link
                      key={period.id}
                      href={`/dashboard/services/${period.serviceProfileId}`}
                      prefetch={true}
                      className="grid gap-2 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_auto]"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={period.id}
                      className="grid gap-2 py-4 text-muted-foreground sm:grid-cols-[1fr_auto]"
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="animate-fade-in-up transition-all duration-300 hover:shadow-xl border-border bg-card">
            <CardHeader>
              <CardTitle>Service mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.categoryMix.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add categories to start tracking service groups.</p>
              ) : (
                data.categoryMix.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-3xl border border-border bg-muted/50 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.frequency}</p>
                    </div>
                    <Badge variant="secondary">{category._count.serviceProfiles}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up transition-all duration-300 hover:shadow-xl border-border bg-card">
            <CardHeader>
              <CardTitle>New clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentClients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients yet.</p>
              ) : (
                data.recentClients.map((client) => (
                  <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      prefetch={true}
                      className="flex items-center justify-between rounded-3xl border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium text-foreground">{client.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {client._count.organizations} org · {client._count.serviceProfiles} service
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
