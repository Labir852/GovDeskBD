import { getClients } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import Link from 'next/link';

export const metadata = {
  title: 'Clients | GovDesk Admin',
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your clients and their personal details.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Link>
        </Button>
      </div>
      
      <DataTable columns={columns} data={clients} searchKey="name" searchPlaceholder="Search by client name..." />
    </div>
  );
}
