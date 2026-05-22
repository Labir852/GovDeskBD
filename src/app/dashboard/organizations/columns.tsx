'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type OrgData = {
  id: string;
  name: string;
  address: string | null;
  tradeLicenseNo: string | null;
  client: { id: string; name: string };
  _count: { serviceProfiles: number };
};

export const columns: ColumnDef<OrgData>[] = [
  {
    accessorKey: 'name',
    header: 'Organization Name',
    cell: ({ row }) => <div className="font-bold">{row.getValue('name')}</div>,
  },
  {
    id: 'client',
    header: 'Owner (Client)',
    cell: ({ row }) => (
      <Link href={`/dashboard/clients/${row.original.client.id}`} className="text-primary hover:underline">
        {row.original.client.name}
      </Link>
    ),
  },
  {
    accessorKey: 'tradeLicenseNo',
    header: 'Trade License',
  },
  {
    id: 'services',
    header: 'Services Attached',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original._count.serviceProfiles} Services</Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const org = row.original;
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
            <DropdownMenuItem>Edit Organization</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/services/new?orgId=${org.id}`}>Add Service</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
