## Desi Alternatives (desialternatives.in)

Product Requirements Document (PRD) & Design System Specification for Sovereign Indian SaaS Directory

## PART I

## Product Requirements Document (PRD)

## 1. Vision & Problem Statement

Indian businesses, startups, and developers overspend on international SaaS subscriptions while dealing with 3.5% foreign transaction markups, recurring credit card mandate failures, lack of 18% GST input tax credit, and distant data residency. Desi Alternatives indexes high-quality, homegrown Indian software that offers sovereign data residency, UPI/ INR pricing, and localized enterprise compliance.

## 2. Target Personas & User Journeys

|   |   | User Persona Core Motivation |   | Primary MVP User Journey |   |   |
| --- | --- | --- | --- | --- | --- | --- |
|   |   | Indian SMB / Startup Founder CTO / Enterprise Lead |   | Cut software costs, enable UPI/INR auto-debit, collect GST invoices. Data sovereignty, RBI/CERT-In guidelines, air-gapped hosting. Acquire high-intent organic traffic and |   | Searches global tool (e.g. Airtable) → Compares ranked Desi alternatives → Filters by GST/UPI → Visits tool site. Filters by "India Hosted" & "Open Source" → Inspects data center residency and compliance badges. Clicks "Claim Listing" → Verifies company work email via |
|   |   | Desi SaaS Founder official brand presence. Internal Staff (Admin/Editor) |   | Curation, content quality assurance, |   | Better-Auth Sentinel → Edits listing specs. Pastes tool URL → System auto-fetches title/favicon/ |
|   |   | and listing moderation. |   |   |   | colors → Verifies checklist → Publishes to directory. |

## 3. URL Routing & Programmatic SEO Architecture

To capture both brand discovery and high-intent competitor comparison search traffic, two distinct route trees are deployed:


|   | Route Pattern Intent Target /alternatives/[global- High-Volume SEO slug] Comparisons |   | Content Structure Lists all Indian tools competing with a global product (e.g., / alternatives/notion ), comparative feature table, and pricing differential. |
| --- | --- | --- | --- |
|   | /tools/[tool-slug] Canonical Product Profile |   | Comprehensive profile (e.g., /tools/frappe-books ) with dynamic gradient header, checklist badges, one-liner, pricing tiers, and claim status. |
|   | /categories/[category- Category Taxonomy slug] |   | Curated view of tools grouped by vertical (e.g., /categories/accounting ) headed by category emoji |
|   |   |   | (e.g., ). |

## 4. Desi Software Checklist Specification

|   | Badge Attribute Display Badge |   |   | Verification Requirement & Value Proposition |
| --- | --- | --- | --- | --- |
|   |   |   |   | Issues compliant tax invoice with 18% input tax credit (ITC) for |
|   | GST Invoicing GST Invoice |   |   | registered Indian entities. |
|   | Indian Data Residency India Hosted |   |   | Customer data and databases reside physically in AWS/GCP/Azure |
|   |   |   |   | India regions or domestic DCs. |
|   | UPI & INR Pricing UPI / INR |   |   | Direct Indian Rupee pricing via UPI / NetBanking / Razorpay, eliminating 3.5% forex fees. |
|   | Open Source Open Source |   |   | Public repository under OSI-compliant license (AGPL, MIT, Apache 2.0). |
|   |   |   |   | Support team available during standard Indian business hours via |
|   | IST Customer Support IST Support |   |   | WhatsApp, phone, or ticket. |
|   | Self-Hostable Self-Hostable Free Tier / Community Free Tier | and students. | infrastructure. | Can be deployed on private VPC or air-gapped on-premise Generous free-forever tier available for early startups, indie hackers, |

## 5. Search & Ingestion Architecture

## 5.1 Metadata Scraper & Dynamic Gradient Ingestion

When staff inserts a tool URL, the ingestion worker parses HTML <meta> tags (title, og:description, apple-touch- icon). It downloads the high-res favicon/logo directly to Cloudflare R2 and computes the dominant HEX color using

fast-average-color , storing primary_color in D1.

## 5.2 Universal CMDK Search Dialog (Command Palette)

A fast client-side modal triggered by Cmd + K or search input, divided into 3 facets:

- Global Platforms: Direct query mapping to /alternatives/[slug] .

- Desi Tools: Direct navigation to /tools/[slug] with checklist tags.

- Browse Categories: Instant filtering into /categories/[slug] with category emojis.


## 6. Drizzle ORM Schema (Cloudflare D1 SQLite)

```
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
// --- AUTH & ROLES (BETTER-AUTH INFRASTRUCTURE) ---
export const users = sqliteTable('users', {
id: text('id').primaryKey(),
name: text('name').notNull(),
email: text('email').notNull().unique(),
emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
image: text('image'),
role: text('role', { enum: ['admin', 'editor', 'author', 'user'] }).default('user').notNull(),
createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
// --- CATEGORIES TAXONOMY ---
export const categories = sqliteTable('categories', {
id: text('id').primaryKey(),
slug: text('slug').notNull().unique(),
name: text('name').notNull(),
emoji: text('emoji').notNull(), // Native UTF-8 Emoji e.g.
description: text('description'),
isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
});
// --- GLOBAL SOFTWARE REFERENCE ---
export const globalTools = sqliteTable('global_tools', {
id: text('id').primaryKey(),
slug: text('slug').notNull().unique(),
name: text('name').notNull(),
websiteUrl: text('website_url').notNull(),
logoUrl: text('logo_url'),
});
// --- DESI ALTERNATIVE TOOL REGISTRY ---
export const desiTools = sqliteTable('desi_tools', {
id: text('id').primaryKey(),
slug: text('slug').notNull().unique(),
name: text('name').notNull(),
tagline: text('tagline').notNull(), // Punchy one-liner
description: text('description').notNull(), // Detailed markdown
websiteUrl: text('website_url').notNull(),
logoUrl: text('logo_url').notNull(), // Stored on Cloudflare R2
primaryColor: text('primary_color').default('#F59E0B').notNull(), // Brand HEX for dynamic gradient
categoryId: text('category_id').notNull().references(() => categories.id),
// Checklist Binary Badges
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
});

// --- TOOL TO GLOBAL MAPPING (M:N) ---
export const toolAlternatives = sqliteTable('tool_alternatives', {
id: text('id').primaryKey(),
globalToolId: text('global_tool_id').notNull().references(() => globalTools.id, { onDelete: 'cascade' }),
desiToolId: text('desi_tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
});

// --- BLOG & EDITORIAL ENGINE ---
export const blogAuthors = sqliteTable('blog_authors', {
id: text('id').primaryKey(),
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
id: text('id').primaryKey(),
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
id: text('id').primaryKey(),
postId: text('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
desiToolId: text('desi_tool_id').notNull().references(() => desiTools.id, { onDelete: 'cascade' }),
});
```

---

## 7. Blog & Editorial CMS Specification (Notion-Style Engine)

### 7.1 Objective & Strategy
To establish sovereign authority in Indian tech search rankings beyond directory indexing, Desi Alternatives operates a custom editorial engine capturing top-of-funnel and high-intent research queries (e.g. *"Best developer tools built in India"*, *"Migrating from Datadog to OpenTelemetry-native APM"*, *"India Data Protection DPDP Act 2023 SaaS readiness"*).

### 7.2 Core Editorial Archetypes
1. **Best-in-Class Curations**: High-intent, category-specific roundups highlighting engineering craftsmanship, feature sets, hosting compliance, and workflow fit.
2. **Technical Architecture Showdowns**: In-depth feature matrices comparing global monoliths against indigenous alternatives (e.g., *SigNoz vs Datadog*, *Postman vs Hoppscotch*).
3. **Founder Stories & Sovereign Essays**: Technical deep dives authored by Indian software architects and founders explaining how they built scalable, sovereign infrastructure.

### 7.3 Notion-Style Admin CMS (`/admin/blog`)
- **Clean Writing Canvas**: Distraction-free interface supporting Title, Subtitle, Cover Image upload to Cloudflare R2, and markdown/block typography.
- **Slash Commands (`/`)**: Quick-insert blocks for H2/H3 headings, Callout boxes, Bullet/Numbered lists, Blockquotes, Syntax-highlighted Code blocks, and Images with captions.
- **Interactive `/tool` Embed Block**: Live search and embed of any Indian tool directly from `desi_tools` in D1. The embedded card dynamically renders live logos, tags, and compliance pills from the database.
- **Continuous Auto-Save**: Real-time draft persistence to LocalStorage and D1 to prevent loss of long-form writing.
- **Real-Time Word & Read Time Engine**: Automatic computation of word counts and estimated reading durations.

### 7.4 SEO & Social Distribution Drawer
- **Slug Management**: Custom slugification with live uniqueness verification against D1.
- **Search Metadata**: Custom Meta Title and Meta Description with character length visual indicators.
- **Social & Edge OG Integration**: Instant preview of Google SERP, Twitter/X summary large card, and auto-generated WASM PNG social card via `/api/og/blog/[slug].png`.
- **Author & Taxonomy Assignment**: Link posts to verified author profiles and categories.
- **Publishing Lifecycle**: Manage `draft`, `scheduled`, `published`, and `archived` states.

### 7.5 Public Reading Experience (`/blog` & `/blog/[slug]`)
- **Scroll-Spy Table of Contents**: Floating sticky sidebar highlighting active sections during scroll.
- **Reading Progress Indicator**: Top accent progress bar reflecting scroll depth.
- **"Tools Mentioned" Shelf**: Dedicated footer matrix summarizing all tools featured in the guide with 1-click links to their canonical directory profiles.
- **Structured Schema Markup**: Automatic injection of `Article`, `ItemList`, `BreadcrumbList`, and `FAQPage` JSON-LD schemas for rich SERP snippets.

