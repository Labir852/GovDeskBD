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
            viewBox="0 0 256 256"
            className="h-7 w-7 text-primary"
            fill="currentColor"
          >
            <path d="M144,16H48A16,16,0,0,0,32,32V224a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V80Z" opacity="0.2" />
            <path d="M208,72H152a8,8,0,0,1-8-8V8a8,8,0,0,0-8-8H48A24,24,0,0,0,24,32V224a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80a8,8,0,0,0-8-8ZM160,224H48a8,8,0,0,1-8-8V32a8,8,0,0,1,8-8h88V72a16,16,0,0,0,16,16h40V216A8,8,0,0,1,208,224Z" />
            <path d="M208,72h-56V16Z" opacity="0.2" />
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
