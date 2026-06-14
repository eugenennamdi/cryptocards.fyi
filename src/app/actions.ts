'use server';

import { submitCardRequest, submitReview } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function handleCardSubmission(formData: FormData) {
  const name = formData.get('name') as string;
  const website_url = formData.get('website_url') as string;

  if (!name || !website_url) {
    return { success: false, error: 'Name and website URL are required' };
  }

  try {
    await submitCardRequest(name, website_url);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit card' };
  }
}

export async function handleReviewSubmission(formData: FormData) {
  const cardId = formData.get('card_id') as string;
  const rating = parseInt(formData.get('rating') as string, 10);
  const reviewText = formData.get('review_text') as string;
  const authorName = formData.get('author_name') as string;
  const cardSlug = formData.get('card_slug') as string;

  if (!cardId || isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: 'Invalid rating or card ID' };
  }

  try {
    await submitReview(cardId, rating, reviewText, authorName);
    if (cardSlug) {
      revalidatePath(`/cards/${cardSlug}`);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

import { updateSubmissionStatus, deleteCard } from '@/lib/data';
import { ADMIN_WALLET } from '@/lib/admin';
import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function verifyAdminAccess(token: string | null) {
  if (!token) throw new Error("Missing auth token");
  try {
    const verifiedClaims = await privy.verifyAuthToken(token);
    const user = await privy.getUser(verifiedClaims.userId);
    if (!user.wallet?.address || user.wallet.address.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
      throw new Error("Unauthorized: Wallet address does not match Admin");
    }
    return true;
  } catch (err: any) {
    throw new Error(`Unauthorized: ${err.message}`);
  }
}

export async function handleApproveSubmission(formData: FormData) {
  const submissionId = formData.get('submission_id') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    await updateSubmissionStatus(submissionId, 'approved');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to approve submission' };
  }
}

export async function handleRejectSubmission(formData: FormData) {
  const submissionId = formData.get('submission_id') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    await updateSubmissionStatus(submissionId, 'rejected');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reject submission' };
  }
}

export async function handleDeleteCard(formData: FormData) {
  const cardId = formData.get('card_id') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    await deleteCard(cardId);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete card' };
  }
}

import { updateCard, getAllCards, getPendingSubmissions, addCard } from '@/lib/data';
import { getSupabase } from '@/lib/data';

export async function fetchAdminData(privyToken: string | null) {
  await verifyAdminAccess(privyToken);
  const cards = await getAllCards();
  const submissions = await getPendingSubmissions();
  return { cards, submissions };
}

export async function handleUpdateCard(formData: FormData) {
  const cardId = formData.get('card_id') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const supported_networks = (formData.get('supported_networks') as string || '')
    .split(',')
    .map(n => n.trim())
    .filter(n => n);

  const region = formData.get('region') as string;
  const kyc = formData.get('kyc') as string;

  try {
    const supabase = getSupabase();
    const { data: card } = await supabase.from('crypto_cards').select('fee_details').eq('id', cardId).single();
    const fee_details = card?.fee_details || {};
    if (region) fee_details.region = region;
    if (kyc) fee_details.kyc = kyc;

    const updates = {
      name: formData.get('name') as string,
      cashback_rate: formData.get('cashback_rate') as string,
      monthly_fees: formData.get('monthly_fees') as string,
      logo_url: formData.get('logo_url') as string,
      editor_trust_score: parseFloat(formData.get('editor_trust_score') as string),
      supported_networks,
      fee_details
    };

    await updateCard(cardId, updates);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update card' };
  }
}

export async function handleAddCard(formData: FormData) {
  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const supported_networks = (formData.get('supported_networks') as string || '')
    .split(',')
    .map(n => n.trim())
    .filter(n => n);

  const region = formData.get('region') as string || 'Global';
  const kyc = formData.get('kyc') as string || 'Standard KYC';
  const name = formData.get('name') as string;

  const newCard = {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: name,
    cashback_rate: formData.get('cashback_rate') as string || '0%',
    monthly_fees: formData.get('monthly_fees') as string || '$0',
    logo_url: formData.get('logo_url') as string || '',
    editor_trust_score: parseFloat(formData.get('editor_trust_score') as string) || 50,
    supported_networks,
    fee_details: { region, kyc },
    upvotes: 0,
    downvotes: 0,
    description: '',
    website_url: '',
    created_at: new Date().toISOString()
  };

  try {
    await addCard(newCard);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add card' };
  }
}

import { submitCardEditSuggestion, markCardAsVerified, clearCardPendingEdits } from '@/lib/data';

export async function handleSuggestCardEdit(formData: FormData) {
  const cardId = formData.get('card_id') as string;
  const callerWallet = formData.get('caller_wallet') as string;
  const text = formData.get('text') as string;

  if (!cardId || !callerWallet || !text) {
    return { success: false, error: 'Missing required fields' };
  }

  try {
    await submitCardEditSuggestion(cardId, callerWallet, text);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit edit' };
  }
}

export async function handleMarkCardVerified(formData: FormData) {
  const cardId = formData.get('card_id') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    await markCardAsVerified(cardId);
    revalidatePath(`/cards/[slug]`, 'page');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to verify card' };
  }
}

export async function handleClearCardEdits(formData: FormData) {
  const cardId = formData.get('card_id') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    await clearCardPendingEdits(cardId);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to clear edits' };
  }
}

export async function handleAIDataSync(formData: FormData) {
  const cardId = formData.get('card_id') as string;
  const cardName = formData.get('card_name') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error("XAI_API_KEY is not set in environment variables. Please add it to your .env.local file.");
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          { 
            role: "system", 
            content: "You are a highly analytical crypto researcher. Your goal is to return a JSON object with the latest data for the requested crypto card. Structure: { \"cashback_rate\": \"string (e.g. 'Up to 4% BTC')\", \"monthly_fees\": \"string (e.g. '$0' or '$49/mo')\", \"description\": \"string (briefly explain rewards, limits, or note if the card is discontinued/inactive)\" }. Return raw JSON only." 
          },
          { 
            role: "user", 
            content: `Find the latest cashback and fee details for the "${cardName}" crypto card.` 
          }
        ]
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`xAI API Error: ${errTxt}`);
    }

    const data = await response.json();
    let parsed;
    try {
      parsed = JSON.parse(data.choices[0].message.content.trim());
    } catch(e) {
      const content = data.choices[0].message.content;
      const clean = content.replace(/```json\n?/, '').replace(/```/, '');
      parsed = JSON.parse(clean);
    }

    const suggestionText = `AI Sync Results (Grok):\nCashback: ${parsed.cashback_rate}\nFees: ${parsed.monthly_fees}\nNotes: ${parsed.description}`;
    
    await submitCardEditSuggestion(cardId, "[AI Data Sync]", suggestionText);
    
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to sync with AI' };
  }
}

export async function handleSavePuterSync(formData: FormData) {
  const cardId = formData.get('card_id') as string;
  const aiText = formData.get('ai_text') as string;

  try {
    await verifyAdminAccess(formData.get('privy_token') as string);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    let parsed;
    try {
      parsed = JSON.parse(aiText.trim());
    } catch(e) {
      const clean = aiText.replace(/```json\n?/, '').replace(/```/, '');
      parsed = JSON.parse(clean);
    }

    const suggestionText = `AI Sync Results (Puter/Grok):\nCashback: ${parsed.cashback_rate}\nFees: ${parsed.monthly_fees}\nNotes: ${parsed.description}`;
    
    await submitCardEditSuggestion(cardId, "[Puter AI Sync]", suggestionText);
    
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save Puter sync' };
  }
}
