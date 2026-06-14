import { CryptoCard } from '@/lib/data';
import Link from 'next/link';
import { CreditCard, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './image-with-fallback';

export function SimilarCards({ cards }: { cards: CryptoCard[] }) {
  if (cards.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-black mb-6">Compare Similar Cards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link 
            key={card.id} 
            href={`/cards/${card.slug}`}
            className="group bg-card border border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all rounded-xl p-4 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              {card.logo_url ? (
                <ImageWithFallback 
                  src={card.logo_url} 
                  alt={card.name} 
                  className="w-10 h-10 rounded-lg object-cover bg-white shadow-sm"
                  fallbackIconSize={20}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shadow-sm">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">{card.name}</h3>
            </div>
            
            <div className="space-y-2 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Cashback</span>
                <span className="font-bold text-foreground">{card.cashback_rate}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Networks</span>
                <span className="font-bold text-foreground">{card.supported_networks?.length || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
