import type { APIRoute } from 'astro';
import { scrapeUrl, isAllowedScrapeTarget } from '@/lib/server/scraper';

export const prerender = false;

const normalize = (raw: string) => {
  const url = raw.trim();
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
};

const blockedTargetResponse = () =>
  new Response(JSON.stringify({ error: 'Only public http(s) websites can be scraped.' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin privileges required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const reqUrl = new URL(request.url);
    const targetUrl = reqUrl.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Valid URL is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowedScrapeTarget(normalize(targetUrl))) return blockedTargetResponse();

    const metadata = await scrapeUrl(targetUrl);

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to scrape metadata from URL' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const targetUrl = body?.url;

    if (!targetUrl || typeof targetUrl !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid URL is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowedScrapeTarget(normalize(targetUrl))) return blockedTargetResponse();

    const metadata = await scrapeUrl(targetUrl);

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to scrape metadata from URL' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

