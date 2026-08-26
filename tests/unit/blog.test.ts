import { describe, it, expect } from 'vitest';
import { createBlogAuthorId, createBlogPostId, createBlogPostToolId } from '../../src/lib/server/id';

function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function sanitizeSlug(title: string): string {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

describe('Blog CMS Utilities & ID Generators', () => {
  it('generates IDs with correct Stripe-style prefixes', () => {
    const authorId = createBlogAuthorId();
    const postId = createBlogPostId();
    const postToolId = createBlogPostToolId();

    expect(authorId).toMatch(/^author_[a-zA-Z0-9]{24}$/);
    expect(postId).toMatch(/^post_[a-zA-Z0-9]{24}$/);
    expect(postToolId).toMatch(/^bpt_[a-zA-Z0-9]{24}$/);
  });

  it('calculates reading time accurately based on word count', () => {
    expect(calculateReadingTime('')).toBe(1);
    expect(calculateReadingTime('Short update here.')).toBe(1);

    const fiveHundredWords = Array(500).fill('word').join(' ');
    expect(calculateReadingTime(fiveHundredWords)).toBe(3); // 500 / 200 = 2.5 -> ceil = 3

    const thousandWords = Array(1000).fill('word').join(' ');
    expect(calculateReadingTime(thousandWords)).toBe(5); // 1000 / 200 = 5
  });

  it('sanitizes and slugifies article titles properly', () => {
    expect(sanitizeSlug('Why India’s Tech Ecosystem is Booming in 2026!'))
      .toBe('why-india-s-tech-ecosystem-is-booming-in-2026');
    expect(sanitizeSlug('SigNoz vs Datadog: Complete APM Comparison'))
      .toBe('signoz-vs-datadog-complete-apm-comparison');
    expect(sanitizeSlug('   ---Leading Open Source Tools---   '))
      .toBe('leading-open-source-tools');
  });

  it('correctly matches and identifies tool embed markdown snippets', () => {
    const markdown = 'Here is the tool:\n\n:::tool{slug="signoz"}\n:::\n\nNext section...';
    const regex = /:::tool\{slug="([^"]+)"\}\s*:::/g;
    const matches = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      matches.push(match[1]);
    }

    expect(matches).toEqual(['signoz']);
  });
});
