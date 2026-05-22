'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCategory } from './actions';

export type CategoryData = {
  id: string;
  name: string;
  frequency: string;
  _count: { serviceProfiles: number };
};

const frequencyColorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Monthly: 'default',
  Quarterly: 'secondary',
  Yearly: 'destructive',
  'One-time': 'outline',
};

export const columns: ColumnDef<CategoryData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className="font-semibold">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: ({ row }) => {
      const frequency = row.getValue('frequency') as string;
      const variant = frequencyColorMap[frequency] || 'secondary';
      return <Badge variant={variant}>{frequency}</Badge>;
    },
  },
  {
    id: 'serviceProfiles',
    header: 'Services',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original._count.serviceProfiles} profiles</Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original;
      const hasProfiles = category._count.serviceProfiles > 0;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(category.id)}
            >
              Copy Category ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/categories/${category.id}`}
                className="cursor-pointer flex items-center justify-between w-full"
              >
                Edit <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={hasProfiles}
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                if (confirm(`Delete category "${category.name}"?`)) {
                  const result = await deleteCategory(category.id);
                  if (!result.success) alert(result.error);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
