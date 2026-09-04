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
      allPosts = await db.select().from(blogPosts).where(eq(blogPosts.status, 'published')).all();
    } catch (e) {
      console.error('Error generating llms-full.txt:', e);
    }
  }

  const lines: string[] = [];

  lines.push('# Desi Alternatives — Full Technical Knowledge Base & Sovereign Software Index');
  lines.push('');
  lines.push('> Comprehensive structured knowledge base of Indian software alternatives to foreign SaaS monopolies. Optimized for retrieval augmented generation (RAG) and LLM search agents.');
  lines.push('');

  // 1. Philosophy & Value Proposition
  lines.push('## Sovereign Software Value Proposition for Indian Businesses');
  lines.push('Indian tech companies spend an estimated $10B+ annually on foreign SaaS. Replacing foreign tools with Indian alternatives unlocks:');
  lines.push('1. Zero Forex Conversion Fees: Avoid 3.5% to 5% markups on international credit card transactions.');
  lines.push('2. 18% GST Input Tax Credit: Foreign SaaS providers without Indian GST registration cannot provide GST invoices, causing companies to lose 18% in tax write-offs.');
  lines.push('3. DPDP Act & RBI Compliance: Data processed and stored locally in Indian cloud regions (AWS Mumbai/Hyderabad, Azure Pune, GCP Delhi).');
  lines.push('4. Seamless Local Payments: Recurring billing via UPI Autopay, NetBanking, and RuPay cards without foreign currency recurring authorization hurdles.');
  lines.push('5. Dedicated IST Support: Engineering teams operating in Indian Standard Time without 12-hour turnaround lags.');
  lines.push('');

  // 2. Global Tools & Detailed Mappings
  lines.push('## Global SaaS Giants vs Indian Alternatives Detailed Breakdown');
  for (const gt of allGlobalTools) {
    lines.push(`### Foreign Tool: ${gt.name}`);
    lines.push(`- Slug: ${gt.slug}`);
    lines.push(`- Comparison URL: ${baseUrl}/alternatives/${gt.slug}`);
    lines.push(`- Website: ${gt.websiteUrl}`);
    lines.push(`- Starting Price (USD): $${gt.startingPriceUsd || 10}/mo`);
    if (gt.tagline) lines.push(`- Overview: ${gt.tagline}`);

    // Parse features & painpoints
    try {
      if (gt.features) {
        const feats = JSON.parse(gt.features);
        if (Array.isArray(feats) && feats.length > 0) {
          lines.push(`- Key Capabilities: ${feats.join(', ')}`);
        }
      }
    } catch {}

    try {
      if (gt.foreignPainPoints) {
        const pps = JSON.parse(gt.foreignPainPoints);
        if (Array.isArray(pps) && pps.length > 0) {
          lines.push(`- Pain Points for Indian Teams: ${pps.join('; ')}`);
        }
      }
    } catch {}

    // Find mapped alternatives
    const mappedAlts = allAlternatives.filter((a) => a.globalToolId === gt.id);
    if (mappedAlts.length > 0) {
      lines.push('- Homegrown Indian Alternatives:');
      for (const m of mappedAlts) {
        const dt = allDesiTools.find((t) => t.id === m.desiToolId);
        if (dt) {
          lines.push(`  * ${dt.name} (${baseUrl}/tools/${dt.slug}): ${dt.tagline}. Starting price: ₹${dt.startingPriceInr || 0}/mo. Open Source: ${dt.isOpenSource ? 'Yes' : 'No'}. Data Residency: ${dt.hasIndianDataResidency ? 'India' : 'Global'}.`);
        }
      }
    }
    lines.push('');
  }

  // 3. Indian Tools Deep Profiles
  lines.push('## Complete Indian Tools Profiles');
  for (const tool of allDesiTools) {
    const cat = allCategories.find((c) => c.id === tool.categoryId);
    lines.push(`### ${tool.name}`);
    lines.push(`- Profile URL: ${baseUrl}/tools/${tool.slug}`);
    lines.push(`- Tagline: ${tool.tagline}`);
    lines.push(`- Category: ${cat ? `${cat.emoji} ${cat.name}` : 'Software'}`);
    lines.push(`- Official Website: ${tool.websiteUrl}`);
    lines.push(`- Headquarters: ${tool.city || 'India'}${tool.state ? `, ${tool.state}` : ''}`);
    lines.push(`- Founded Year: ${tool.foundedYear || 'N/A'}`);
    lines.push(`- Company Type: ${tool.companyType || 'Independent'}`);
    lines.push(`- Pricing Model: ${tool.pricingModel} (From ₹${tool.startingPriceInr || 0}/mo)`);
    lines.push(`- GST Tax Invoice Eligible: ${tool.hasGstInvoice ? 'Yes (18% input credit)' : 'No'}`);
    lines.push(`- Domestic Data Residency: ${tool.hasIndianDataResidency ? 'Yes (India regions)' : 'No'}`);
    lines.push(`- UPI Autopay Support: ${tool.hasUpiSupport ? 'Yes' : 'No'}`);
    lines.push(`- Open Source: ${tool.isOpenSource ? 'Yes' : 'No'}`);
    lines.push(`- Self Hostable: ${tool.isSelfHostable ? 'Yes' : 'No'}`);
    if (tool.description) lines.push(`- Detailed Description: ${tool.description}`);
    lines.push('');
  }

  if (allPosts.length > 0) {
    lines.push('## Editorial & Sovereign Movement Articles');
    for (const post of allPosts) {
      lines.push(`### ${post.title}`);
      lines.push(`- Article URL: ${baseUrl}/blog/${post.slug}`);
      if (post.excerpt) lines.push(`- Excerpt: ${post.excerpt}`);
      lines.push(`- Published: ${new Date(post.publishedAt || post.createdAt).toISOString().split('T')[0]}`);
      lines.push('');
    }
  }

  const content = lines.join('\n');

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
