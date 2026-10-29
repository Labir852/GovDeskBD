import { getServiceProfileById } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/encryption';
import { CopyButton } from '@/components/ui/copy-button';

export const metadata = { title: 'Service Profile | GovDesk Admin' };

const formatAmount = (amount: number | null | undefined) =>
  new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'BDT',
  }).format(amount ?? 0);

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
  if (!id || id === 'undefined') {
    redirect('/dashboard/services');
  }

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
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm backdrop-blur-xl">
        <Button variant="outline" asChild className="w-fit">
          <Link href={`/dashboard/services/`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Service Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{ownerType}</p>
              <p className="text-lg font-semibold text-foreground">{ownerName}</p>
              <p className="text-sm text-muted-foreground">Client: {clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Service Category</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-foreground">{profile.category.name}</span>
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
                  <p className="text-sm break-all text-foreground/80">{portalUrl}</p>
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

        <Card className="rounded-[1.75rem] border-border bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Billing Periods</CardTitle>
              <CardDescription>Track payment status and service periods</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href={`/dashboard/services/${profile.id}/periods/new`}>
                <Plus className="mr-2 h-4 w-4" /> Add Period
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {profile.servicePeriods.length === 0 ? (
              <div className="space-y-4 rounded-3xl border border-border bg-muted/50 p-8 text-center text-muted-foreground">
                <p>No billing periods recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.servicePeriods.map((period) => (
                  <div key={period.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{period.period}</p>
                      <p className="text-sm text-muted-foreground">{formatAmount(period.paymentAmount)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={period.isPaid ? 'default' : 'secondary'}>
                        {period.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/services/${profile.id}/periods/${period.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
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
