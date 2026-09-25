/**
 * URL safety helpers.
 * Stored URLs end up in <a href> / <img src>. A `javascript:` (or `data:`, `vbscript:`)
 * value turns a link into stored XSS, so only http(s) schemes are accepted.
 * Scheme-less values are allowed because the app stores relative asset paths
 * (`/api/assets/...`) and bare social handles (`acme`) in these fields.
 */

export function isSafeUrlValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true;
  // Browsers ignore whitespace/control characters inside a scheme ("java\tscript:"), so strip them first.
  const s = String(value).replace(/[\u0000- \u007f-\u009f]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(s)?.[1]?.toLowerCase();
  return !scheme || scheme === 'http' || scheme === 'https';
}

const URL_KEY = /(url|website|logo|linkedin|youtube|facebook|github|discord)$/i;

/** Returns the path of the first URL-like field with an unsafe scheme, or null if all are safe. */
export function findUnsafeUrlField(value: unknown, path = ''): string | null {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = findUnsafeUrlField(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }

  if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      const keyPath = path ? `${path}.${key}` : key;
      if (typeof v === 'string' && URL_KEY.test(key) && !isSafeUrlValue(v)) return keyPath;
      if (v && typeof v === 'object') {
        const hit = findUnsafeUrlField(v, keyPath);
        if (hit) return hit;
      }
    }
  }

  return null;
}

export function unsafeUrlResponse(field: string): Response {
  return new Response(JSON.stringify({ error: `Invalid URL in "${field}". Only http:// or https:// links are allowed.` }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
