'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await createClient(formData);
    
    if (result.success) {
      router.push('/dashboard/clients');
    } else {
      alert(result.error);
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
          <p className="text-muted-foreground">Enter the client's personal details and credentials.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
          <CardDescription>Basic information for the client profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="01XXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nid">NID Number</Label>
                <Input id="nid" name="nid" placeholder="National ID" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailPassword">Email Password (Secure Storage)</Label>
                <Input id="emailPassword" name="emailPassword" type="text" placeholder="Will be encrypted securely" />
                <p className="text-xs text-muted-foreground">This password will be encrypted using AES-256 before saving to the database.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Any extra information about this client..." />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/clients">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
