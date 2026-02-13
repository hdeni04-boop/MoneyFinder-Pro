
import { Source, CollectorType } from './types.ts';

export const INITIAL_SOURCES: Source[] = [
  {
    id: 's1',
    name: 'TechCrunch Startups',
    url: 'https://techcrunch.com/feed/',
    type: CollectorType.RSS,
    isActive: true,
  },
  {
    id: 's2',
    name: 'GitHub Trending Repo API',
    url: 'https://api.github.com/trending',
    type: CollectorType.API,
    isActive: true,
  },
  {
    id: 's3',
    name: 'Product Hunt (Web Scraper)',
    url: 'https://www.producthunt.com/',
    type: CollectorType.WEB,
    isActive: true,
  },
  {
    id: 's4',
    name: 'CoinDesk Latest News',
    url: 'https://www.coindesk.com/feed/',
    type: CollectorType.RSS,
    isActive: true,
  }
];

export const MOCK_OPPORTUNITIES = [
  {
    id: 'o1',
    title: 'Seed Funding for AI DevTools',
    description: 'A new platform raising $5M to automate UI/UX design via LLMs.',
    sourceId: 's1',
    sourceName: 'TechCrunch Startups',
    link: '#',
    score: 85,
    reasoning: 'High growth potential in the AI infrastructure sector with significant capital injection.',
    timestamp: new Date().toISOString(),
    category: 'Funding',
    type: CollectorType.RSS
  }
];
