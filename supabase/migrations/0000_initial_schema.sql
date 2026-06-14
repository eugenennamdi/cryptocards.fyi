-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: cards
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    specs JSONB DEFAULT '{}'::jsonb,
    current_score NUMERIC DEFAULT 0,
    volume_24h INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: mentions
CREATE TABLE IF NOT EXISTS public.mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- e.g., 'reddit', 'x'
    url TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    sentiment_label TEXT, -- 'positive', 'neutral', 'negative'
    is_top_review BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: daily_trends
CREATE TABLE IF NOT EXISTS public.daily_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    avg_sentiment_score NUMERIC NOT NULL,
    total_mentions INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_mentions_card_id ON public.mentions(card_id);
CREATE INDEX IF NOT EXISTS idx_daily_trends_card_id ON public.daily_trends(card_id);
