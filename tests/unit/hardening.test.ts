import { describe, it, expect } from 'vitest';
import { rateLimitRuleFor } from '@/lib/server/rate-limit';
import { applySecurityHeaders } from '@/lib/server/security-headers';
import { isAllowedScrapeTarget } from '@/lib/server/scraper';
import { jsonLd } from '@/lib/json-ld';

describe('rateLimitRuleFor', () => {
  it('puts OTP send/verify in the otp bucket', () => {
    expect(rateLimitRuleFor('POST', '/api/auth/email-otp/send-verification-otp')).toBe('otp');
    expect(rateLimitRuleFor('POST', '/api/auth/sign-in/email-otp')).toBe('otp');
  });

  it('puts public write endpoints in the write bucket (trailing slash tolerated)', () => {
    expect(rateLimitRuleFor('POST', '/api/reviews/submit')).toBe('write');
    expect(rateLimitRuleFor('POST', '/api/upload/')).toBe('write');
    expect(rateLimitRuleFor('POST', '/api/admin/scrape')).toBe('write');
  });

  it('ignores reads and unrelated routes', () => {
    expect(rateLimitRuleFor('GET', '/api/reviews/submit')).toBeNull();
    expect(rateLimitRuleFor('POST', '/api/analytics/collect')).toBeNull();
    expect(rateLimitRuleFor('GET', '/tools/signoz')).toBeNull();
  });
});

describe('applySecurityHeaders', () => {
  it('adds anti-clickjacking and baseline headers, HSTS only on https', () => {
    const https = applySecurityHeaders(new Response('ok'), true);
    expect(https.headers.get('Content-Security-Policy')).toBe("frame-ancestors 'none'");
    expect(https.headers.get('X-Frame-Options')).toBe('DENY');
    expect(https.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(https.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');

    const http = applySecurityHeaders(new Response('ok'), false);
    expect(http.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('keeps a route-specific CSP (e.g. sandboxed assets)', () => {
    const res = applySecurityHeaders(new Response('x', { headers: { 'Content-Security-Policy': "default-src 'none'; sandbox" } }), true);
    expect(res.headers.get('Content-Security-Policy')).toBe("default-src 'none'; sandbox");
  });

  it('works on responses with immutable headers (redirects)', () => {
    const res = applySecurityHeaders(Response.redirect('https://example.com/', 302), true);
    expect(res.status).toBe(302);
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });
});

describe('isAllowedScrapeTarget', () => {
  it('allows public http(s) sites', () => {
    expect(isAllowedScrapeTarget('https://signoz.io')).toBe(true);
    expect(isAllowedScrapeTarget('http://www.zoho.com/in/')).toBe(true);
    expect(isAllowedScrapeTarget('https://example.in:443/path')).toBe(true);
  });

  it('blocks internal, IP-literal, non-http and odd-port targets', () => {
    expect(isAllowedScrapeTarget('http://localhost:8787')).toBe(false);
    expect(isAllowedScrapeTarget('http://127.0.0.1')).toBe(false);
    expect(isAllowedScrapeTarget('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isAllowedScrapeTarget('http://[::1]/')).toBe(false);
    expect(isAllowedScrapeTarget('http://db.internal')).toBe(false);
    expect(isAllowedScrapeTarget('http://printer.local')).toBe(false);
    expect(isAllowedScrapeTarget('https://example.com:8080')).toBe(false);
    expect(isAllowedScrapeTarget('https://user:pass@example.com')).toBe(false);
    expect(isAllowedScrapeTarget('file:///etc/passwd')).toBe(false);
    expect(isAllowedScrapeTarget('not a url')).toBe(false);
  });
});

describe('jsonLd', () => {
  it('prevents </script> breakout while keeping valid JSON', () => {
    const out = jsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});
