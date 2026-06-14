import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export type CryptoCard = {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  cashback_rate: string;
  monthly_fees: string;
  supported_networks: string[];
  editor_trust_score: number;
  upvotes: number;
  downvotes: number;
  description: string;
  website_url: string;
  created_at: string;
  pros?: string[];
  cons?: string[];
  full_review?: string;
  fee_details?: Record<string, any>; // Includes standard fees + last_verified_at and pending_edits array
};

export type PendingEdit = {
  id: string;
  suggested_by: string;
  text: string;
  date: string;
};

export const getAllCards = unstable_cache(async (): Promise<CryptoCard[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('crypto_cards')
    .select('*')
    .order('editor_trust_score', { ascending: false });

  if (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
  return data as CryptoCard[];
}, ['all-cards'], { revalidate: 30, tags: ['cards'] });

export const getCardBySlug = unstable_cache(async (slug: string): Promise<CryptoCard | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('crypto_cards')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching card with slug ${slug}:`, error);
    return null;
  }
  return data as CryptoCard;
}, ['card-by-slug'], { revalidate: 30, tags: ['cards'] });

export type CardSubmission = {
  id: string;
  name: string;
  website_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type CardReview = {
  id: string;
  card_id: string;
  rating: number;
  review_text: string | null;
  author_name: string;
  created_at: string;
};

export async function submitCardRequest(name: string, website_url: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('card_submissions')
    .insert([{ name, website_url }]);
  
  if (error) {
    console.error('Error submitting card:', error);
    throw new Error('Failed to submit card request');
  }
}

export async function submitReview(cardId: string, rating: number, reviewText: string, authorName: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('card_reviews')
    .insert([{ 
      card_id: cardId, 
      rating, 
      review_text: reviewText || null, 
      author_name: authorName || 'Anonymous'
    }]);

  if (error) {
    console.error('Error submitting review:', error);
    throw new Error('Failed to submit review');
  }
}

export async function getReviewsForCard(cardId: string): Promise<CardReview[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('card_reviews')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data as CardReview[];
}

export async function getPendingSubmissions(): Promise<CardSubmission[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('card_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  return data as CardSubmission[];
}

export async function updateSubmissionStatus(id: string, status: 'approved' | 'rejected') {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('card_submissions')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating submission:', error);
    throw new Error('Failed to update submission');
  }
}

export async function deleteCard(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('crypto_cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting card:', error);
    throw new Error('Failed to delete card');
  }
}

export async function getSimilarCards(currentCard: CryptoCard, limit = 3): Promise<CryptoCard[]> {
  const allCards = await getAllCards();
  const others = allCards.filter(c => c.id !== currentCard.id);

  const scored = others.map(card => {
    let score = 0;
    
    const currentNetworks = currentCard.supported_networks || [];
    const theirNetworks = card.supported_networks || [];
    const overlap = currentNetworks.filter(n => theirNetworks.includes(n)).length;
    score += overlap * 2;
    
    const currentCb = parseFloat(currentCard.cashback_rate.replace('%', '')) || 0;
    const theirCb = parseFloat(card.cashback_rate.replace('%', '')) || 0;
    if (Math.abs(currentCb - theirCb) <= 1.5) {
      score += 1;
    }

    return { card, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.card);
}

export async function updateCard(id: string, updates: Partial<CryptoCard>) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('crypto_cards')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating card:', error);
    throw new Error('Failed to update card');
  }
}

export async function addCard(card: CryptoCard) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('crypto_cards')
    .insert([card]);

  if (error) {
    console.error('Error adding card:', error);
    throw new Error('Failed to add card');
  }
}

export async function submitCardEditSuggestion(cardId: string, suggestedBy: string, text: string) {
  const supabase = getSupabase();
  const { data: card, error: fetchErr } = await supabase.from('crypto_cards').select('fee_details').eq('id', cardId).single();
  
  if (fetchErr || !card) {
    throw new Error('Card not found');
  }

  const fee_details = card.fee_details || {};
  const pending_edits = fee_details.pending_edits || [];
  
  pending_edits.push({
    id: crypto.randomUUID(),
    suggested_by: suggestedBy,
    text,
    date: new Date().toISOString()
  });

  const { error: updateErr } = await supabase
    .from('crypto_cards')
    .update({ fee_details: { ...fee_details, pending_edits } })
    .eq('id', cardId);

  if (updateErr) {
    throw new Error('Failed to submit edit');
  }
}

export async function markCardAsVerified(cardId: string) {
  const supabase = getSupabase();
  const { data: card, error: fetchErr } = await supabase.from('crypto_cards').select('fee_details').eq('id', cardId).single();
  
  if (fetchErr || !card) {
    throw new Error('Card not found');
  }

  const fee_details = card.fee_details || {};
  
  const { error: updateErr } = await supabase
    .from('crypto_cards')
    .update({ 
      fee_details: { 
        ...fee_details, 
        last_verified_at: new Date().toISOString(),
        pending_edits: [] // Clear pending edits when verified
      } 
    })
    .eq('id', cardId);

  if (updateErr) {
    throw new Error('Failed to verify card');
  }
}

export async function clearCardPendingEdits(cardId: string) {
  const supabase = getSupabase();
  const { data: card, error: fetchErr } = await supabase.from('crypto_cards').select('fee_details').eq('id', cardId).single();
  
  if (fetchErr || !card) {
    throw new Error('Card not found');
  }

  const fee_details = card.fee_details || {};
  
  const { error: updateErr } = await supabase
    .from('crypto_cards')
    .update({ 
      fee_details: { 
        ...fee_details, 
        pending_edits: [] 
      } 
    })
    .eq('id', cardId);

  if (updateErr) {
    throw new Error('Failed to clear edits');
  }
}
