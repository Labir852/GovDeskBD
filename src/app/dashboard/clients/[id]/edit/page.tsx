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
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/clients/${id}`}>
          <span className="mr-2">←</span> Back to Profile
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
          <CardDescription>Update the client's personal information and credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground">Passwords are encrypted using AES-256.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={client.notes ?? ''}
                placeholder="Any extra information about this client..."
              />
            </div>

            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={client.isActive}
                value="true"
                className="w-4 h-4 rounded cursor-pointer"
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                Mark as Active
              </Label>
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
