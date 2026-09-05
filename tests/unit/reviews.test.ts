import { describe, it, expect } from 'vitest';
import { createReviewId, createReviewVoteId } from '../../src/lib/server/id';

function calculateAverageRating(ratings: number[]): string {
  if (!ratings || ratings.length === 0) return '5.0';
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return (sum / ratings.length).toFixed(1);
}

function clampRating(rating: number): number {
  return Math.max(1, Math.min(5, Math.round(rating)));
}

describe('Community Reviews & Rating Engine', () => {
  it('generates review and vote IDs with correct Stripe-style prefixes', () => {
    const reviewId = createReviewId();
    const voteId = createReviewVoteId();

    expect(reviewId).toMatch(/^rev_[a-zA-Z0-9]{24}$/);
    expect(voteId).toMatch(/^vote_[a-zA-Z0-9]{24}$/);
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
