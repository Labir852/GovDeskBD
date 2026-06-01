import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, Sidebar as SidebarUI, SidebarContent } from '@/components/ui/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
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
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/20">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Mobile sidebar sheet */}
        <SidebarUI className="md:hidden">
          <SidebarContent>
            <Sidebar />
          </SidebarContent>
        </SidebarUI>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Suspense fallback={<LoadingBar />}>
            <Topbar />
          </Suspense>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Suspense fallback={<LoadingBar />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
