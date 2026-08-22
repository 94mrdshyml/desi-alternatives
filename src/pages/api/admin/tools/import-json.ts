import type { APIRoute } from 'astro';
import { categories, desiTools, globalTools, toolAlternatives, toolPricingPlans } from '@/lib/server/db/schema';
import { createToolId, createAlternativeId, createPricingPlanId } from '@/lib/server/id';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  const user = locals.user;

  if (!db || !user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as any;
    
    // Normalize input into an array of tool objects
    let toolsPayload: any[] = [];
    if (Array.isArray(body)) {
      toolsPayload = body;
    } else if (Array.isArray(body?.tools)) {
      toolsPayload = body.tools;
    } else if (body && typeof body === 'object' && body.name) {
      toolsPayload = [body];
    }

    if (!toolsPayload.length) {
      return new Response(JSON.stringify({ error: 'No valid tool objects found in JSON payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch existing categories & global tools for intelligent auto-matching
    const allCategories = await db.select().from(categories).all();
    const allGlobals = await db.select().from(globalTools).all();

    const importedTools: any[] = [];
    const errors: string[] = [];

    for (let index = 0; index < toolsPayload.length; index++) {
      const raw = toolsPayload[index];
      const toolName = String(raw.name || '').trim();

      if (!toolName) {
        errors.push(`Item #${index + 1}: Missing product name.`);
        continue;
      }

      // 1. Resolve Category
      const rawCat = String(raw.category || raw.categoryId || '').trim().toLowerCase();
      let matchedCategory = allCategories.find(
        (c) => c.id === rawCat || c.slug.toLowerCase() === rawCat || c.name.toLowerCase() === rawCat
      );
      if (!matchedCategory) {
        // Fallback match or default to first category
        matchedCategory = allCategories.find((c) => c.slug === 'developer-tools') || allCategories[0];
      }

      if (!matchedCategory) {
        errors.push(`Tool "${toolName}": No category available in database.`);
        continue;
      }

      // 2. Generate and Deduplicate Slug
      let baseSlug = (raw.slug || toolName)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!baseSlug) {
        baseSlug = `tool-${Date.now().toString(36)}`;
      }

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await db
          .select({ id: desiTools.id })
          .from(desiTools)
          .where(eq(desiTools.slug, uniqueSlug))
          .get();
        if (!existing) break;
        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
      }

      // 3. Website & Logo Fallbacks
      let websiteUrl = String(raw.websiteUrl || '').trim();
      if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = `https://${websiteUrl}`;
      }

      let hostname = '';
      try {
        if (websiteUrl) hostname = new URL(websiteUrl).hostname;
      } catch {}

      const logoUrl =
        raw.logoUrl ||
        (hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=128` : 'https://placehold.co/128x128.png');

      const tagline = String(raw.tagline || `${toolName} — Made in India`).trim();
      const description = String(raw.description || tagline).trim();

      // 4. Company & Origins Metadata
      const company = raw.company || {};
      const city = company.city || raw.city || null;
      const state = company.state || raw.state || null;
      const foundedYear = company.foundedYear || raw.foundedYear ? Number(company.foundedYear || raw.foundedYear) : null;
      const companyType = company.companyType || raw.companyType || 'Private Ltd';
      const githubUrl = company.githubUrl || raw.githubUrl || null;
      const discordUrl = company.discordUrl || raw.discordUrl || null;

      // 5. Social Profile Links
      const socials = raw.socials || {};
      const twitterHandle = socials.twitterHandle || raw.twitterHandle ? String(socials.twitterHandle || raw.twitterHandle).trim().replace(/^@/, '') : null;
      const linkedinUrl = socials.linkedinUrl || raw.linkedinUrl ? String(socials.linkedinUrl || raw.linkedinUrl).trim() : null;
      const youtubeUrl = socials.youtubeUrl || raw.youtubeUrl ? String(socials.youtubeUrl || raw.youtubeUrl).trim() : null;
      const instagramHandle = socials.instagramHandle || raw.instagramHandle ? String(socials.instagramHandle || raw.instagramHandle).trim().replace(/^@/, '') : null;
      const facebookUrl = socials.facebookUrl || raw.facebookUrl ? String(socials.facebookUrl || raw.facebookUrl).trim() : null;

      // 6. Pros & Cons (JSON serialized)
      let prosJson: string | null = null;
      if (Array.isArray(raw.pros)) {
        prosJson = JSON.stringify(raw.pros.map((p: any) => String(p).trim()).filter(Boolean));
      }

      let consJson: string | null = null;
      if (Array.isArray(raw.cons)) {
        consJson = JSON.stringify(raw.cons.map((c: any) => String(c).trim()).filter(Boolean));
      }

      // 7. Compliance & Sovereign Checklist
      const compliance = raw.compliance || {};
      const isOpenSource = Boolean(compliance.isOpenSource ?? company.isOpenSource ?? raw.isOpenSource);
      const hasIndianDataResidency = Boolean(compliance.hasIndianDataResidency ?? raw.hasIndianDataResidency);
      const hasGstInvoice = Boolean(compliance.hasGstInvoice ?? raw.hasGstInvoice);
      const hasInrPricing = Boolean(compliance.hasInrPricing ?? raw.hasInrPricing ?? true);
      const hasUpiSupport = Boolean(compliance.hasUpiSupport ?? raw.hasUpiSupport ?? true);
      const hasIstSupport = Boolean(compliance.hasIstSupport ?? raw.hasIstSupport ?? true);
      const isSelfHostable = Boolean(compliance.isSelfHostable ?? raw.isSelfHostable ?? isOpenSource);
      
      // 8. Pricing Plans Processing
      const rawPlans: any[] = Array.isArray(raw.pricingPlans) ? raw.pricingPlans : [];
      let hasFreeTier = Boolean(compliance.hasFreeTier ?? raw.hasFreeTier);
      let calculatedStartingPrice: number | null = raw.startingPriceInr !== undefined && raw.startingPriceInr !== null ? Number(raw.startingPriceInr) : null;

      if (rawPlans.length > 0) {
        for (const plan of rawPlans) {
          if (plan.isFree || plan.amount === 0) {
            hasFreeTier = true;
          }
          if (plan.amount && typeof plan.amount === 'number' && plan.amount > 0) {
            if (calculatedStartingPrice === null || plan.amount < calculatedStartingPrice) {
              calculatedStartingPrice = plan.amount;
            }
          }
        }
      }

      let pricingModel = raw.pricingModel || (hasFreeTier ? 'Freemium' : isOpenSource ? 'Open-Source' : 'Paid');
      if (!['Free', 'Freemium', 'Paid', 'Open-Source'].includes(pricingModel)) {
        pricingModel = hasFreeTier ? 'Freemium' : 'Paid';
      }

      // 9. Insert Tool Record
      const newToolId = createToolId();
      await db.insert(desiTools).values({
        id: newToolId,
        slug: uniqueSlug,
        name: toolName,
        tagline,
        description,
        websiteUrl: websiteUrl || 'https://desialternatives.in',
        logoUrl,
        primaryColor: raw.primaryColor || '#F59E0B',
        categoryId: matchedCategory.id,
        pricingModel: pricingModel as any,
        startingPriceInr: calculatedStartingPrice,
        hasIndianDataResidency,
        hasGstInvoice,
        hasInrPricing,
        hasUpiSupport,
        isOpenSource,
        hasIstSupport,
        isSelfHostable,
        hasFreeTier,
        isFeatured: Boolean(compliance.isFeatured ?? raw.isFeatured),
        city,
        state,
        foundedYear,
        companyType,
        githubUrl,
        discordUrl,
        pros: prosJson,
        cons: consJson,
        twitterHandle,
        instagramHandle,
        youtubeUrl,
        facebookUrl,
        linkedinUrl,
        claimedById: user.id,
        status: 'published',
      });

      // 10. Insert Pricing Plans
      if (rawPlans.length > 0) {
        for (let pIdx = 0; pIdx < rawPlans.length; pIdx++) {
          const plan = rawPlans[pIdx];
          const planName = String(plan.name || `Plan ${pIdx + 1}`).trim();
          const currency = String(plan.currency || 'INR').toUpperCase();
          const amount = plan.amount !== undefined && plan.amount !== null && plan.amount !== '' ? Number(plan.amount) : null;
          const billingPeriod = String(plan.billingPeriod || (amount === 0 ? 'lifetime' : 'monthly')).toLowerCase();
          const isFree = Boolean(plan.isFree || amount === 0);
          const isPopular = Boolean(plan.isPopular);
          const planDesc = plan.description ? String(plan.description).trim() : null;

          await db.insert(toolPricingPlans).values({
            id: createPricingPlanId(),
            toolId: newToolId,
            name: planName,
            currency,
            amount,
            billingPeriod,
            isFree,
            isPopular,
            description: planDesc,
            sortOrder: pIdx,
          });
        }
      }

      // 11. Map Global Alternative Replaced Tools
      const replacedTools: string[] = Array.isArray(raw.replacesGlobalTools)
        ? raw.replacesGlobalTools
        : Array.isArray(raw.globalAlternatives)
          ? raw.globalAlternatives
          : [];

      for (const globalRef of replacedTools) {
        const query = String(globalRef).trim().toLowerCase();
        if (!query) continue;

        const matchedGlobal = allGlobals.find(
          (g) => g.slug.toLowerCase() === query || g.name.toLowerCase() === query || g.id === query
        );

        if (matchedGlobal) {
          // Link in toolAlternatives table
          await db.insert(toolAlternatives).values({
            id: createAlternativeId(),
            globalToolId: matchedGlobal.id,
            desiToolId: newToolId,
          });
        }
      }

      importedTools.push({
        id: newToolId,
        name: toolName,
        slug: uniqueSlug,
        category: matchedCategory.name,
        plansCount: rawPlans.length,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: importedTools.length,
        imported: importedTools,
        errors: errors.length ? errors : undefined,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to import JSON tools.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
