"use client";

import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Wallet, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ADMIN_WALLET } from '@/lib/admin';

export function ConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return <div className="h-10 w-32 bg-muted animate-pulse rounded-full" />;
  }

  if (authenticated && user) {
    // Truncate wallet address
    const address = user.wallet?.address || '';
    const displayAddress = address 
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : 'Connected';
      
    const isAdmin = address.toLowerCase() === ADMIN_WALLET.toLowerCase();

    return (
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link 
            href="/admin" 
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Panel</span>
          </Link>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 bg-card/80 backdrop-blur-sm text-foreground font-semibold text-sm rounded-full hover:bg-card hover:shadow-md hover:border-primary/30 transition-all border border-border group"
        >
          <span className="group-hover:hidden flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {displayAddress}
          </span>
          <span className="hidden group-hover:flex items-center gap-2 text-red-500">
            <LogOut className="w-4 h-4" />
            Disconnect
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-full hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
