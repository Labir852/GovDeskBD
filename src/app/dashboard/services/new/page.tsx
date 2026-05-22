'use client';

import { createServiceProfile, getOrganizationsForSelect, getCategoriesForSelect } from '../actions';
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

export default function NewServiceProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      const orgs = await getOrganizationsForSelect();
      const cats = await getCategoriesForSelect();
      setOrganizations(orgs);
      setCategories(cats);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
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
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href="/dashboard/services">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Service Profile</CardTitle>
          <CardDescription>Add a new service profile with portal credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization *</Label>
              <Select defaultValue="" name="organizationId" required>
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
              <Select defaultValue="" name="categoryId" required>
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
              <p className="text-xs text-muted-foreground">Passwords are stored securely with AES-256 encryption.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
