import '../styles/main.css';
import { mountSiteChrome } from '../components/layout';
import { getPaddleConfig, isPaddleConfigured } from '../config/paddle';
import { PLANS, SITE, type PaidPlanId, type PlanSpec } from '../config/site';
import {
  fetchLocalizedPrices,
  onCheckoutCompleted,
  openPlanCheckout,
  type LocalizedPriceMap
} from '../services/paddleClient';

function isPaidPlan(id: PlanSpec['id']): id is PaidPlanId {
  return id === 'pro' || id === 'power';
}

function renderPlanCard(plan: PlanSpec, highlightedPlan: string | null): string {
  const classes = ['pricing-card'];
  if (plan.featured) classes.push('featured');
  if (highlightedPlan === plan.id) classes.push('highlighted');

  const badgeHtml = plan.badge
    ? `<span class="badge badge-accent pricing-badge">${plan.badge}</span>`
    : '';

  const featuresHtml = plan.features
    .map(f => `<li><span class="check" aria-hidden="true">✓</span><span>${f}</span></li>`)
    .join('');

  const ctaHtml = isPaidPlan(plan.id)
    ? `<button type="button" class="btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} btn-lg btn-block" data-checkout-plan="${plan.id}">${plan.ctaLabel}</button>`
    : `<a class="btn btn-secondary btn-lg btn-block" href="${SITE.agentDocsUrl}" target="_blank" rel="noopener noreferrer">${plan.ctaLabel} ↗</a>`;

  return `
    <article class="${classes.join(' ')}" data-plan-card="${plan.id}">
      ${badgeHtml}
      <div class="pricing-tier">${plan.name}</div>
      <p class="pricing-subtitle">${plan.tagline}</p>
      <div class="pricing-price-row">
        <span class="pricing-amount" data-price-amount="${plan.id}">${plan.fallbackPrice}</span>
        <span class="pricing-cadence">${plan.cadence}</span>
      </div>
      <div class="pricing-tax-note" data-price-tax="${plan.id}">
        ${isPaidPlan(plan.id) ? 'USD base price · localized at checkout' : 'No credit card required'}
      </div>
      <div class="pricing-allowance">${plan.allowance}</div>
      <ul class="pricing-features">${featuresHtml}</ul>
      ${ctaHtml}
    </article>
  `;
}

function setStatusBanner(
  kind: 'info' | 'amber' | 'danger' | 'emerald',
  html: string
): void {
  const el = document.querySelector<HTMLElement>('[data-pricing-status]');
  if (!el) return;
  const clsMap = {
    info: 'callout',
    amber: 'callout callout-amber',
    danger: 'callout callout-danger',
    emerald: 'callout callout-emerald'
  };
  el.className = clsMap[kind];
  el.innerHTML = html;
  el.hidden = false;
}

function applyLocalizedPrices(prices: LocalizedPriceMap): void {
  for (const planId of ['pro', 'power'] as const) {
    const entry = prices[planId];
    if (!entry) continue;

    const amountEl = document.querySelector<HTMLElement>(`[data-price-amount="${planId}"]`);
    const taxEl = document.querySelector<HTMLElement>(`[data-price-tax="${planId}"]`);
    if (amountEl) amountEl.textContent = entry.formattedTotal;
    if (taxEl) taxEl.textContent = entry.taxLabel;
  }
}

async function initPricingPage(): Promise<void> {
  mountSiteChrome('pricing');

  const params = new URLSearchParams(window.location.search);
  const requestedPlan = params.get('plan')?.toLowerCase() ?? null;
  const prefillEmailParam = params.get('email')?.trim() ?? '';

  const grid = document.querySelector<HTMLElement>('[data-pricing-grid]');
  if (grid) {
    grid.innerHTML = PLANS.map(plan => renderPlanCard(plan, requestedPlan)).join('');
  }

  const emailInput = document.querySelector<HTMLInputElement>('[data-checkout-email]');
  if (emailInput && prefillEmailParam) {
    emailInput.value = prefillEmailParam;
  }

  const config = getPaddleConfig();
  const configured = isPaddleConfigured(config);

  if (configured && config.environment === 'sandbox') {
    setStatusBanner(
      'amber',
      `<div><strong>Sandbox Mode Active:</strong> Paddle checkout is running against your Paddle Sandbox environment. Use Paddle test cards to verify the full license-key delivery flow.</div>`
    );
  } else if (!configured) {
    setStatusBanner(
      'info',
      `<div><strong>Paddle Checkout Setup Pending:</strong> Configure <code>VITE_PADDLE_CLIENT_TOKEN</code>, <code>VITE_PADDLE_PRICE_ID_PRO</code>, and <code>VITE_PADDLE_PRICE_ID_POWER</code> in <code>.env</code> (or GitHub Actions variables) to activate live localized pricing and overlay checkout.</div>`
    );
  }

  onCheckoutCompleted(() => {
    setStatusBanner(
      'emerald',
      `<div><strong>Payment complete!</strong> Redirecting you to activation instructions… Your license key is on its way to your email.</div>`
    );
    window.setTimeout(() => {
      window.location.assign('/success/');
    }, 1200);
  });

  // Bind checkout buttons
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-checkout-plan]');
  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const planId = btn.dataset.checkoutPlan as PaidPlanId | undefined;
      if (!planId) return;

      const originalText = btn.textContent ?? 'Subscribe';
      btn.disabled = true;
      btn.textContent = 'Opening checkout…';

      const email = emailInput?.value.trim() || undefined;
      void openPlanCheckout(planId, email)
        .catch(err => {
          const message = err instanceof Error ? err.message : 'Unable to open checkout.';
          setStatusBanner('danger', `<div><strong>Checkout unavailable:</strong> ${message}</div>`);
        })
        .finally(() => {
          btn.disabled = false;
          btn.textContent = originalText;
        });
    });
  }

  // Hydrate localized prices from Paddle.PricePreview
  if (configured) {
    try {
      const localized = await fetchLocalizedPrices(config);
      applyLocalizedPrices(localized);
    } catch (err) {
      console.warn('[FCR Paddle] PricePreview fallback to USD:', err);
    }
  }

  // Smoothly scroll to deep-linked plan if ?plan=pro or ?plan=power
  if (requestedPlan === 'pro' || requestedPlan === 'power') {
    const target = document.querySelector<HTMLElement>(`[data-plan-card="${requestedPlan}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

void initPricingPage();
