import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import {
  createUserId,
  createSessionId,
  createAccountId,
  createVerificationId,
  createCategoryId,
  createGlobalToolId,
  createToolId,
  createAlternativeId,
  createClaimId,
  createEditId,
} from '../id';

// ==========================================
// 1. BETTER-AUTH INFRASTRUCTURE TABLES
// ==========================================

export const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(createUserId),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['admin', 'user'] }).default('user').notNull(),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(createSessionId),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  impersonatedBy: text('impersonated_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(createAccountId),
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
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey().$defaultFn(createVerificationId),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==========================================
// 2. CATEGORIES TAXONOMY
// ==========================================

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(createCategoryId),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(), // UTF-8 emoji
  description: text('description'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 3. GLOBAL SOFTWARE REFERENCE
// ==========================================

export const globalTools = sqliteTable('global_tools', {
  id: text('id').primaryKey().$defaultFn(createGlobalToolId),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  websiteUrl: text('website_url').notNull(),
  logoUrl: text('logo_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 4. DESI ALTERNATIVE TOOL REGISTRY
// ==========================================

export const desiTools = sqliteTable('desi_tools', {
  id: text('id').primaryKey().$defaultFn(createToolId),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  websiteUrl: text('website_url').notNull(),
  logoUrl: text('logo_url').notNull(),
  primaryColor: text('primary_color').default('#F59E0B').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),

  // Desi Checklist Binary Badges
  hasGstInvoice: integer('has_gst_invoice', { mode: 'boolean' }).default(false).notNull(),
  hasIndianDataResidency: integer('has_indian_data_residency', { mode: 'boolean' }).default(false).notNull(),
  hasInrPricing: integer('has_inr_pricing', { mode: 'boolean' }).default(false).notNull(),
  hasUpiSupport: integer('has_upi_support', { mode: 'boolean' }).default(false).notNull(),
  isOpenSource: integer('is_open_source', { mode: 'boolean' }).default(false).notNull(),
  hasIstSupport: integer('has_ist_support', { mode: 'boolean' }).default(false).notNull(),
  isSelfHostable: integer('is_self_hostable', { mode: 'boolean' }).default(false).notNull(),
  hasFreeTier: integer('has_free_tier', { mode: 'boolean' }).default(false).notNull(),

  pricingModel: text('pricing_model', { enum: ['Free', 'Freemium', 'Paid', 'Open-Source'] }).notNull(),
  startingPriceInr: integer('starting_price_inr'),
  claimedById: text('claimed_by_id').references(() => users.id),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('published').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 5. TOOL TO GLOBAL ALTERNATIVES (M:N)
// ==========================================

export const toolAlternatives = sqliteTable('tool_alternatives', {
  id: text('id').primaryKey().$defaultFn(createAlternativeId),
  globalToolId: text('global_tool_id').notNull().references(() => globalTools.id, { onDelete: 'cascade' }),
  desiToolId: text('desi_tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 6. CLAIMS & EDITS QUEUE
// ==========================================

export const claimsQueue = sqliteTable('claims_queue', {
  id: text('id').primaryKey().$defaultFn(createClaimId),
  toolId: text('tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workEmail: text('work_email').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  notes: text('notes'),
  submittedAt: text('submitted_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  reviewedAt: text('reviewed_at'),
});

export const editsQueue = sqliteTable('edits_queue', {
  id: text('id').primaryKey().$defaultFn(createEditId),
  toolId: text('tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  suggestedChanges: text('suggested_changes').notNull(), // JSON string payload
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  submittedAt: text('submitted_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  reviewedAt: text('reviewed_at'),
});
