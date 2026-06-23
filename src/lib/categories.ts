export type CardMetadata = {
  region: string;
  kyc: string;
  paymentNetwork: 'Visa' | 'Mastercard' | 'Unknown';
  applePay: boolean;
  googlePay: boolean;
  custody: 'Self-Custodial' | 'Custodial';
};

export const CARD_PAYMENT_NETWORKS: Record<string, string[]> = {
  "Visa": [
    "Coinbase Card", "Gnosis Pay", "Wirex", "Bitpanda", "Bitget Card", "Avici Money", "RedotPay", "Payy", "Uphold Card", "Plasma One", "Tria", "Kast", "COCA"
  ],
  "Mastercard": [
    "ether.fi Cash", "MetaMask Card", "Nexo Card", "Bybit Card", "Holyheld", "Bleap"
  ]
};

export const CARD_APPLE_PAY = [
  "Coinbase Card", "Gnosis Pay", "Nexo Card", "Bybit Card", "Bitpanda", "Wirex", "Kast", "RedotPay", "ether.fi Cash", "Uphold Card", "Bitget Card", "Avici Money", "Plasma One", "Tria", "COCA"
];

export const CARD_GOOGLE_PAY = [
  "Coinbase Card", "Gnosis Pay", "Nexo Card", "Bybit Card", "Bitpanda", "Wirex", "Kast", "RedotPay", "ether.fi Cash", "Uphold Card", "Bitget Card", "Avici Money", "Tria", "COCA"
];

export const CARD_SELF_CUSTODIAL = [
  "Gnosis Pay", "ether.fi Cash", "MetaMask Card", "Holyheld", "Bleap", "COCA", "Avici Money", "Tria", "Payy"
];

export const CARD_REGIONS: Record<string, string[]> = {
  "Global": [
    "Kast", "RedotPay", "ether.fi Cash", "MetaMask Card", "Coinbase Card", 
    "Nexo Card", "Bybit Card", "Bitget Card", 
    "Uphold Card", "Wirex", "Plasma One", "Avici Money", "Tria", "Payy"
  ],
  "Europe & UK": [
    "Gnosis Pay", "Holyheld", "Bleap", "Bitpanda", "COCA"
  ]
};

export const CARD_KYC: Record<string, string[]> = {
  "Low/No KYC": [
    "Payy"
  ],
  "Standard KYC": [
    "Kast", "RedotPay", "ether.fi Cash", "MetaMask Card", "Coinbase Card", 
    "Nexo Card", "Bybit Card", "Bitget Card", 
    "Uphold Card", "Wirex", "Plasma One", "Avici Money", "Tria"
  ],
  "Full KYC": [
    "Gnosis Pay", "Holyheld", "Bleap", "Bitpanda", "COCA"
  ]
};

export function getMetadataForCard(name: string): CardMetadata {
  let region = "Global";
  for (const [r, cards] of Object.entries(CARD_REGIONS)) {
    if (cards.includes(name)) region = r;
  }

  let kyc = "Standard KYC";
  for (const [k, cards] of Object.entries(CARD_KYC)) {
    if (cards.includes(name)) kyc = k;
  }

  let paymentNetwork: 'Visa' | 'Mastercard' | 'Unknown' = 'Unknown';
  if (CARD_PAYMENT_NETWORKS['Visa'].includes(name)) paymentNetwork = 'Visa';
  else if (CARD_PAYMENT_NETWORKS['Mastercard'].includes(name)) paymentNetwork = 'Mastercard';

  const applePay = CARD_APPLE_PAY.includes(name);
  const googlePay = CARD_GOOGLE_PAY.includes(name);
  const custody: 'Self-Custodial' | 'Custodial' = CARD_SELF_CUSTODIAL.includes(name) ? 'Self-Custodial' : 'Custodial';

  return { region, kyc, paymentNetwork, applePay, googlePay, custody };
}

export const CARD_POPULARITY: Record<string, number> = {
  "Gnosis Pay": 95,
  "ether.fi Cash": 90,
  "Tria": 87,
  "Kast": 85,
  "COCA": 83,
  "MetaMask Card": 80,
  "Avici Money": 78,
  "Holyheld": 75,
  "Bleap": 73,
  "Payy": 70,
  "RedotPay": 68,
  "Bitget Card": 65,
  "Bybit Card": 63,
  "Coinbase Card": 60,
  "Wirex": 58,
  "Nexo Card": 55,
  "Uphold Card": 53,
  "Bitpanda": 50,
  "Plasma One": 48
};

export function getPopularityScore(name: string): number {
  return CARD_POPULARITY[name] || 40; // Default base popularity for newer or smaller cards
}

export function getRegionColorClasses(region: string): string {
  switch (region) {
    case 'Global': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30';
    case 'Emerging Markets': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30';
    case 'Europe & UK': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30';
    case 'US & Global': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30';
    case 'UK & Europe': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/30';
    case 'LATAM': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/30';
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export function getKycColorClasses(kyc: string): string {
  switch (kyc) {
    case 'Low/No KYC': return 'bg-zinc-800 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-700 dark:border-zinc-300';
    case 'Light KYC': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800/30';
    case 'Full KYC': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}
