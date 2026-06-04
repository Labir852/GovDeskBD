import { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getCurrentUser } from '@/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

function LoadingBar() {
  return (
    <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent animate-pulse" />
  );
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell>
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Suspense fallback={<LoadingBar />}>{children}</Suspense>
      </main>
    </DashboardShell>
  );
}
