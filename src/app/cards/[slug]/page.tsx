import { getCardBySlug, getAllCards, getReviewsForCard, getSimilarCards } from '@/lib/data';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, CreditCard, CheckCircle2, XCircle, Sparkles, Globe, Github, Twitter } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { NetworkBadge } from '@/components/network-badge';
import { ConnectButton } from '@/components/connect-button';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { AdminCardActions } from '@/components/admin-card-actions';
import { SimilarCards } from '@/components/similar-cards';
import { ReviewForm } from './review-form';
import SuggestEditForm from './suggest-edit-form';
import { PlusCircle, Info, Star } from 'lucide-react';
import Script from 'next/script';

export async function generateStaticParams() {
  const cards = await getAllCards();
  return cards.map((card) => ({
    slug: card.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const card = await getCardBySlug(params.slug);

  if (!card) {
    return { title: 'Card Not Found | CryptoCards.fyi' };
  }

  return {
    title: `${card.name} Review & Fees | CryptoCards.fyi`,
    description: card.description,
    openGraph: {
      title: `${card.name} - Honest Reviews & Details`,
      description: card.description,
      type: 'website',
      images: [card.logo_url || 'https://cryptocards.fyi/og.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.name} | CryptoCards.fyi`,
      description: card.description,
      images: [card.logo_url || 'https://cryptocards.fyi/og.png'],
    },
  };
}

export default async function CardProfilePage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const card = await getCardBySlug(params.slug);

  if (!card) {
    notFound();
  }

  const reviews = await getReviewsForCard(card.id);
  const similarCards = await getSimilarCards(card);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  // Community Trust Score Calculation
  const totalVotes = card.upvotes + card.downvotes;
  const communityScore = totalVotes > 0 ? (card.upvotes / totalVotes) * 10 : 0;
  const scoreDisplay = totalVotes > 0 ? `${communityScore.toFixed(1)}/10` : 'N/A';

  const lastVerifiedStr = card.fee_details?.last_verified_at 
    ? new Date(card.fee_details.last_verified_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : new Date(card.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate Structured Data (JSON-LD) for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.name,
    image: card.logo_url || 'https://cryptocards.fyi/og.png',
    description: card.full_review?.slice(0, 160) || card.description,
    brand: {
      '@type': 'Brand',
      name: card.name
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: card.editor_trust_score,
      reviewCount: Math.max(card.upvotes + card.downvotes, 1),
      bestRating: 10,
      worstRating: 1
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header section */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Back to Directory</span>
          </Link>
          <div className="flex items-center gap-4">
            <ConnectButton />
            <div className="hidden sm:flex items-center gap-1 border-r border-border pr-4 mr-2">
              <a href="https://x.com/cryptocardsfyi" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com/eugenennamdi/cryptocards.fyi" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-10">
          {card.logo_url ? (
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl rounded-full" />
              <ImageWithFallback 
                src={card.logo_url} 
                alt={card.name} 
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-[28px] object-cover ring-1 ring-border/50 shadow-2xl shadow-black/5 bg-white"
                fallbackIconSize={48} 
              />
            </div>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] flex-shrink-0 bg-muted flex items-center justify-center ring-1 ring-border/50 shadow-2xl shadow-black/5">
              <CreditCard className="w-10 h-10 md:w-14 md:h-14 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-0 md:mt-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
              {card.name}
            </h1>
            {card.description && card.description !== "A popular crypto card offering seamless spending and robust features." && (
              <p className="text-lg text-muted-foreground max-w-2xl line-clamp-2 mb-5 leading-snug">
                {card.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
              <a 
                href={card.website_url} 
                target="_blank" 
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold text-sm rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-foreground/10"
              >
                Visit Website <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
              <AdminCardActions cardId={card.id} />
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Info (Left/Middle 2 Columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Financials */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-bold border-b border-border pb-2 mb-3">Financials</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Cashback Rate</span>
                    <span className="font-bold">{card.cashback_rate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Monthly Fees</span>
                    <span className="font-bold">{card.monthly_fees}</span>
                  </div>
                </div>
              </div>

              {/* Networks */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-bold border-b border-border pb-2 mb-3">Supported Networks</h2>
                <div className="flex gap-2 flex-wrap">
                  {card.supported_networks?.map((network) => (
                    <NetworkBadge key={network} network={network} />
                  ))}
                </div>
              </div>
            </div>

            {/* Pros and Cons */}
            {((card.pros && card.pros.length > 0) || (card.cons && card.cons.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
                  <h2 className="text-base font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Pros</h2>
                  <ul className="space-y-2">
                    {card.pros?.map((pro, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/90 leading-snug">
                        <span className="text-green-600 dark:text-green-500 flex-shrink-0">•</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                  <h2 className="text-base font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2"><XCircle className="w-5 h-5"/> Cons</h2>
                  <ul className="space-y-2">
                    {card.cons?.map((con, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/90 leading-snug">
                        <span className="text-red-600 dark:text-red-500 flex-shrink-0">•</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Right Column) */}
          <div className="flex flex-col gap-6">
            {/* Community Trust Section */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold border-b border-border pb-2 mb-3">Community Trust</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full border border-green-500/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Score: {scoreDisplay}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full border border-blue-500/20">
                  <span className="font-bold text-xs uppercase">Verified: {lastVerifiedStr}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="bg-muted px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 w-1/2 justify-center">
                  <span className="text-green-600 dark:text-green-500 font-bold">▲</span> {card.upvotes}
                </div>
                <div className="bg-muted px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 w-1/2 justify-center">
                  <span className="text-red-600 dark:text-red-500 font-bold">▼</span> {card.downvotes}
                </div>
              </div>
            </div>

            {/* Suggest Edit Form */}
            <SuggestEditForm cardId={card.id} />
          </div>
        </div>

        {/* User Reviews Section - Compact */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h2 className="text-2xl font-black">Community Reviews</h2>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>{averageRating}</span>
              <span className="text-muted-foreground">({reviews.length})</span>
            </div>
          </div>

          <div className="mb-6">
            <ReviewForm cardId={card.id} cardSlug={card.slug} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <div className="col-span-full bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-4 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{review.author_name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {review.review_text}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Similar Cards Recommendation Engine */}
        <SimilarCards cards={similarCards} />
      </main>
    </div>
  );
}
