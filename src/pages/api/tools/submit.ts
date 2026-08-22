import type { APIRoute } from 'astro';
import { desiTools, toolAlternatives } from '@/lib/server/db/schema';
import { createToolId, createAlternativeId } from '@/lib/server/id';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = locals.user;
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Please sign in to submit your Indian SaaS tool.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = (await request.json()) as any;
    const {
      name,
      tagline,
      description,
      websiteUrl,
      logoUrl,
      categoryId,
      hasGstInvoice,
      hasIndianDataResidency,
      hasInrPricing,
      hasUpiSupport,
      isOpenSource,
      hasIstSupport,
      isSelfHostable,
      hasFreeTier,
      pricingModel,
      startingPriceInr,
      globalToolIds,
      twitterHandle,
      instagramHandle,
      youtubeUrl,
      facebookUrl,
      linkedinUrl,
    } = body;

    if (!name || !tagline || !websiteUrl || !categoryId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: Name, Tagline, Website URL, and Category are required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let baseSlug = (body.slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!baseSlug) {
      baseSlug = `tool-${Date.now().toString(36)}`;
    }

    let slug = baseSlug;
    const existing = await db.select().from(desiTools).where(eq(desiTools.slug, slug)).get();
    if (existing) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const toolId = createToolId();

    await db.insert(desiTools).values({
      id: toolId,
      slug,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description ? description.trim() : tagline.trim(),
      websiteUrl,
      logoUrl: logoUrl || `https://logo.clearbit.com/${new URL(websiteUrl).hostname}`,
      primaryColor: '#D97706',
      categoryId,
      hasGstInvoice: Boolean(hasGstInvoice),
      hasIndianDataResidency: Boolean(hasIndianDataResidency),
      hasInrPricing: Boolean(hasInrPricing),
      hasUpiSupport: Boolean(hasUpiSupport),
      isOpenSource: Boolean(isOpenSource),
      hasIstSupport: Boolean(hasIstSupport),
      isSelfHostable: Boolean(isSelfHostable),
      hasFreeTier: Boolean(hasFreeTier),
      pricingModel: pricingModel || 'Freemium',
      startingPriceInr: startingPriceInr !== undefined ? Number(startingPriceInr) : null,
      twitterHandle: twitterHandle ? String(twitterHandle).trim().replace(/^@/, '') : null,
      instagramHandle: instagramHandle ? String(instagramHandle).trim().replace(/^@/, '') : null,
      youtubeUrl: youtubeUrl ? String(youtubeUrl).trim() : null,
      facebookUrl: facebookUrl ? String(facebookUrl).trim() : null,
      linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null,
      claimedById: user.id,
      status: 'draft', // Requires admin review
    });

    if (Array.isArray(globalToolIds)) {
      for (const gtId of globalToolIds) {
        await db.insert(toolAlternatives).values({
          id: createAlternativeId(),
          globalToolId: gtId,
          desiToolId: toolId,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, toolId, slug }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to submit tool' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
