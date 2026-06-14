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
    <div className="space-y-6 max-w-2xl animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <Button variant="outline" asChild className="w-fit">
          <Link href={`/dashboard/services/${id}`}>
            <span className="mr-2">←</span> Back to Profile
          </Link>
        </Button>
      </div>

      <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Edit Service Profile</CardTitle>
          <CardDescription>Update portal credentials and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization *</Label>
              <select 
                id="organizationId" 
                name="organizationId" 
                title="Organization"
                defaultValue={profile.organizationId ?? ''} 
                className="w-full rounded-3xl border border-border bg-background text-foreground px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                title="Service Category"
                defaultValue={profile.categoryId} 
                className="w-full rounded-3xl border border-slate-200 px-4 py-3 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
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
              <p className="text-xs text-slate-500">Passwords are stored securely with AES-256 encryption.</p>
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
