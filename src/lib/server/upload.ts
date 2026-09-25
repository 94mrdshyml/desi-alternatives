/**
 * Upload safety helpers.
 * The image type is detected from the file's magic bytes — never from the
 * client-supplied filename or Content-Type, which an attacker fully controls.
 */

export interface DetectedImage {
  ext: 'png' | 'jpg' | 'webp';
  mime: 'image/png' | 'image/jpeg' | 'image/webp';
}

export function detectImageType(bytes: Uint8Array): DetectedImage | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }

  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }

  // WebP: "RIFF" ???? "WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }

  return null;
}

// Types we are willing to serve inline from /api/assets. SVG is kept so logos
// uploaded before this hardening still render; the sandbox CSP below stops any
// script inside them from running if the file is opened directly.
const INLINE_SAFE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/x-icon', 'image/svg+xml']);

export function buildAssetHeaders(storedContentType: string | undefined, etag: string): Record<string, string> {
  const type = (storedContentType || '').split(';')[0].trim().toLowerCase();
  const isSafe = INLINE_SAFE_TYPES.has(type);

  const headers: Record<string, string> = {
    'Cache-Control': 'public, max-age=31536000, immutable',
    etag,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'Content-Type': isSafe ? type : 'application/octet-stream',
  };

  if (!isSafe) {
    headers['Content-Disposition'] = 'attachment';
  }

  return headers;
}
