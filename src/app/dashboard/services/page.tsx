import { getServiceProfiles } from './actions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServicesTabs } from './services-tabs';
import Link from 'next/link';

export const metadata = { title: 'Service Profiles | GovDesk Admin' };

export default async function ServiceProfilesPage() {
  const profiles = await getServiceProfiles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Profiles</h1>
          <p className="text-muted-foreground">Manage portal credentials and billing periods for services.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/services/new">
            <Plus className="mr-2 h-4 w-4" /> Add Service Profile
          </Link>
        </Button>
      </div>

      <ServicesTabs profiles={profiles} />
    </div>
  );
}
