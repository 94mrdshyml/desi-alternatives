import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/server/auth';

export const prerender = false;

export const ALL: APIRoute = async (context) => {
  const env = context.locals.runtime?.env;
  if (!env?.DB) {
    return new Response(JSON.stringify({ error: 'Database binding not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = createAuth(env.DB, {
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    BETTER_AUTH_API_KEY: env.BETTER_AUTH_API_KEY,
  });

  return auth.handler(context.request);
};
