'use client';

import { usePrivy } from '@privy-io/react-auth';
import { ADMIN_WALLET } from '@/lib/admin';
import { handleDeleteCard } from '@/app/actions';
import { Trash2, Loader2, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AdminCardActions({ cardId }: { cardId: string }) {
  const { authenticated, user } = usePrivy();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!authenticated || user?.wallet?.address !== ADMIN_WALLET) {
    return null; // Stealth Mode
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="text-sm font-bold text-primary flex-1">
        Admin Controls
      </div>
      <div className="flex items-center gap-3">
        <Link 
          href="/admin"
          className="bg-muted text-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit Card
        </Link>
        <form action={async (fd) => {
          if (!confirm('Are you sure you want to permanently delete this card?')) return;
          setIsDeleting(true);
          fd.append('caller_wallet', user.wallet!.address);
          fd.append('card_id', cardId);
          await handleDeleteCard(fd);
          router.push('/');
        }}>
          <button 
            type="submit"
            disabled={isDeleting}
            className="bg-red-500/10 text-red-600 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Card
          </button>
        </form>
      </div>
    </div>
  );
}
