// LUMINEX Next.js - Root Layout
// Ana layout component'i - tüm uygulama için

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/components/providers/language-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { CookieBanner } from '@/components/legal/CookieBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LUMINEX - Sağlık Randevu Sistemi',
  description: 'LUMINEX ile randevunuzu kolayca oluşturun, doktorunuzla online görüşün. Türkiye\'nin en kapsamlı sağlık yönetim platformu.',
  keywords: ['sağlık', 'randevu', 'doktor', 'hastane', 'online görüşme', 'tele-tıp', 'reçete', 'test sonuçları'],
  authors: [{ name: 'LUMINEX' }],
  creator: 'LUMINEX',
  publisher: 'LUMINEX',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-icon.png',
  },
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://luminex.com.tr',
    title: 'LUMINEX - Sağlık Randevu Sistemi',
    description: 'LUMINEX ile randevunuzu kolayca oluşturun, doktorunuzla online görüşün. Türkiye\'nin en kapsamlı sağlık yönetim platformu.',
    siteName: 'LUMINEX',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LUMINEX'
      }
    ]
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'LUMINEX - Sağlık Randevu Sistemi',
    description: 'LUMINEX ile randevunuzu kolayca oluşturun, doktorunuzla online görüşün.',
    images: ['/og-image.png'],
    creator: '@luminex'
  },
  // Robots
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
  // Verification
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <CookieBanner />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
