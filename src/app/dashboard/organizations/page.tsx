import { getOrganizations } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import Link from 'next/link';

export const metadata = { title: 'Organizations | GovDesk Admin' };

export default async function OrganizationsPage() {
  const orgs = await getOrganizations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage businesses and associate them with clients.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/organizations/new">
            <Plus className="mr-2 h-4 w-4" /> Add Organization
          </Link>
        </Button>
      </div>
      
      <DataTable columns={columns} data={orgs} searchKey="name" searchPlaceholder="Search by organization name..." />
    </div>
  );
}
