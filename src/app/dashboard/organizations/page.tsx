import { getOrganizations } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import Link from 'next/link';

export const metadata = { title: 'Organizations | GovDesk Admin' };

export default async function OrganizationsPage() {
  const orgs = await getOrganizations();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Organizations</h1>
            <p className="text-sm text-muted-foreground">Manage businesses and associate them with clients.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/organizations/new">
              <Plus className="mr-2 h-4 w-4" /> Add Organization
            </Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
        <CardContent className="p-0">
          <DataTable columns={columns} data={orgs} searchKey="name" searchPlaceholder="Search by organization name..." />
        </CardContent>
      </Card>
    </div>
  );
}
