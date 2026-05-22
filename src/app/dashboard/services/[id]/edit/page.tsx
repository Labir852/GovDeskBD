'use client';

import { updateServiceProfile, getServiceProfileById, getOrganizationsForSelect, getCategoriesForSelect } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Organization = { id: string; name: string };
type Category = { id: string; name: string; frequency: string };

export default function EditServiceProfilePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const prof = await getServiceProfileById(params.id);
      const orgs = await getOrganizationsForSelect();
      const cats = await getCategoriesForSelect();

      if (!prof) {
        router.push('/dashboard/services');
        return;
      }

      setProfile(prof);
      setOrganizations(orgs);
      setCategories(cats);
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateServiceProfile(params.id, formData);

    if (result.success) {
      toast({
        title: 'Service profile updated',
        description: 'The service profile has been updated successfully.',
      });
      router.push(`/dashboard/services/${params.id}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to update service profile.',
      });
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/services/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Service Profile</CardTitle>
          <CardDescription>Update portal credentials and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization *</Label>
              <Select defaultValue={profile?.organizationId} name="organizationId" required>
                <SelectTrigger id="organizationId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Service Category *</Label>
              <Select defaultValue={profile?.categoryId} name="categoryId" required>
                <SelectTrigger id="categoryId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.frequency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalUserId">Portal Account ID</Label>
              <Input
                id="portalUserId"
                name="portalUserId"
                defaultValue={profile?.portalUserId || ''}
                placeholder="e.g., user@portal.gov.bd"
                type="text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalPassword">Portal Password</Label>
              <Input
                id="portalPassword"
                name="portalPassword"
                placeholder="Leave blank to keep existing password"
                type="password"
              />
              <p className="text-xs text-muted-foreground">Passwords are stored securely with AES-256 encryption.</p>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Service Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
