import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// Initialize Supabase with Service Role to bypass RLS for secure RPC execution
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { cardId, cardName, voteType, signature, walletAddress } = await req.json();

    if (!cardId || !voteType || !signature || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // 1. Reconstruct the exact message the user was asked to sign
    const expectedMessage = `I am casting an authenticated ${voteType} for ${cardName}.`;

    // 2. Cryptographically verify the signature
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(expectedMessage, signature);
    } catch (e) {
      return NextResponse.json({ error: 'Cryptographic verification failed. Invalid signature.' }, { status: 401 });
    }

    // 3. Ensure the recovered address matches the claimed wallet address
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Signature does not match the provided wallet address.' }, { status: 401 });
    }

    // 4. Execute the secure database RPC to log the vote and increment the aggregate
    const { error: rpcError } = await supabase.rpc('cast_authenticated_vote', {
      p_card_id: cardId,
      p_wallet_address: walletAddress.toLowerCase(),
      p_vote_type: voteType
    });

    if (rpcError) {
      if (rpcError.code === '23505') { // Postgres Unique Violation
        return NextResponse.json({ error: 'You have already voted on this card.' }, { status: 409 });
      }
      console.error("RPC Error:", rpcError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (err: any) {
    console.error("Vote API Error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
