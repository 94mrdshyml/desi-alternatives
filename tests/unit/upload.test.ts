import { describe, it, expect } from 'vitest';
import { detectImageType, buildAssetHeaders } from '@/lib/server/upload';

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
const text = (s: string) => new TextEncoder().encode(s);

describe('Upload magic-byte detection', () => {
  it('accepts PNG, JPG and WebP by their real bytes', () => {
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual({ ext: 'png', mime: 'image/png' });
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toEqual({ ext: 'jpg', mime: 'image/jpeg' });
    expect(detectImageType(text('RIFF\x00\x00\x00\x00WEBPVP8 '))).toEqual({ ext: 'webp', mime: 'image/webp' });
  });

  it('rejects HTML, SVG, GIF and empty files regardless of claimed name/type', () => {
    expect(detectImageType(text('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(detectImageType(text('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'))).toBeNull();
    expect(detectImageType(text('GIF89a......'))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});

describe('Asset response headers', () => {
  it('always sends nosniff and a sandbox CSP', () => {
    const h = buildAssetHeaders('image/png', '"e1"');
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['Content-Security-Policy']).toContain('sandbox');
    expect(h['Content-Type']).toBe('image/png');
    expect(h['Content-Disposition']).toBeUndefined();
  });

  it('forces download for legacy objects stored with a dangerous type', () => {
    const h = buildAssetHeaders('text/html; charset=utf-8', '"e2"');
    expect(h['Content-Type']).toBe('application/octet-stream');
    expect(h['Content-Disposition']).toBe('attachment');
  });

  it('still serves legacy SVG logos inline but sandboxed', () => {
    const h = buildAssetHeaders('image/svg+xml', '"e3"');
    expect(h['Content-Type']).toBe('image/svg+xml');
    expect(h['Content-Security-Policy']).toContain('sandbox');
  });
});
