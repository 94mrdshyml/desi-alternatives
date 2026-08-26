import type { APIRoute } from 'astro';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { desiTools, globalTools, categories, blogPosts, blogAuthors, toolAlternatives, searchLogs } from '@/lib/server/db/schema';
import { createSearchLogId } from '@/lib/server/id';

export interface SearchResultItem {
  id: string;
  type: 'tool' | 'alternative' | 'category' | 'blog';
  title: string;
  subtitle: string;
  slug: string;
  url: string;
  logoUrl?: string | null;
  emoji?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  categoryEmoji?: string | null;
  badgeLabel: string;
  badgeType: 'tool' | 'alternative' | 'category' | 'blog';
  metaBadge?: string | null;
  score: number;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const db = locals.db;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const rawQuery = url.searchParams.get('q') || '';
  const query = rawQuery.trim();
  const filterType = (url.searchParams.get('type') || 'all').toLowerCase();
  const sessionId = url.searchParams.get('sid') || null;

  try {
    const results: SearchResultItem[] = [];

    if (!query) {
      // 1. Initial State / Popular suggestions
      const [topTools, topGlobals, topCats, recentPosts] = await Promise.all([
        db
          .select({
            id: desiTools.id,
            slug: desiTools.slug,
            name: desiTools.name,
            tagline: desiTools.tagline,
            logoUrl: desiTools.logoUrl,
            categoryName: categories.name,
            categorySlug: categories.slug,
            categoryEmoji: categories.emoji,
            hasGstInvoice: desiTools.hasGstInvoice,
            hasInrPricing: desiTools.hasInrPricing,
            isOpenSource: desiTools.isOpenSource,
          })
          .from(desiTools)
          .leftJoin(categories, eq(desiTools.categoryId, categories.id))
          .where(eq(desiTools.status, 'published'))
          .orderBy(desc(desiTools.isFeatured), desc(desiTools.createdAt))
          .limit(4)
          .all(),

        db
          .select({
            id: globalTools.id,
            slug: globalTools.slug,
            name: globalTools.name,
            tagline: globalTools.tagline,
            logoUrl: globalTools.logoUrl,
            categoryName: categories.name,
            categorySlug: categories.slug,
            categoryEmoji: categories.emoji,
            startingPriceUsd: globalTools.startingPriceUsd,
          })
          .from(globalTools)
          .leftJoin(categories, eq(globalTools.categoryId, categories.id))
          .limit(3)
          .all(),

        db.select().from(categories).limit(4).all(),

        db
          .select({
            id: blogPosts.id,
            slug: blogPosts.slug,
            title: blogPosts.title,
            subtitle: blogPosts.subtitle,
            coverImageUrl: blogPosts.coverImageUrl,
            readingTimeMinutes: blogPosts.readingTimeMinutes,
            categoryName: categories.name,
            categorySlug: categories.slug,
            categoryEmoji: categories.emoji,
          })
          .from(blogPosts)
          .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
          .where(eq(blogPosts.status, 'published'))
          .orderBy(desc(blogPosts.publishedAt))
          .limit(2)
          .all(),
      ]);

      topTools.forEach((t) => {
        let meta = '🇮🇳 Homegrown';
        if (t.isOpenSource) meta = '⚡ Open Source';
        else if (t.hasGstInvoice) meta = '🧾 GST Invoicing';
        else if (t.hasInrPricing) meta = '💳 INR / UPI';

        results.push({
          id: t.id,
          type: 'tool',
          title: t.name,
          subtitle: t.tagline,
          slug: t.slug,
          url: `/tools/${t.slug}`,
          logoUrl: t.logoUrl,
          categoryName: t.categoryName,
          categorySlug: t.categorySlug,
          categoryEmoji: t.categoryEmoji,
          badgeLabel: 'Indian Tool',
          badgeType: 'tool',
          metaBadge: meta,
          score: 100,
        });
      });

      topGlobals.forEach((g) => {
        results.push({
          id: g.id,
          type: 'alternative',
          title: g.name,
          subtitle: g.tagline || `Compare Indian alternatives to ${g.name}`,
          slug: g.slug,
          url: `/alternatives/${g.slug}`,
          logoUrl: g.logoUrl || `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${g.slug}.com&size=128`,
          categoryName: g.categoryName || 'Global Software',
          categorySlug: g.categorySlug,
          categoryEmoji: g.categoryEmoji || '🌐',
          badgeLabel: 'Global Giant',
          badgeType: 'alternative',
          metaBadge: g.startingPriceUsd ? `From $${g.startingPriceUsd}/mo` : 'Global Ref',
          score: 90,
        });
      });

      topCats.forEach((c) => {
        results.push({
          id: c.id,
          type: 'category',
          title: c.name,
          subtitle: c.description || `Explore top Indian software in ${c.name}`,
          slug: c.slug,
          url: `/category/${c.slug}`,
          emoji: c.emoji,
          badgeLabel: 'Category',
          badgeType: 'category',
          metaBadge: 'Taxonomy',
          score: 80,
        });
      });

      recentPosts.forEach((p) => {
        results.push({
          id: p.id,
          type: 'blog',
          title: p.title,
          subtitle: p.subtitle || 'Editorial teardown & software analysis',
          slug: p.slug,
          url: `/blog/${p.slug}`,
          logoUrl: p.coverImageUrl,
          categoryName: p.categoryName,
          categorySlug: p.categorySlug,
          categoryEmoji: p.categoryEmoji,
          badgeLabel: 'Article',
          badgeType: 'blog',
          metaBadge: `${p.readingTimeMinutes || 5} min read`,
          score: 70,
        });
      });

      return new Response(
        JSON.stringify({
          query: '',
          counts: {
            all: results.length,
            tools: topTools.length,
            alternatives: topGlobals.length,
            categories: topCats.length,
            blog: recentPosts.length,
          },
          results,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
        }
      );
    }

    // 2. Active Search Across All 4 Entities
    const qLower = query.toLowerCase();
    const searchPattern = `%${query}%`;

    const [toolsMatches, globalsMatches, catsMatches, blogMatches, toolAlts] = await Promise.all([
      // A. Indian Tools
      db
        .select({
          id: desiTools.id,
          slug: desiTools.slug,
          name: desiTools.name,
          tagline: desiTools.tagline,
          description: desiTools.description,
          logoUrl: desiTools.logoUrl,
          city: desiTools.city,
          state: desiTools.state,
          hasGstInvoice: desiTools.hasGstInvoice,
          hasInrPricing: desiTools.hasInrPricing,
          hasUpiSupport: desiTools.hasUpiSupport,
          isOpenSource: desiTools.isOpenSource,
          pricingModel: desiTools.pricingModel,
          startingPriceInr: desiTools.startingPriceInr,
          categoryName: categories.name,
          categorySlug: categories.slug,
          categoryEmoji: categories.emoji,
        })
        .from(desiTools)
        .leftJoin(categories, eq(desiTools.categoryId, categories.id))
        .where(
          and(
            eq(desiTools.status, 'published'),
            or(
              like(desiTools.name, searchPattern),
              like(desiTools.tagline, searchPattern),
              like(desiTools.description, searchPattern),
              like(desiTools.slug, searchPattern),
              like(desiTools.city, searchPattern),
              like(desiTools.state, searchPattern)
            )
          )
        )
        .limit(15)
        .all(),

      // B. Global Tools / Alternatives
      db
        .select({
          id: globalTools.id,
          slug: globalTools.slug,
          name: globalTools.name,
          tagline: globalTools.tagline,
          websiteUrl: globalTools.websiteUrl,
          logoUrl: globalTools.logoUrl,
          features: globalTools.features,
          startingPriceUsd: globalTools.startingPriceUsd,
          categoryName: categories.name,
          categorySlug: categories.slug,
          categoryEmoji: categories.emoji,
        })
        .from(globalTools)
        .leftJoin(categories, eq(globalTools.categoryId, categories.id))
        .where(
          or(
            like(globalTools.name, searchPattern),
            like(globalTools.slug, searchPattern),
            like(globalTools.tagline, searchPattern),
            like(globalTools.features, searchPattern)
          )
        )
        .limit(10)
        .all(),

      // C. Categories Taxonomy
      db
        .select()
        .from(categories)
        .where(
          or(
            like(categories.name, searchPattern),
            like(categories.slug, searchPattern),
            like(categories.description, searchPattern)
          )
        )
        .limit(8)
        .all(),

      // D. Blog Posts
      db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          subtitle: blogPosts.subtitle,
          coverImageUrl: blogPosts.coverImageUrl,
          readingTimeMinutes: blogPosts.readingTimeMinutes,
          categoryName: categories.name,
          categorySlug: categories.slug,
          categoryEmoji: categories.emoji,
          authorName: blogAuthors.name,
        })
        .from(blogPosts)
        .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
        .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
        .where(
          and(
            eq(blogPosts.status, 'published'),
            or(
              like(blogPosts.title, searchPattern),
              like(blogPosts.subtitle, searchPattern),
              like(blogPosts.slug, searchPattern),
              like(blogPosts.content, searchPattern)
            )
          )
        )
        .limit(8)
        .all(),

      // Lookup tool alternatives to show mapped alternatives badges
      db
        .select({
          desiToolId: toolAlternatives.desiToolId,
          globalName: globalTools.name,
          globalSlug: globalTools.slug,
        })
        .from(toolAlternatives)
        .leftJoin(globalTools, eq(toolAlternatives.globalToolId, globalTools.id))
        .all(),
    ]);

    // Map global names to desi tool IDs
    const toolAltMap: Record<string, string[]> = {};
    toolAlts.forEach((ta) => {
      if (ta.desiToolId && ta.globalName) {
        if (!toolAltMap[ta.desiToolId]) toolAltMap[ta.desiToolId] = [];
        toolAltMap[ta.desiToolId].push(ta.globalName);
      }
    });

    // Score and format Indian Tools
    toolsMatches.forEach((t) => {
      let score = 50;
      const tName = t.name.toLowerCase();
      if (tName === qLower) score += 100;
      else if (tName.startsWith(qLower)) score += 60;
      else if (tName.includes(qLower)) score += 40;

      const altNames = toolAltMap[t.id] || [];
      let metaBadge = '';
      if (altNames.length > 0) {
        metaBadge = `Alt to ${altNames.slice(0, 2).join(', ')}`;
      } else if (t.isOpenSource) {
        metaBadge = '⚡ Open Source';
      } else if (t.startingPriceInr !== null && t.startingPriceInr !== undefined) {
        metaBadge = t.startingPriceInr === 0 ? 'Free Tier' : `₹${t.startingPriceInr}/mo`;
      } else {
        metaBadge = t.pricingModel || '🇮🇳 Homegrown';
      }

      results.push({
        id: t.id,
        type: 'tool',
        title: t.name,
        subtitle: t.tagline,
        slug: t.slug,
        url: `/tools/${t.slug}`,
        logoUrl: t.logoUrl,
        categoryName: t.categoryName,
        categorySlug: t.categorySlug,
        categoryEmoji: t.categoryEmoji,
        badgeLabel: 'Indian Tool',
        badgeType: 'tool',
        metaBadge,
        score,
      });
    });

    // Score and format Global Alternatives
    globalsMatches.forEach((g) => {
      let score = 40;
      const gName = g.name.toLowerCase();
      if (gName === qLower) score += 90;
      else if (gName.startsWith(qLower)) score += 50;
      else if (gName.includes(qLower)) score += 30;

      results.push({
        id: g.id,
        type: 'alternative',
        title: g.name,
        subtitle: g.tagline || `Indian sovereign alternatives to ${g.name}`,
        slug: g.slug,
        url: `/alternatives/${g.slug}`,
        logoUrl: g.logoUrl || `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(g.websiteUrl || 'https://' + g.slug + '.com')}&size=128`,
        categoryName: g.categoryName || 'Global Software',
        categorySlug: g.categorySlug,
        categoryEmoji: g.categoryEmoji || '🌐',
        badgeLabel: 'Global Giant',
        badgeType: 'alternative',
        metaBadge: g.startingPriceUsd ? `From $${g.startingPriceUsd}/mo` : 'Programmatic SEO',
        score,
      });
    });

    // Score and format Categories
    catsMatches.forEach((c) => {
      let score = 30;
      const cName = c.name.toLowerCase();
      if (cName === qLower) score += 80;
      else if (cName.startsWith(qLower)) score += 40;

      results.push({
        id: c.id,
        type: 'category',
        title: c.name,
        subtitle: c.description || `Browse sovereign Indian software in ${c.name}`,
        slug: c.slug,
        url: `/category/${c.slug}`,
        emoji: c.emoji,
        badgeLabel: 'Category',
        badgeType: 'category',
        metaBadge: 'Taxonomy Pillar',
        score,
      });
    });

    // Score and format Blog Posts
    blogMatches.forEach((p) => {
      let score = 35;
      const pTitle = p.title.toLowerCase();
      if (pTitle.includes(qLower)) score += 45;

      results.push({
        id: p.id,
        type: 'blog',
        title: p.title,
        subtitle: p.subtitle || `By ${p.authorName || 'Editorial Team'}`,
        slug: p.slug,
        url: `/blog/${p.slug}`,
        logoUrl: p.coverImageUrl,
        categoryName: p.categoryName,
        categorySlug: p.categorySlug,
        categoryEmoji: p.categoryEmoji,
        badgeLabel: 'Article',
        badgeType: 'blog',
        metaBadge: `${p.readingTimeMinutes || 5} min read`,
        score,
      });
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Compute breakdown counts
    const counts = {
      all: results.length,
      tools: results.filter((r) => r.type === 'tool').length,
      alternatives: results.filter((r) => r.type === 'alternative').length,
      categories: results.filter((r) => r.type === 'category').length,
      blog: results.filter((r) => r.type === 'blog').length,
    };

    // Filter results if a specific tab was requested
    let filteredResults = results;
    if (filterType === 'tools') filteredResults = results.filter((r) => r.type === 'tool');
    else if (filterType === 'alternatives') filteredResults = results.filter((r) => r.type === 'alternative');
    else if (filterType === 'categories') filteredResults = results.filter((r) => r.type === 'category');
    else if (filterType === 'blog') filteredResults = results.filter((r) => r.type === 'blog');

    // 3. Log search query in search_logs (telemetry for admin content gap analysis)
    let searchLogId = createSearchLogId();
    try {
      if (query.length >= 2) {
        await db.insert(searchLogs).values({
          id: searchLogId,
          query: rawQuery.slice(0, 100),
          normalizedQuery: qLower.slice(0, 100),
          resultsCount: results.length,
          clickedType: 'none',
          userSessionId: sessionId || null,
        });
      }
    } catch (logErr) {
      console.error('Failed to log search telemetry:', logErr);
    }

    return new Response(
      JSON.stringify({
        searchLogId,
        query,
        counts,
        results: filteredResults,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      }
    );
  } catch (error: any) {
    console.error('Search API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Search execution failed',
        message: error?.message || 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
