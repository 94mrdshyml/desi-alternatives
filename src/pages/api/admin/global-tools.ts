import type { APIRoute } from 'astro';
import { globalTools, toolAlternatives } from '@/lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { createGlobalToolId, createAlternativeId } from '@/lib/server/id';

export const prerender = false;

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
    const action = String(body?.action || '').trim();

    // 1. CREATE GLOBAL GIANT
    if (action === 'create') {
      const name = String(body.name || '').trim();
      let slug = String(body.slug || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const websiteUrl = String(body.websiteUrl || '').trim();
      const logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null;
      const tagline = body.tagline ? String(body.tagline).trim() : null;
      const categoryId = body.categoryId ? String(body.categoryId).trim() : null;
      const startingPriceUsd = body.startingPriceUsd !== undefined && body.startingPriceUsd !== '' ? Number(body.startingPriceUsd) : null;
      
      let features: string | null = null;
      if (Array.isArray(body.features)) {
        features = JSON.stringify(body.features.map((f: any) => String(f).trim()).filter(Boolean));
      } else if (typeof body.features === 'string' && body.features.trim()) {
        features = JSON.stringify(body.features.split(',').map((f: string) => f.trim()).filter(Boolean));
      }

      let foreignPainPoints: string | null = null;
      if (Array.isArray(body.foreignPainPoints)) {
        foreignPainPoints = JSON.stringify(body.foreignPainPoints.map((p: any) => String(p).trim()).filter(Boolean));
      } else if (typeof body.foreignPainPoints === 'string' && body.foreignPainPoints.trim()) {
        foreignPainPoints = JSON.stringify(body.foreignPainPoints.split('\n').map((p: string) => p.trim()).filter(Boolean));
      }

      if (!name || !websiteUrl) {
        return new Response(JSON.stringify({ error: 'Name and Website URL are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!slug) {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      const existingSlug = await db.select().from(globalTools).where(eq(globalTools.slug, slug)).get();
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const newId = createGlobalToolId();
      await db.insert(globalTools).values({
        id: newId,
        slug,
        name,
        tagline,
        websiteUrl,
        logoUrl,
        features,
        startingPriceUsd,
        foreignPainPoints,
        categoryId,
      });

      // If mapped Indian tool IDs provided
      if (Array.isArray(body.mappedDesiToolIds) && body.mappedDesiToolIds.length > 0) {
        for (const desiToolId of body.mappedDesiToolIds) {
          await db.insert(toolAlternatives).values({
            id: createAlternativeId(),
            globalToolId: newId,
            desiToolId: String(desiToolId),
          });
        }
      }

      return new Response(JSON.stringify({ success: true, id: newId, slug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. UPDATE GLOBAL GIANT
    if (action === 'update') {
      const id = String(body.id || '').trim();
      if (!id) {
        return new Response(JSON.stringify({ error: 'Global Tool ID is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const name = String(body.name || '').trim();
      const slug = String(body.slug || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const websiteUrl = String(body.websiteUrl || '').trim();
      const logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null;
      const tagline = body.tagline ? String(body.tagline).trim() : null;
      const categoryId = body.categoryId ? String(body.categoryId).trim() : null;
      const startingPriceUsd = body.startingPriceUsd !== undefined && body.startingPriceUsd !== '' ? Number(body.startingPriceUsd) : null;

      let features: string | null = null;
      if (Array.isArray(body.features)) {
        features = JSON.stringify(body.features.map((f: any) => String(f).trim()).filter(Boolean));
      } else if (typeof body.features === 'string') {
        features = JSON.stringify(body.features.split(',').map((f: string) => f.trim()).filter(Boolean));
      }

      let foreignPainPoints: string | null = null;
      if (Array.isArray(body.foreignPainPoints)) {
        foreignPainPoints = JSON.stringify(body.foreignPainPoints.map((p: any) => String(p).trim()).filter(Boolean));
      } else if (typeof body.foreignPainPoints === 'string') {
        foreignPainPoints = JSON.stringify(body.foreignPainPoints.split('\n').map((p: string) => p.trim()).filter(Boolean));
      }

      await db
        .update(globalTools)
        .set({
          name,
          slug,
          websiteUrl,
          logoUrl,
          tagline,
          features,
          startingPriceUsd,
          foreignPainPoints,
          categoryId,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(globalTools.id, id));

      // Sync mapped competing Indian alternatives
      if (Array.isArray(body.mappedDesiToolIds)) {
        await db.delete(toolAlternatives).where(eq(toolAlternatives.globalToolId, id));
        for (const desiToolId of body.mappedDesiToolIds) {
          if (desiToolId) {
            await db.insert(toolAlternatives).values({
              id: createAlternativeId(),
              globalToolId: id,
              desiToolId: String(desiToolId),
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. DELETE GLOBAL GIANT
    if (action === 'delete') {
      const id = String(body.id || '').trim();
      if (!id) {
        return new Response(JSON.stringify({ error: 'Global Tool ID is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await db.delete(toolAlternatives).where(eq(toolAlternatives.globalToolId, id));
      await db.delete(globalTools).where(eq(globalTools.id, id));

      return new Response(JSON.stringify({ success: true, deletedId: id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. MAP / UNMAP ALTERNATIVE
    if (action === 'mapAlternative') {
      const globalToolId = String(body.globalToolId || '').trim();
      const desiToolId = String(body.desiToolId || '').trim();
      const isMapped = Boolean(body.isMapped);

      if (!globalToolId || !desiToolId) {
        return new Response(JSON.stringify({ error: 'Both globalToolId and desiToolId are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (isMapped) {
        const existing = await db
          .select()
          .from(toolAlternatives)
          .where(and(eq(toolAlternatives.globalToolId, globalToolId), eq(toolAlternatives.desiToolId, desiToolId)))
          .get();

        if (!existing) {
          await db.insert(toolAlternatives).values({
            id: createAlternativeId(),
            globalToolId,
            desiToolId,
          });
        }
      } else {
        await db
          .delete(toolAlternatives)
          .where(and(eq(toolAlternatives.globalToolId, globalToolId), eq(toolAlternatives.desiToolId, desiToolId)));
      }

      return new Response(JSON.stringify({ success: true, globalToolId, desiToolId, isMapped }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action requested.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
