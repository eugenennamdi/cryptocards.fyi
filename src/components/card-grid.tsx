"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CreditCard, Filter, ArrowUpDown, Info } from 'lucide-react';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { Search, CheckSquare, Square, Smartphone, Wallet, Wifi, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NetworkBadge, networkIconMap } from './network-badge';
import { VoteButton } from './vote-button';
import { motion } from 'framer-motion';
import { type CryptoCard } from '@/lib/data';
import { getMetadataForCard, CARD_REGIONS, CARD_KYC, getPopularityScore, getRegionColorClasses, getKycColorClasses } from '@/lib/categories';

type CardGridProps = {
  initialCards: CryptoCard[];
};

type SortOption = 'popular' | 'score_desc' | 'upvotes' | 'cashback' | 'fees';

export function CardGrid({ initialCards }: CardGridProps) {
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [kycDropdownOpen, setKycDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const router = useRouter();
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setNetworkDropdownOpen(false);
        setRegionDropdownOpen(false);
        setKycDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (quickFilter === 'no-kyc' && kycFilter !== 'Low/No KYC') setQuickFilter('custom');
    if (quickFilter === 'apple-pay' && regionFilter !== 'all') setQuickFilter('custom');
    if (quickFilter === 'self-custody' && regionFilter !== 'all') setQuickFilter('custom');
    if (quickFilter === 'all' && (kycFilter !== 'all' || regionFilter !== 'all' || networkFilter !== 'all')) setQuickFilter('custom');
  }, [kycFilter, regionFilter, networkFilter, quickFilter]);

  const handleQuickFilter = (type: string) => {
    setQuickFilter(type);
    if (type === 'all') {
      setKycFilter('all');
      setRegionFilter('all');
      setNetworkFilter('all');
      setSearchQuery('');
    } else if (type === 'no-kyc') {
      setKycFilter('Low/No KYC');
      setRegionFilter('all');
      setNetworkFilter('all');
      setSearchQuery('');
    } else if (type === 'high-cashback' || type === 'apple-pay' || type === 'self-custody') {
      setKycFilter('all');
      setRegionFilter('all');
      setNetworkFilter('all');
      setSearchQuery('');
    }
  };

  const allRegions = Object.keys(CARD_REGIONS);
  const allKYCs = Object.keys(CARD_KYC);

  // Extract all unique networks across all cards for the filter dropdown
  const allNetworks = useMemo(() => {
    const networks = new Set<string>();
    initialCards.forEach(card => {
      card.supported_networks?.forEach(n => networks.add(n));
    });
    return Array.from(networks).sort();
  }, [initialCards]);

  // Apply filtering and sorting
  const processedCards = useMemo(() => {
    let filtered = [...initialCards];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(q)
      );
    }

    // Filter by network
    if (networkFilter !== 'all') {
      filtered = filtered.filter(card => 
        card.supported_networks?.includes(networkFilter)
      );
    }

    // Filter by region
    if (regionFilter !== 'all') {
      filtered = filtered.filter(card => {
        const region = card.fee_details?.region || getMetadataForCard(card.name).region;
        return region === regionFilter || region === 'Global';
      });
    }

    // Filter by KYC
    if (kycFilter !== 'all') {
      filtered = filtered.filter(card => {
        const kyc = card.fee_details?.kyc || getMetadataForCard(card.name).kyc;
        return kyc === kycFilter;
      });
    }

    // Quick Filter: High Cashback
    if (quickFilter === 'high-cashback') {
      filtered = filtered.filter(card => {
        const cb = parseFloat(card.cashback_rate.replace(/[^0-9.]/g, '')) || 0;
        return cb >= 4;
      });
    }

    // Quick Filter: Apple Pay
    if (quickFilter === 'apple-pay') {
      filtered = filtered.filter(card => getMetadataForCard(card.name).applePay);
    }

    // Quick Filter: Self-Custody
    if (quickFilter === 'self-custody') {
      filtered = filtered.filter(card => getMetadataForCard(card.name).custody === 'Self-Custodial');
    }

    // Sort
    filtered.sort((a, b) => {
      const scoreA = getCompositeScore(a);
      const scoreB = getCompositeScore(b);

      switch (sortBy) {
        case 'score_desc': return scoreB - scoreA;
        case 'upvotes': return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'cashback': 
          const cbA = parseFloat(a.cashback_rate.replace(/[^0-9.]/g, '')) || 0;
          const cbB = parseFloat(b.cashback_rate.replace(/[^0-9.]/g, '')) || 0;
          return cbB - cbA; // Highest first
        case 'fees':
          const feeA = parseFloat(a.monthly_fees.replace(/[^0-9.]/g, '')) || 0;
          const feeB = parseFloat(b.monthly_fees.replace(/[^0-9.]/g, '')) || 0;
          return feeA - feeB; // Lowest first
        case 'popular':
        default: 
          return getPopularityScore(b.name) - getPopularityScore(a.name);
      }
    });

    return filtered;
  }, [initialCards, networkFilter, regionFilter, kycFilter, sortBy, searchQuery, quickFilter]);

  function getCompositeScore(card: CryptoCard): number {
    const totalVotes = card.upvotes + card.downvotes;
    if (totalVotes === 0) return 0;
    return (card.upvotes / totalVotes) * 10;
  }

  const handleCompareToggle = (slug: string) => {
    setSelectedCards(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= 4) return prev; // Max 4 cards
      return [...prev, slug];
    });
  };

  return (
    <div>
      {/* High-Intent Quick Filters */}
      <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 mb-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'all', label: 'All Cards' },
          { id: 'apple-pay', label: 'Apple/Google Pay' },
          { id: 'self-custody', label: 'Self-Custodial' },
          { id: 'no-kyc', label: 'No/Low KYC' },
          { id: 'high-cashback', label: 'High Cashback (4%+)' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => handleQuickFilter(filter.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
              quickFilter === filter.id 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div ref={toolbarRef} className="flex flex-col gap-4 mb-8 bg-card border border-border p-4 rounded-xl">
        <div className="relative flex items-center bg-muted rounded-lg px-3 py-2 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-full">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search by card name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 sm:gap-4 items-center justify-between w-full">
        <div className="relative flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Filter className="hidden sm:block w-5 h-5 text-muted-foreground" />
          <button 
            onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
            className="flex items-center justify-between w-full sm:w-48 bg-transparent text-sm font-medium focus:outline-none cursor-pointer py-2 border-b border-transparent hover:border-primary/40 focus:text-primary focus:border-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              {networkFilter !== 'all' && networkIconMap[networkFilter] && (
                <img src={networkIconMap[networkFilter]} alt="" className="w-4 h-4 object-contain" />
              )}
              {networkFilter === 'all' ? 'All Networks' : networkFilter}
            </div>
            <span className="text-xs text-muted-foreground">▼</span>
          </button>
          
          {networkDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              <button 
                onClick={() => { setNetworkFilter('all'); setNetworkDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                All Networks
              </button>
              {allNetworks.map(network => (
                <button 
                  key={network}
                  onClick={() => { setNetworkFilter(network); setNetworkDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                >
                  {networkIconMap[network] && (
                    <img src={networkIconMap[network]} alt="" className="w-4 h-4 object-contain" />
                  )}
                  {network}
                </button>
              ))}
            </div>
          )}
        </div>



        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
          <ArrowUpDown className="hidden sm:block w-5 h-5 text-muted-foreground" />
          <select 
            className="bg-transparent text-sm font-medium focus:outline-none border-none cursor-pointer w-full sm:w-auto py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="score_desc">Highest Trust</option>
            <option value="popular">Curated Popularity</option>
            <option value="upvotes">Most Upvoted</option>
            <option value="cashback">Highest Cashback</option>
            <option value="fees">Lowest Fees</option>
          </select>
        </div>
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {processedCards.map((card) => {
          const compositeScore = getCompositeScore(card).toFixed(1);
          const metadata = getMetadataForCard(card.name);
          const isVisa = metadata.paymentNetwork === 'Visa';
          const isMastercard = metadata.paymentNetwork === 'Mastercard';
          
          return (
            <motion.div 
              key={card.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ scale: 1.02, rotateX: 4, rotateY: -4 }}
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
              className={`group relative flex flex-col bg-card border rounded-[20px] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgb(255,255,255,0.08)] transition-all duration-500 ${selectedCards.includes(card.slug) ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'}`}
            >
              {/* Physical Card Visual */}
              <div className="p-4 sm:p-5" style={{ transform: "translateZ(30px)" }}>
                <div className={`relative w-full aspect-[1.586/1] rounded-xl overflow-hidden flex flex-col justify-between p-5 relative group-hover:after:absolute group-hover:after:inset-0 group-hover:after:bg-gradient-to-tr group-hover:after:from-transparent group-hover:after:via-white/40 group-hover:after:to-transparent group-hover:after:translate-x-full group-hover:after:transition-transform group-hover:after:duration-1000 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_10px_30px_rgba(0,0,0,0.15)] border border-slate-200/80 ring-1 ring-blue-900/5 dark:from-zinc-800 dark:via-slate-800 dark:to-zinc-900 dark:border-zinc-700/50 dark:ring-blue-400/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)]`}>
                  {/* Glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
                  
                  {/* Top: Logo and Network */}
                  <div className="flex justify-between items-start z-10 relative">
                    <div className="flex items-center gap-3 bg-white/40 dark:bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 shadow-sm">
                      {card.logo_url ? (
                        <ImageWithFallback src={card.logo_url} alt={card.name} className="w-5 h-5 rounded-full object-cover bg-white shadow-sm" fallbackIconSize={16} />
                      ) : (
                        <CreditCard className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                      )}
                      <span className="text-zinc-800 dark:text-white font-bold text-sm truncate max-w-[120px]">{card.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Wifi className="w-5 h-5 rotate-90" />
                    </div>
                  </div>

                  {/* Middle: EMV Chip */}
                  <div className="z-10 relative mt-4">
                    <div className="w-10 h-8 rounded bg-gradient-to-br from-[#F3E2B3] to-[#D4AF37] border border-yellow-600/30 flex flex-col justify-between p-[2px] opacity-90 shadow-sm">
                       <div className="flex justify-between w-full h-[30%]">
                         <div className="w-[30%] h-full border border-black/10 rounded-[1px]"></div>
                         <div className="w-[30%] h-full border border-black/10 rounded-[1px]"></div>
                       </div>
                       <div className="w-full h-[30%] border border-black/10 rounded-[1px]"></div>
                       <div className="flex justify-between w-full h-[30%]">
                         <div className="w-[30%] h-full border border-black/10 rounded-[1px]"></div>
                         <div className="w-[30%] h-full border border-black/10 rounded-[1px]"></div>
                       </div>
                    </div>
                  </div>

                  {/* Bottom: Visa/Mastercard */}
                  <div className="flex justify-end items-end z-10 relative">
                    <div className="h-8 flex items-center justify-end">
                      {isVisa && (
                        <span className="text-[#1A1F71] dark:text-white font-black text-2xl tracking-tighter italic pr-1">VISA</span>
                      )}
                      {isMastercard && (
                        <div className="flex relative w-10 h-6 items-center pr-1">
                          <div className="absolute w-6 h-6 rounded-full bg-[#EB001B]/90 mix-blend-multiply dark:mix-blend-screen left-0"></div>
                          <div className="absolute w-6 h-6 rounded-full bg-[#F79E1B]/90 mix-blend-multiply dark:mix-blend-screen right-0"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Details Section */}
              <div className="px-5 pb-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                       <ShieldCheck className="w-4 h-4" /> Trust: <span className="text-foreground">{(card.upvotes + card.downvotes) > 0 ? compositeScore : 'N/A'}</span>
                    </span>
                  </div>
                  <VoteButton 
                    cardId={card.id} 
                    cardName={card.name}
                    initialUpvotes={card.upvotes} 
                    initialDownvotes={card.downvotes} 
                  />
                </div>

                {/* Premium Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {metadata.applePay && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded border bg-muted/50 text-xs font-bold text-foreground">
                      <Smartphone className="w-3.5 h-3.5" /> Apple Pay
                    </span>
                  )}
                  {metadata.custody === 'Self-Custodial' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded border bg-muted/50 text-xs font-bold text-foreground">
                      <Wallet className="w-3.5 h-3.5" /> Self-Custody
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-bold ${getKycColorClasses(metadata.kyc)}`}>
                    {metadata.kyc}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border mt-auto">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Cashback</p>
                    <p className="font-bold text-foreground text-sm">{card.cashback_rate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Monthly Fee</p>
                    <p className="font-bold text-foreground text-sm">{card.monthly_fees}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-border bg-muted/10 flex gap-3 mt-auto">
                <button 
                  onClick={() => handleCompareToggle(card.slug)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-colors ${
                    selectedCards.includes(card.slug) 
                      ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' 
                      : 'bg-background border-border text-foreground hover:border-foreground/30 hover:bg-muted'
                  }`}
                >
                  {selectedCards.includes(card.slug) ? (
                    <><CheckSquare className="w-4 h-4" /> Added</>
                  ) : (
                    <><Square className="w-4 h-4 text-muted-foreground" /> Compare</>
                  )}
                </button>
                <Link 
                  href={`/cards/${card.slug}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
        
        {processedCards.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No cards found matching your current filters.
          </div>
        )}
      </motion.div>

      {/* Floating Action Bar for Compare */}
      {selectedCards.length > 0 && (
        <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border-2 border-primary/20 shadow-2xl rounded-full px-4 py-2.5 md:px-6 md:py-3 flex items-center gap-3 md:gap-6 w-[95%] sm:w-auto max-w-[400px] sm:max-w-none justify-between sm:justify-start animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
            <span className="bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0">{selectedCards.length}</span>
            <span className="truncate">Cards Selected</span>
            {selectedCards.length >= 4 && <span className="text-muted-foreground text-[10px] sm:text-xs font-medium ml-0.5 sm:ml-2 shrink-0">(Max)</span>}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={() => setSelectedCards([])}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              Clear
            </button>
            <button 
              onClick={() => router.push(`/compare?cards=${selectedCards.join(',')}`)}
              disabled={selectedCards.length < 2}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Compare Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
