/**
 * First-Party Analytics Engine for Desi Alternatives
 * Powered by Cloudflare Analytics Engine + Edge Request Context.
 * Zero 3rd-party cookies. Automated daily date-seeded salt for privacy.
 */

export interface AnalyticsEventInput {
  eventType: 'pageview' | 'tool_view' | 'outbound_click' | 'badge_click' | 'search';
  path: string;
  toolId?: string;
  toolSlug?: string;
  globalToolSlug?: string;
  badgeType?: string;
  referrer?: string;
  searchQuery?: string;
  durationSeconds?: number;
}

export interface UserAgentInfo {
  device: 'desktop' | 'mobile' | 'tablet';
  os: 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android' | 'Other';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Arc' | 'Brave' | 'Other';
}

export function parseUserAgent(ua: string): UserAgentInfo {
  if (!ua) {
    return { device: 'desktop', os: 'Other', browser: 'Other' };
  }

  // Device Detection
  let device: UserAgentInfo['device'] = 'desktop';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    device = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) {
    device = 'mobile';
  }

  // OS Detection
  let os: UserAgentInfo['os'] = 'Other';
  if (/Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) {
    os = 'macOS';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // Browser Detection
  let browser: UserAgentInfo['browser'] = 'Other';
  if (/Brave/i.test(ua)) {
    browser = 'Brave';
  } else if (/Edg\//i.test(ua)) {
    browser = 'Edge';
  } else if (/Arc\//i.test(ua)) {
    browser = 'Arc';
  } else if (/Chrome|CriOS/i.test(ua) && !/Edg|OPR/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS|Android/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browser = 'Firefox';
  }

  return { device, os, browser };
}

export async function generateDailySessionHash(ip: string, userAgent: string, secret = 'desi-salt-key'): Promise<string> {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const raw = `${secret}:${today}:${ip}:${userAgent}`;
  const msgUint8 = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export async function recordAnalyticsEvent(
  env: CloudflareEnv,
  input: AnalyticsEventInput,
  request: Request,
  cf?: any
): Promise<boolean> {
  try {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const secret = env.BETTER_AUTH_SECRET || 'desi-default-analytics-secret';

    const sessionHash = await generateDailySessionHash(ip, userAgent, secret);
    const { device, os, browser } = parseUserAgent(userAgent);

    const country = cf?.country || request.headers.get('cf-ipcountry') || 'IN';
    const region = cf?.regionCode || 'KA';
    const city = cf?.city || 'Bengaluru';

    let referrerHost = 'direct';
    if (input.referrer) {
      try {
        referrerHost = new URL(input.referrer).hostname.replace(/^www\./, '');
      } catch {
        referrerHost = input.referrer.slice(0, 50);
      }
    }

    if (env.ANALYTICS) {
      env.ANALYTICS.writeDataPoint({
        blobs: [
          input.eventType,                         // blob1: eventType
          input.path || '/',                       // blob2: path
          input.toolId || input.toolSlug || '',    // blob3: toolId / toolSlug
          sessionHash,                             // blob4: daily session hash
          referrerHost,                            // blob5: referrer host
          device,                                  // blob6: device
          os,                                      // blob7: os
          browser,                                 // blob8: browser
          country,                                 // blob9: country
          city,                                    // blob10: city
          region,                                  // blob11: state / region code
          input.badgeType || '',                   // blob12: badge type clicked
          input.globalToolSlug || '',              // blob13: global competitor compared
          input.searchQuery || '',                 // blob14: search query
        ],
        doubles: [
          input.durationSeconds ? Number(input.durationSeconds) : 1, // double1: engagement seconds / count
        ],
        indexes: [
          input.toolSlug || input.toolId || 'site', // index1: indexed for tool filtering
        ],
      });
    }

    return true;
  } catch (err) {
    console.error('Failed to record analytics event to Cloudflare Analytics Engine:', err);
    return false;
  }
}
