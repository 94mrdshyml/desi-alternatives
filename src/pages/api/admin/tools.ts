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

    // 0. Check Tool Slug Uniqueness Endpoint
    if (action === 'check-slug') {
      const checkSlug = (body.slug || '').trim().toLowerCase();
      if (!checkSlug) {
        return new Response(JSON.stringify({ available: false, error: 'Slug is empty' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const existing = await db
        .select()
        .from(desiTools)
        .where(eq(desiTools.slug, checkSlug))
        .get();

      const available = !existing || (toolId && existing.id === toolId);
      return new Response(JSON.stringify({ available, slug: checkSlug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Create Tool (Direct Publish)
    if (action === 'create') {
      const {
        name,
        slug: userProvidedSlug,
        tagline,
        description,
        websiteUrl,
        logoUrl,
        primaryColor,
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
        isFeatured,
        twitterHandle,
        instagramHandle,
        youtubeUrl,
        facebookUrl,
        linkedinUrl,
        globalToolIds,
      } = body;

      if (!name || !tagline || !websiteUrl || !categoryId) {
        return new Response(
          JSON.stringify({ error: 'Name, tagline, website URL, and category are required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const generatedSlug = (userProvidedSlug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!generatedSlug) {
        return new Response(
          JSON.stringify({ error: 'Valid tool slug could not be generated.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const existing = await db
        .select()
        .from(desiTools)
        .where(eq(desiTools.slug, generatedSlug))
        .get();

      if (existing) {
        return new Response(
          JSON.stringify({ error: `Slug "${generatedSlug}" is already in use by another tool.` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newToolId = createToolId();

      await db.insert(desiTools).values({
        id: newToolId,
        slug: generatedSlug,
        name: name.trim(),
        tagline: tagline.trim(),
        description: description ? description.trim() : tagline.trim(),
        websiteUrl,
        logoUrl: logoUrl || `https://logo.clearbit.com/${new URL(websiteUrl).hostname}`,
        primaryColor: primaryColor || '#D97706',
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
        isFeatured: Boolean(isFeatured),
        twitterHandle: twitterHandle ? String(twitterHandle).trim().replace(/^@/, '') : null,
        instagramHandle: instagramHandle ? String(instagramHandle).trim().replace(/^@/, '') : null,
        youtubeUrl: youtubeUrl ? String(youtubeUrl).trim() : null,
        facebookUrl: facebookUrl ? String(facebookUrl).trim() : null,
        linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null,
        claimedById: user.id,
        status: 'published',
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

      return new Response(JSON.stringify({ success: true, toolId: newToolId, slug: generatedSlug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Update Existing Tool
    if (action === 'update') {
      const {
        id,
        name,
        tagline,
        description,
        websiteUrl,
        logoUrl,
        primaryColor,
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
        isFeatured,
        twitterHandle,
        instagramHandle,
        youtubeUrl,
        facebookUrl,
        linkedinUrl,
      } = body;

      if (!id || !name || !tagline || !websiteUrl || !categoryId) {
        return new Response(
          JSON.stringify({ error: 'Tool ID, name, tagline, website URL, and category are required for update.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const slug = (body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await db
        .update(desiTools)
        .set({
          name,
          slug,
          tagline,
          description: description || tagline,
          websiteUrl,
          logoUrl,
          primaryColor: primaryColor || '#D97706',
          categoryId,
          pricingModel: pricingModel || 'Freemium',
          startingPriceInr: startingPriceInr !== undefined && startingPriceInr !== '' ? Number(startingPriceInr) : null,
          hasIndianDataResidency: Boolean(hasIndianDataResidency),
          hasGstInvoice: Boolean(hasGstInvoice),
          hasInrPricing: Boolean(hasInrPricing),
          hasUpiSupport: Boolean(hasUpiSupport),
          isOpenSource: Boolean(isOpenSource),
          hasIstSupport: Boolean(hasIstSupport),
          isSelfHostable: Boolean(isSelfHostable),
          hasFreeTier: Boolean(hasFreeTier),
          isFeatured: Boolean(isFeatured),
          twitterHandle: twitterHandle ? String(twitterHandle).trim().replace(/^@/, '') : null,
          instagramHandle: instagramHandle ? String(instagramHandle).trim().replace(/^@/, '') : null,
          youtubeUrl: youtubeUrl ? String(youtubeUrl).trim() : null,
          facebookUrl: facebookUrl ? String(facebookUrl).trim() : null,
          linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null,
        })
        .where(eq(desiTools.id, id));

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Toggle Featured
    if (action === 'toggleFeatured') {
      const tool = await db.select().from(desiTools).where(eq(desiTools.id, toolId)).get();
      if (!tool) {
        return new Response(JSON.stringify({ error: 'Tool not found' }), { status: 404 });
      }
      await db.update(desiTools).set({ isFeatured: !tool.isFeatured }).where(eq(desiTools.id, toolId));
      return new Response(JSON.stringify({ success: true, isFeatured: !tool.isFeatured }), { status: 200 });
    }

    // 4. Toggle Status (Publish / Unpublish)
    if (action === 'toggleStatus') {
      const tool = await db.select().from(desiTools).where(eq(desiTools.id, toolId)).get();
      if (!tool) {
        return new Response(JSON.stringify({ error: 'Tool not found' }), { status: 404 });
      }
      const nextStatus = tool.status === 'published' ? 'draft' : 'published';
      await db.update(desiTools).set({ status: nextStatus }).where(eq(desiTools.id, toolId));
      return new Response(JSON.stringify({ success: true, status: nextStatus }), { status: 200 });
    }

    // 5. Delete Tool
    if (action === 'delete') {
      await db.delete(desiTools).where(eq(desiTools.id, toolId));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid action parameter' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
