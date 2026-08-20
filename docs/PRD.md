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
```
