/**
 * URL Metadata Scraper Utility
 * Extracts title, description, favicon/logo, and suggests brand styling from public website HTML.
 */

export interface ScrapedMetadata {
  title: string;
  name: string;
  description: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string;
}

export function parseHtmlMetadata(html: string, baseUrl: string): ScrapedMetadata {
  const getMeta = (property: string): string | null => {
    const match =
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'));
    return match ? match[1].trim() : null;
  };

  let hostname = '';
  try {
    hostname = new URL(baseUrl).hostname.replace(/^www\./, '');
  } catch {}

  // 1. Extract Title / Name
  let fullTitle = getMeta('og:title') || getMeta('twitter:title');
  if (!fullTitle) {
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    fullTitle = titleTag ? titleTag[1].trim() : '';
  }

  // Clean common site suffixes like " | Official", " – Home", etc. from title
  let title = fullTitle.split(/[|–—]/)[0].trim();
  if (!title && hostname) {
    const mainDomain = hostname.split('.')[0];
    title = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  }

  // Clean name for concise inputs
  let name = (getMeta('og:site_name') || title).split(/[:|–—]/)[0].trim();
  if (!name && hostname) {
    const mainDomain = hostname.split('.')[0];
    name = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  }

  // 2. Extract Description / Tagline
  let description =
    getMeta('og:description') ||
    getMeta('description') ||
    getMeta('twitter:description') ||
    '';

  const tagline = description ? (description.length > 120 ? description.slice(0, 117) + '...' : description) : '';

  // 3. Extract Favicon / Logo URL
  let logoUrl: string | null = null;

  // Check apple-touch-icon first (usually highest resolution)
  const appleIconMatch = html.match(/<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/i);
  if (appleIconMatch) {
    logoUrl = appleIconMatch[1].trim();
  }

  // Check og:image or twitter:image
  if (!logoUrl) {
    const ogImage = getMeta('og:image') || getMeta('twitter:image');
    if (ogImage && (ogImage.endsWith('.png') || ogImage.endsWith('.svg') || ogImage.endsWith('.webp') || ogImage.includes('logo') || ogImage.includes('icon'))) {
      logoUrl = ogImage;
    }
  }

  // Check standard icon / shortcut icon
  if (!logoUrl) {
    const iconMatch =
      html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
    if (iconMatch) {
      logoUrl = iconMatch[1].trim();
    }
  }

  // Normalize relative URL
  if (logoUrl) {
    try {
      logoUrl = new URL(logoUrl, baseUrl).toString();
    } catch {
      logoUrl = null;
    }
  }

  if (!logoUrl && hostname) {
    logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  }

  const primaryColor = '#F59E0B';

  return {
    title,
    name: title,
    description,
    tagline,
    logoUrl,
    primaryColor,
  };
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedMetadata> {
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  let hostname = '';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {}

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (response.ok) {
      const html = await response.text();
      return parseHtmlMetadata(html, url);
    }
  } catch {
    // Gracefully proceed to domain-based fallback if remote server blocks fetch
  }

  // Fallback to domain-based metadata derivation if HTML cannot be fetched
  const mainDomain = hostname ? hostname.split('.')[0] : 'Tool';
  const derivedName = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);

  return {
    title: derivedName,
    name: derivedName,
    description: '',
    tagline: '',
    logoUrl: hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=128` : null,
    primaryColor: '#F59E0B',
  };
}
