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

async function getDashboardData() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [
    totalClients,
    activeClients,
    totalOrganizations,
    totalCategories,
    totalServiceProfiles,
    unpaidThisMonth,
    pendingPeriods,
    recentPeriods,
    recentClients,
    categoryMix,
    totalRevenueExpected,
    totalRevenueCollected,
    totalRevenueOutstanding,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true } }),
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
    prisma.servicePeriod.aggregate({ _sum: { paymentAmount: true } }),
    prisma.servicePeriod.aggregate({
      where: { isPaid: true },
      _sum: { paymentAmount: true },
    }),
    prisma.servicePeriod.aggregate({
      where: { isPaid: false },
      _sum: { paymentAmount: true },
    }),
  ]);

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
    totalRevenueExpected: totalRevenueExpected._sum.paymentAmount ?? 0,
    totalRevenueCollected: totalRevenueCollected._sum.paymentAmount ?? 0,
    totalRevenueOutstanding: totalRevenueOutstanding._sum.paymentAmount ?? 0,
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
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Organizations',
      value: data.totalOrganizations,
      helper: 'Linked to client owners',
      icon: Building2,
      tone: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      label: 'Service profiles',
      value: data.totalServiceProfiles,
      helper: `${data.totalCategories} editable categories`,
      icon: BriefcaseBusiness,
      tone: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'Needs attention',
      value: data.pendingPeriods + data.unpaidThisMonth,
      helper: `${data.unpaidThisMonth} unpaid in ${data.currentMonth}`,
      icon: AlertCircle,
      tone: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  const revenueCards = [
    {
      label: 'Expected revenue',
      value: formatAmount(data.totalRevenueExpected),
      helper: 'All payment terms total value',
      icon: Wallet,
      tone: 'bg-slate-50 text-slate-700 border-slate-200',
    },
    {
      label: 'Collected revenue',
      value: formatAmount(data.totalRevenueCollected),
      helper: 'Amount already marked paid',
      icon: TrendingUp,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Outstanding revenue',
      value: formatAmount(data.totalRevenueOutstanding),
      helper: 'Pending payments across all terms',
      icon: AlertCircle,
      tone: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border bg-background">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit gap-2">
              <Clock3 className="h-3.5 w-3.5" />
              {data.currentMonth} operations
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">GovDesk command center</h1>
              <p className="max-w-2xl text-muted-foreground">
                Track clients, organizations, monthly VAT work, annual returns, renewals, and payments from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/clients/new">
                  Add client <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/services/new">Create service profile</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Relationship model is ready</p>
                <p className="text-xs text-muted-foreground">One client can own multiple organizations and services.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tags className="h-5 w-5 text-sky-600" />
              <div>
                <p className="text-sm font-medium">Categories stay flexible</p>
                <p className="text-xs text-muted-foreground">VAT, eReturn, ERC, IRC, Trade License, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.helper}</p>
              </div>
              <div className={`rounded-lg border p-3 ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Revenue overview</p>
            <h2 className="text-2xl font-bold tracking-tight">Expected vs. collected</h2>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Review total projected revenue, collected amounts, and outstanding payment terms for your service portfolio.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {revenueCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                </div>
                <div className={`rounded-lg border p-3 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent service activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/services">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.recentPeriods.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No service periods have been recorded yet.</p>
              ) : (
                data.recentPeriods.map((period) => {
                  const content = (
                    <>
                      <div>
                        <p className="font-medium">{getProfileName(period)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getClientName(period)} · {period.serviceProfile.category.name} · {period.period}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Badge variant={period.isPaid ? 'default' : 'outline'}>{period.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                        <span className="text-sm font-medium">{formatAmount(period.paymentAmount)}</span>
                      </div>
                    </>
                  );

                  return period.serviceProfileId ? (
                    <Link
                      key={period.id}
                      href={`/dashboard/services/${period.serviceProfileId}`}
                      className="grid gap-2 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_auto]"
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
          <Card>
            <CardHeader>
              <CardTitle>Service mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.categoryMix.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add categories to start tracking service groups.</p>
              ) : (
                data.categoryMix.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.frequency}</p>
                    </div>
                    <Badge variant="secondary">{category._count.serviceProfiles}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
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
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="text-sm font-medium">{client.name}</span>
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
