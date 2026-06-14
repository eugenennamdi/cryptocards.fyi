'use client';

import { useState } from 'react';
import { handleReviewSubmission } from '@/app/actions';
import { Star, Loader2, CheckCircle2, MessageSquareQuote, ShieldAlert } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

export function ReviewForm({ cardId, cardSlug }: { cardId: string, cardSlug: string }) {
  const { ready, authenticated, user, login } = usePrivy();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    if (!authenticated) {
      login();
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // Inject custom state
    formData.append('card_id', cardId);
    formData.append('card_slug', cardSlug);
    formData.append('rating', rating.toString());
    
    // Override author name with wallet address logic if not provided
    const defaultAuthor = user?.wallet?.address 
      ? `0x...${user.wallet.address.slice(-4)}` 
      : 'Verified User';
    
    const providedName = formData.get('author_name');
    if (!providedName) {
      formData.set('author_name', defaultAuthor);
    }
    
    const result = await handleReviewSubmission(formData);
    
    if (result.success) {
      setIsSuccess(true);
      setRating(0);
    } else {
      setError(result.error || 'Failed to submit review');
    }
    
    setIsSubmitting(false);
  }

  if (!ready) {
    return <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />;
  }

  if (isSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Review Published</h3>
        <p className="text-muted-foreground">Your feedback has been verified and added to the community consensus.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-sm font-bold text-foreground hover:opacity-70 transition-opacity underline underline-offset-4"
        >
          Submit another response
        </button>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm flex flex-col items-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <ShieldAlert className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-1">Verified Reviews Only</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          To prevent spam and ensure authentic community feedback, we require users to connect a wallet before leaving a review.
        </p>
        <button 
          onClick={login}
          className="bg-foreground text-background font-bold text-xs px-5 py-2 rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
        >
          Connect Wallet to Review
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <MessageSquareQuote className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-base font-bold">Share Your Experience</h3>
      </div>
      
      <form action={onSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">Overall Rating</label>
          <div className="flex items-center gap-1 bg-background border border-border w-fit px-3 py-1.5 rounded-full">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star 
                  className={`w-5 h-5 transition-colors ${
                    star <= (hoveredRating || rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground/30'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="author_name" className="block text-xs font-bold text-foreground mb-1">Display Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
          <input 
            type="text" 
            id="author_name" 
            name="author_name" 
            placeholder="e.g. CryptoUser99"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
          />
        </div>

        <div>
          <label htmlFor="review_text" className="block text-xs font-bold text-foreground mb-1">Detailed Review <span className="text-muted-foreground font-normal">(Optional)</span></label>
          <textarea 
            id="review_text" 
            name="review_text" 
            rows={2}
            placeholder="Share your objective experience..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium resize-y"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-foreground text-background font-bold text-sm py-2.5 rounded-full hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
          ) : (
            'Publish Review'
          )}
        </button>
      </form>
    </div>
  );
}
