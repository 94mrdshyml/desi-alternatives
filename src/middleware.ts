import { defineMiddleware } from 'astro:middleware';
import { createDb } from './lib/server/db';
import { createAuth } from './lib/server/auth';
import { rateLimitRuleFor, tooManyRequestsResponse } from './lib/server/rate-limit';
import { applySecurityHeaders } from './lib/server/security-headers';

export const onRequest = defineMiddleware(async (context, next) => {
  const env = context.locals.runtime?.env;

  const rule = rateLimitRuleFor(context.request.method, context.url.pathname);
  const limiter = rule === 'otp' ? env?.RL_OTP : rule === 'write' ? env?.RL_WRITE : undefined;
  if (rule && limiter) {
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const { success } = await limiter.limit({ key: `${rule}:${ip}` });
    if (!success) return tooManyRequestsResponse();
  }

  if (env?.DB) {
    const origin = new URL(context.request.url).origin;
    const resendApiKey = env.RESEND_API_KEY || (import.meta as any).env?.RESEND_API_KEY || (globalThis as any).process?.env?.RESEND_API_KEY;
    context.locals.db = createDb(env.DB);

    try {
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

      const sessionData = await context.locals.auth.api.getSession({
        headers: context.request.headers,
      });

      context.locals.user = sessionData?.user ?? null;
      context.locals.session = sessionData?.session ?? null;
    } catch (err) {
      console.error('[middleware] auth unavailable:', (err as Error)?.message);
      context.locals.user = null;
      context.locals.session = null;
    }
  }

  return applySecurityHeaders(await next(), context.url.protocol === 'https:');
});
