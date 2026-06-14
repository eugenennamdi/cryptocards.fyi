import { getAllCards } from '@/lib/data';
import { getMetadataForCard, getRegionColorClasses, getKycColorClasses } from '@/lib/categories';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { NetworkBadge } from '@/components/network-badge';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, Zap, ShieldCheck, Globe2 } from 'lucide-react';

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ cards?: string }> }) {
  const params = await searchParams;
  const slugs = params.cards?.split(',') || [];
  
  const allCards = await getAllCards();
  const compareCards = slugs.map(slug => allCards.find(c => c.slug === slug)).filter(Boolean) as typeof allCards;

  if (compareCards.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tight">No cards selected</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">Return to the directory and select up to 4 cards to compare their features side-by-side.</p>
        <Link href="/" className="bg-foreground text-background px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
          <ArrowLeft className="w-5 h-5" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 transition-colors font-medium bg-muted/50 px-4 py-2 rounded-full text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>
      
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            Card Comparison
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A detailed, side-by-side breakdown of fees, rewards, and requirements.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr>
                <th className="p-3 md:p-6 border-b border-border border-r w-32 md:w-64 sticky left-0 bg-card z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] align-bottom">
                  <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Features</div>
                </th>
                {compareCards.map(card => (
                  <th key={card.id} className="p-8 border-b border-border min-w-[280px] bg-muted/10 align-top relative">
                    <div className="flex flex-col items-center text-center">
                      {card.logo_url ? (
                        <ImageWithFallback src={card.logo_url} alt={card.name} className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-md mb-4" fallbackIconSize={32} />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border-4 border-background shadow-md mb-4">
                          <span className="text-3xl font-black text-muted-foreground">{card.name[0]}</span>
                        </div>
                      )}
                      <h2 className="text-2xl font-black text-foreground mb-2">{card.name}</h2>
                      <Link href={`/cards/${card.slug}`} className="text-sm font-semibold text-primary hover:underline">Read Full Review →</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Cashback Rate
                </td>
                {compareCards.map(card => (
                  <td key={card.id} className="p-6 text-center">
                    <span className="text-xl font-bold text-foreground">{card.cashback_rate}</span>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20 transition-colors bg-muted/5">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground flex items-center gap-2">
                  Monthly Fees
                </td>
                {compareCards.map(card => (
                  <td key={card.id} className="p-6 text-center">
                    <span className="text-xl font-bold text-foreground">{card.monthly_fees}</span>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> KYC Level
                </td>
                {compareCards.map(card => {
                  const kyc = card.fee_details?.kyc || getMetadataForCard(card.name).kyc;
                  return (
                    <td key={card.id} className="p-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getKycColorClasses(kyc)}`}>
                        {kyc}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-muted/20 transition-colors bg-muted/5">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground flex items-center gap-2">
                  <Globe2 className="w-4 h-4" /> Supported Region
                </td>
                {compareCards.map(card => {
                  const region = card.fee_details?.region || getMetadataForCard(card.name).region;
                  return (
                    <td key={card.id} className="p-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getRegionColorClasses(region)}`}>
                        {region}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground align-top pt-8">
                  Supported Networks
                </td>
                {compareCards.map(card => (
                  <td key={card.id} className="p-6 align-top pt-8">
                    <div className="flex flex-wrap justify-center gap-2">
                      {card.supported_networks?.length > 0 ? (
                        card.supported_networks.map(n => <NetworkBadge key={n} network={n} />)
                      ) : (
                        <span className="text-muted-foreground text-sm font-medium">Not specified</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20 transition-colors bg-muted/5">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground align-top pt-8">
                  Top Pros
                </td>
                {compareCards.map(card => (
                  <td key={card.id} className="p-6 align-top pt-8 text-left">
                    {card.pros?.length ? (
                      <ul className="space-y-3">
                        {card.pros.slice(0,3).map((pro, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-muted-foreground text-sm text-center block italic">Not listed</span>}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground align-top pt-8">
                  Major Cons
                </td>
                {compareCards.map(card => (
                  <td key={card.id} className="p-6 align-top pt-8 text-left">
                    {card.cons?.length ? (
                      <ul className="space-y-3">
                        {card.cons.slice(0,3).map((con, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground">
                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-muted-foreground text-sm text-center block italic">Not listed</span>}
                  </td>
                ))}
              </tr>
              <tr className="bg-muted/10">
                <td className="p-3 md:p-6 text-xs md:text-base border-r border-border font-bold sticky left-0 bg-card z-10 text-muted-foreground">
                  Official Site
                </td>
                {compareCards.map(card => (
                  <td key={card.id} className="p-6 text-center">
                    <a href={card.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-foreground text-background w-full py-3 rounded-full font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
                      Get {card.name} <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
