import type { APIRoute } from 'astro';
import { INDEXNOW_KEY } from '@/lib/server/indexnow';

export const prerender = true;

export const GET: APIRoute = async () => {
  return new Response(INDEXNOW_KEY, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
