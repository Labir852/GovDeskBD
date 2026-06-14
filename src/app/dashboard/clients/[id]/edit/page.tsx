import { notFound, redirect } from 'next/navigation';
import { updateClient, getClientById } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const result = await updateClient(id, formData);
    if (result.success) {
      redirect(`/dashboard/clients/${id}`);
    }
    throw new Error(result.error || 'Failed to update client');
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <Button variant="outline" asChild className="w-fit">
          <Link href={`/dashboard/clients/${id}`}>
            <span className="mr-2">←</span> Back to Profile
          </Link>
        </Button>
      </div>

      <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
          <CardDescription>Update the client's personal information and credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={client.name}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={client.phone ?? ''}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client.email ?? ''}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nid">NID Number</Label>
                <Input
                  id="nid"
                  name="nid"
                  defaultValue={client.nid ?? ''}
                  placeholder="National ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Email Password</Label>
                <Input
                  id="emailPassword"
                  name="emailPassword"
                  type="password"
                  placeholder="Leave blank to keep existing password"
                />
                <p className="text-xs text-slate-500">Passwords are encrypted using AES-256.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
              <label htmlFor="isActive" className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={client.isActive}
                  value="true"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                Mark as Active
              </label>
            </div>

            <Button type="submit" className="w-full">
              Update Client
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
