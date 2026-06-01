'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createOrganization, getClientsForSelect } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Client = { id: string; name: string };

export default function NewOrganizationFromClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(searchParams.get('clientId') || '');

  useEffect(() => {
    getClientsForSelect().then(setClients);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClientId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a client'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set('clientId', selectedClientId);
    
    const result = await createOrganization(formData);

    if (result.success) {
      toast({
        title: 'Organization created',
        description: 'The organization has been created successfully.',
      });
      router.push(`/dashboard/clients/${selectedClientId}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to create organization'
      });
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/organizations"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Organization</h1>
          <p className="text-muted-foreground">Register a business and link it to a client.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information for the organization profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientId">Owner (Client) *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input id="name" name="name" required placeholder="Acme Corp Ltd." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeLicenseNo">Trade License No</Label>
                <Input id="tradeLicenseNo" name="tradeLicenseNo" placeholder="TL-XXXXXXX" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="123 Business Road, Dhaka" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/organizations">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading || !selectedClientId}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
