'use client';

import { updateServiceProfile, getServiceProfileById, getOrganizationsForSelect, getCategoriesForSelect } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { CopyButton } from '@/components/ui/copy-button';

type Organization = { id: string; name: string };
type Category = { id: string; name: string; frequency: string };

export default function EditServiceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [organizationId, setOrganizationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [portalUserId, setPortalUserId] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function load() {
      const prof = await getServiceProfileById(id);
      const orgs = await getOrganizationsForSelect();
      const cats = await getCategoriesForSelect();

      if (!prof) {
        router.push('/dashboard/services');
        return;
      }

      setProfile(prof);
      setOrganizationId(prof.organizationId ?? '');
      setCategoryId(prof.categoryId);
      setPortalUserId(prof.portalUserId ?? '');
      setPortalPassword(prof.portalDecryptedPassword ?? '');
      setOrganizations(orgs);
      setCategories(cats);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateServiceProfile(id, formData);

    if (result.success) {
      toast({
        title: 'Service profile updated',
        description: 'The service profile has been updated successfully.',
      });
      router.push(`/dashboard/services/${id}`);
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
        <Link href={`/dashboard/services/${id}`}>
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
              <Select value={organizationId} onValueChange={setOrganizationId} name="organizationId" required>
                <SelectTrigger id="organizationId">
                  <SelectValue placeholder="Select an organization" />
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
              <Select value={categoryId} onValueChange={setCategoryId} name="categoryId" required>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
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
              <div className="flex gap-2">
                <Input
                  id="portalUserId"
                  name="portalUserId"
                  value={portalUserId}
                  onChange={(event) => setPortalUserId(event.target.value)}
                  placeholder="e.g., user@portal.gov.bd"
                  type="text"
                  className="font-mono flex-1"
                />
                <CopyButton value={portalUserId} label="User ID" variant="outline" className="h-10 w-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalPassword">Portal Password</Label>
              <div className="flex gap-2">
                <Input
                  id="portalPassword"
                  name="portalPassword"
                  value={portalPassword}
                  onChange={(event) => setPortalPassword(event.target.value)}
                  placeholder="Leave blank to keep existing password"
                  type={showPassword ? 'text' : 'password'}
                  className="font-mono flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                  className="h-10 w-10 flex-shrink-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <CopyButton value={portalPassword} label="Password" variant="outline" className="h-10 w-10" />
              </div>
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
