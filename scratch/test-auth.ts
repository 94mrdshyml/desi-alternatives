import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['admin', 'editor', 'author', 'user'] }).default('user').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  issuer: text('issuer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

const sqlite = new Database(':memory:');
sqlite.exec(`
CREATE TABLE users (id text PRIMARY KEY NOT NULL, name text NOT NULL, email text NOT NULL UNIQUE, email_verified integer DEFAULT 0 NOT NULL, image text, role text DEFAULT 'user' NOT NULL, created_at integer NOT NULL, updated_at integer NOT NULL);
CREATE TABLE accounts (id text PRIMARY KEY NOT NULL, user_id text NOT NULL, account_id text NOT NULL, provider_id text NOT NULL, access_token text, refresh_token text, access_token_expires_at integer, refresh_token_expires_at integer, scope text, id_token text, password text, issuer text, created_at integer NOT NULL, updated_at integer NOT NULL);
CREATE TABLE sessions (id text PRIMARY KEY NOT NULL, user_id text NOT NULL, token text NOT NULL UNIQUE, expires_at integer NOT NULL, ip_address text, user_agent text, created_at integer NOT NULL, updated_at integer NOT NULL);
CREATE TABLE verifications (id text PRIMARY KEY NOT NULL, identifier text NOT NULL, value text NOT NULL, expires_at integer NOT NULL, created_at integer, updated_at integer);
`);

const db = drizzle(sqlite, { schema: { users, sessions, accounts, verifications } });
const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret: 'dev_secret_desi_alternatives_minimum_32_characters_long',
  emailAndPassword: { enabled: true },
});

async function run() {
  try {
    const signup = await auth.api.signUpEmail({
      body: {
        name: 'Mridu Sharma',
        email: 'test@gmail.com',
        password: 'Password123!',
      },
    });
    console.log('SIGNUP SUCCESS:', signup);

    const signin = await auth.api.signInEmail({
      body: {
        email: 'test@gmail.com',
        password: 'Password123!',
      },
    });
    console.log('SIGNIN SUCCESS:', signin);
  } catch (e: any) {
    console.error('FAILED:', e);
  }
}

run();
