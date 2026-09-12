/**
 * Unified 3-in-1 Client Analytics Event Dispatcher
 * Dispatches synchronously/asynchronously across:
 * 1. Google Tag Manager / GA4 (dataLayer & gtag)
 * 2. Umami Analytics (window.umami)
 * 3. First-Party Sovereign Analytics (/api/analytics/collect)
 */

export interface TrackEventOptions {
  [key: string]: any;
}

export function trackEvent(eventName: string, params: TrackEventOptions = {}): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  const currentReferrer = document.referrer || '';

  // 1. Google Tag Manager & GA4 dataLayer
  try {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: eventName,
      page_path: currentPath,
      ...params,
    });

    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, {
        page_path: currentPath,
        ...params,
      });
    }
  } catch (e) {
    // Fail silently
  }

  // 2. Umami Analytics Custom Event
  try {
    const w = window as any;
    if (typeof w.umami === 'object' && typeof w.umami?.track === 'function') {
      w.umami.track(eventName, params);
    }
  } catch (e) {
    // Fail silently
  }

  // 3. First-Party Sovereign Analytics Beacon
  try {
    const payload = JSON.stringify({
      eventType: eventName,
      path: currentPath,
      referrer: currentReferrer,
      ...params,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/collect', payload);
    } else {
      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Fail silently
  }
}

// Global browser window attachment
if (typeof window !== 'undefined') {
  (window as any).trackEvent = trackEvent;
}
