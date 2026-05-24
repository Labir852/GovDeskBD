import { getCategoryById, updateCategory, deleteCategory } from '../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { EditCategoryForm } from './edit-form';

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  const hasProfiles = category._count.serviceProfiles > 0;

  // Fetch the audit logs for the timeline
  const timeline = await prisma.auditLog.findMany({
    where: { entityId: category.id, entity: 'Category' },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/categories"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground">Edit category details</p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-1">
          {category._count.serviceProfiles} service profile{category._count.serviceProfiles !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <EditCategoryForm
            category={{
              id: category.id,
              name: category.name,
              frequency: category.frequency,
              portalUrl: category.portalUrl,
            }}
            hasProfiles={hasProfiles}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Profiles</CardTitle>
              <CardDescription>Profiles attached to this category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{category._count.serviceProfiles}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category._count.serviceProfiles === 0
                      ? 'No profiles attached'
                      : 'Active profile(s)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>History of changes for this category.</CardDescription>
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
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
