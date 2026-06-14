import { getAllCards } from '@/lib/data';
import Link from 'next/link';
import { ShieldCheck, PlusCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { CardGrid } from '@/components/card-grid';
import { ConnectButton } from '@/components/connect-button';
import { HeroAnimation, HeroElement } from '@/components/hero-animation';

export default async function HomePage() {
  const cards = await getAllCards();

  return (
    <div className="min-h-screen relative">
      {/* Subtle Purple Gradient Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent -z-10 pointer-events-none" />

      {/* Header section */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo-light.png" alt="CryptoCards.fyi" className="h-9 md:h-10 w-auto object-contain dark:hidden" />
            <img src="/logo-dark.png" alt="CryptoCards.fyi" className="h-9 md:h-10 w-auto object-contain hidden dark:block" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/submit" className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded-full hover:bg-muted border border-transparent hover:border-border">
              <PlusCircle className="w-4 h-4" /> Submit Card
            </Link>
            <ConnectButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto pb-10 sm:pb-12 text-center">
          <HeroAnimation>
            <HeroElement>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground md:whitespace-nowrap">
                Discover the Best <span className="text-primary block sm:inline">Crypto Cards.</span>
              </h2>
            </HeroElement>
            <HeroElement>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
                Compare fees, cashback rewards, and supported networks across 20+ verified crypto cards.
              </p>
            </HeroElement>
          </HeroAnimation>
        </div>

        {/* Minimalist Data Grid with Sorting & Filtering */}
        <CardGrid initialCards={cards} />
      </main>
    </div>
  );
}
