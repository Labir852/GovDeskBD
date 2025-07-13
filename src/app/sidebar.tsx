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
            className="h-6 w-6 text-primary"
            fill="currentColor"
          >
            <path d="M144,16H48A16,16,0,0,0,32,32V224a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V80Z" opacity="0.2" />
            <path d="M208,72H152a8,8,0,0,1-8-8V8a8,8,0,0,0-8-8H48A24,24,0,0,0,24,32V224a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80a8,8,0,0,0-8-8ZM48,32H136V64h28.7L189.3,88.7,164.7,113.3,189.3,138l-24.6,24.6L189.3,187.3,164.7,212l24.6-24.7L213.9,212,216,210.1V224H48Z" />
            <path d="M208,72h-56V16l56,56Z" />
          </svg>
          <span className="text-lg font-semibold">GovDesk BD</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" isActive={isActive('/')} tooltip="Dashboard">
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/settings" isActive={isActive('/settings')} tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/help" isActive={isActive('/help')}>
              <LifeBuoy />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/profile" isActive={isActive('/profile')}>
              <SquareUser />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
