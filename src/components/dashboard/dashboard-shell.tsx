'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  function handleMenuClick() {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setDesktopSidebarOpen((open) => !open);
      return;
    }

    setMobileSidebarOpen(true);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/20">
      <aside
        className={`hidden shrink-0 overflow-hidden border-r bg-card transition-[width] duration-300 ease-in-out md:block ${
          desktopSidebarOpen ? 'w-64' : 'w-0 border-r-0'
        }`}
      >
        <Sidebar />
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard navigation</SheetTitle>
            <SheetDescription>Open dashboard sections and admin tools.</SheetDescription>
          </SheetHeader>
          <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={handleMenuClick} />
        {children}
      </div>
    </div>
  );
}
