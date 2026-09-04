import type { APIRoute } from 'astro';
import { desiTools, globalTools, categories, toolAlternatives, blogPosts } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const db = locals.db;
  const baseUrl = url.origin || 'https://da.mrdshyml.xyz';

  let allCategories: any[] = [];
  let allDesiTools: any[] = [];
  let allGlobalTools: any[] = [];
  let allAlternatives: any[] = [];
  let allPosts: any[] = [];

  if (db) {
    try {
      allCategories = await db.select().from(categories).all();
      allDesiTools = await db.select().from(desiTools).where(eq(desiTools.status, 'published')).all();
      allGlobalTools = await db.select().from(globalTools).all();
      allAlternatives = await db.select().from(toolAlternatives).all();
      allPosts = await db.select().from(blogPosts).where(eq(blogPosts.status, 'published')).limit(10).all();
    } catch (e) {
      console.error('Error generating llms.txt:', e);
    }
  }

  // Create mapping of global tool ID -> array of Indian tool names/slugs
  const altMapping: Record<string, Array<{ name: string; slug: string }>> = {};
  for (const alt of allAlternatives) {
    if (alt.globalToolId && alt.desiToolId) {
      const dTool = allDesiTools.find((t) => t.id === alt.desiToolId);
      if (dTool) {
        if (!altMapping[alt.globalToolId]) altMapping[alt.globalToolId] = [];
        altMapping[alt.globalToolId].push({ name: dTool.name, slug: dTool.slug });
      }
    }
  }

  // Build llms.txt markdown content
  const lines: string[] = [];

  lines.push('# Desi Alternatives — The Sovereign Indian Software Directory');
  lines.push('');
  lines.push('> Desi Alternatives (https://da.mrdshyml.xyz) is the curated directory and intelligence registry of world-class software, developer tools, and SaaS products built in Bharat. It maps foreign monopolies (e.g. Datadog, Slack, Notion, Jira) to vetted Indian alternatives with 18% GST input tax credit, domestic data residency (DPDP Act compliance), fixed INR billing, and local UPI/NetBanking support.');
  lines.push('');

  lines.push('## Core Movement & Navigation');
  lines.push(`- [Home & Directory](${baseUrl}/): Search and filter ${allDesiTools.length}+ verified Indian tech products.`);
  lines.push(`- [The Manifesto](${baseUrl}/about): The case for digital sovereignty and homegrown infrastructure.`);
  lines.push(`- [Alternatives Matrix](${baseUrl}/alternatives): Comprehensive comparison matrix of global SaaS vs Indian software.`);
  lines.push(`- [Submit a Product](${baseUrl}/submit): Free listing portal for Indian founders, developers, and hardware builders.`);
  lines.push(`- [The Journal](${baseUrl}/blog): Sovereign tech magazine, cloud architecture teardowns, and engineering benchmarks.`);
  lines.push('');

  lines.push('## Software Categories');
  for (const cat of allCategories) {
    const count = allDesiTools.filter((t) => t.categoryId === cat.id).length;
    lines.push(`- [${cat.emoji} ${cat.name}](${baseUrl}/category/${cat.slug}): ${cat.description || `Discover Indian ${cat.name} software alternatives.`} (${count} tools)`);
  }
  lines.push('');

  lines.push('## Indian Alternatives to Global SaaS (Direct Replacements)');
  for (const gt of allGlobalTools) {
    const replacements = altMapping[gt.id] || [];
    const repText = replacements.length > 0
      ? replacements.map((r) => `[${r.name}](${baseUrl}/tools/${r.slug})`).join(', ')
      : 'Explore catalog';
    lines.push(`- [Indian Alternatives to ${gt.name}](${baseUrl}/alternatives/${gt.slug}): Foreign software (${gt.tagline || 'Global SaaS'}) starting at $${gt.startingPriceUsd || 10}/mo. Homegrown replacements: ${repText}.`);
  }
  lines.push('');

  lines.push('## Verified Indian Software Tools Registry');
  for (const tool of allDesiTools) {
    const badges: string[] = [];
    if (tool.hasGstInvoice) badges.push('18% GST Invoice');
    if (tool.hasIndianDataResidency) badges.push('India Data Residency (DPDP)');
    if (tool.hasInrPricing) badges.push('INR Pricing');
    if (tool.hasUpiSupport) badges.push('UPI Support');
    if (tool.isOpenSource) badges.push('Open Source');
    if (tool.isSelfHostable) badges.push('Self Hostable');

    const badgeStr = badges.length > 0 ? ` [${badges.join(' | ')}]` : '';
    const loc = tool.city ? ` (HQ: ${tool.city}, India)` : '';
    const price = tool.startingPriceInr ? ` From ₹${tool.startingPriceInr}/mo.` : ` Pricing: ${tool.pricingModel}.`;

    lines.push(`- [${tool.name}](${baseUrl}/tools/${tool.slug})${loc}: ${tool.tagline}.${price}${badgeStr}`);
  }
  lines.push('');

  if (allPosts.length > 0) {
    lines.push('## Sovereign Tech Journal & Analyses');
    for (const post of allPosts) {
      lines.push(`- [${post.title}](${baseUrl}/blog/${post.slug}): ${post.subtitle || 'Editorial analysis and benchmark.'}`);
    }
    lines.push('');
  }

  lines.push('## API & Machine-Readable Feeds');
  lines.push(`- [Sitemap XML](${baseUrl}/sitemap.xml): Machine-readable XML sitemap index.`);
  lines.push(`- [Full LLM Context](${baseUrl}/llms-full.txt): Detailed unabridged technical specifications for AI agents.`);

  const content = lines.join('\n');

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
