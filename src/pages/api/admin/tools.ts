import type { APIRoute } from 'astro';
import { desiTools, toolAlternatives } from '@/lib/server/db/schema';
import { createToolId, createAlternativeId } from '@/lib/server/id';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db || !user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    const { toolId, action } = body;

    if (action === 'create') {
      const {
        name,
        tagline,
        description,
        websiteUrl,
        logoUrl,
        categoryId,
        pricingModel,
        startingPriceInr,
        hasIndianDataResidency,
        hasGstInvoice,
        hasInrPricing,
        hasUpiSupport,
        isOpenSource,
        hasIstSupport,
        isSelfHostable,
        hasFreeTier,
        globalToolIds,
      } = body;

      if (!name || !tagline || !websiteUrl || !categoryId) {
        return new Response(
          JSON.stringify({ error: 'Name, tagline, website URL, and category are required.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newToolId = createToolId();

      await db.insert(desiTools).values({
        id: newToolId,
        slug,
        name,
        tagline,
        description: description || tagline,
        websiteUrl,
        logoUrl: logoUrl || `https://logo.clearbit.com/${new URL(websiteUrl).hostname}`,
        primaryColor: '#D97706',
        categoryId,
        pricingModel: pricingModel || 'Freemium',
        startingPriceInr: startingPriceInr !== undefined ? Number(startingPriceInr) : null,
        hasIndianDataResidency: Boolean(hasIndianDataResidency),
        hasGstInvoice: Boolean(hasGstInvoice),
        hasInrPricing: Boolean(hasInrPricing),
        hasUpiSupport: Boolean(hasUpiSupport),
        isOpenSource: Boolean(isOpenSource),
        hasIstSupport: Boolean(hasIstSupport),
        isSelfHostable: Boolean(isSelfHostable),
        hasFreeTier: Boolean(hasFreeTier),
        claimedById: user.id,
        status: 'published', // Direct admin publish
      });

      if (Array.isArray(globalToolIds)) {
        for (const gtId of globalToolIds) {
          if (gtId) {
            await db.insert(toolAlternatives).values({
              id: createAlternativeId(),
              globalToolId: gtId,
              desiToolId: newToolId,
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, toolId: newToolId, slug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!toolId || !action || !['publish', 'archive', 'delete'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'publish') {
      await db.update(desiTools).set({ status: 'published' }).where(eq(desiTools.id, toolId));
    } else if (action === 'archive') {
      await db.update(desiTools).set({ status: 'archived' }).where(eq(desiTools.id, toolId));
    } else if (action === 'delete') {
      await db.delete(desiTools).where(eq(desiTools.id, toolId));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
