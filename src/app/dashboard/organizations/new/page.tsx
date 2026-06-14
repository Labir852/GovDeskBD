'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrganization, getClientsForSelect } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    getClientsForSelect().then(setClients);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set('clientId', selectedClientId);
    const result = await createOrganization(formData);

    if (result.success) {
      router.push('/dashboard/organizations');
    } else {
      alert(result.error);
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto animate-fade-in-up"
    >
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/organizations"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Add New Organization</h1>
              <p className="text-sm text-muted-foreground">Register a business and link it to a client.</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information for the organization profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientId">Owner (Client) *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                  <SelectTrigger>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/organizations">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading || !selectedClientId}>
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
