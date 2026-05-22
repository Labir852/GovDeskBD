import { getServiceProfiles } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import Link from 'next/link';

export const metadata = { title: 'Service Profiles | GovDesk Admin' };

export default async function ServiceProfilesPage() {
  const profiles = await getServiceProfiles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Profiles</h1>
          <p className="text-muted-foreground">Manage portal credentials and billing periods for services.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/services/new">
            <Plus className="mr-2 h-4 w-4" /> Add Service Profile
          </Link>
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={profiles} 
        searchKey="organization.name" 
        searchPlaceholder="Search by organization or service..." 
      />
    </div>
  );
}
