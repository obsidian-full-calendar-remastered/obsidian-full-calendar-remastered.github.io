const UMAMI_SCRIPT_SRC = 'https://injest.destyleer.in.net/assets/js/theme-utils.js';
const UMAMI_HOST_URL = 'https://injest.destyleer.in.net';
const UMAMI_WEBSITE_ID = 'b18306c0-3f20-4089-baaf-bcb771cb9cd2';
const SITE_PATH_PREFIX = '/site';

type UmamiPayload = { url?: string; [key: string]: unknown };

declare global {
  interface Window {
    cleanUmamiUrl?: (type: string, payload: UmamiPayload) => UmamiPayload;
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      identify?: (traits: Record<string, unknown>) => void;
    };
  }
}

let initialized = false;
let scriptLoaded = false;
const pendingEvents: Array<{ name: string; data?: Record<string, unknown> }> = [];

function normalizeSitePath(rawPath: string): string {
  const withoutQueryOrHash = rawPath.split(/[?#]/)[0] || '/';
  const path = withoutQueryOrHash.startsWith('/') ? withoutQueryOrHash : `/${withoutQueryOrHash}`;
  if (path === SITE_PATH_PREFIX || path.startsWith(`${SITE_PATH_PREFIX}/`)) {
    return path;
  }
  return `${SITE_PATH_PREFIX}${path}`;
}

function sendToUmami(eventName: string, eventData?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.umami || typeof window.umami.track !== 'function') {
    return;
  }
  const payload = eventData ? { ...eventData } : undefined;
  if (payload && typeof payload.page === 'string') {
    payload.page = normalizeSitePath(payload.page);
  }
  window.umami.track(eventName, payload);
}

export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!scriptLoaded || !window.umami || typeof window.umami.track !== 'function') {
    if (pendingEvents.length < 25) {
      pendingEvents.push({ name: eventName, data: eventData });
    }
    return;
  }
  sendToUmami(eventName, eventData);
}

export function syncSessionProperties(): void {
  if (typeof window === 'undefined' || !window.umami || typeof window.umami.identify !== 'function') {
    return;
  }
  const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  window.umami.identify({
    theme_preference: activeTheme,
    screen_tier:
      window.innerWidth > 1200 ? 'desktop_wide' : window.innerWidth > 768 ? 'tablet' : 'mobile',
    device_orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    browser_language: navigator.language || 'unknown'
  });
}

function bindScrollMilestone(): void {
  let triggered = false;
  const onScroll = (): void => {
    if (triggered) return;
    const doc = document.documentElement;
    const scrollable = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    if (scrollable <= 0) return;
    const percent = ((doc.scrollTop || document.body.scrollTop) / scrollable) * 100;
    if (percent >= 90) {
      triggered = true;
      trackEvent('scrolled_90', { page: window.location.pathname });
      window.removeEventListener('scroll', onScroll);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

function bindLinkTracking(): void {
  document.addEventListener('click', ev => {
    const anchor = (ev.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    const currentPath = window.location.pathname;

    if (/^\/pricing(?:\/?(?:[?#].*)?)$/.test(href)) {
      trackEvent('cta_pricing_click', {
        label: (anchor.textContent || '').trim().slice(0, 60),
        page: currentPath
      });
      return;
    }

    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const target = new URL(href);
        if (
          target.hostname !== window.location.hostname &&
          target.hostname !== 'injest.destyleer.in.net'
        ) {
          trackEvent('outbound_exit', {
            destination: href,
            page: currentPath
          });
        }
      } catch {
        // Ignore malformed URLs
      }
    }
  });
}

export function initSiteAnalytics(): void {
  if (initialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  initialized = true;

  window.cleanUmamiUrl = (_type: string, payload: UmamiPayload): UmamiPayload => {
    if (payload && typeof payload.url === 'string') {
      payload.url = normalizeSitePath(payload.url);
    }
    return payload;
  };

  const script = document.createElement('script');
  script.src = UMAMI_SCRIPT_SRC;
  script.defer = true;
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  script.setAttribute('data-host-url', UMAMI_HOST_URL);
  script.setAttribute('data-before-send', 'cleanUmamiUrl');
  script.setAttribute('data-performance', 'true');
  script.onload = () => {
    scriptLoaded = true;
    syncSessionProperties();
    while (pendingEvents.length > 0) {
      const next = pendingEvents.shift();
      if (next) {
        sendToUmami(next.name, next.data);
      }
    }
  };
  document.head.appendChild(script);

  bindScrollMilestone();
  bindLinkTracking();
}
