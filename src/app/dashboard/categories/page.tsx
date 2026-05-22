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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Categories</h1>
          <p className="text-muted-foreground">
            Manage service categories like VAT, eReturn, IRC, ERC, and Trade License.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={categories} searchKey="name" searchPlaceholder="Search by category name..." />
    </div>
  );
}
