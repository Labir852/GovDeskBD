'use client';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {Home, Settings, LifeBuoy, SquareUser} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 7v10l10 5 10-5V7" />
            <path d="M12 22V12" />
            <path d="M22 7l-10 5" />
            <path d="M2 7l10 5" />
            <path d="M17 4.5l-10 5" />
            <path d="M7 19.5l10-5" />
          </svg>
          <span className="text-xl font-semibold">GovDesk BD</span>
        </div>
      </SidebarHeader>
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
    </>
  );
}
