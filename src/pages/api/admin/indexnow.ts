import type { APIRoute } from 'astro';
import { pingIndexNow } from '@/lib/server/indexnow';
import { desiTools, globalTools, categories, blogPosts } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, url }) => {
  const db = locals.db;
  const user = locals.user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as any;
    const action = body?.action || 'submit-urls';
    const origin = url.origin || 'https://da.mrdshyml.xyz';

    // 1. Submit specific URLs
    if (action === 'submit-urls' && Array.isArray(body.urls) && body.urls.length > 0) {
      const result = await pingIndexNow(body.urls, origin);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Full Catalog Batch IndexNow Ping
    if (action === 'ping-all' && db) {
      const urls: string[] = ['/', '/about', '/alternatives', '/blog', '/submit'];

      // Fetch all published tools
      const publishedTools = await db
        .select({ slug: desiTools.slug })
        .from(desiTools)
        .where(eq(desiTools.status, 'published'))
        .all();
      publishedTools.forEach((t) => urls.push(`/tools/${t.slug}`));

      // Fetch all global tools
      const allGlobalTools = await db
        .select({ slug: globalTools.slug })
        .from(globalTools)
        .all();
      allGlobalTools.forEach((gt) => urls.push(`/alternatives/${gt.slug}`));

      // Fetch all categories
      const allCategories = await db
        .select({ slug: categories.slug })
        .from(categories)
        .all();
      allCategories.forEach((c) => urls.push(`/category/${c.slug}`));

      // Fetch all published blog posts
      const allPosts = await db
        .select({ slug: blogPosts.slug })
        .from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .all();
      allPosts.forEach((p) => urls.push(`/blog/${p.slug}`));

      const result = await pingIndexNow(urls, origin);
      return new Response(
        JSON.stringify({
          ...result,
          totalUrls: urls.length,
          message: `Indexed & pinged search engines for ${urls.length} catalog URLs!`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid IndexNow action or parameters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'IndexNow submission failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
