"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

type VoteButtonProps = {
  cardId: string;
  cardName: string;
  initialUpvotes: number;
  initialDownvotes: number;
};

export function VoteButton({ cardId, cardName, initialUpvotes, initialDownvotes }: VoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();

  // We check local storage just to show visual state, but backend enforces 1 vote per wallet
  useEffect(() => {
    if (user?.wallet?.address) {
      const storedVote = localStorage.getItem(`vote_${cardId}_${user.wallet.address}`);
      if (storedVote === 'upvote' || storedVote === 'downvote') {
        setUserVote(storedVote);
      }
    }
  }, [cardId, user?.wallet?.address]);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!authenticated || !user?.wallet?.address) {
      login();
      return;
    }

    if (userVote) return; // Already voted locally
    
    setIsLoading(true);
    const walletAddress = user.wallet.address;
    const expectedMessage = `I am casting an authenticated ${type} for ${cardName}.`;

    try {
      // Find the specific wallet instance to sign with (supports both external & embedded)
      const wallet = wallets.find(w => w.address === walletAddress) || wallets[0];
      if (!wallet) throw new Error("No connected wallet found to sign the message.");

      // 1. Prompt user to sign the payload
      const signature = await wallet.sign(expectedMessage);

      // 2. Optimistic UI update
      if (type === 'upvote') setUpvotes(prev => prev + 1);
      if (type === 'downvote') setDownvotes(prev => prev + 1);
      setUserVote(type);
      localStorage.setItem(`vote_${cardId}_${walletAddress}`, type);

      // 3. Send to API for backend cryptographic verification and storage
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cardId, 
          cardName,
          voteType: type, 
          signature,
          walletAddress 
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Vote failed');
      }

    } catch (e: any) {
      // If the user rejects the signature or the API fails, revert the state
      console.error(e);
      if (userVote === null) {
        if (type === 'upvote') setUpvotes(prev => prev - 1);
        if (type === 'downvote') setDownvotes(prev => prev - 1);
        setUserVote(null);
        localStorage.removeItem(`vote_${cardId}_${walletAddress}`);
      }
      alert(e.message || "Failed to cast vote. Did you reject the signature?");
    } finally {
      setIsLoading(false);
    }
  };

  const totalVotes = upvotes + downvotes;
  const percentage = totalVotes === 0 ? 0 : Math.round((upvotes / totalVotes) * 100);

  return (
    <div className="flex flex-col items-center justify-center gap-1 min-w-[60px]">
      <button 
        onClick={() => handleVote('upvote')}
        disabled={isLoading || userVote !== null}
        className={`p-1.5 rounded-full transition-colors ${userVote === 'upvote' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50'}`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      
      <div className="text-sm font-bold text-foreground text-center leading-none">
        {totalVotes > 0 ? `${percentage}%` : '---'}
      </div>
      
      <button 
        onClick={() => handleVote('downvote')}
        disabled={isLoading || userVote !== null}
        className={`p-1.5 rounded-full transition-colors ${userVote === 'downvote' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50'}`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
