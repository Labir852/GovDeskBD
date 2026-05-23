'use client';
import {
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {Home, Settings, LifeBuoy, SquareUser} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={isActive('/')} tooltip="Dashboard">
                <a>
                  <Home />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/settings" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={isActive('/settings')} tooltip="Settings">
                <a>
                  <Settings />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/help" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={isActive('/help')}>
                <a>
                  <LifeBuoy />
                  <span>Help & Support</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/profile" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={isActive('/profile')}>
                <a>
                  <SquareUser />
                  <span>Profile</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarProvider>
  );
}
