import { MetadataRoute } from 'next';
import { getAllCards } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all cards from the database
  const cards = await getAllCards();

  // Map cards to sitemap entries
  const cardEntries: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `https://cryptocards.fyi/cards/${card.slug}`,
    lastModified: new Date(card.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://cryptocards.fyi',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://cryptocards.fyi/compare',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://cryptocards.fyi/submit',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...cardEntries,
  ];
}
