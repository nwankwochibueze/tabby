import type { TabContext } from '@tabby/types';

const CONTEXT_RULES: Record<TabContext, string[]> = {
  work: [
    'github', 'gitlab', 'jira', 'notion', 'linear', 'figma',
    'slack', 'trello', 'asana', 'confluence', 'docs.google',
    'sheets.google', 'drive.google', 'meet.google', 'zoom',
    'stackoverflow', 'vercel', 'netlify', 'railway', 'supabase',
    'claude.ai', 'cloudinary', 'mongodb', 'upstash', 'render.com',
    'heroku', 'firebase', 'planetscale', 'neon.tech', 'prisma',
    'postman', 'insomnia', 'adminjs', 'cursor.sh', 'replit',
  ],
  research: [
    'wikipedia', 'arxiv', 'scholar.google', 'pubmed', 'jstor',
    'medium', 'dev.to', 'hashnode', 'substack', 'blog',
    'docs', 'documentation', 'mdn', 'w3schools', 'freecodecamp',
    'reactbits', 'greatfrontend', 'frontendmentor', 'css-tricks',
    'smashingmagazine', 'web.dev', 'patterns.dev',
  ],
  entertainment: [
    'youtube', 'netflix', 'twitch', 'spotify', 'soundcloud',
    'reddit', '9gag', 'imgur', 'tiktok', 'disney', 'hulu',
    'primevideo', 'crunchyroll',
  ],
  social: [
    'twitter', 'x.com', 'facebook', 'instagram', 'linkedin',
    'threads', 'discord', 'telegram', 'whatsapp', 'messenger',
  ],
  shopping: [
    'amazon', 'ebay', 'etsy', 'shopify', 'aliexpress',
    'walmart', 'bestbuy', 'target', 'jumia', 'konga',
    'coingecko', 'coinmarketcap', 'binance', 'exchangerate',
  ],
  unknown: [],
};

const matchesContext = (text: string, keywords: string[]): boolean => {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
};

export const detectContext = (url: string, title: string): TabContext => {
  const text = `${url} ${title}`;

  for (const [context, keywords] of Object.entries(CONTEXT_RULES) as [
    TabContext,
    string[],
  ][]) {
    if (context === 'unknown') continue;
    if (matchesContext(text, keywords)) return context;
  }

  return 'unknown';
};