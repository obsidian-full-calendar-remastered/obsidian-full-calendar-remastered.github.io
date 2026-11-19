import { initializePaddle, type Paddle, type PaddleEventData } from '@paddle/paddle-js';
import {
  getPaddleConfig,
  getPriceIdForPlan,
  isPaddleConfigured,
  type PaddleConfig
} from '../config/paddle';
import { SITE, type PaidPlanId } from '../config/site';
import { getCurrentTheme } from './theme';

export interface LocalizedPrice {
  planId: PaidPlanId;
  formattedTotal: string;
  currencyCode: string;
  taxLabel: string;
}

export type LocalizedPriceMap = Partial<Record<PaidPlanId, LocalizedPrice>>;

let paddlePromise: Promise<Paddle | null> | null = null;
let checkoutCompletedListener: (() => void) | null = null;

export function onCheckoutCompleted(listener: () => void): void {
  checkoutCompletedListener = listener;
}

function handlePaddleEvent(event: PaddleEventData): void {
  if (event.name === 'checkout.completed') {
    checkoutCompletedListener?.();
  }
}

export async function getPaddleInstance(
  config: PaddleConfig = getPaddleConfig()
): Promise<Paddle | null> {
  if (!isPaddleConfigured(config)) {
    return null;
  }

  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: config.environment,
      token: config.clientToken,
      eventCallback: handlePaddleEvent
    })
      .then(instance => instance ?? null)
      .catch(err => {
        console.error('[FCR Paddle] Failed to initialize Paddle.js:', err);
        paddlePromise = null;
        return null;
      });
  }

  return paddlePromise;
}

export async function fetchLocalizedPrices(
  config: PaddleConfig = getPaddleConfig()
): Promise<LocalizedPriceMap> {
  const paddle = await getPaddleInstance(config);
  if (!paddle) {
    return {};
  }

  const response = await paddle.PricePreview({
    items: [
      { priceId: config.priceIds.pro, quantity: 1 },
      { priceId: config.priceIds.power, quantity: 1 }
    ]
  });

  const result: LocalizedPriceMap = {};
  const lineItems = response.data?.details?.lineItems ?? [];
  const currencyCode = response.data?.currencyCode ?? 'USD';

  for (const item of lineItems) {
    const priceId = item.price?.id;
    let planId: PaidPlanId | null = null;
    if (priceId === config.priceIds.pro) {
      planId = 'pro';
    } else if (priceId === config.priceIds.power) {
      planId = 'power';
    }

    if (!planId) continue;

    const formattedTotal = item.formattedTotals?.total || item.formattedTotals?.subtotal;
    if (!formattedTotal) continue;

    const taxMode = item.price?.taxMode;
    const taxLabel =
      taxMode === 'internal'
        ? `Localized (${currencyCode}) · tax included`
        : `Localized (${currencyCode}) · plus applicable tax`;

    result[planId] = {
      planId,
      formattedTotal,
      currencyCode,
      taxLabel
    };
  }

  return result;
}

export async function openPlanCheckout(
  planId: PaidPlanId,
  customerEmail?: string
): Promise<void> {
  const config = getPaddleConfig();
  if (!isPaddleConfigured(config)) {
    throw new Error(
      'Paddle checkout is not configured yet. Add VITE_PADDLE_CLIENT_TOKEN and price IDs to your environment.'
    );
  }

  const paddle = await getPaddleInstance(config);
  if (!paddle) {
    throw new Error('Unable to load Paddle checkout right now. Please disable ad blockers or try again.');
  }

  const priceId = getPriceIdForPlan(planId, config);
  const trimmedEmail = customerEmail?.trim();
  const successUrl =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `${window.location.origin}/success/`
      : `${SITE.url}/success/`;

  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    ...(trimmedEmail ? { customer: { email: trimmedEmail } } : {}),
    settings: {
      displayMode: 'overlay',
      theme: getCurrentTheme(),
      locale: 'en',
      successUrl
    }
  });
}
