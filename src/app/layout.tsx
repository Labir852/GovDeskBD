import type {Metadata} from 'next';
import './globals.css';
import {Sidebar, SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {Toaster} from '@/components/ui/toaster';
import SidebarContent from './sidebar';

export const metadata: Metadata = {
  title: 'GovDesk BD',
  description: 'Your Government Service Assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarContent />
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-semibold">GovDesk BD</h1>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
