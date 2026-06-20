import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'CryptoCards.fyi | The Curated Directory of Premium Crypto Cards',
  description: 'Spend onchain. Compare fees, cashback rewards, and supported networks across the best verified crypto cards and Web3 debit cards.',
  openGraph: {
    title: 'CryptoCards.fyi | The Curated Directory of Premium Crypto Cards',
    description: 'Compare fees, cashback rewards, and supported networks across 20+ verified crypto cards.',
    url: 'https://cryptocards.fyi',
    siteName: 'CryptoCards.fyi',
    images: [
      {
        url: 'https://cryptocards.fyi/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoCards.fyi | Best Crypto Cards',
    description: 'Compare fees, cashback rewards, and supported networks across 20+ verified crypto cards.',
  },
};

import { GeistSans } from 'geist/font/sans';

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} font-sans antialiased flex flex-col min-h-screen`}>
        <Providers>
          <div className="flex-grow relative">
            {children}
            {modal}
          </div>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
