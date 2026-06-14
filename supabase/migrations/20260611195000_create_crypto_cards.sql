-- Drop old tables
DROP TABLE IF EXISTS public.mentions CASCADE;
DROP TABLE IF EXISTS public.cards CASCADE;

-- Create the new curated crypto_cards table
CREATE TABLE public.crypto_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    cashback_rate TEXT,
    monthly_fees TEXT,
    supported_networks TEXT[],
    editor_trust_score NUMERIC CHECK (editor_trust_score >= 0 AND editor_trust_score <= 10),
    description TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disable Row Level Security temporarily for rapid prototyping since we are server-side only for ingestion/display right now
ALTER TABLE public.crypto_cards DISABLE ROW LEVEL SECURITY;

-- Insert initial seed data
INSERT INTO public.crypto_cards (
    name, 
    slug, 
    logo_url, 
    cashback_rate, 
    monthly_fees, 
    supported_networks, 
    editor_trust_score, 
    description, 
    website_url
) VALUES (
    'Etherfi Cash',
    'etherfi-cash',
    'https://pbs.twimg.com/profile_images/1628122606673661954/P_V_P3l9_400x400.jpg',
    'Up to 8% (Variable based on staking)',
    '$0 (Requires active restaking)',
    ARRAY['Ethereum', 'Arbitrum', 'Optimism'],
    8.5,
    'Etherfi Cash is a bleeding-edge non-custodial spending card seamlessly integrated with your restaking portfolio on EigenLayer. Perfect for DeFi native power users who want to spend yield directly.',
    'https://www.ether.fi/'
),
(
    'Coinbase One',
    'coinbase-one',
    'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8dea22c4781f147/Coinbase_Logo_2016.png',
    '0% (No trading fees)',
    '$29.99/month',
    ARRAY['Ethereum', 'Base', 'Solana', 'Bitcoin', 'Polygon'],
    9.0,
    'Coinbase One is a premium subscription for high-volume traders. It offers zero-fee trading, boosted staking rewards, and priority 24/7 phone support, providing immense value to power users inside the Coinbase ecosystem.',
    'https://www.coinbase.com/one'
);
