import { getCategories } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import Link from 'next/link';

export const metadata = {
  title: 'Service Categories | GovDesk Admin',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <section className="animate-fade-in-up rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Category inventory</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Service Categories</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Create, update, and organize the service categories used across your portal.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/categories/new">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/90 p-4 shadow-sm">
        <DataTable columns={columns} data={categories} searchKey="name" searchPlaceholder="Search by category name..." />
      </section>
    </div>
  );
}
