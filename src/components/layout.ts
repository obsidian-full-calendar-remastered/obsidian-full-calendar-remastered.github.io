import { hasSupportEmail, NAV_ITEMS, SITE } from '../config/site';
import { getCurrentTheme, initTheme, toggleTheme } from '../services/theme';

export type PageId = 'home' | 'ai' | 'pricing' | 'success' | 'privacy' | 'terms' | 'refunds';

function renderThemeIcon(theme: 'dark' | 'light'): string {
  if (theme === 'dark') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
}

function buildNavLinkHtml(
  item: (typeof NAV_ITEMS)[number],
  activePage: PageId
): string {
  const isCurrent = item.id === activePage;
  const externalAttrs =
    'external' in item && item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const currentAttr = isCurrent ? ' aria-current="page"' : '';
  return `<a class="nav-link" href="${item.href}"${currentAttr}${externalAttrs}>${item.label}</a>`;
}

export function mountSiteChrome(activePage: PageId): void {
  const initialTheme = initTheme();

  const headerMount = document.querySelector<HTMLElement>('[data-site-header]');
  if (headerMount) {
    const linksHtml = NAV_ITEMS.map(item => buildNavLinkHtml(item, activePage)).join('');

    headerMount.className = 'site-header';
    headerMount.innerHTML = `
      <div class="container nav-inner">
        <a class="brand-link" href="/">
          <img class="brand-logo" src="/favicon.svg" alt="" width="30" height="30" />
          <span>${SITE.name}</span>
        </a>
        <nav class="nav-links" aria-label="Primary navigation">
          ${linksHtml}
        </nav>
        <div class="nav-actions">
          <a class="btn btn-primary btn-sm nav-cta-desktop" href="/pricing/">AI Plans</a>
          <button
            type="button"
            class="icon-btn"
            data-theme-toggle
            aria-label="Toggle color theme"
            title="Toggle dark / light theme"
          >
            ${renderThemeIcon(initialTheme)}
          </button>
          <button
            type="button"
            class="icon-btn mobile-menu-btn"
            data-mobile-menu-toggle
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="mobile-drawer" data-mobile-drawer>
        <div class="mobile-drawer-links">
          ${linksHtml}
        </div>
      </div>
    `;

    const themeBtn = headerMount.querySelector<HTMLButtonElement>('[data-theme-toggle]');
    themeBtn?.addEventListener('click', () => {
      const next = toggleTheme();
      themeBtn.innerHTML = renderThemeIcon(next);
    });

    const menuBtn = headerMount.querySelector<HTMLButtonElement>('[data-mobile-menu-toggle]');
    const drawer = headerMount.querySelector<HTMLElement>('[data-mobile-drawer]');
    menuBtn?.addEventListener('click', () => {
      const isOpen = drawer?.classList.toggle('open') ?? false;
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const footerMount = document.querySelector<HTMLElement>('[data-site-footer]');
  if (footerMount) {
    const year = new Date().getFullYear();
    const contactItem = hasSupportEmail()
      ? `<li><a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a></li>`
      : `<li><a href="${SITE.issuesUrl}" target="_blank" rel="noopener noreferrer">GitHub Issues ↗</a></li>`;

    footerMount.className = 'site-footer';
    footerMount.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand-link" href="/">
              <img class="brand-logo" src="/favicon.svg" alt="" width="28" height="28" />
              <span>${SITE.name}</span>
            </a>
            <p>
              Local-first calendar for Obsidian with optional strictly GDPR-compliant,
              Zero Data Retention AI scheduling — or bring your own key for free.
            </p>
          </div>
          <div class="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="/">Overview</a></li>
              <li><a href="/ai/">Calendar AI Agent</a></li>
              <li><a href="/pricing/">Plans &amp; Pricing</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="${SITE.docsUrl}" target="_blank" rel="noopener noreferrer">Documentation ↗</a></li>
              <li><a href="${SITE.agentDocsUrl}" target="_blank" rel="noopener noreferrer">Agent Guide ↗</a></li>
              <li><a href="${SITE.repoUrl}" target="_blank" rel="noopener noreferrer">GitHub Repository ↗</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Legal &amp; Support</h4>
            <ul>
              <li><a href="/privacy/">Privacy Policy</a></li>
              <li><a href="/terms/">Terms of Service</a></li>
              <li><a href="/refunds/">Refund Policy</a></li>
              ${contactItem}
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} ${SITE.name}. Built for Obsidian.</span>
          <span>Payments &amp; VAT handled by Paddle (Merchant of Record).</span>
        </div>
      </div>
    `;
  }

  // Hydrate any inline support contact placeholders on legal pages
  const contactSlots = document.querySelectorAll<HTMLElement>('[data-support-contact]');
  for (const slot of contactSlots) {
    if (hasSupportEmail()) {
      slot.innerHTML = `<a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a> or via <a href="${SITE.issuesUrl}" target="_blank" rel="noopener noreferrer">GitHub Issues</a>`;
    } else {
      slot.innerHTML = `<a href="${SITE.issuesUrl}" target="_blank" rel="noopener noreferrer">our GitHub repository</a>`;
    }
  }

  // Keep icon synced in case theme was restored
  const current = getCurrentTheme();
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (btn) {
    btn.innerHTML = renderThemeIcon(current);
  }
}
