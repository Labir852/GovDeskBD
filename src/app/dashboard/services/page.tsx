import { getServiceProfiles } from './actions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServicesTabs } from './services-tabs';
import Link from 'next/link';

export const metadata = { title: 'Service Profiles | GovDesk Admin' };

export default async function ServiceProfilesPage() {
  const profiles = await getServiceProfiles();

  return (
    <div className="space-y-6">
      <section className="animate-fade-in-up rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Service profiles</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Service Profiles</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage portal credentials and billing periods for services from one simple page.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" /> Add Service Profile
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/90 p-4 shadow-sm">
        <ServicesTabs profiles={profiles} />
      </section>
    </div>
  );
}
