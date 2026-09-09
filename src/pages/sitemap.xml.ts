import type { APIRoute } from 'astro';
import { desiTools, globalTools, toolAlternatives, categories, blogPosts } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.db;
  const baseUrl = 'https://desialternatives.in';
  const now = new Date().toISOString().split('T')[0];

  const urls: Array<{ loc: string; lastmod?: string; changefreq: string; priority: string }> = [
    { loc: `${baseUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/compare`, lastmod: now, changefreq: 'daily', priority: '0.9' },
    { loc: `${baseUrl}/newsletter`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/about`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
    { loc: `${baseUrl}/submit`, lastmod: now, changefreq: 'monthly', priority: '0.6' },
    { loc: `${baseUrl}/blog`, lastmod: now, changefreq: 'daily', priority: '0.8' },
  ];

  if (db) {
    try {
      const [desiList, globalList, catList, postList, altList] = await Promise.all([
        db.select({ slug: desiTools.slug, updatedAt: desiTools.updatedAt }).from(desiTools).where(eq(desiTools.status, 'published')).all(),
        db.select({ slug: globalTools.slug, updatedAt: globalTools.updatedAt }).from(globalTools).all(),
        db.select({ slug: categories.slug }).from(categories).all(),
        db.select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.status, 'published')).all(),
        db
          .select({
            desiSlug: desiTools.slug,
            globalSlug: globalTools.slug,
          })
          .from(toolAlternatives)
          .leftJoin(desiTools, eq(toolAlternatives.desiToolId, desiTools.id))
          .leftJoin(globalTools, eq(toolAlternatives.globalToolId, globalTools.id))
          .all(),
      ]);

      // Categories
      for (const cat of catList) {
        if (cat.slug) {
          urls.push({
            loc: `${baseUrl}/category/${cat.slug}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: '0.8',
          });
        }
      }

      // Indian Sovereign Tools
      for (const tool of desiList) {
        if (tool.slug) {
          urls.push({
            loc: `${baseUrl}/tools/${tool.slug}`,
            lastmod: tool.updatedAt ? tool.updatedAt.split('T')[0] : now,
            changefreq: 'weekly',
            priority: '0.8',
          });
        }
      }

      // Global Alternatives
      for (const gt of globalList) {
        if (gt.slug) {
          urls.push({
            loc: `${baseUrl}/alternatives/${gt.slug}`,
            lastmod: gt.updatedAt ? gt.updatedAt.split('T')[0] : now,
            changefreq: 'weekly',
            priority: '0.8',
          });
        }
      }

      // Programmatic SEO Comparisons
      for (const alt of altList) {
        if (alt.desiSlug && alt.globalSlug) {
          urls.push({
            loc: `${baseUrl}/compare/${alt.desiSlug}-vs-${alt.globalSlug}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: '0.9',
          });
        }
      }

      // Blog Articles
      for (const post of postList) {
        if (post.slug) {
          urls.push({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: post.updatedAt ? post.updatedAt.split('T')[0] : post.publishedAt ? post.publishedAt.split('T')[0] : now,
            changefreq: 'monthly',
            priority: '0.7',
          });
        }
      }
    } catch (e) {
      console.error('Error generating sitemap XML:', e);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
