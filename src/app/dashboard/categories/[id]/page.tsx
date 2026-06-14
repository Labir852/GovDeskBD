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
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/categories"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{category.name}</h1>
              <p className="text-sm text-muted-foreground">Edit category details</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {category._count.serviceProfiles} service profile{category._count.serviceProfiles !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-[1.75rem] border border-border bg-card shadow-sm p-6">
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
        </div>

        <div className="flex flex-col gap-6">
          <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Service Profiles</CardTitle>
              <CardDescription>Profiles attached to this category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-3xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-4xl font-bold text-foreground">{category._count.serviceProfiles}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category._count.serviceProfiles === 0 ? 'No profiles attached' : 'Active profile(s)'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>History of changes for this category.</CardDescription>
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
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
