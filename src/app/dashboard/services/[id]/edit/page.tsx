'use server';

import { redirect, notFound } from 'next/navigation';
import { updateServiceProfile, getServiceProfileById, getOrganizationsForSelect, getCategoriesForSelect } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

type Organization = { id: string; name: string };
type Category = { id: string; name: string; frequency: string };

export default async function EditServiceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, organizations, categories] = await Promise.all([
    getServiceProfileById(id),
    getOrganizationsForSelect(),
    getCategoriesForSelect(),
  ]);

  if (!profile) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const result = await updateServiceProfile(id, formData);
    if (result.success) {
      redirect(`/dashboard/services/${id}`);
    }
    throw new Error(result.error || 'Failed to update service profile');
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/services/${id}`}>
          <span className="mr-2">←</span> Back to Profile
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Service Profile</CardTitle>
          <CardDescription>Update portal credentials and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization *</Label>
              <select 
                id="organizationId" 
                name="organizationId" 
                defaultValue={profile.organizationId ?? ''} 
                className="w-full rounded border px-3 py-2"
                required
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Service Category *</Label>
              <select 
                id="categoryId" 
                name="categoryId" 
                defaultValue={profile.categoryId} 
                className="w-full rounded border px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.frequency})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalUserId">Portal Account ID</Label>
              <Input
                id="portalUserId"
                name="portalUserId"
                defaultValue={profile.portalUserId ?? ''}
                placeholder="e.g., user@portal.gov.bd"
                type="text"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalPassword">Portal Password</Label>
              <Input
                id="portalPassword"
                name="portalPassword"
                placeholder="Leave blank to keep existing password"
                type="password"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Passwords are stored securely with AES-256 encryption.</p>
            </div>

            <Button type="submit" className="w-full">
              Update Service Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
