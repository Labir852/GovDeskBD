'use client';

import { createServiceProfile, getOrganizationsForSelect, getCategoriesForSelect } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Organization = { id: string; name: string };
type Category = { id: string; name: string; frequency: string };

export default function NewServiceProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const orgId = searchParams.get('orgId') || '';
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState(orgId);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    async function load() {
      const orgs = await getOrganizationsForSelect(clientId || undefined);
      const cats = await getCategoriesForSelect();
      setOrganizations(orgs);
      setCategories(cats);
      if (!orgId && orgs.length === 1) {
        setSelectedOrgId(orgs[0].id);
      }
      if (!selectedCategoryId && cats.length === 1) {
        setSelectedCategoryId(cats[0].id);
      }
    }
    load();
  }, [clientId, orgId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedOrgId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an organization',
      });
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('organizationId', selectedOrgId);
    const result = await createServiceProfile(formData);

    if (result.success) {
      toast({
        title: 'Service profile created',
        description: 'The service profile has been created successfully.',
      });
      router.push('/dashboard/services');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to create service profile.',
      });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/services"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create Service Profile</h1>
              <p className="text-sm text-muted-foreground">Add a new service profile with portal credentials.</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Service Profile Details</CardTitle>
          <CardDescription>Add a new service profile with portal credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="organizationId" value={selectedOrgId} />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization *</Label>
                <Select value={selectedOrgId} onValueChange={setSelectedOrgId} required>
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
                <input type="hidden" name="categoryId" value={selectedCategoryId} />
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
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
                <Input
                  id="portalUserId"
                  name="portalUserId"
                  placeholder="e.g., user@portal.gov.bd"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portalPassword">Portal Password</Label>
                <Input
                  id="portalPassword"
                  name="portalPassword"
                  placeholder="Enter portal password (will be encrypted)"
                  type="password"
                />
                <p className="text-xs text-slate-500">Passwords are stored securely with AES-256 encryption.</p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !selectedOrgId || !selectedCategoryId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
