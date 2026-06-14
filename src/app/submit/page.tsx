'use client';

import { useState } from 'react';
import { handleCardSubmission } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Sparkles, Globe } from 'lucide-react';

export default function SubmitCardPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    
    const result = await handleCardSubmission(formData);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || 'Something went wrong');
    }
    
    setIsSubmitting(false);
  }

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full scale-150" />
          <div className="w-24 h-24 bg-card border-2 border-green-500/30 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground text-center">
          Submission Received
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-lg text-center leading-relaxed">
          Thank you for contributing to the directory. Our editorial team will review the card details and publish it if it meets our quality standards.
        </p>
        <Link 
          href="/" 
          className="bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" /> Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors font-medium bg-muted/50 hover:bg-muted px-4 py-2 rounded-full text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
          Suggest a Card
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Help us curate the most comprehensive repository for crypto cards.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative background flare */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        <form action={onSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <label htmlFor="name" className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" /> Card Name
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              placeholder="e.g., Coinbase Card, Binance Card"
              className="w-full bg-background border border-border rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="website_url" className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" /> Official Website URL
            </label>
            <input 
              type="url" 
              id="website_url" 
              name="website_url" 
              required 
              placeholder="https://..."
              className="w-full bg-background border border-border rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-foreground text-background font-black text-lg py-5 rounded-full hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-foreground/10"
            >
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
              ) : (
                'Submit for Editorial Review'
              )}
            </button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground font-medium mt-4">
            By submitting, you confirm this card is publicly available or in active beta.
          </p>
        </form>
      </div>
    </div>
  );
}
