import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
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
    <filter id="shadow" x="0" y="0" width="1200" height="630" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <style>
    .kicker { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 15px; fill: #F59E0B; letter-spacing: 0.1em; }
    .title { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 56px; fill: #FFFFFF; letter-spacing: -0.02em; }
    .title-accent { fill: #F59E0B; }
    .tagline { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 400; font-size: 24px; fill: #94A3B8; line-height: 1.4; }
    .badge-text { font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 16px; fill: #F1F5F9; }
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
  <circle cx="200" cy="180" r="240" fill="#F59E0B" opacity="0.15" />
  <circle cx="1000" cy="400" r="280" fill="#3B82F6" opacity="0.12" />

  <!-- Main Card Container -->
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="#1E293B" fill-opacity="0.75" stroke="#334155" stroke-width="2" filter="url(#shadow)" />
  <rect x="60" y="50" width="1080" height="530" rx="28" fill="url(#glow)" />

  <!-- Top Accent Tri-Color Stripe -->
  <rect x="60" y="50" width="1080" height="6" rx="3" fill="url(#accentLine)" />

  <!-- Kicker Pill -->
  <g transform="translate(100, 95)">
    <rect x="0" y="0" width="340" height="38" rx="19" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
    <text x="170" y="24" text-anchor="middle" class="kicker">🇮🇳 SOVEREIGN SAAS DIRECTORY</text>
  </g>

  <!-- Header Title -->
  <g transform="translate(100, 205)">
    <text x="0" y="0" class="title">Homegrown Indian <tspan class="title-accent">Software Alternatives</tspan></text>
    <text x="0" y="48" class="tagline">Replace foreign SaaS giants with sovereign tech. Pay in INR, claim 18% GST input credit, and host data in Indian cloud regions.</text>
  </g>

  <!-- Key Pillars Badges Grid -->
  <g transform="translate(100, 350)">
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="280" height="64" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="24" y="38" class="badge-text">₹ Zero Forex Markup</text>
    </g>

    <g transform="translate(300, 0)">
      <rect x="0" y="0" width="280" height="64" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="24" y="38" class="badge-text">🧾 18% GST Input Credit</text>
    </g>

    <g transform="translate(600, 0)">
      <rect x="0" y="0" width="280" height="64" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
      <text x="24" y="38" class="badge-text">🛡️ India Data Residency</text>
    </g>
  </g>

  <!-- Bottom Brand Footer -->
  <g transform="translate(100, 490)">
    <line x1="0" y1="0" x2="880" y2="0" stroke="#334155" stroke-width="1" />
    <text x="0" y="40" class="brand-title">DESI ALTERNATIVES</text>
    <text x="260" y="39" class="brand-sub">🇮🇳 Sovereign Indian SaaS &amp; Software Directory</text>
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
