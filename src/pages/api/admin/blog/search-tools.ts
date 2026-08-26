import type { APIRoute } from 'astro';
import { desiTools, categories } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  if (!db) {
    return new Response(JSON.stringify({ tools: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  try {
    let tools = await db
      .select({
        id: desiTools.id,
        name: desiTools.name,
        slug: desiTools.slug,
        tagline: desiTools.tagline,
        logoUrl: desiTools.logoUrl,
        categoryName: categories.name,
        categoryEmoji: categories.emoji,
        startingPriceInr: desiTools.startingPriceInr,
        hasIndianDataResidency: desiTools.hasIndianDataResidency,
        hasGstInvoice: desiTools.hasGstInvoice,
        hasInrPricing: desiTools.hasInrPricing,
        hasUpiSupport: desiTools.hasUpiSupport,
        isOpenSource: desiTools.isOpenSource,
        city: desiTools.city,
        state: desiTools.state,
      })
      .from(desiTools)
      .leftJoin(categories, eq(desiTools.categoryId, categories.id))
      .all();

    if (q) {
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.categoryName && t.categoryName.toLowerCase().includes(q))
      );
    }

    return new Response(JSON.stringify({ tools: tools.slice(0, 10) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ tools: [], error: err.message }), { status: 500 });
  }
};
