import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { dash, sentinel } from '@better-auth/infra';
import { admin, emailOTP } from 'better-auth/plugins';
import { createDb } from './db';
import * as schema from './db/schema';
import { generateId } from './id';
import { eq } from 'drizzle-orm';
import { sendOtpEmail } from './email';

export function createAuth(
  d1: D1Database,
  env: {
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    BETTER_AUTH_API_KEY?: string;
    RESEND_API_KEY?: string;
  },
  requestOrigin?: string
) {
  const db = createDb(d1);

  const plugins: any[] = [
    admin({
      defaultRole: 'user',
      adminRole: 'admin',
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes in seconds
      async sendVerificationOTP({ email, otp, type }) {
        let fromName = 'Desi Alternatives';
        let fromEmail = 'auth@desialternatives.in';
        try {
          const settings = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, 'general')).get();
          if (settings) {
            if (settings.fromName) fromName = settings.fromName;
            if (settings.fromEmail) fromEmail = settings.fromEmail;
          }
        } catch {
          // fallback to defaults
        }

        await sendOtpEmail({
          apiKey: env.RESEND_API_KEY,
          to: email,
          otp,
          type,
          fromName,
          fromEmail,
        });
      },
    }),
  ];

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
    user: {
      additionalFields: {
        firstName: { type: 'string', required: false },
        lastName: { type: 'string', required: false },
        username: { type: 'string', required: false },
      },
    },
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
