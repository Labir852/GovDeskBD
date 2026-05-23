import { SettingsContent } from '@/app/settings/page';

export const metadata = {
  title: 'Settings | GovDesk Admin',
};

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams?: { updated?: string; created?: string; seeded?: string };
}) {
  return <SettingsContent basePath="/dashboard/settings" searchParams={searchParams} />;
}
