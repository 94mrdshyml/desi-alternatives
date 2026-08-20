/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/cloudflare" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

interface CloudflareEnv {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_API_KEY?: string;
  RESEND_API_KEY?: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: CloudflareEnv;
      cf: import('@cloudflare/workers-types').IncomingRequestCfProperties;
      ctx: import('@cloudflare/workers-types').ExecutionContext;
      caches: import('@cloudflare/workers-types').CacheStorage;
    };
    db: import('./lib/server/db').Database;
    auth: import('./lib/server/auth').Auth;
    user: import('better-auth').User | null;
    session: import('better-auth').Session | null;
  }
}
