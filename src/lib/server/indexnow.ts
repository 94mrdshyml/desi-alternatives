/**
 * IndexNow Protocol Helper
 * Enables instant programmatic search engine indexing across Bing, Yandex, Seznam, and partner crawlers.
 * Specification: https://www.indexnow.org/documentation
 */

export const INDEXNOW_KEY = 'd351a17e89ab4c2f88e1029c45b78f61';
export const DEFAULT_HOST = 'da.mrdshyml.xyz';

export interface IndexNowResult {
  success: boolean;
  urlsSubmitted: string[];
  status?: number;
  message?: string;
  endpoints?: Record<string, { status: number; ok: boolean }>;
}

/**
 * Auto-ping IndexNow search engine endpoints with updated or created URLs.
 * Safe and non-blocking: Never throws unhandled errors or blocks database operations.
 */
export async function pingIndexNow(
  urls: string | string[],
  customOrigin?: string
): Promise<IndexNowResult> {
  const urlListRaw = Array.isArray(urls) ? urls : [urls];
  const origin = customOrigin || `https://${DEFAULT_HOST}`;
  
  // Format all URLs as absolute HTTPS URLs
  const urlList = urlListRaw.map((u) => {
    const trimmed = String(u || '').trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${origin}${cleanPath}`;
  }).filter(Boolean);

  if (urlList.length === 0) {
    return { success: false, urlsSubmitted: [], message: 'No valid URLs provided.' };
  }

  const host = new URL(urlList[0]).hostname || DEFAULT_HOST;
  const keyLocation = `https://${host}/${INDEXNOW_KEY}.txt`;

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList,
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  const endpointResults: Record<string, { status: number; ok: boolean }> = {};
  let anySuccess = false;

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        endpointResults[endpoint] = {
          status: res.status,
          ok: res.status >= 200 && res.status < 300,
        };

        if (res.status >= 200 && res.status < 300) {
          anySuccess = true;
        }
      } catch (err: any) {
        endpointResults[endpoint] = {
          status: 0,
          ok: false,
        };
      }
    })
  );

  return {
    success: anySuccess,
    urlsSubmitted: urlList,
    message: anySuccess
      ? `Successfully submitted ${urlList.length} URL(s) to IndexNow endpoints.`
      : 'IndexNow submission completed (endpoints notified).',
    endpoints: endpointResults,
  };
}
