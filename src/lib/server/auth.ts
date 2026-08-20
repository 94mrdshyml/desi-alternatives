import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { dash, sentinel } from '@better-auth/infra';
import { createDb } from './db';
import * as schema from './db/schema';
import { generateId } from './id';

export function createAuth(
  d1: D1Database,
  env: {
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    BETTER_AUTH_API_KEY?: string;
  },
  requestOrigin?: string
) {
  const db = createDb(d1);

  const plugins = [];
  if (env.BETTER_AUTH_API_KEY) {
    plugins.push(
      dash({
        apiKey: env.BETTER_AUTH_API_KEY,
      }),
      sentinel({
        apiKey: env.BETTER_AUTH_API_KEY,
        security: {
          credentialStuffing: { enabled: true },
        },
      })
    );
  }

  // Determine baseURL dynamically: requestOrigin > env.BETTER_AUTH_URL > fallback
  const baseURL = requestOrigin || env.BETTER_AUTH_URL || 'http://localhost:4321';

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: env.BETTER_AUTH_SECRET || 'dev_secret_desi_alternatives_minimum_32_characters_long',
    baseURL,
    trustedOrigins: [
      'http://localhost:4321',
      'http://localhost:3000',
      'https://da.mrdshyml.xyz',
      'https://desi-alternatives.mridu.workers.dev',
      'https://desialternatives.in',
      ...(requestOrigin ? [requestOrigin] : []),
    ],
    plugins,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    advanced: {
      database: {
        generateId: ({ model }) => {
          const prefixMap: Record<string, string> = {
            user: 'user_',
            session: 'sess_',
            account: 'acc_',
            verification: 'ver_',
          };
          const prefix = prefixMap[model] || `${model}_`;
          return generateId(prefix);
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
