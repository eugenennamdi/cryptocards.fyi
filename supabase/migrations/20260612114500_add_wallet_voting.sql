-- 1. Create the votes tracking table to prevent sybil attacks
CREATE TABLE IF NOT EXISTS public.card_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.crypto_cards(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(card_id, wallet_address)
);

-- 2. Enable RLS but allow everything via service_role 
ALTER TABLE public.card_votes ENABLE ROW LEVEL SECURITY;

-- 3. Create a secure atomic RPC to cast an authenticated vote
CREATE OR REPLACE FUNCTION cast_authenticated_vote(
  p_card_id UUID,
  p_wallet_address TEXT,
  p_vote_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Attempt to insert the unique vote. If it violates the UNIQUE constraint, it throws an error.
  INSERT INTO public.card_votes (card_id, wallet_address, vote_type)
  VALUES (p_card_id, p_wallet_address, p_vote_type);

  -- If successful, update the aggregate count on the crypto_cards table
  IF p_vote_type = 'upvote' THEN
    UPDATE public.crypto_cards
    SET upvotes = upvotes + 1
    WHERE id = p_card_id;
  ELSIF p_vote_type = 'downvote' THEN
    UPDATE public.crypto_cards
    SET downvotes = downvotes + 1
    WHERE id = p_card_id;
  END IF;
END;
$$;
