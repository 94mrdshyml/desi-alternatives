import { describe, it, expect } from 'vitest';
import { pingIndexNow, INDEXNOW_KEY, DEFAULT_HOST } from '@/lib/server/indexnow';

describe('IndexNow Instant Indexing Protocol', () => {
  it('formats URLs properly with host and verification key', async () => {
    expect(INDEXNOW_KEY).toBeDefined();
    expect(INDEXNOW_KEY.length).toBe(32);
    expect(DEFAULT_HOST).toBe('da.mrdshyml.xyz');

    const result = await pingIndexNow([
      '/tools/signoz',
      'https://da.mrdshyml.xyz/alternatives/datadog',
    ]);

    expect(result.urlsSubmitted).toContain('https://da.mrdshyml.xyz/tools/signoz');
    expect(result.urlsSubmitted).toContain('https://da.mrdshyml.xyz/alternatives/datadog');
  });

  it('handles empty URL arrays gracefully without throwing', async () => {
    const result = await pingIndexNow([]);
    expect(result.success).toBe(false);
    expect(result.urlsSubmitted.length).toBe(0);
  });
});
