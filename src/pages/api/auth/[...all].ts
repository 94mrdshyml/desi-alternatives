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

  const origin = new URL(context.request.url).origin;
  const resendApiKey = env.RESEND_API_KEY || (import.meta as any).env?.RESEND_API_KEY || (globalThis as any).process?.env?.RESEND_API_KEY;
  const auth = createAuth(
    env.DB,
    {
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: env.BETTER_AUTH_URL,
      BETTER_AUTH_API_KEY: env.BETTER_AUTH_API_KEY,
      RESEND_API_KEY: resendApiKey,
    },
    origin
  );

  return auth.handler(context.request);
};
