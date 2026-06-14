"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  if (!appId) {
    console.warn("Missing NEXT_PUBLIC_PRIVY_APP_ID. Privy auth will fail.");
  }

  return (
    <PrivyProvider
      appId={appId || ''}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'apple'],
        appearance: {
          theme: 'dark',
          accentColor: '#171717',
          logo: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/credit-card.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </PrivyProvider>
  );
}
