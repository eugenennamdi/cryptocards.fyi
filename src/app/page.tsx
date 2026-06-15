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
        <div className="max-w-4xl mx-auto pb-12 sm:pb-16 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
          <HeroAnimation>
            <HeroElement>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground md:whitespace-nowrap leading-tight">
                Discover the Best <br className="sm:hidden" /><span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Crypto Cards.</span>
              </h2>
            </HeroElement>
            <HeroElement>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto px-4 leading-relaxed">
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
