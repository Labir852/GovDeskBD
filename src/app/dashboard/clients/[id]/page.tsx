import { getClientById } from '../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Edit } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const client = await getClientById(params.id);

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">Client Profile & Timeline</p>
        </div>
        <Badge variant={client.isActive ? 'default' : 'destructive'} className="text-sm px-4 py-1">
          {client.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{client.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{client.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NID Number</p>
              <p className="font-medium">{client.nid || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Password</p>
              <p className="font-mono text-sm">{client.encryptedEmailPassword ? '•••••••• (Encrypted)' : 'N/A'}</p>
            </div>
            {client.notes && (
              <div className="col-span-2 mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p>{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations ({client._count.organizations})</CardTitle>
            <CardDescription>Businesses owned by this client.</CardDescription>
          </CardHeader>
          <CardContent>
            {client.organizations.length > 0 ? (
              <ul className="space-y-3">
                {client.organizations.map((org) => (
                  <li key={org.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.tradeLicenseNo || 'No Trade License'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No organizations found.</p>
            )}
            <Button variant="outline" className="w-full mt-4" size="sm">Add Organization</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>History of changes and updates for this client.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border-l ml-3 space-y-6 pb-4">
              {timeline.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                  <p className="text-sm font-medium">
                    {log.action} by {log.user?.name || 'System'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.details && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded-md overflow-x-auto">
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
