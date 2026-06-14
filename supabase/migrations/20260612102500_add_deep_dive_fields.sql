-- Add deep dive editorial columns
ALTER TABLE public.crypto_cards 
ADD COLUMN IF NOT EXISTS pros TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS full_review TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fee_details JSONB DEFAULT '{}'::jsonb;
