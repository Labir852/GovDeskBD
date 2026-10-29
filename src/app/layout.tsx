import type {Metadata} from 'next';
import {ReactNode, Suspense} from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {NavigationProgress} from '@/components/navigation-progress';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
    url: 'https://govdeskbd.com',
    siteName: 'GovDesk BD',
    images: [
      {
        url: '/govdesk-banner.png',
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
    images: ['/govdesk-banner.png'],
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
  icons: {
    icon: '/govdesk-bd-logo-transparent crop.png',
    shortcut: '/govdesk-bd-logo-transparent crop.png',
    apple: '/govdesk-bd-logo-transparent crop.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="bn" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var mode = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = mode === 'dark' || (!mode && prefersDark);
                document.documentElement.classList.toggle('dark', isDark);

                var combo = localStorage.getItem('theme_combo') || 'national';
                document.documentElement.classList.remove('theme-national', 'theme-indigo', 'theme-blue', 'theme-teal', 'theme-charcoal');
                if (combo !== 'national') {
                  document.documentElement.classList.add('theme-' + combo);
                }
              } catch (error) {
                console.warn('Theme initialization failed', error);
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
