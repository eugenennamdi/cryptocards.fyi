import { ImageResponse } from 'next/og';
import { getCardBySlug } from '@/lib/data';

export const alt = 'CryptoCard deep dive and review';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const card = await getCardBySlug(params.slug);

  if (!card) {
    return new ImageResponse(
      (
        <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 64 }}>
          Card Not Found
        </div>
      ),
      { ...size }
    );
  }

  const totalVotes = card.upvotes + card.downvotes;
  const communityScore = totalVotes > 0 ? (card.upvotes / totalVotes) * 10 : card.editor_trust_score;
  const compositeScore = ((card.editor_trust_score + communityScore) / 2).toFixed(1);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #171717, #0a0a0a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          {card.logo_url && (
            <img 
              src={card.logo_url} 
              width="120" 
              height="120" 
              style={{ borderRadius: '60px', marginRight: '40px', border: '4px solid #333', background: 'white' }} 
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '72px', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              {card.name}
            </h1>
            <p style={{ fontSize: '32px', color: '#a3a3a3', marginTop: '10px' }}>
              Deep Dive & Review
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', borderTop: '2px solid #262626', paddingTop: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '2px' }}>Trust Score</span>
            <span style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff' }}>{compositeScore}/10</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '2px' }}>Cashback</span>
            <span style={{ fontSize: '56px', fontWeight: 'bold', color: '#22c55e' }}>{card.cashback_rate}</span>
          </div>
        </div>
        
        <div style={{ position: 'absolute', bottom: '40px', right: '80px', fontSize: '28px', fontWeight: 'bold', color: '#525252' }}>
          CryptoCards.fyi
        </div>
      </div>
    ),
    { ...size }
  );
}
