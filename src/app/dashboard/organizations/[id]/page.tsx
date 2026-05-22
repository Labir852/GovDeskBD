import { getOrganizationById } from '../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import DeleteOrganizationButton from './delete-button';

export default async function OrganizationDetailsPage({ params }: { params: { id: string } }) {
  const org = await getOrganizationById(params.id);

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/organizations"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
          <p className="text-muted-foreground">Organization Profile & Timeline</p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-1">
          {org._count.serviceProfiles} Services
        </Badge>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/organizations/${org.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        <DeleteOrganizationButton orgId={org.id} orgName={org.name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization Name</p>
              <p className="font-medium">{org.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner (Client)</p>
              <Link
                href={`/dashboard/clients/${org.client.id}`}
                className="font-medium text-primary hover:underline flex items-center gap-1"
              >
                <User className="h-3.5 w-3.5" />
                {org.client.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trade License No</p>
              <p className="font-medium">{org.tradeLicenseNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">{new Date(org.createdAt).toLocaleDateString()}</p>
            </div>
            {org.address && (
              <div className="col-span-2 mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Address</p>
                <p>{org.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>Service Profiles ({org._count.serviceProfiles})</CardTitle>
            <CardDescription>Services linked to this organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {org.serviceProfiles.length > 0 ? (
              <ul className="space-y-3">
                {org.serviceProfiles.map((sp) => (
                  <li key={sp.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{sp.category.name}</p>
                      <p className="text-xs text-muted-foreground">{sp.category.frequency}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No service profiles found.</p>
            )}
            <Button variant="outline" className="w-full mt-4" size="sm" asChild>
              <Link href={`/dashboard/services/new?orgId=${org.id}`}>Add Service</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>History of changes and updates for this organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length > 0 ? (
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
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
