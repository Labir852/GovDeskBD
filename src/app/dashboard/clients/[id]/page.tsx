import { getClientById } from '../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Edit } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  // Fetch the audit logs for the timeline
  const timeline = await prisma.auditLog.findMany({
    where: { entityId: client.id, entity: 'Client' },
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/clients"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{client.name}</h1>
              <p className="text-sm text-muted-foreground">Client Profile & timeline</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={client.isActive ? 'default' : 'destructive'} className="text-sm px-4 py-1">
              {client.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${client.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Phone number</p>
              <p className="font-medium text-foreground">{client.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email address</p>
              <p className="font-medium text-foreground">{client.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NID number</p>
              <p className="font-medium text-foreground">{client.nid || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email password</p>
              <p className="font-mono text-sm text-foreground">{client.encryptedEmailPassword ? '•••••••• (Encrypted)' : 'N/A'}</p>
            </div>
            {client.notes && (
              <div className="col-span-2 mt-4 rounded-3xl border border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-2 text-foreground/80">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Businesses owned by this client.</CardDescription>
            </CardHeader>
            <CardContent>
              {client.organizations.length > 0 ? (
                <ul className="space-y-3">
                  {client.organizations.map((org) => (
                    <li key={org.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-muted/50 p-4 transition hover:bg-muted/80">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-sky-100 dark:bg-sky-950/20 p-3 text-sky-600 dark:text-sky-400">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{org.name}</p>
                            <p className="text-xs text-muted-foreground">{org.tradeLicenseNo || 'No Trade License'}</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/dashboard/services/new?orgId=${org.id}`}>Add Service</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No organizations found.</p>
              )}
              <Button variant="outline" className="w-full mt-4" size="sm" asChild>
                <Link href={`/dashboard/clients/${client.id}/new-org`}>Add Organization</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Service Profiles</CardTitle>
              <CardDescription>Services assigned to this client.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create new services through the services dashboard or add them directly to an organization.
              </p>
              <Button asChild className="w-full">
                <Link href={`/dashboard/services/new?orgId=${client.organizations[0]?.id || ''}`}>Add Service</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-3 rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>History of changes and updates for this client.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
