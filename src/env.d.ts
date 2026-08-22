/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/cloudflare" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

interface CloudflareEnv {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ANALYTICS?: import('@cloudflare/workers-types').AnalyticsEngineDataset;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_API_KEY?: string;
  RESEND_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
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
    user: (import('better-auth').User & {
      role?: string | null;
      banned?: boolean | null;
      banReason?: string | null;
      banExpires?: Date | null;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
    }) | null;
    session: import('better-auth').Session | null;
  }
}

declare module '*.wasm' {
  const content: any;
  export default content;
}
