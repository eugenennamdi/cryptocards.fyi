'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { handleSuggestCardEdit } from '@/app/actions';
import { Loader2, MessageSquarePlus, CheckCircle2 } from 'lucide-react';

export default function SuggestEditForm({ cardId }: { cardId: string }) {
  const { authenticated, user, login } = usePrivy();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen && !success) {
    return (
      <div className="mt-12 bg-muted/30 border border-border rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold mb-2">Spot inaccurate data?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Card fees and rates can change. Help keep the community accurate.
        </p>
        <button
          onClick={() => {
            if (!authenticated) {
              login();
            } else {
              setIsOpen(true);
            }
          }}
          className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-6 py-2.5 rounded-lg font-bold text-sm inline-flex items-center gap-2"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Suggest an Edit
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-12 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl p-6 text-center flex flex-col items-center">
        <CheckCircle2 className="w-8 h-8 mb-3 text-green-500" />
        <h3 className="text-lg font-bold">Thank you!</h3>
        <p className="text-sm opacity-80">
          Your suggestion has been submitted to the editors for review.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Suggest an Edit</h3>
      <form
        action={async (fd) => {
          setIsSubmitting(true);
          fd.append('card_id', cardId);
          fd.append('caller_wallet', user!.wallet!.address);
          
          const res = await handleSuggestCardEdit(fd);
          setIsSubmitting(false);
          
          if (res.success) {
            setSuccess(true);
          } else {
            alert(res.error || 'Something went wrong.');
          }
        }}
      >
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="E.g., The cashback rate changed to 2% last week."
          className="w-full bg-background border border-border rounded-xl px-4 py-3 font-medium mb-4 text-sm"
          rows={3}
          required
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Edit'}
          </button>
        </div>
      </form>
    </div>
  );
}
