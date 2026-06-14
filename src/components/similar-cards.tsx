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
            className="group bg-card border border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              {card.logo_url ? (
                <ImageWithFallback 
                  src={card.logo_url} 
                  alt={card.name} 
                  className="w-12 h-12 rounded-xl object-cover bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{card.name}</h3>
            </div>
            
            <div className="mt-auto space-y-2 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Cashback</span>
                <span className="font-bold text-foreground">{card.cashback_rate}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Networks</span>
                <span className="font-medium text-foreground">{card.supported_networks?.length || 0}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              View Details <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
