import { uniqueNamesGenerator, adjectives, animals, colors, starWars } from 'unique-names-generator';

const desiWords = [
  'samosa',
  'dosa',
  'jalebi',
  'chai',
  'biryani',
  'paneer',
  'laddu',
  'kachori',
  'rasgulla',
  'paratha',
  'gulabjamun',
  'idli',
  'chutney',
  'vada',
  'poha',
  'halwa',
  'pakora',
  'kachodi',
  'lassi',
  'falooda',
  'thandai',
  'gajar',
  'kheer',
  'gobi',
  'paratha',
  'naan',
  'chapati',
  'roti',
  'bhatura',
];

export function generateFunnyUsername(): string {
  const isDesiFlavor = Math.random() > 0.4;

  if (isDesiFlavor) {
    const adj = uniqueNamesGenerator({
      dictionaries: [adjectives],
      length: 1,
      style: 'lowerCase',
    });
    const food = desiWords[Math.floor(Math.random() * desiWords.length)];
    const num = Math.floor(100 + Math.random() * 90);
    return `${adj}-${food}-${num}`;
  }

  const generated = uniqueNamesGenerator({
    dictionaries: [adjectives, [animals, colors, starWars][Math.floor(Math.random() * 3)]],
    separator: '-',
    length: 2,
    style: 'lowerCase',
  });

  const num = Math.floor(10 + Math.random() * 90);
  return `${generated}-${num}`.replace(/[\s_]+/g, '-');
}
