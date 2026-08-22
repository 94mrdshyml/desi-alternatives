import type { APIRoute } from 'astro';
import { globalTools, toolAlternatives, desiTools } from '@/lib/server/db/schema';
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

  let globalTool: any = null;
  let mappedTools: any[] = [];

  try {
    globalTool = await db
      .select()
      .from(globalTools)
      .where(eq(globalTools.slug, slug))
      .get();

    if (globalTool) {
      mappedTools = await db
        .select({
          name: desiTools.name,
          tagline: desiTools.tagline,
          startingPriceInr: desiTools.startingPriceInr,
          city: desiTools.city,
        })
        .from(toolAlternatives)
        .leftJoin(desiTools, eq(toolAlternatives.desiToolId, desiTools.id))
        .where(eq(toolAlternatives.globalToolId, globalTool.id))
        .all();
    }
  } catch (e) {
    console.error('Error querying global alternative for OG PNG:', e);
  }

  const globalName = escapeXml(globalTool?.name || (slug.charAt(0).toUpperCase() + slug.slice(1)));
  const usdPrice = globalTool?.startingPriceUsd ? `$${globalTool.startingPriceUsd}/mo` : '$20+/mo';

  const toolCards = mappedTools.slice(0, 3).map((t, idx) => {
    const xPos = idx * 290;
    const tName = escapeXml(truncate(t?.name || 'Desi Tool', 18));
    const tTagline = escapeXml(truncate(t?.tagline || 'Indian Alternative', 34));
    const tPrice = t?.startingPriceInr !== null && t?.startingPriceInr !== undefined
      ? (t.startingPriceInr === 0 ? 'Free tier' : `₹${t.startingPriceInr}/mo`)
      : 'INR Pricing';

    return `<g transform="translate(${xPos}, 0)">
      <rect x="0" y="0" width="270" height="96" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="20" y="32" class="subcard-title">${tName}</text>
      <text x="20" y="56" class="subcard-sub">${tTagline}</text>
      <text x="20" y="80" class="subcard-price">${tPrice}</text>
    </g>`;
  }).join('');

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0B0F19" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.05" />
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="50%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>

  <style>
    .kicker { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 15px; fill: #F59E0B; letter-spacing: 0.1em; }
    .title { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 54px; fill: #FFFFFF; }
    .title-accent { fill: #F59E0B; }
    .tagline { font-family: system-ui, -apple-system, sans-serif; font-weight: 400; font-size: 24px; fill: #94A3B8; }
    .badge-text { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 16px; fill: #F1F5F9; }
    .subcard-title { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 20px; fill: #FFFFFF; }
    .subcard-sub { font-family: system-ui, -apple-system, sans-serif; font-weight: 400; font-size: 13px; fill: #94A3B8; }
    .subcard-price { font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 14px; fill: #34D399; }
    .brand-title { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 24px; fill: #F59E0B; letter-spacing: 0.05em; }
    .brand-sub { font-family: system-ui, -apple-system, sans-serif; font-weight: 500; font-size: 16px; fill: #64748B; }
  </style>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Ambient Glow Spheres -->
  <circle cx="200" cy="180" r="240" fill="#F59E0B" opacity="0.12" />
  <circle cx="1000" cy="400" r="280" fill="#3B82F6" opacity="0.10" />

  <!-- Main Card Container -->
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="#1E293B" fill-opacity="0.85" stroke="#334155" stroke-width="2" />
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="url(#glow)" />

  <!-- Top Accent Tri-Color Stripe -->
  <rect x="60" y="50" width="1080" height="6" rx="3" fill="url(#accentLine)" />

  <!-- Kicker Pill & USD Price Tag -->
  <g transform="translate(100, 95)">
    <rect x="0" y="0" width="310" height="38" rx="19" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
    <text x="155" y="25" text-anchor="middle" class="kicker">🇮🇳 SOVEREIGN SAAS DIRECTORY</text>

    <rect x="670" y="0" width="210" height="38" rx="19" fill="#450A0A" stroke="#DC2626" stroke-width="1.5" />
    <text x="775" y="25" text-anchor="middle" class="badge-text" font-size="14" fill="#FCA5A5">Foreign USD: ${usdPrice}</text>
  </g>

  <!-- Header Title -->
  <g transform="translate(100, 205)">
    <text x="0" y="0" class="title">Indian Alternatives to <tspan class="title-accent">${globalName}</tspan></text>
    <text x="0" y="48" class="tagline">Save 3.5% forex conversion markup with 18% GST Input Credit &amp; local data residency.</text>
  </g>

  <!-- Mapped Alternatives Cards Grid -->
  <g transform="translate(100, 335)">
    ${toolCards || `<g transform="translate(0, 0)">
      <rect x="0" y="0" width="880" height="96" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="40" y="54" class="subcard-title">Explore vetted Indian alternatives with fixed INR billing &amp; UPI support</text>
    </g>`}
  </g>

  <!-- Bottom Brand Footer -->
  <g transform="translate(100, 490)">
    <line x1="0" y1="0" x2="880" y2="0" stroke="#334155" stroke-width="1" />
    <text x="0" y="40" class="brand-title">DESI ALTERNATIVES</text>
    <text x="260" y="39" class="brand-sub">🇮🇳 Replace Foreign SaaS with Homegrown Tech</text>
    <text x="880" y="39" text-anchor="end" class="brand-sub">desialternatives.in</text>
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
  } catch (err) {
    console.error('Error rendering PNG alternative card, redirecting to default banner:', err);
    return new Response(null, {
      status: 302,
      headers: { Location: '/og-default.png' },
    });
  }
};
