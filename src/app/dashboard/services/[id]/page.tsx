import { getServiceProfileById } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Service Profile | GovDesk Admin' };

export default async function ServiceProfileDetailPage({ params }: { params: { id: string } }) {
  const profile = await getServiceProfileById(params.id);

  if (!profile) {
    redirect('/dashboard/services');
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" asChild className="w-fit">
        <Link href="/dashboard/services">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-lg font-semibold">{profile.organization.name}</p>
              <p className="text-sm text-muted-foreground">Client: {profile.organization.client.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Service Category</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{profile.category.name}</span>
                <Badge variant="outline">{profile.category.frequency}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Portal Account ID</p>
              <p className="text-lg font-mono font-semibold">
                {profile.portalUserId ? `●●●●●●${profile.portalUserId.slice(-2)}` : 'Not Set'}
              </p>
            </div>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href={`/dashboard/services/${profile.id}/edit`}>Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Periods</CardTitle>
            <CardDescription>Track payment status and service periods</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.servicePeriods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No billing periods recorded yet.</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href={`/dashboard/services/${profile.id}/periods/new`}>Add Period</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.servicePeriods.map((period) => (
                  <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{period.period}</p>
                      <p className="text-sm text-muted-foreground">${period.paymentAmount}</p>
                    </div>
                    <Badge variant={period.isPaid ? 'default' : 'secondary'}>
                      {period.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
