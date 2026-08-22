import { defineMiddleware } from 'astro:middleware';
import { createDb } from './lib/server/db';
import { createAuth } from './lib/server/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const env = context.locals.runtime?.env;

  if (env?.DB) {
    const origin = new URL(context.request.url).origin;
    const resendApiKey = env.RESEND_API_KEY || (import.meta as any).env?.RESEND_API_KEY || (globalThis as any).process?.env?.RESEND_API_KEY;
    context.locals.db = createDb(env.DB);
    context.locals.auth = createAuth(
      env.DB,
      {
        BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: env.BETTER_AUTH_URL,
        BETTER_AUTH_API_KEY: env.BETTER_AUTH_API_KEY,
        RESEND_API_KEY: resendApiKey,
      },
      origin
    );

    try {
      const sessionData = await context.locals.auth.api.getSession({
        headers: context.request.headers,
      });

      context.locals.user = sessionData?.user ?? null;
      context.locals.session = sessionData?.session ?? null;
    } catch {
      context.locals.user = null;
      context.locals.session = null;
    }
  }

  return next();
});
