export interface CuratedQuote {
  id: string;
  text: string;
  author: string;
  category: 'wisdom' | 'motivation' | 'creativity' | 'friendship' | 'tech';
  theme: 'amber' | 'emerald' | 'violet' | 'rose' | 'ocean' | 'dark';
}

export const CURATED_QUOTES: CuratedQuote[] = [
  {
    id: 'q1',
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "motivation",
    theme: "amber",
  },
  {
    id: 'q2',
    text: "Connection is the energy that exists between people when they feel seen, heard, and valued.",
    author: "Brené Brown",
    category: "friendship",
    theme: "rose",
  },
  {
    id: 'q3',
    text: "Simplicity is about subtracting the obvious and adding the meaningful.",
    author: "John Maeda",
    category: "creativity",
    theme: "emerald",
  },
  {
    id: 'q4',
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
    category: "tech",
    theme: "ocean",
  },
  {
    id: 'q5',
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "wisdom",
    theme: "violet",
  },
  {
    id: 'q6',
    text: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
    category: "creativity",
    theme: "amber",
  },
  {
    id: 'q7',
    text: "Real communication begins when we stop listening to reply and start listening to understand.",
    author: "Stephen Covey",
    category: "friendship",
    theme: "emerald",
  },
  {
    id: 'q8',
    text: "What we achieve inwardly will change outer reality.",
    author: "Plutarch",
    category: "wisdom",
    theme: "dark",
  },
];

export const THEME_GRADIENTS: Record<
  'amber' | 'emerald' | 'violet' | 'rose' | 'ocean' | 'dark',
  { bg: string; text: string; authorText: string; border: string; accent: string }
> = {
  amber: {
    bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700',
    text: 'text-amber-50',
    authorText: 'text-amber-200',
    border: 'border-amber-400/30',
    accent: '#f59e0b',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800',
    text: 'text-emerald-50',
    authorText: 'text-emerald-200',
    border: 'border-emerald-400/30',
    accent: '#10b981',
  },
  violet: {
    bg: 'bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-900',
    text: 'text-purple-50',
    authorText: 'text-violet-200',
    border: 'border-violet-400/30',
    accent: '#8b5cf6',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-800',
    text: 'text-rose-50',
    authorText: 'text-rose-200',
    border: 'border-rose-400/30',
    accent: '#f43f5e',
  },
  ocean: {
    bg: 'bg-gradient-to-br from-blue-600 via-cyan-700 to-sky-900',
    text: 'text-sky-50',
    authorText: 'text-sky-200',
    border: 'border-sky-400/30',
    accent: '#0ea5e9',
  },
  dark: {
    bg: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-950',
    text: 'text-slate-100',
    authorText: 'text-slate-400',
    border: 'border-slate-800',
    accent: '#64748b',
  },
};

export function getRandomQuote(): CuratedQuote {
  const index = Math.floor(Math.random() * CURATED_QUOTES.length);
  return CURATED_QUOTES[index];
}
