/**
 * URL Metadata Scraper Utility
 * Extracts title, description, favicon/logo, and suggests brand styling from public website HTML.
 */

export interface ScrapedMetadata {
  title: string;
  description: string;
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

  // 1. Extract Title
  let title = getMeta('og:title') || getMeta('twitter:title');
  if (!title) {
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = titleTag ? titleTag[1].trim() : '';
  }

  // Clean common suffixes like " | Home", " - Best Tool", etc.
  title = title.split(/[|–—]/)[0].trim();

  // 2. Extract Description / Tagline
  let description =
    getMeta('og:description') ||
    getMeta('description') ||
    getMeta('twitter:description') ||
    '';

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
    if (ogImage && (ogImage.endsWith('.png') || ogImage.endsWith('.svg') || ogImage.endsWith('.webp') || ogImage.includes('logo'))) {
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
      // Keep as-is or fallback
    }
  } else {
    // Fallback to standard /favicon.ico at domain root
    try {
      const urlObj = new URL(baseUrl);
      logoUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch {
      logoUrl = null;
    }
  }

  // 4. Default Sovereign Amber Fallback
  const primaryColor = '#F59E0B';

  return {
    title,
    description,
    logoUrl,
    primaryColor,
  };
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedMetadata> {
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 DesiAlternatives/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  return parseHtmlMetadata(html, url);
}
