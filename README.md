<div align="center">
  <img src="public/og.png" alt="CryptoCards.fyi Promo Image" width="100%" />
  <h1>CryptoCards.fyi</h1>
  <p><strong>The Curated Hub for Crypto Cards.</strong></p>
  <p>Spend onchain. Compare fees, cashback rewards, and supported networks across the best verified crypto cards and Web3 debit cards.</p>
</div>

---

## Overview

CryptoCards.fyi is a comprehensive, community-driven directory designed to help users navigate the rapidly expanding world of crypto debit and credit cards. 

With dozens of cards on the market, it can be difficult to compare cashback rates, hidden fees, KYC requirements, and supported blockchain networks. This platform solves that by providing a clean, dynamic, and community-verified database of the best Web3 cards available.

## Core Features

*   **Dynamic Card Directory**: Browse and filter through dozens of crypto cards by supported networks, region (Global, Europe/UK, Emerging Markets), and KYC requirements.
*   **Detailed Comparisons**: Side-by-side analysis of monthly fees, cashback rates (up to 4%+), and editor trust scores.
*   **Community Submissions & Reviews**: Users can securely connect their Web3 wallets or use social login to upvote cards, leave reviews, and suggest edits to existing card data.
*   **Universal Authentication**: Seamless authentication using Privy, allowing users to interact with the platform without needing traditional passwords. Users can log in via email, Google, Apple, or native Web3 wallets.

## Tech Stack

This project was built with modern, highly-scalable web technologies:

*   **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Shadcn UI concepts
*   **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Authentication**: [Privy](https://privy.io/)
*   **Analytics**: [Vercel Analytics](https://vercel.com/analytics)
*   **Deployment**: Vercel

## Getting Started (Local Development)

### Prerequisites
*   Node.js 18+
*   A Supabase project
*   A Privy application

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add all variables from `.env.local` (and any necessary production secrets) into the Vercel Environment Variables settings.
4. Ensure your custom domain is added to both Vercel and your Privy Dashboard's "Allowed Domains" list.
5. Deploy!

---
*Built for the onchain ecosystem.*
