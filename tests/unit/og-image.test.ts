import { describe, it, expect } from 'vitest';
import { GET as getToolOg } from '../../src/pages/api/og/tool/[slug].svg';
import { GET as getToolOgPng } from '../../src/pages/api/og/tool/[slug].png';
import { GET as getAlternativeOg } from '../../src/pages/api/og/alternative/[slug].svg';
import { GET as getAlternativeOgPng } from '../../src/pages/api/og/alternative/[slug].png';
import { GET as getDefaultOg } from '../../src/pages/api/og/default.svg';

describe('Dynamic Open Graph (OG) Image Generation', () => {
  it('generates a valid SVG banner for Default Brand OG', async () => {
    const response = await getDefaultOg({} as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(response.headers.get('Cache-Control')).toContain('public');

    const svg = await response.text();
    expect(svg).toContain('<svg');
    expect(svg).toContain('DESI ALTERNATIVES');
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
  });

  it('generates a dynamic SVG banner for Indian Tool details', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          leftJoin: () => ({
            where: () => ({
              get: async () => ({
                name: 'SigNoz',
                tagline: 'Open-source APM & Observability',
                primaryColor: '#D97706',
                categoryName: 'Developer Tools',
                categoryEmoji: '⚡',
                city: 'Bengaluru',
                state: 'Karnataka',
                foundedYear: 2021,
                isOpenSource: true,
                hasIndianDataResidency: true,
                hasGstInvoice: true,
                hasInrPricing: true,
                startingPriceInr: 0,
              }),
            }),
          }),
        }),
      }),
    };

    const response = await getToolOg({
      params: { slug: 'signoz' },
      locals: { db: mockDb },
    } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');

    const svg = await response.text();
    expect(svg).toContain('SigNoz');
    expect(svg).toContain('Developer Tools');
    expect(svg).toContain('Bengaluru, Karnataka');
    expect(svg).toContain('Free Tier');
    expect(svg).toContain('18% GST Input Credit');
  });

  it('generates a dynamic PNG banner for Indian Tool details', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          leftJoin: () => ({
            where: () => ({
              get: async () => ({
                name: 'Razorpay',
                tagline: 'Payments, banking, and financial suite',
                primaryColor: '#0284C7',
                categoryName: 'Fintech',
                categoryEmoji: '💳',
                city: 'Bengaluru',
                state: 'Karnataka',
                foundedYear: 2014,
                isOpenSource: false,
                hasIndianDataResidency: true,
                hasGstInvoice: true,
                hasInrPricing: true,
                startingPriceInr: 0,
              }),
            }),
          }),
        }),
      }),
    };

    const response = await getToolOgPng({
      params: { slug: 'razorpay' },
      locals: { db: mockDb },
    } as any);

    expect([200, 302]).toContain(response.status);
    if (response.status === 200) {
      expect(response.headers.get('Content-Type')).toBe('image/png');
    }
  }, 15000);

  it('generates a dynamic SVG banner for Alternative comparison matrix', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            get: async () => ({
              id: 'gt_notion',
              name: 'Notion',
              slug: 'notion',
              startingPriceUsd: 10,
            }),
          }),
          leftJoin: () => ({
            where: () => ({
              all: async () => [
                {
                  name: 'Appsmith',
                  tagline: 'Low-code internal tool builder',
                  startingPriceInr: 0,
                  city: 'Bengaluru',
                },
              ],
            }),
          }),
        }),
      }),
    };

    const response = await getAlternativeOg({
      params: { slug: 'notion' },
      locals: { db: mockDb },
    } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');

    const svg = await response.text();
    expect(svg).toContain('Indian Alternatives to');
    expect(svg).toContain('Notion');
    expect(svg).toContain('Appsmith');
  });

  it('generates a dynamic PNG banner for Alternative comparison matrix', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            get: async () => ({
              id: 'gt_stripe',
              name: 'Stripe',
              slug: 'stripe',
              startingPriceUsd: 29,
            }),
          }),
          leftJoin: () => ({
            where: () => ({
              all: async () => [
                {
                  name: 'Razorpay',
                  tagline: 'Payment gateway for India',
                  startingPriceInr: 0,
                  city: 'Bengaluru',
                },
              ],
            }),
          }),
        }),
      }),
    };

    const response = await getAlternativeOgPng({
      params: { slug: 'stripe' },
      locals: { db: mockDb },
    } as any);

    expect([200, 302]).toContain(response.status);
    if (response.status === 200) {
      expect(response.headers.get('Content-Type')).toBe('image/png');
    }
  }, 15000);
});
