import { test, expect } from '@playwright/test';

const ORIGIN = { Origin: 'http://localhost:4321' };

test.describe('Security hardening (Session 46)', () => {
  test('password sign-up is disabled (OTP-only accounts)', async ({ request }) => {
    const res = await request.post('/api/auth/sign-up/email', {
      headers: ORIGIN,
      data: { email: 'ceo@example-victim.com', password: 'Password123!', name: 'Fake CEO' },
    });
    expect(res.ok()).toBe(false);
    expect(res.headers()['set-cookie'] ?? '').not.toContain('session_token');
  });

  test('password sign-in is disabled', async ({ request }) => {
    const res = await request.post('/api/auth/sign-in/email', {
      headers: ORIGIN,
      data: { email: 'someone@example.com', password: 'Password123!' },
    });
    expect(res.ok()).toBe(false);
  });

  test('welcome email endpoint refuses anonymous callers (no open mail relay)', async ({ request }) => {
    const res = await request.post('/api/auth/welcome', {
      data: { email: 'victim@example.com', name: '<a href="https://evil.example">Verify</a>' },
    });
    expect(res.status()).toBe(401);
  });

  test('uploads require sign-in', async ({ request }) => {
    const res = await request.post('/api/upload', {
      multipart: { file: { name: 'evil.html', mimeType: 'text/html', buffer: Buffer.from('<script>alert(1)</script>') } },
    });
    expect(res.status()).toBe(401);
  });

  test('blog tool search is staff-only', async ({ request }) => {
    const res = await request.get('/api/admin/blog/search-tools?q=a');
    expect(res.status()).toBe(401);
  });

  test('pages send anti-clickjacking and baseline security headers', async ({ request }) => {
    const res = await request.get('/');
    const h = res.headers();
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('anonymous users cannot post reviews', async ({ request }) => {
    const res = await request.post('/api/reviews/submit', {
      data: { toolId: 'tool_x', rating: 5, title: 'Great', content: 'Fake review' },
    });
    expect(res.status()).toBe(401);
  });

  test('strangers cannot unsubscribe someone by email alone', async ({ request }) => {
    const res = await request.post('/api/newsletter/unsubscribe', { data: { email: 'victim@example.com' } });
    expect(res.status()).toBe(400);
  });

  test('GET scraper is admin-only', async ({ request }) => {
    const res = await request.get('/api/admin/scrape?url=https://example.com');
    expect(res.status()).toBe(403);
  });

  test('OTP sending is rate limited per IP', async ({ request }) => {
    const headers = { ...ORIGIN, 'cf-connecting-ip': '203.0.113.77' };
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await request.post('/api/auth/email-otp/send-verification-otp', {
        headers,
        data: { email: `ratelimit-${i}@example.com`, type: 'sign-in' },
      });
      statuses.push(res.status());
    }
    expect(statuses).toContain(429);
    expect(statuses.slice(0, 5)).not.toContain(429);
  });
});
