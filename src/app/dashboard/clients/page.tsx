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
    <div className="space-y-6">
      <section className="animate-fade-in-up rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Client management</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Clients</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Manage your clients and their personal details with a cleaner, faster interface.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/clients/new">
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/90 p-4 shadow-sm">
        <DataTable columns={columns} data={clients} searchKey="name" searchPlaceholder="Search by client name..." />
      </section>
    </div>
  );
}
