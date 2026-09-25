/**
 * Per-IP rate limiting using Cloudflare Workers Rate Limiting bindings
 * (configured under `ratelimits` in wrangler.jsonc: RL_OTP and RL_WRITE).
 */

export type RateLimitRule = 'otp' | 'write';

// Sending and entering 6-digit codes: protects Resend quota and the OTP itself.
const OTP_PATHS = new Set(['/api/auth/email-otp/send-verification-otp', '/api/auth/sign-in/email-otp']);

// Public write endpoints that create content, send email, or trigger outbound fetches.
const WRITE_PATHS = new Set([
  '/api/auth/welcome',
  '/api/reviews/submit',
  '/api/reviews/vote',
  '/api/tools/submit',
  '/api/tools/claim',
  '/api/newsletter/subscribe',
  '/api/newsletter/unsubscribe',
  '/api/upload',
  '/api/admin/scrape',
]);

export function rateLimitRuleFor(method: string, pathname: string): RateLimitRule | null {
  if (method !== 'POST') return null;
  const path = pathname.replace(/\/+$/, '');
  if (OTP_PATHS.has(path)) return 'otp';
  if (WRITE_PATHS.has(path)) return 'write';
  return null;
}

export function tooManyRequestsResponse(): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Please wait a minute and try again.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
  });
}
