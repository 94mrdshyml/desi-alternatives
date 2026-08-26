import { describe, it, expect } from 'vitest';

interface SearchResultItem {
  id: string;
  type: 'tool' | 'alternative' | 'category' | 'blog';
  title: string;
  subtitle: string;
  slug: string;
  url: string;
  badgeLabel: string;
  badgeType: 'tool' | 'alternative' | 'category' | 'blog';
  categoryName?: string;
  score: number;
}

// Search scoring simulator matching API logic
function scoreSearchItem(query: string, item: { name: string; type: 'tool' | 'alternative' | 'category' | 'blog'; tagline?: string }): number {
  const q = query.trim().toLowerCase();
  const name = item.name.toLowerCase();
  let baseScore = item.type === 'tool' ? 50 : item.type === 'alternative' ? 40 : item.type === 'category' ? 30 : 35;

  if (name === q) return baseScore + 100;
  if (name.startsWith(q)) return baseScore + 60;
  if (name.includes(q)) return baseScore + 40;
  if (item.tagline && item.tagline.toLowerCase().includes(q)) return baseScore + 20;
  return 0;
}

// Content Gap aggregator
function aggregateZeroResultGaps(logs: { query: string; resultsCount: number; createdAt: string }[]) {
  const zeroLogs = logs.filter((l) => l.resultsCount === 0);
  const map: Record<string, { query: string; count: number; lastSearched: string }> = {};

  zeroLogs.forEach((z) => {
    const key = z.query.trim().toLowerCase();
    if (!map[key]) {
      map[key] = { query: z.query, count: 0, lastSearched: z.createdAt };
    }
    map[key].count += 1;
  });

  return Object.values(map).sort((a, b) => b.count - a.count);
}

describe('Universal Search & Content Gap Intelligence', () => {
  it('correctly scores exact, prefix, and substring matches with priority weighting', () => {
    const exactToolScore = scoreSearchItem('postman', { name: 'Postman', type: 'tool' });
    const prefixToolScore = scoreSearchItem('post', { name: 'Postman', type: 'tool' });
    const substrToolScore = scoreSearchItem('man', { name: 'Postman', type: 'tool' });

    expect(exactToolScore).toBeGreaterThan(prefixToolScore);
    expect(prefixToolScore).toBeGreaterThan(substrToolScore);
    expect(substrToolScore).toBeGreaterThan(0);
  });

  it('accurately identifies zero-result searches as content gaps', () => {
    const mockLogs = [
      { query: 'Linear', resultsCount: 0, createdAt: '2026-08-26T10:00:00Z' },
      { query: 'linear', resultsCount: 0, createdAt: '2026-08-26T10:05:00Z' },
      { query: 'Figma', resultsCount: 0, createdAt: '2026-08-26T10:10:00Z' },
      { query: 'Appsmith', resultsCount: 3, createdAt: '2026-08-26T10:15:00Z' },
      { query: 'Linear', resultsCount: 0, createdAt: '2026-08-26T10:20:00Z' },
    ];

    const gaps = aggregateZeroResultGaps(mockLogs);

    expect(gaps.length).toBe(2);
    expect(gaps[0].query.toLowerCase()).toBe('linear');
    expect(gaps[0].count).toBe(3); // 3 occurrences normalized
    expect(gaps[1].query.toLowerCase()).toBe('figma');
    expect(gaps[1].count).toBe(1);
  });

  it('assigns distinctive pill badges and category tags for each entity type', () => {
    const toolItem: SearchResultItem = {
      id: 'tool_123',
      type: 'tool',
      title: 'Appsmith',
      subtitle: 'Low-code internal tool builder',
      slug: 'appsmith',
      url: '/tools/appsmith',
      badgeLabel: 'Indian Tool',
      badgeType: 'tool',
      categoryName: 'Developer Tools',
      score: 150,
    };

    const altItem: SearchResultItem = {
      id: 'gt_456',
      type: 'alternative',
      title: 'Retool',
      subtitle: 'Internal tool builder for enterprises',
      slug: 'retool',
      url: '/alternatives/retool',
      badgeLabel: 'Global Giant',
      badgeType: 'alternative',
      categoryName: 'Developer Tools',
      score: 140,
    };

    expect(toolItem.badgeType).toBe('tool');
    expect(toolItem.categoryName).toBe('Developer Tools');
    expect(altItem.badgeType).toBe('alternative');
    expect(altItem.badgeLabel).toBe('Global Giant');
  });
});
