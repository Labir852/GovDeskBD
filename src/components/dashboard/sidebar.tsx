'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Building2, Briefcase, Calculator, Settings, LogOut, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Clients', href: '/dashboard/clients', icon: Users },
  { title: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
  { title: 'Categories', href: '/dashboard/categories', icon: Tags },
  { title: 'Service Profiles', href: '/dashboard/services', icon: Briefcase },
  { title: 'Tax Calculator', href: '/dashboard/tax-calculator', icon: Calculator },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border shadow-sm">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-sidebar-primary to-sidebar-primary/60 bg-clip-text text-transparent">
          GovDesk Admin
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <span className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:text-sidebar-primary">
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-sidebar-primary/10"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                      <motion.span
                        layoutId="active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-sidebar-primary"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    </>
                  )}
                  <item.icon className={cn("z-10 h-5 w-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground")} />
                  <span className={cn("z-10", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground")}>
                    {item.title}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <Button 
          type="button"
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 "
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
