import type { APIRoute } from 'astro';
import { recordAnalyticsEvent, type AnalyticsEventInput } from '@/lib/server/analytics';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload = (await request.json()) as AnalyticsEventInput;
    if (!payload || !payload.eventType) {
      return new Response(JSON.stringify({ error: 'Missing eventType' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const env = locals.runtime.env;
    const cf = locals.runtime.cf;
    const ctx = locals.runtime.ctx;

    // Use ctx.waitUntil to execute without delaying client response
    const promise = recordAnalyticsEvent(env, payload, request, cf);
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(promise);
    } else {
      await promise;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
