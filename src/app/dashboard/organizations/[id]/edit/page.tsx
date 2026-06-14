import { notFound, redirect } from 'next/navigation';
import { updateOrganization, getOrganizationById, getClientsForSelect } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type Client = { id: string; name: string };

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganizationById(id);
  if (!org) {
    notFound();
  }

  const clients: Client[] = await getClientsForSelect();

  async function handleUpdate(formData: FormData) {
    'use server';
    const result = await updateOrganization(id, formData);
    if (result.success) {
      redirect(`/dashboard/organizations/${id}`);
    }
    throw new Error(result.error || 'Failed to update organization');
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <Button variant="outline" asChild className="w-fit">
          <Link href={`/dashboard/organizations/${id}`}>
            <span className="mr-2">←</span> Back to Profile
          </Link>
        </Button>
      </div>

      <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Edit Organization</CardTitle>
          <CardDescription>Update the organization's details and client assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientId">Owner (Client) *</Label>
              <select id="clientId" name="clientId" title="Owner (Client)" defaultValue={org.clientId || ''} className="w-full rounded-3xl border border-border bg-background text-foreground px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input id="name" name="name" defaultValue={org.name} placeholder="Acme Corp Ltd." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeLicenseNo">Trade License No</Label>
                <Input id="tradeLicenseNo" name="tradeLicenseNo" defaultValue={org.tradeLicenseNo ?? ''} placeholder="TL-XXXXXXX" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={org.address ?? ''} placeholder="123 Business Road, Dhaka" />
            </div>

            <Button type="submit" className="w-full">
              Update Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
