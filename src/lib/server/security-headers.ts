/**
 * Baseline security headers for every worker response.
 * CSP is limited to frame-ancestors (anti-clickjacking) so GTM/Umami inline
 * scripts keep working; a full script CSP is a separate, deliberate step.
 */
const BASELINE: Record<string, string> = {
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function setHeaders(res: Response, isHttps: boolean) {
  for (const [name, value] of Object.entries(BASELINE)) {
    // Routes that set their own policy (e.g. sandboxed /api/assets) keep it.
    if (!res.headers.has(name)) res.headers.set(name, value);
  }
  if (isHttps) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

export function applySecurityHeaders(response: Response, isHttps: boolean): Response {
  try {
    setHeaders(response, isHttps);
    return response;
  } catch {
    // Some responses (e.g. redirects) have immutable headers; copy and retry.
    const copy = new Response(response.body, response);
    setHeaders(copy, isHttps);
    return copy;
  }
}
