import type { APIRoute } from 'astro';
import { desiTools, categories } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

export const GET: APIRoute = async ({ params, locals }) => {
  const db = locals.db;
  const slug = params.slug;

  if (!db || !slug) {
    return new Response('Not found', { status: 404 });
  }

  let tool: any = null;

  try {
    tool = await db
      .select({
        name: desiTools.name,
        tagline: desiTools.tagline,
        primaryColor: desiTools.primaryColor,
        categoryName: categories.name,
        categoryEmoji: categories.emoji,
        city: desiTools.city,
        state: desiTools.state,
        foundedYear: desiTools.foundedYear,
        isOpenSource: desiTools.isOpenSource,
        hasIndianDataResidency: desiTools.hasIndianDataResidency,
        hasGstInvoice: desiTools.hasGstInvoice,
        hasInrPricing: desiTools.hasInrPricing,
        startingPriceInr: desiTools.startingPriceInr,
      })
      .from(desiTools)
      .leftJoin(categories, eq(desiTools.categoryId, categories.id))
      .where(eq(desiTools.slug, slug))
      .get();
  } catch (e) {
    console.error('Error rendering OG tool banner:', e);
  }

  const name = escapeXml(tool?.name || 'Desi Alternative');
  const tagline = escapeXml(truncate(tool?.tagline || 'Homegrown Indian software built for sovereign performance.', 90));
  const category = escapeXml(`${tool?.categoryEmoji || '⚡'} ${tool?.categoryName || 'Software'}`);
  const location = tool?.city && tool?.state ? escapeXml(`📍 ${tool.city}, ${tool.state}`) : '🇮🇳 Made in India';
  const brandColor = tool?.primaryColor || '#D97706';
  const startingPrice = tool?.startingPriceInr !== null && tool?.startingPriceInr !== undefined
    ? (tool.startingPriceInr === 0 ? 'Free Tier' : `From ₹${tool.startingPriceInr}/mo`)
    : 'Transparent Pricing';

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="cardGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brandColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.05" />
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
    <filter id="shadow" x="0" y="0" width="1200" height="630" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <style>
    .title { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 64px; fill: #FFFFFF; letter-spacing: -0.02em; }
    .tagline { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 400; font-size: 26px; fill: #94A3B8; line-height: 1.4; }
    .badge-text { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 18px; fill: #F1F5F9; }
    .meta-text { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 600; font-size: 20px; fill: #CBD5E1; }
    .brand-title { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 24px; fill: #F59E0B; letter-spacing: 0.05em; }
    .brand-sub { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 500; font-size: 16px; fill: #64748B; }
  </style>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Geometric Subtle Grid -->
  <g opacity="0.12" stroke="#334155" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="630" />
    <line x1="300" y1="0" x2="300" y2="630" />
    <line x1="500" y1="0" x2="500" y2="630" />
    <line x1="700" y1="0" x2="700" y2="630" />
    <line x1="900" y1="0" x2="900" y2="630" />
    <line x1="1100" y1="0" x2="1100" y2="630" />
    <line x1="0" y1="100" x2="1200" y2="100" />
    <line x1="0" y1="300" x2="1200" y2="300" />
    <line x1="0" y1="500" x2="1200" y2="500" />
  </g>

  <!-- Ambient Glow Spheres -->
  <circle cx="200" cy="180" r="220" fill="${brandColor}" opacity="0.18" />
  <circle cx="1050" cy="450" r="260" fill="#3B82F6" opacity="0.12" />

  <!-- Main Card Container -->
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="#1E293B" fill-opacity="0.75" stroke="#334155" stroke-width="2" filter="url(#shadow)" />
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="url(#cardGlow)" />

  <!-- Top Accent Tri-Color Stripe -->
  <rect x="60" y="50" width="1080" height="6" rx="3" fill="url(#accentLine)" />

  <!-- Top Navigation Header inside Card -->
  <g transform="translate(100, 95)">
    <!-- Category Pill -->
    <rect x="0" y="0" width="220" height="38" rx="19" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
    <text x="110" y="24" text-anchor="middle" class="badge-text" font-size="15">${category}</text>

    <!-- Location / Origin Pill -->
    <rect x="235" y="0" width="240" height="38" rx="19" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
    <text x="355" y="24" text-anchor="middle" class="badge-text" font-size="15">${location}</text>

    <!-- Starting Price Pill -->
    <rect x="740" y="0" width="180" height="38" rx="19" fill="#064E3B" stroke="#059669" stroke-width="1.5" />
    <text x="830" y="24" text-anchor="middle" class="badge-text" font-size="15" fill="#34D399">${startingPrice}</text>
  </g>

  <!-- Tool Title & Tagline -->
  <g transform="translate(100, 210)">
    <text x="0" y="0" class="title">${name}</text>
    <text x="0" y="52" class="tagline">${tagline}</text>
  </g>

  <!-- Feature Check Badges -->
  <g transform="translate(100, 360)">
    <!-- Badge 1: 18% GST -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="280" height="64" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="24" y="38" class="badge-text">🧾 18% GST Input Credit</text>
    </g>

    <!-- Badge 2: INR Billing -->
    <g transform="translate(300, 0)">
      <rect x="0" y="0" width="280" height="64" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="24" y="38" class="badge-text">₹ Zero Forex / UPI</text>
    </g>

    <!-- Badge 3: Data Sovereignty / OSS -->
    <g transform="translate(600, 0)">
      <rect x="0" y="0" width="280" height="64" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="24" y="38" class="badge-text">🇮🇳 Sovereign Cloud / DPDP</text>
    </g>
  </g>

  <!-- Bottom Brand Footer -->
  <g transform="translate(100, 490)">
    <line x1="0" y1="0" x2="880" y2="0" stroke="#334155" stroke-width="1" />
    <text x="0" y="40" class="brand-title">DESI ALTERNATIVES</text>
    <text x="260" y="39" class="brand-sub">🇮🇳 Sovereign Indian SaaS & Software Directory</text>
    <text x="880" y="39" text-anchor="end" class="brand-sub">desialternatives.in</text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
};
