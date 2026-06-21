import Image from "next/image";

type NetworkBadgeProps = {
  network: string;
};

export const networkIconMap: Record<string, string> = {
  'Ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  'Bitcoin': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  'Polygon': 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  'Arbitrum': 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
  'Optimism': 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png',
  'Solana': 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  'Base': 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://base.org&size=128',
  'Avalanche': 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  'BNB Chain': 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  'Cronos': 'https://cryptologos.cc/logos/cronos-cro-logo.svg',
  'Gnosis': 'https://s2.coinmarketcap.com/static/img/coins/64x64/1659.png',
  'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.svg',
  'Stellar': 'https://cryptologos.cc/logos/stellar-xlm-logo.svg',
  'KCC': 'https://s2.coinmarketcap.com/static/img/coins/64x64/3155.png',
  'SUI': 'https://cryptologos.cc/logos/sui-sui-logo.svg',
  'Sui': 'https://cryptologos.cc/logos/sui-sui-logo.svg',
  'TON': 'https://cryptologos.cc/logos/toncoin-ton-logo.svg',
  'Ton': 'https://cryptologos.cc/logos/toncoin-ton-logo.svg',
  'Tron': 'https://cryptologos.cc/logos/tron-trx-logo.svg',
  'Aptos': 'https://cryptologos.cc/logos/aptos-apt-logo.svg',
  'Celo': 'https://cryptologos.cc/logos/celo-celo-logo.svg',
  'THORChain': 'https://cryptologos.cc/logos/thorchain-rune-logo.svg',
  'Sonic': 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://soniclabs.com&size=128',
  'Linea': 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://linea.build&size=128',
  'Payy Network': 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://payy.network&size=128',
  'Plasma': 'https://www.plasma.org/logo-512.png'
};

export function NetworkBadge({ network }: NetworkBadgeProps) {
  const iconUrl = networkIconMap[network];

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted text-foreground rounded-md text-xs font-medium border border-border">
      {iconUrl && (
        <img 
          src={iconUrl} 
          alt={`${network} icon`} 
          className="w-3.5 h-3.5 object-contain"
        />
      )}
      {network}
    </div>
  );
}
