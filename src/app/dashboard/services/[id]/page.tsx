import { getServiceProfileById } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/encryption';
import { CopyButton } from '@/components/ui/copy-button';

export const metadata = { title: 'Service Profile | GovDesk Admin' };

function buildPortalLink(url: string, userId?: string | null, password?: string) {
  try {
    const parsed = new URL(url);
    if (userId) parsed.searchParams.set('username', userId);
    if (password) parsed.searchParams.set('password', password);
    return parsed.toString();
  } catch {
    return url;
  }
}

function CopyableCredential({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
      <p className="text-sm font-mono flex-1 break-all">{value}</p>
      <CopyButton value={value} label={label} showText={true} />
    </div>
  );
}

export default async function ServiceProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getServiceProfileById(id);

  if (!profile) {
    redirect('/dashboard/services');
  }

  const ownerName = profile.organization?.name || profile.client?.name || 'Unassigned profile';
  const ownerType = profile.organization ? 'Organization' : 'Client';
  const clientName = profile.organization?.client.name || profile.client?.name || 'No client linked';
  const portalUrl = profile.category.portalUrl?.trim();
  const decryptedPassword = profile.portalEncryptedPassword ? decrypt(profile.portalEncryptedPassword) : '';
  const portalPassword = decryptedPassword && decryptedPassword !== 'Decryption failed' ? decryptedPassword : '';
  const portalLink = portalUrl
    ? buildPortalLink(portalUrl, profile.portalUserId, portalPassword)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/dashboard/services/`}>
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
              <p className="text-sm font-medium text-muted-foreground">{ownerType}</p>
              <p className="text-lg font-semibold">{ownerName}</p>
              <p className="text-sm text-muted-foreground">Client: {clientName}</p>
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
              {profile.portalUserId ? (
                <CopyableCredential value={profile.portalUserId} label="User ID" />
              ) : (
                <p className="text-sm text-muted-foreground">Not Set</p>
              )}
            </div>
            {portalPassword && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portal Password</p>
                <CopyableCredential value={portalPassword} label="Password" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Portal URL</p>
              {portalUrl ? (
                <div className="space-y-2">
                  <p className="text-sm break-all text-slate-700">{portalUrl}</p>
                  <Button asChild className="w-full">
                    <Link href={portalLink ?? portalUrl} target="_blank" rel="noopener noreferrer">
                      Open Portal
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No portal URL configured for this category.</p>
              )}
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
