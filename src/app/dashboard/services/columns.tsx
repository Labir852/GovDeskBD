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
import { deleteServiceProfile } from './actions';

export type ServiceProfileData = {
  id: string;
  organizationId: string;
  categoryId: string;
  portalUserId: string | null;
  organization: {
    id: string;
    name: string;
    client: { name: string };
  };
  category: {
    id: string;
    name: string;
    frequency: string;
  };
  _count: { servicePeriods: number };
  createdAt: Date;
};

export const columns: ColumnDef<ServiceProfileData>[] = [
  {
    accessorKey: 'organization',
    header: 'Organization',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/organizations/${row.original.organizationId}`}
        className="text-primary hover:underline font-semibold"
      >
        {row.original.organization.name}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Service Category',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.category.name}</span>
        <Badge variant="outline" className="text-xs">
          {row.original.category.frequency}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'portalUserId',
    header: 'Portal Account',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.portalUserId ? `●●●●●●${row.original.portalUserId.slice(-2)}` : 'Not Set'}
      </span>
    ),
  },
  {
    id: 'periods',
    header: 'Billing Periods',
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original._count.servicePeriods}</Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const profile = row.original;
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
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/services/${profile.id}`}
                className="cursor-pointer flex items-center justify-between w-full"
              >
                View <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/services/${profile.id}/edit`}>Edit Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                if (confirm('Delete this service profile?')) {
                  const result = await deleteServiceProfile(profile.id);
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
