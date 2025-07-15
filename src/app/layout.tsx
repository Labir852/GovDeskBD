import type {Metadata} from 'next';
import './globals.css';
import {Sidebar, SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {Toaster} from '@/components/ui/toaster';
import SidebarContent from './sidebar';

export const metadata: Metadata = {
  title: {
    default: 'GovDesk BD - Your Trusted Partner for Government Services in Bangladesh',
    template: '%s | GovDesk BD',
  },
  description: 'GovDesk BD simplifies government services in Bangladesh. Get your e-trade license, TIN certificate, BIN, IRC, ERC, and file tax returns online with ease and expert assistance.',
  keywords: ['GovDesk BD', 'Bangladesh government services', 'e-trade license', 'TIN certificate', 'BIN certificate', 'IRC', 'ERC', 'online tax return Bangladesh', 'সরকারি সেবা', 'ই-ট্রেড লাইসেন্স', 'টিন সার্টিফিকেট'],
  authors: [{ name: 'GovDesk BD', url: 'https://www.facebook.com/govdeskbd/' }],
  openGraph: {
    title: 'GovDesk BD - Easy Government Services in Bangladesh',
    description: 'Effortlessly manage your e-trade license, TIN, BIN, and tax returns with GovDesk BD.',
    url: 'https://govdeskbd.com', // Replace with your actual domain
    siteName: 'GovDesk BD',
    images: [
      {
        url: '/govdesk-banner.png', // Path to your OG image
        width: 1200,
        height: 630,
        alt: 'GovDesk BD - Government Service Assistant',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GovDesk BD - Your Partner for BD Govt Services',
    description: 'Simplify your trade license, TIN, BIN, and tax filings with GovDesk BD.',
    images: ['/govdesk-banner.png'], // Path to your Twitter image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json', // Optional: if you have a manifest file
  icons: {
    icon: '/govdesk-bd-logo-transparent crop.png',
    shortcut: '/govdesk-bd-logo-transparent crop.png',
    apple: '/govdesk-bd-logo-transparent crop.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
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
            <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">GovDesk BD</h1>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
