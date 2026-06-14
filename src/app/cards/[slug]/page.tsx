import { getCardBySlug, getAllCards, getReviewsForCard, getSimilarCards } from '@/lib/data';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, CreditCard, CheckCircle2, XCircle, Sparkles, Globe } from 'lucide-react';
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-12">
          {card.logo_url ? (
            <ImageWithFallback 
              src={card.logo_url} 
              alt={card.name} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-2 border-border shadow-sm bg-white"
              fallbackIconSize={48} 
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-muted flex items-center justify-center border-2 border-border shadow-sm">
              <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {card.name}
            </h1>
            {card.description && card.description !== "A popular crypto card offering seamless spending and robust features." && (
              <p className="text-xl text-muted-foreground mb-6">
                {card.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mt-4 mb-4">
              <a 
                href={card.website_url} 
                target="_blank" 
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background font-bold text-sm rounded-full hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-foreground/10 transition-all"
              >
                Visit Website <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full border border-green-500/20 shadow-sm">
                <ShieldCheck className="w-4 h-4 fill-green-500/20" />
                <span className="font-bold text-xs tracking-wider uppercase">Trust Score: {scoreDisplay}</span>
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full border border-blue-500/20 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-xs tracking-wider uppercase">Last Verified: {lastVerifiedStr}</span>
              </div>
            </div>
            
            <AdminCardActions cardId={card.id} />
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Fees & Rates */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold border-b border-border pb-3 mb-4">Financials</h2>
            <div className="space-y-4">
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
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold border-b border-border pb-3 mb-4">Supported Networks</h2>
            <div className="flex gap-2 flex-wrap">
              {card.supported_networks?.map((network) => (
                <NetworkBadge key={network} network={network} />
              ))}
            </div>
          </div>
        </div>

        {/* Pros and Cons */}
        {((card.pros && card.pros.length > 0) || (card.cons && card.cons.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2"><CheckCircle2 className="w-6 h-6"/> The Pros</h2>
              <ul className="space-y-3">
                {card.pros?.map((pro, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-foreground/90 leading-relaxed">
                    <span className="text-green-600 dark:text-green-500 mt-1 flex-shrink-0">•</span> {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2"><XCircle className="w-6 h-6"/> The Cons</h2>
              <ul className="space-y-3">
                {card.cons?.map((con, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-foreground/90 leading-relaxed">
                    <span className="text-red-600 dark:text-red-500 mt-1 flex-shrink-0">•</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Detailed Fees Table */}
        {card.fee_details && Object.keys(card.fee_details).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Detailed Fee Breakdown</h2>
            <div className="overflow-x-auto overflow-y-hidden border border-border rounded-xl">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <tbody className="divide-y divide-border">
                  {Object.entries(card.fee_details).map(([feeName, feeValue]) => (
                    <tr key={feeName} className="hover:bg-muted/50 transition-colors">
                      <th className="px-6 py-4 font-medium text-muted-foreground w-1/2">{feeName}</th>
                      <td className="px-6 py-4 font-semibold text-foreground w-1/2">{feeValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Editorial Review */}
        {card.full_review && (
          <div className="mb-12 bg-card border border-border rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Summary</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-foreground/90">
                {card.full_review}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-start gap-3 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Transparency Note:</strong> This summary was objectively synthesized by <strong>Google Gemini 2.5 Flash</strong> using aggregated community sentiment and historical reputation data. It does not represent human editorial opinion or professional financial advice.
              </p>
            </div>
          </div>
        )}
        <SuggestEditForm cardId={card.id} />

        {/* Community Trust Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Community Trust Data</h2>
          <p className="text-muted-foreground text-sm mb-4">
            This card has received <strong>{totalVotes}</strong> anonymous community votes, 
            resulting in an independent community rating of <strong>{scoreDisplay}</strong>. 
            This score is 100% community-driven.
          </p>
          <div className="flex items-center gap-4">
            <div className="bg-muted px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
              <span className="text-green-600 dark:text-green-500 font-bold">▲</span> {card.upvotes} Upvotes
            </div>
            <div className="bg-muted px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
              <span className="text-red-600 dark:text-red-500 font-bold">▼</span> {card.downvotes} Downvotes
            </div>
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Community Reviews</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold ml-2">{averageRating}</span>
                  <span className="text-muted-foreground ml-1">/ 5</span>
                </div>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <ReviewForm cardId={card.id} cardSlug={card.slug} />
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground mb-2">No reviews yet.</p>
                <p className="text-sm font-medium">Be the first to share your experience with the {card.name}!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-foreground">{review.author_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
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
