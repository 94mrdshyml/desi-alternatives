import type { APIRoute } from 'astro';
import { globalTools, toolAlternatives } from '@/lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { createGlobalToolId, createAlternativeId } from '@/lib/server/id';
import { pingIndexNow } from '@/lib/server/indexnow';

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
      const description = body.description ? String(body.description).trim() : null;
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

      let pros: string | null = null;
      if (Array.isArray(body.pros)) {
        pros = JSON.stringify(body.pros.map((p: any) => String(p).trim()).filter(Boolean));
      }

      let cons: string | null = null;
      if (Array.isArray(body.cons)) {
        cons = JSON.stringify(body.cons.map((c: any) => String(c).trim()).filter(Boolean));
      }

      let pricingPlans: string | null = null;
      if (Array.isArray(body.pricingPlans)) {
        pricingPlans = JSON.stringify(body.pricingPlans);
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
        description,
        websiteUrl,
        logoUrl,
        features,
        startingPriceUsd,
        pricingPlans,
        foreignPainPoints,
        categoryId,
        country: body.country ? String(body.country).trim() : null,
        city: body.city ? String(body.city).trim() : null,
        foundedYear: body.foundedYear ? Number(body.foundedYear) : null,
        companyType: body.companyType ? String(body.companyType).trim() : null,
        isOpenSource: Boolean(body.isOpenSource),
        githubUrl: body.githubUrl ? String(body.githubUrl).trim() : null,
        discordUrl: body.discordUrl ? String(body.discordUrl).trim() : null,
        pros,
        cons,
        twitterHandle: body.twitterHandle ? String(body.twitterHandle).trim().replace(/^@/, '') : null,
        instagramHandle: body.instagramHandle ? String(body.instagramHandle).trim().replace(/^@/, '') : null,
        youtubeUrl: body.youtubeUrl ? String(body.youtubeUrl).trim() : null,
        facebookUrl: body.facebookUrl ? String(body.facebookUrl).trim() : null,
        linkedinUrl: body.linkedinUrl ? String(body.linkedinUrl).trim() : null,
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

      // Auto-ping IndexNow for instant search engine indexing
      pingIndexNow([`/alternatives/${slug}`, '/alternatives'], new URL(request.url).origin);

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
      const description = body.description ? String(body.description).trim() : null;
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

      let pros: string | null = null;
      if (Array.isArray(body.pros)) {
        pros = JSON.stringify(body.pros.map((p: any) => String(p).trim()).filter(Boolean));
      }

      let cons: string | null = null;
      if (Array.isArray(body.cons)) {
        cons = JSON.stringify(body.cons.map((c: any) => String(c).trim()).filter(Boolean));
      }

      let pricingPlans: string | null = null;
      if (Array.isArray(body.pricingPlans)) {
        pricingPlans = JSON.stringify(body.pricingPlans);
      }

      await db
        .update(globalTools)
        .set({
          name,
          slug,
          websiteUrl,
          logoUrl,
          tagline,
          description,
          features,
          startingPriceUsd,
          pricingPlans,
          foreignPainPoints,
          categoryId,
          country: body.country ? String(body.country).trim() : null,
          city: body.city ? String(body.city).trim() : null,
          foundedYear: body.foundedYear ? Number(body.foundedYear) : null,
          companyType: body.companyType ? String(body.companyType).trim() : null,
          isOpenSource: Boolean(body.isOpenSource),
          githubUrl: body.githubUrl ? String(body.githubUrl).trim() : null,
          discordUrl: body.discordUrl ? String(body.discordUrl).trim() : null,
          pros,
          cons,
          twitterHandle: body.twitterHandle ? String(body.twitterHandle).trim().replace(/^@/, '') : null,
          instagramHandle: body.instagramHandle ? String(body.instagramHandle).trim().replace(/^@/, '') : null,
          youtubeUrl: body.youtubeUrl ? String(body.youtubeUrl).trim() : null,
          facebookUrl: body.facebookUrl ? String(body.facebookUrl).trim() : null,
          linkedinUrl: body.linkedinUrl ? String(body.linkedinUrl).trim() : null,
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

      // Auto-ping IndexNow for instant search engine indexing
      pingIndexNow([`/alternatives/${slug}`, '/alternatives'], new URL(request.url).origin);

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

    // 5. AI JSON IMPORT FOR GLOBAL TOOLS (SINGLE OR BULK)
    if (action === 'import-json') {
      const rawPayload = body.tools || body.payload || body;
      const toolsToImport = Array.isArray(rawPayload) ? rawPayload : [rawPayload];

      if (!toolsToImport || toolsToImport.length === 0) {
        return new Response(JSON.stringify({ error: 'No tool data found in payload.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const importedTools: any[] = [];
      const updatedSlugs: string[] = [];

      for (const item of toolsToImport) {
        const name = String(item.name || '').trim();
        if (!name) continue;

        let slug = String(item.slug || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        if (!slug) {
          slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        const websiteUrl = String(item.websiteUrl || '').trim();
        const tagline = item.tagline ? String(item.tagline).trim() : null;
        const description = item.description ? String(item.description).trim() : null;

        // Auto logo fallback from domain if not provided
        let logoUrl = item.logoUrl ? String(item.logoUrl).trim() : null;
        if (!logoUrl && websiteUrl) {
          try {
            const domain = new URL(websiteUrl).hostname.replace(/^www\./, '');
            logoUrl = `https://img.logo.dev/${domain}?token=pk_anonymous`;
          } catch (e) {
            // Ignore URL parse error
          }
        }

        // Category mapping
        let categoryId: string | null = null;
        const catQuery = String(item.category || item.categoryId || '').toLowerCase().trim();
        if (catQuery) {
          const matchedCategory = await db.query?.categories?.findFirst({
            where: (cat: any, { or, eq, like }: any) =>
              or(eq(cat.id, catQuery), eq(cat.slug, catQuery), like(cat.name, `%${catQuery}%`)),
          });
          if (matchedCategory) {
            categoryId = matchedCategory.id;
          }
        }

        // Company Metadata
        const company = item.company || {};
        const country = String(company.country || item.country || '').trim() || null;
        const city = String(company.city || item.city || '').trim() || null;
        const foundedYear = company.foundedYear || item.foundedYear ? Number(company.foundedYear || item.foundedYear) : null;
        const companyType = String(company.companyType || item.companyType || '').trim() || null;
        const isOpenSource = Boolean(company.isOpenSource ?? item.isOpenSource ?? false);
        const githubUrl = String(company.githubUrl || item.githubUrl || '').trim() || null;
        const discordUrl = String(company.discordUrl || item.discordUrl || '').trim() || null;

        // Pros & Cons
        let pros: string | null = null;
        if (Array.isArray(item.pros)) {
          pros = JSON.stringify(item.pros.map((p: any) => String(p).trim()).filter(Boolean));
        }

        let cons: string | null = null;
        if (Array.isArray(item.cons)) {
          cons = JSON.stringify(item.cons.map((c: any) => String(c).trim()).filter(Boolean));
        }

        // Foreign Pain Points
        let foreignPainPoints: string | null = null;
        if (Array.isArray(item.foreignPainPoints)) {
          foreignPainPoints = JSON.stringify(item.foreignPainPoints.map((p: any) => String(p).trim()).filter(Boolean));
        }

        // Pricing & Plans
        const pricingObj = item.pricing || {};
        const startingPriceUsd =
          item.startingPriceUsd !== undefined
            ? Number(item.startingPriceUsd)
            : pricingObj.startingPriceUsd !== undefined
            ? Number(pricingObj.startingPriceUsd)
            : null;

        let pricingPlans: string | null = null;
        const plansArray = Array.isArray(pricingObj.plans) ? pricingObj.plans : Array.isArray(item.pricingPlans) ? item.pricingPlans : null;
        if (plansArray) {
          pricingPlans = JSON.stringify(plansArray);
        }

        // Social Profiles
        const socials = item.socialProfiles || {};
        const twitterHandle = String(socials.twitter || item.twitterHandle || '').trim().replace(/^@/, '') || null;
        const linkedinUrl = String(socials.linkedin || item.linkedinUrl || '').trim() || null;
        const youtubeUrl = String(socials.youtube || item.youtubeUrl || '').trim() || null;
        const facebookUrl = String(socials.facebook || item.facebookUrl || '').trim() || null;
        const instagramHandle = String(socials.instagram || item.instagramHandle || '').trim().replace(/^@/, '') || null;

        // Check if existing global tool with same slug
        const existingTool = await db.select().from(globalTools).where(eq(globalTools.slug, slug)).get();

        if (existingTool) {
          // Update existing
          await db
            .update(globalTools)
            .set({
              name,
              tagline: tagline || existingTool.tagline,
              description: description || existingTool.description,
              websiteUrl: websiteUrl || existingTool.websiteUrl,
              logoUrl: logoUrl || existingTool.logoUrl,
              categoryId: categoryId || existingTool.categoryId,
              country: country || existingTool.country,
              city: city || existingTool.city,
              foundedYear: foundedYear || existingTool.foundedYear,
              companyType: companyType || existingTool.companyType,
              isOpenSource,
              githubUrl: githubUrl || existingTool.githubUrl,
              discordUrl: discordUrl || existingTool.discordUrl,
              pros: pros || existingTool.pros,
              cons: cons || existingTool.cons,
              foreignPainPoints: foreignPainPoints || existingTool.foreignPainPoints,
              startingPriceUsd: startingPriceUsd !== null ? startingPriceUsd : existingTool.startingPriceUsd,
              pricingPlans: pricingPlans || existingTool.pricingPlans,
              twitterHandle: twitterHandle || existingTool.twitterHandle,
              linkedinUrl: linkedinUrl || existingTool.linkedinUrl,
              youtubeUrl: youtubeUrl || existingTool.youtubeUrl,
              facebookUrl: facebookUrl || existingTool.facebookUrl,
              instagramHandle: instagramHandle || existingTool.instagramHandle,
              isJsonImported: true,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(globalTools.id, existingTool.id));

          importedTools.push({ id: existingTool.id, name, slug, action: 'updated' });
        } else {
          // Insert new
          const newId = createGlobalToolId();
          await db.insert(globalTools).values({
            id: newId,
            slug,
            name,
            tagline,
            description,
            websiteUrl: websiteUrl || 'https://' + slug + '.com',
            logoUrl,
            categoryId,
            country,
            city,
            foundedYear,
            companyType,
            isOpenSource,
            githubUrl,
            discordUrl,
            pros,
            cons,
            foreignPainPoints,
            startingPriceUsd,
            pricingPlans,
            twitterHandle,
            linkedinUrl,
            youtubeUrl,
            facebookUrl,
            instagramHandle,
            isJsonImported: true,
          });

          importedTools.push({ id: newId, name, slug, action: 'created' });
        }

        updatedSlugs.push(`/alternatives/${slug}`);
      }

      if (updatedSlugs.length > 0) {
        pingIndexNow(updatedSlugs, new URL(request.url).origin);
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: importedTools.length,
          tools: importedTools,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
