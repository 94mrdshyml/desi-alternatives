import { describe, it, expect } from 'vitest';
import { isSafeUrlValue, findUnsafeUrlField } from '@/lib/server/url';

describe('isSafeUrlValue', () => {
  it('accepts http(s), relative asset paths, bare handles and empty values', () => {
    expect(isSafeUrlValue('https://signoz.io')).toBe(true);
    expect(isSafeUrlValue('http://example.in/path?q=1')).toBe(true);
    expect(isSafeUrlValue('/api/assets/logos/123-abc.png')).toBe(true);
    expect(isSafeUrlValue('signoz')).toBe(true);
    expect(isSafeUrlValue('')).toBe(true);
    expect(isSafeUrlValue(null)).toBe(true);
    expect(isSafeUrlValue(undefined)).toBe(true);
  });

  it('rejects script-capable schemes, including obfuscated variants', () => {
    expect(isSafeUrlValue('javascript:alert(1)')).toBe(false);
    expect(isSafeUrlValue('JavaScript:alert(1)')).toBe(false);
    expect(isSafeUrlValue('  javascript:alert(1)')).toBe(false);
    expect(isSafeUrlValue('java\tscript:alert(1)')).toBe(false);
    expect(isSafeUrlValue('java\nscript:alert(1)')).toBe(false);
    expect(isSafeUrlValue('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrlValue('vbscript:msgbox(1)')).toBe(false);
  });
});

describe('findUnsafeUrlField', () => {
  it('returns null for a normal tool submission', () => {
    expect(
      findUnsafeUrlField({
        name: 'SigNoz',
        tagline: 'Pricing: ₹99/mo',
        description: 'Note: open source APM',
        websiteUrl: 'https://signoz.io',
        logoUrl: '/api/assets/logos/1.png',
        linkedinUrl: 'signoz',
      })
    ).toBeNull();
  });

  it('flags top-level and nested unsafe URL fields', () => {
    expect(findUnsafeUrlField({ websiteUrl: 'javascript:alert(1)' })).toBe('websiteUrl');
    expect(findUnsafeUrlField({ tools: [{ name: 'x', socialProfiles: { linkedin: 'javascript:alert(1)' } }] })).toBe(
      'tools[0].socialProfiles.linkedin'
    );
    expect(findUnsafeUrlField([{ company: { website: 'data:text/html,x' } }])).toBe('[0].company.website');
  });
});
