import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
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
  createPricingPlanId,
  createBlogAuthorId,
  createBlogPostId,
  createBlogPostToolId,
  createSearchLogId,
  createReviewId,
  createReviewVoteId,
  createNewsletterSubscriberId,
} from '../id';

// ==========================================
// 1. BETTER-AUTH INFRASTRUCTURE TABLES
// ==========================================

export const userRoles = ['admin', 'author', 'user'] as const;
export type UserRole = (typeof userRoles)[number];

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(createUserId),
  name: text('name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  username: text('username').unique(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['admin', 'author', 'user'] }).default('user').notNull(),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp' }),
  consentStatus: text('consent_status', { enum: ['allowed', 'denied'] }),
  consentUpdatedAt: integer('consent_updated_at', { mode: 'timestamp' }),
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
  tagline: text('tagline'),
  description: text('description'), // Detailed about/summary
  websiteUrl: text('website_url').notNull(),
  logoUrl: text('logo_url'),
  features: text('features'), // JSON array of string features
  startingPriceUsd: integer('starting_price_usd'), // USD per month
  pricingPlans: text('pricing_plans'), // JSON array of tier pricing objects
  foreignPainPoints: text('foreign_pain_points'), // JSON array of strings
  categoryId: text('category_id').references(() => categories.id),

  // Company Origins & DNA Metadata
  country: text('country'), // e.g. "United States", "Germany"
  city: text('city'), // e.g. "San Francisco", "New York"
  foundedYear: integer('founded_year'), // e.g. 2010
  companyType: text('company_type'), // e.g. "Public Ltd", "VC-Funded", "Bootstrapped"
  isOpenSource: integer('is_open_source', { mode: 'boolean' }).default(false).notNull(),
  githubUrl: text('github_url'),
  discordUrl: text('discord_url'),

  // Editorial Pros & Cons
  pros: text('pros'), // JSON array of pros
  cons: text('cons'), // JSON array of cons

  // Social Profile Handles / Links
  twitterHandle: text('twitter_handle'),
  instagramHandle: text('instagram_handle'),
  youtubeUrl: text('youtube_url'),
  facebookUrl: text('facebook_url'),
  linkedinUrl: text('linkedin_url'),

  // Import / Provenance metadata
  isJsonImported: integer('is_json_imported', { mode: 'boolean' }).default(false).notNull(),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at'),
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
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),

  // Company Origins & DNA Metadata
  city: text('city'), // e.g. "Bengaluru", "Pune", "Chennai", "Jaipur"
  state: text('state'), // e.g. "Karnataka", "Maharashtra", "Tamil Nadu"
  foundedYear: integer('founded_year'), // e.g. 2021
  companyType: text('company_type'), // e.g. "Bootstrapped", "VC-Funded", "Public Ltd", "Independent"
  githubUrl: text('github_url'),
  discordUrl: text('discord_url'),

  // Editorial Pros & Superpowers / Limitations (JSON array of strings)
  pros: text('pros'), // JSON array of top 5 pros
  cons: text('cons'), // JSON array of top 5 cons

  // Social Profile Handles / Links
  twitterHandle: text('twitter_handle'),
  instagramHandle: text('instagram_handle'),
  youtubeUrl: text('youtube_url'),
  facebookUrl: text('facebook_url'),
  linkedinUrl: text('linkedin_url'),

  // Import / Provenance metadata
  isJsonImported: integer('is_json_imported', { mode: 'boolean' }).default(false).notNull(),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 5. MULTI-TIER TOOL PRICING PLANS
// ==========================================

export const toolPricingPlans = sqliteTable('tool_pricing_plans', {
  id: text('id').primaryKey().$defaultFn(createPricingPlanId),
  toolId: text('tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g. "Community Open Source", "Pro", "Enterprise"
  currency: text('currency').default('INR').notNull(),
  amount: real('amount'), // null for custom / contact for pricing
  billingPeriod: text('billing_period').default('monthly').notNull(), // 'monthly', 'yearly', 'lifetime', 'custom'
  isFree: integer('is_free', { mode: 'boolean' }).default(false).notNull(),
  isPopular: integer('is_popular', { mode: 'boolean' }).default(false).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 6. TOOL TO GLOBAL ALTERNATIVES (M:N)
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

// ==========================================
// 7. SITE & EMAIL SETTINGS
// ==========================================

export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(), // 'general'
  fromName: text('from_name').default('Desi Alternatives').notNull(),
  fromEmail: text('from_email').default('team@letter.mrdshyml.xyz').notNull(),
  
  // Registration Welcome Email
  welcomeEnabled: integer('welcome_enabled', { mode: 'boolean' }).default(true).notNull(),
  welcomeSubject: text('welcome_subject').default('Welcome to Desi Alternatives, {{first_name|builder}}! 🇮🇳').notNull(),
  welcomeBody: text('welcome_body').default(`Hi {{first_name|there}},

Welcome to Desi Alternatives! We're thrilled to have you join our sovereign community of founders, CTOs, and developers building the future of Indian tech.

Here is what you can do right now:
• Explore the Sovereign Directory across Developer Tools, Cloud, AI, and Productivity
• Compare Indian SaaS vs Global Giants in our Head-to-Head Comparison Engine
• Submit or Claim your Indian software listing to verify official ownership
• Read in-depth migration teardowns and architecture blueprints in the Tech Journal

Have questions or built a tool you'd like indexed? Simply reply to this email.

Best regards,
The Desi Alternatives Team
https://desialternatives.in`).notNull(),

  // Newsletter Subscription Welcome Email
  newsletterWelcomeEnabled: integer('newsletter_welcome_enabled', { mode: 'boolean' }).default(true).notNull(),
  newsletterWelcomeSubject: text('newsletter_welcome_subject').default('Welcome to Desi Alternatives Dispatch, {{first_name|there}}! 📬').notNull(),
  newsletterWelcomeBody: text('newsletter_welcome_body').default(`Hi {{first_name|there}},

Thanks for subscribing to the Desi Alternatives Dispatch!

Every Thursday morning, we deliver curated intelligence directly to your inbox:
• Sovereign SaaS Radar: Hidden gems and high-performing Indian software
• Cost Teardowns: Real case studies on cutting foreign cloud bills
• Migration Blueprints: Step-by-step guides for moving off global monopolies
• Compliance Guides: Navigating Indian data residency, 18% GST invoices, and DPDP rules

Look out for our next dispatch in your inbox this Thursday!

Warmly,
The Dispatch Editorial Team
https://desialternatives.in/newsletter`).notNull(),

  // Google Tag Manager & Umami Tracking
  gtmEnabled: integer('gtm_enabled', { mode: 'boolean' }).default(false).notNull(),
  gtmId: text('gtm_id'),
  umamiEnabled: integer('umami_enabled', { mode: 'boolean' }).default(false).notNull(),
  umamiWebsiteId: text('umami_website_id'),
  umamiScriptUrl: text('umami_script_url').default('https://cloud.umami.is/script.js').notNull(),
  umamiPixelEnabled: integer('umami_pixel_enabled', { mode: 'boolean' }).default(false).notNull(),
  umamiPixelUrl: text('umami_pixel_url'),
  emailPixelTrackingEnabled: integer('email_pixel_tracking_enabled', { mode: 'boolean' }).default(false).notNull(),
  consentBannerEnabled: integer('consent_banner_enabled', { mode: 'boolean' }).default(true).notNull(),

  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 8. BLOG & EDITORIAL ENGINE
// ==========================================

export const blogAuthors = sqliteTable('blog_authors', {
  id: text('id').primaryKey().$defaultFn(createBlogAuthorId),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // e.g. "Founder & Lead Architect", "Staff Writer"
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  twitterHandle: text('twitter_handle'),
  linkedinUrl: text('linkedin_url'),
  websiteUrl: text('website_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey().$defaultFn(createBlogPostId),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  content: text('content').notNull(), // Markdown / Block Structure
  coverImageUrl: text('cover_image_url'),
  authorId: text('author_id').references(() => blogAuthors.id),
  categoryId: text('category_id').references(() => categories.id),
  status: text('status', { enum: ['draft', 'published', 'scheduled', 'archived'] }).default('draft').notNull(),
  readingTimeMinutes: integer('reading_time_minutes').default(5).notNull(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const blogPostTools = sqliteTable('blog_post_tools', {
  id: text('id').primaryKey().$defaultFn(createBlogPostToolId),
  postId: text('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  desiToolId: text('desi_tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
});

// ==========================================
// 9. SEARCH INTELLIGENCE & TELEMETRY
// ==========================================

export const searchLogs = sqliteTable('search_logs', {
  id: text('id').primaryKey().$defaultFn(createSearchLogId),
  query: text('query').notNull(),
  normalizedQuery: text('normalized_query').notNull(),
  resultsCount: integer('results_count').default(0).notNull(),
  clickedType: text('clicked_type', { enum: ['tool', 'alternative', 'category', 'blog', 'none'] }).default('none'),
  clickedId: text('clicked_id'),
  clickedSlug: text('clicked_slug'),
  userSessionId: text('user_session_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 10. COMMUNITY REVIEWS & RATINGS ENGINE
// ==========================================

export const toolReviews = sqliteTable('tool_reviews', {
  id: text('id').primaryKey().$defaultFn(createReviewId),
  toolId: text('tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role'), // e.g. "Head of Engineering", "DevOps Architect"
  authorCompany: text('author_company'), // e.g. "Fintech Scaleup (Bengaluru)"
  authorAvatarUrl: text('author_avatar_url'),
  rating: integer('rating').notNull(), // 1 to 5 overall stars
  title: text('title').notNull(),
  content: text('content').notNull(),
  
  // Dimensional Sub-Scores (1 to 5)
  easeOfMigrationRating: integer('ease_of_migration_rating').default(5),
  valueForMoneyRating: integer('value_for_money_rating').default(5),
  supportRating: integer('support_rating').default(5),
  dataResidencyRating: integer('data_residency_rating').default(5),

  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  status: text('status', { enum: ['pending', 'published', 'rejected'] }).default('published').notNull(),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const reviewHelpfulVotes = sqliteTable('review_helpful_votes', {
  id: text('id').primaryKey().$defaultFn(createReviewVoteId),
  reviewId: text('review_id').notNull().references(() => toolReviews.id, { onDelete: 'cascade' }),
  voterIdentifier: text('voter_identifier').notNull(), // User ID or IP/client hash
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// 11. NEWSLETTER DISPATCH & SUBSCRIBERS
// ==========================================

export const newsletterSources = ['registration', 'profile', 'newsletter_page'] as const;
export type NewsletterSource = (typeof newsletterSources)[number];

export const newsletterStatuses = ['subscribed', 'unsubscribed'] as const;
export type NewsletterStatus = (typeof newsletterStatuses)[number];

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: text('id').primaryKey().$defaultFn(createNewsletterSubscriberId),
  email: text('email').notNull().unique(),
  name: text('name'),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  source: text('source', { enum: ['registration', 'profile', 'newsletter_page'] }).notNull().default('newsletter_page'),
  status: text('status', { enum: ['subscribed', 'unsubscribed'] }).notNull().default('subscribed'),
  token: text('token').notNull().unique(), // Secure nanoid token for 1-click unsubscribe links
  subscribedAt: text('subscribed_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  unsubscribedAt: text('unsubscribed_at'),
});


