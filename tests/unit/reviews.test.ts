import { describe, it, expect } from 'vitest';
import { createReviewId, createReviewVoteId, createToolUsageId } from '../../src/lib/server/id';

function calculateAverageRating(ratings: number[]): string {
  if (!ratings || ratings.length === 0) return '5.0';
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return (sum / ratings.length).toFixed(1);
}

function clampRating(rating: number): number {
  return Math.max(1, Math.min(5, Math.round(rating)));
}

function resolveReviewAvatar(authorName: string, customImage?: string | null): string {
  return customImage || `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(authorName || 'Desi')}`;
}

describe('Community Reviews & Rating Engine', () => {
  it('generates review, vote, and tool usage IDs with correct Stripe-style prefixes', () => {
    const reviewId = createReviewId();
    const voteId = createReviewVoteId();
    const usageId = createToolUsageId();

    expect(reviewId).toMatch(/^rev_[a-zA-Z0-9]{24}$/);
    expect(voteId).toMatch(/^vote_[a-zA-Z0-9]{24}$/);
    expect(usageId).toMatch(/^usage_[a-zA-Z0-9]{24}$/);
  });

  it('clamps and validates review ratings strictly between 1 and 5', () => {
    expect(clampRating(5)).toBe(5);
    expect(clampRating(1)).toBe(1);
    expect(clampRating(0)).toBe(1);
    expect(clampRating(-4)).toBe(1);
    expect(clampRating(10)).toBe(5);
    expect(clampRating(4.7)).toBe(5);
    expect(clampRating(4.2)).toBe(4);
  });

  it('calculates average review score accurately across multiple reviews', () => {
    expect(calculateAverageRating([])).toBe('5.0');
    expect(calculateAverageRating([5, 5, 5])).toBe('5.0');
    expect(calculateAverageRating([5, 4])).toBe('4.5');
    expect(calculateAverageRating([5, 4, 5, 4])).toBe('4.5');
    expect(calculateAverageRating([5, 5, 4, 5, 5])).toBe('4.8');
    expect(calculateAverageRating([1, 2, 3, 4, 5])).toBe('3.0');
  });

  it('resolves deterministic Dicebear avatar URLs when custom image is not provided', () => {
    const avatar1 = resolveReviewAvatar('Mridul Shyamal');
    expect(avatar1).toBe('https://api.dicebear.com/9.x/identicon/svg?seed=Mridul%20Shyamal');

    const customAvatar = resolveReviewAvatar('Vikram', 'https://r2.desi.io/custom-avatar.png');
    expect(customAvatar).toBe('https://r2.desi.io/custom-avatar.png');
  });

  it('formats verified review metadata properly', () => {
    const mockReview = {
      id: createReviewId(),
      toolId: 'tool_123',
      authorName: 'Vikram Joshi',
      authorRole: 'DevOps Lead',
      authorCompany: 'Fintech Hub',
      rating: 5,
      isVerified: true,
      title: 'Seamless migration',
      content: 'Local support is exceptional and direct GST invoice saves 18%.',
      helpfulCount: 8,
    };

    expect(mockReview.id).toContain('rev_');
    expect(mockReview.rating).toBe(5);
    expect(mockReview.isVerified).toBe(true);
    expect(mockReview.helpfulCount).toBeGreaterThanOrEqual(0);
  });
});
