-- 1. Add voting columns
ALTER TABLE public.crypto_cards 
ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0;

-- 2. Create RPC for atomic vote incrementing
CREATE OR REPLACE FUNCTION increment_vote(card_id UUID, vote_type TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF vote_type = 'up' THEN
        UPDATE public.crypto_cards SET upvotes = upvotes + 1 WHERE id = card_id;
    ELSIF vote_type = 'down' THEN
        UPDATE public.crypto_cards SET downvotes = downvotes + 1 WHERE id = card_id;
    END IF;
END;
$$;

-- 3. Seed 20+ additional cards
INSERT INTO public.crypto_cards (name, slug, logo_url, cashback_rate, monthly_fees, supported_networks, editor_trust_score, description, website_url) VALUES 
('Crypto.com Visa', 'cryptocom-visa', 'https://pbs.twimg.com/profile_images/1684136413204013056/k6G4I4dO_400x400.jpg', 'Up to 5%', 'Free (requires CRO stake)', ARRAY['Ethereum', 'Cronos', 'Bitcoin'], 8.5, 'The most popular crypto debit card. Offers massive perks like Spotify/Netflix rebates depending on your CRO staking tier.', 'https://crypto.com/cards'),

('Nexo Card', 'nexo-card', 'https://pbs.twimg.com/profile_images/1676644026365825026/GjJt9j0u_400x400.jpg', 'Up to 2%', 'Free', ARRAY['Ethereum', 'Bitcoin', 'Polygon'], 8.8, 'Allows you to spend the fiat value of your crypto without selling it by opening a dynamic line of credit.', 'https://nexo.com/nexo-card'),

('Wirex', 'wirex', 'https://pbs.twimg.com/profile_images/1649065612717019141/00R_kQpY_400x400.jpg', 'Up to 8% (Cryptoback)', 'Free', ARRAY['Ethereum', 'Avalanche', 'Polygon', 'Stellar'], 7.5, 'A multi-currency travel card and crypto app. Great for switching between fiat currencies and crypto on the fly.', 'https://wirexapp.com/'),

('Gnosis Pay', 'gnosis-pay', 'https://pbs.twimg.com/profile_images/1679862804515860481/E5YkF1K0_400x400.jpg', 'Variable', '€29.99 (Card Issue)', ARRAY['Gnosis', 'Ethereum'], 9.2, 'The world''s first decentralized payment network tied to a Visa card. Operates entirely on the Gnosis chain via a Safe Smart Account.', 'https://gnosispay.com/'),

('Plutus', 'plutus', 'https://pbs.twimg.com/profile_images/1630161476080766976/yRzM8-jI_400x400.jpg', 'Up to 9% (PLU)', 'Free - £14.99/mo', ARRAY['Ethereum'], 8.0, 'Non-custodial reward card. You connect your own wallet and earn PLU tokens on everyday spending.', 'https://plutus.it/'),

('Binance Card', 'binance-card', 'https://pbs.twimg.com/profile_images/1612411039801774080/w1M4kG4J_400x400.jpg', 'Up to 8%', 'Free', ARRAY['BNB Chain', 'Bitcoin', 'Ethereum'], 8.0, 'Spend your crypto directly from your Binance funding wallet. Note: Availability is currently restricted in several regions.', 'https://www.binance.com/en/cards'),

('Monolith', 'monolith', 'https://pbs.twimg.com/profile_images/1381987553310064646/9a1T4Z2S_400x400.jpg', 'None', 'Variable Gas', ARRAY['Ethereum'], 7.8, 'One of the original DeFi debit cards. Operates via a non-custodial smart contract wallet on Ethereum.', 'https://monolith.xyz/'),

('Holyheld', 'holyheld', 'https://pbs.twimg.com/profile_images/1628063073289060352/K4_V5y9__400x400.jpg', 'None', 'Variable', ARRAY['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'], 8.5, 'A sleek non-custodial card. Top up directly from your self-hosted wallet without a central exchange holding your funds.', 'https://holyheld.com/'),

('Renegade', 'renegade', 'https://pbs.twimg.com/profile_images/1709935105223364609/J8M2b8wA_400x400.jpg', 'Variable', 'Free', ARRAY['Ethereum', 'Base'], 7.0, 'A new privacy-focused decentralized exchange that integrates a spending card tied to your darkpool balances.', 'https://renegade.fi/'),

('Spritz Finance', 'spritz-finance', 'https://pbs.twimg.com/profile_images/1531737976899309569/180hBv4G_400x400.jpg', 'None', 'Free', ARRAY['Polygon', 'Arbitrum', 'Optimism', 'Base', 'BNB Chain'], 8.6, 'Not a physical card, but allows you to pay real-world bills (credit cards, mortgage) directly from your Web3 wallet.', 'https://spritz.finance/'),

('KuCoin Card', 'kucoin-card', 'https://pbs.twimg.com/profile_images/1648937667230912513/f5W9yWzI_400x400.jpg', 'Up to 2%', 'Free', ARRAY['Ethereum', 'Bitcoin', 'KCC'], 7.0, 'Spend crypto globally with KuCoin. Converts cryptocurrency to fiat at the point of sale.', 'https://www.kucoin.com/kucard'),

('Baanx', 'baanx', 'https://pbs.twimg.com/profile_images/1541434947230785536/b1p5x7M7_400x400.jpg', 'Variable', 'Free', ARRAY['Ethereum', 'Polygon'], 7.5, 'B2B2C cryptofinance platform that powers cards like Ledger''s CL Card. Highly regulated and secure.', 'https://baanx.com/'),

('Ledger CL Card', 'ledger-cl-card', 'https://pbs.twimg.com/profile_images/1671151624649719810/o4v1t50__400x400.jpg', 'Up to 2%', 'Free', ARRAY['Ethereum', 'Bitcoin', 'Polygon'], 8.9, 'Powered by Baanx, this card integrates directly with the Ledger Live app, letting you top up from your hardware wallet.', 'https://www.ledger.com/cl-card'),

('Gemini Credit Card', 'gemini-credit-card', 'https://pbs.twimg.com/profile_images/1585293237177573377/oA2pC6A2_400x400.jpg', 'Up to 3% in Crypto', 'No Annual Fee', ARRAY['Ethereum', 'Bitcoin'], 8.7, 'A traditional credit card that issues instant cashback in Bitcoin, Ethereum, or 40+ other cryptos.', 'https://www.gemini.com/credit-card'),

('Fold Card', 'fold-card', 'https://pbs.twimg.com/profile_images/1506307185264353282/c99i_k4r_400x400.jpg', 'Spin the Wheel (BTC)', '$21 - $150/yr', ARRAY['Bitcoin'], 8.2, 'A Bitcoin-only rewards debit card. Every purchase lets you spin a wheel for a chance to win a full Bitcoin.', 'https://foldapp.com/'),

('Uphold Card', 'uphold-card', 'https://pbs.twimg.com/profile_images/1648719266734493696/6sD2_wZz_400x400.jpg', 'Up to 4% (XRP)', 'Free', ARRAY['XRP', 'Ethereum', 'Bitcoin'], 8.0, 'Spend any asset in your Uphold account, from crypto to precious metals to fiat currencies.', 'https://uphold.com/en-us/products/debit-card'),

('Bybit Card', 'bybit-card', 'https://pbs.twimg.com/profile_images/1665646197115666432/m616uB5c_400x400.jpg', 'Up to 10%', 'Free', ARRAY['Ethereum', 'Bitcoin', 'USDT'], 7.9, 'A Mastercard debit card that allows Bybit users to spend their crypto balances worldwide.', 'https://www.bybit.com/en-US/card/'),

('Nexo Credit', 'nexo-credit', 'https://pbs.twimg.com/profile_images/1676644026365825026/GjJt9j0u_400x400.jpg', 'Up to 2%', 'Free', ARRAY['Ethereum', 'Bitcoin'], 8.5, 'Use your crypto as collateral to borrow fiat on the go without triggering a taxable event.', 'https://nexo.com/'),

('Xapo Bank', 'xapo-bank', 'https://pbs.twimg.com/profile_images/1628424263433150466/YxK7oZ_9_400x400.jpg', 'Up to 1%', '$150/yr', ARRAY['Bitcoin', 'USDC'], 9.5, 'A fully regulated private bank in Gibraltar that bridges Bitcoin and USD with a premium metal card.', 'https://xapobank.com/'),

('Bitpanda Card', 'bitpanda-card', 'https://pbs.twimg.com/profile_images/1645398284615802880/wB3jC3_O_400x400.jpg', 'Up to 2% (BEST)', 'Free', ARRAY['Ethereum', 'Bitcoin', 'BEST'], 8.1, 'A Visa card connected to your Bitpanda portfolio. Spend stocks, crypto, or metals instantly.', 'https://www.bitpanda.com/en/card')
ON CONFLICT (slug) DO NOTHING;
