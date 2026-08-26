import type { APIRoute } from 'astro';
import { blogPosts, blogAuthors, categories } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { renderSvgToPng } from '@/lib/server/og-renderer';

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

export const GET: APIRoute = async ({ params, locals, url }) => {
  const db = locals.db;
  const slug = params.slug;

  if (!db || !slug) {
    return new Response('Not found', { status: 404 });
  }

  let post: any = null;

  try {
    post = await db
      .select({
        title: blogPosts.title,
        subtitle: blogPosts.subtitle,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        publishedAt: blogPosts.publishedAt,
        authorName: blogAuthors.name,
        authorRole: blogAuthors.role,
        categoryName: categories.name,
        categoryEmoji: categories.emoji,
      })
      .from(blogPosts)
      .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
      .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
      .where(eq(blogPosts.slug, slug))
      .get();
  } catch (e) {
    console.error('Error querying blog post for OG PNG:', e);
  }

  const title = escapeXml(truncate(post?.title || 'Sovereign Indian SaaS & Tech Editorial', 80));
  const subtitle = escapeXml(
    truncate(
      post?.subtitle || 'In-depth engineering architectures, migration guides, and sovereign software curations.',
      110
    )
  );
  const category = escapeXml(`${post?.categoryEmoji || '🇮🇳'} ${post?.categoryName || 'Editorial'}`);
  const author = escapeXml(post?.authorName || 'Desi Alternatives Editorial');
  const readTime = `${post?.readingTimeMinutes || 5} min read`;

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="cardGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.30" />
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.08" />
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>

  <style>
    .title { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 52px; fill: #FFFFFF; line-height: 1.2; }
    .subtitle { font-family: system-ui, -apple-system, sans-serif; font-weight: 400; font-size: 24px; fill: #94A3B8; }
    .badge-text { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 16px; fill: #F1F5F9; }
    .brand-title { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 22px; fill: #F59E0B; letter-spacing: 0.05em; }
    .brand-sub { font-family: system-ui, -apple-system, sans-serif; font-weight: 500; font-size: 15px; fill: #64748B; }
    .author-name { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 18px; fill: #E2E8F0; }
  </style>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Ambient Glow Spheres -->
  <circle cx="240" cy="160" r="260" fill="#F59E0B" opacity="0.15" />
  <circle cx="1000" cy="460" r="280" fill="#3B82F6" opacity="0.12" />

  <!-- Main Card Container -->
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="#1E293B" fill-opacity="0.85" stroke="#334155" stroke-width="2" />
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="url(#cardGlow)" />

  <!-- Top Accent Tri-Color Stripe -->
  <rect x="60" y="50" width="1080" height="6" rx="3" fill="url(#accentLine)" />

  <!-- Header: Category & Read Time -->
  <g transform="translate(100, 95)">
    <rect width="180" height="34" rx="17" fill="#334155" />
    <text x="90" y="22" text-anchor="middle" class="badge-text">${category}</text>

    <rect x="195" width="120" height="34" rx="17" fill="#0F172A" stroke="#334155" stroke-width="1" />
    <text x="255" y="22" text-anchor="middle" class="badge-text" fill="#94A3B8">⏱ ${readTime}</text>
  </g>

  <!-- Post Title & Subtitle -->
  <g transform="translate(100, 180)">
    <text x="0" y="50" class="title">${title}</text>
    <text x="0" y="140" class="subtitle">${subtitle}</text>
  </g>

  <!-- Footer / Bottom Branding & Author -->
  <g transform="translate(100, 480)">
    <!-- Author Pill -->
    <rect width="320" height="48" rx="24" fill="#0F172A" stroke="#334155" stroke-width="1" />
    <circle cx="24" cy="24" r="16" fill="#F59E0B" opacity="0.3" />
    <text x="24" y="29" text-anchor="middle" font-family="system-ui" font-size="14" fill="#F59E0B">✍️</text>
    <text x="50" y="30" class="author-name">${author}</text>

    <!-- Brand Pinned Right -->
    <g transform="translate(680, 0)">
      <text x="200" y="22" text-anchor="end" class="brand-title">DESI ALTERNATIVES</text>
      <text x="200" y="42" text-anchor="end" class="brand-sub">Sovereign Tech Magazine · desialternatives.in</text>
    </g>
  </g>
</svg>`;

  try {
    const pngBuffer = await renderSvgToPng(svg, url.origin);
    return new Response(pngBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error rendering blog OG PNG, redirecting to default banner:', error);
    return new Response(null, {
      status: 302,
      headers: { Location: '/og-default.png' },
    });
  }
};
