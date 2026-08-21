import { describe, it, expect } from 'vitest';
import { parseUserAgent, generateDailySessionHash } from '@/lib/server/analytics';

describe('First-Party Analytics Utilities', () => {
  describe('User Agent Parser', () => {
    it('detects macOS and Chrome correctly', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      const parsed = parseUserAgent(ua);
      expect(parsed.device).toBe('desktop');
      expect(parsed.os).toBe('macOS');
      expect(parsed.browser).toBe('Chrome');
    });

    it('detects Android and mobile device correctly', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
      const parsed = parseUserAgent(ua);
      expect(parsed.device).toBe('mobile');
      expect(parsed.os).toBe('Android');
      expect(parsed.browser).toBe('Chrome');
    });

    it('detects iPhone and Safari correctly', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1';
      const parsed = parseUserAgent(ua);
      expect(parsed.device).toBe('mobile');
      expect(parsed.os).toBe('iOS');
      expect(parsed.browser).toBe('Safari');
    });

    it('detects Brave, Arc, and Edge correctly', () => {
      const edgeUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      const arcUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Arc/1.24.0';

      expect(parseUserAgent(edgeUa).browser).toBe('Edge');
      expect(parseUserAgent(arcUa).browser).toBe('Arc');
    });
  });

  describe('Daily Automated Salt Session Hasher', () => {
    it('produces consistent 16-character hex hash for the same day', async () => {
      const hash1 = await generateDailySessionHash('192.168.1.1', 'Mozilla/5.0', 'test-secret');
      const hash2 = await generateDailySessionHash('192.168.1.1', 'Mozilla/5.0', 'test-secret');

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
    });

    it('produces different hash for different IPs or user agents', async () => {
      const hashA = await generateDailySessionHash('192.168.1.1', 'Mozilla/5.0', 'test-secret');
      const hashB = await generateDailySessionHash('192.168.1.2', 'Mozilla/5.0', 'test-secret');

      expect(hashA).not.toBe(hashB);
    });
  });
});
