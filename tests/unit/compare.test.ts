import { describe, it, expect } from 'vitest';

describe('Comparison Engine Logic & Calculations', () => {
  const USD_TO_INR_RATE = 86;

  it('correctly parses -vs- comparison route slugs', () => {
    function parseComparisonSlug(slug: string): { slugA: string; slugB: string } | null {
      if (!slug || !slug.includes('-vs-')) return null;
      const parts = slug.split('-vs-');
      const slugA = parts[0]?.trim();
      const slugB = parts[1]?.trim();
      if (!slugA || !slugB) return null;
      return { slugA, slugB };
    }

    expect(parseComparisonSlug('signoz-vs-datadog')).toEqual({ slugA: 'signoz', slugB: 'datadog' });
    expect(parseComparisonSlug('plane-vs-jira')).toEqual({ slugA: 'plane', slugB: 'jira' });
    expect(parseComparisonSlug('appsmith-vs-tooljet')).toEqual({ slugA: 'appsmith', slugB: 'tooljet' });
    expect(parseComparisonSlug('invalid-slug')).toBeNull();
    expect(parseComparisonSlug('')).toBeNull();
  });

  it('calculates standardized INR and USD currency conversions', () => {
    const usdPrice = 20; // $20/mo
    const inrEquivalent = Math.round(usdPrice * USD_TO_INR_RATE);
    expect(inrEquivalent).toBe(1720); // ₹1,720/mo

    const inrPrice = 2150; // ₹2,150/mo
    const usdEquivalent = Math.round(inrPrice / USD_TO_INR_RATE);
    expect(usdEquivalent).toBe(25); // $25/mo
  });

  it('calculates 18% GST input tax credit savings for Indian entities', () => {
    const monthlyCostInr = 5000;
    const annualCost = monthlyCostInr * 12; // ₹60,000/yr
    const gstInputCredit = Math.round(annualCost * 0.18); // ₹10,800

    expect(gstInputCredit).toBe(10800);
  });

  it('calculates team annual cost delta between two tools accurately', () => {
    const seats = 20;
    const monthlyCostA = 1000; // Tool A (INR 1,000/seat/mo)
    const monthlyCostB = 3000; // Tool B (INR 3,000/seat/mo)

    const annualCostA = monthlyCostA * seats * 12; // 240,000
    const annualCostB = monthlyCostB * seats * 12; // 720,000
    const savingsWithA = annualCostB - annualCostA;

    expect(savingsWithA).toBe(480000); // Saves ₹4,80,000/yr
  });

  it('safely parses JSON arrays of pros and cons with fallbacks', () => {
    function parseJsonList(input: any): string[] {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    const rawJsonString = '["OpenTelemetry native", "Self-hostable", "18% GST Invoice"]';
    expect(parseJsonList(rawJsonString)).toHaveLength(3);
    expect(parseJsonList(rawJsonString)[0]).toBe('OpenTelemetry native');

    expect(parseJsonList(null)).toHaveLength(0);
    expect(parseJsonList('invalid-json')).toHaveLength(0);
    expect(parseJsonList(['direct', 'array'])).toHaveLength(2);
  });
});
