'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrganization } from '../actions';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteOrganizationButtonProps {
  orgId: string;
  orgName: string;
}

export default function DeleteOrganizationButton({ orgId, orgName }: DeleteOrganizationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(`Delete organization "${orgName}"? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteOrganization(orgId);
    setIsDeleting(false);

    if (!result.success) {
      window.alert(result.error || 'Failed to delete organization.');
      return;
    }

    router.push('/dashboard/organizations');
    router.refresh();
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
