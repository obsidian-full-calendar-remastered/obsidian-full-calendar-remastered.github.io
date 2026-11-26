import { SITE, type PaidPlanId } from './site';

export type PaddleEnvironment = 'sandbox' | 'production';

export interface PaddleConfig {
  environment: PaddleEnvironment;
  clientToken: string;
  gatewayBaseUrl: string;
  priceIds: Record<PaidPlanId, string>;
}

function readEnv(key: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function getPaddleConfig(): PaddleConfig {
  const rawEnv = readEnv('VITE_PADDLE_ENV').toLowerCase();
  const environment: PaddleEnvironment = rawEnv === 'production' ? 'production' : 'sandbox';
  const defaultGateway =
    environment === 'production'
      ? SITE.gatewayUrl
      : 'https://staging-gateway.full-calendar-remastered.in';

  return {
    environment,
    clientToken: readEnv('VITE_PADDLE_CLIENT_TOKEN'),
    gatewayBaseUrl: (readEnv('VITE_GATEWAY_URL') || defaultGateway).replace(/\/+$/, ''),
    priceIds: {
      pro: readEnv('VITE_PADDLE_PRICE_ID_PRO'),
      power: readEnv('VITE_PADDLE_PRICE_ID_POWER')
    }
  };
}

export function isPaddleConfigured(config: PaddleConfig = getPaddleConfig()): boolean {
  return Boolean(config.clientToken && config.priceIds.pro && config.priceIds.power);
}

export function getPriceIdForPlan(
  planId: PaidPlanId,
  config: PaddleConfig = getPaddleConfig()
): string {
  return config.priceIds[planId];
}
