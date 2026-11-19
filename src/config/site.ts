export type PaidPlanId = 'pro' | 'power';
export type PlanId = 'trial' | PaidPlanId;

export interface PlanSpec {
  id: PlanId;
  name: string;
  tagline: string;
  fallbackPrice: string;
  cadence: string;
  allowance: string;
  badge?: string;
  featured?: boolean;
  ctaLabel: string;
  features: string[];
}

export const SITE = {
  name: 'Full Calendar Remastered',
  shortName: 'FCR',
  domain: 'full-calendar-remastered.in',
  url: 'https://full-calendar-remastered.in',
  repoUrl: 'https://github.com/obsidian-full-calendar-remastered/plugin-full-calendar',
  issuesUrl: 'https://github.com/obsidian-full-calendar-remastered/plugin-full-calendar/issues',
  docsUrl: 'https://obsidian-full-calendar-remastered.github.io/plugin-full-calendar/',
  agentDocsUrl:
    'https://obsidian-full-calendar-remastered.github.io/plugin-full-calendar/user/features/agent/',
  gatewayUrl: 'https://gateway.full-calendar-remastered.in',
  /**
   * Leave blank until you are ready to publish a dedicated support address.
   * When populated (e.g. "support@full-calendar-remastered.in"), it automatically
   * appears in the footer and legal pages.
   */
  supportEmail: 'support@full-calendar-remastered.in'
} as const;

export function hasSupportEmail(): boolean {
  return SITE.supportEmail.trim().length > 0;
}

export const PLANS: readonly PlanSpec[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    tagline: 'Explore the Calendar Agent right inside Obsidian — no signup or card required.',
    fallbackPrice: '$0',
    cadence: 'one-time lifetime',
    allowance: '1,000,000 credits (lifetime)',
    ctaLabel: 'Start inside Obsidian',
    features: [
      'Up to 1M input, 10M cached, or 250k output tokens',
      '1 active device · 16k token context window',
      'Strictly GDPR-compliant & Zero Data Retention (EU)',
      'Approval-gated calendar creates, edits & deletes',
      'No account, credit card, or API key required'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Ideal for daily personal scheduling, vault planning, and multi-device workflows.',
    fallbackPrice: '$7',
    cadence: '/ month',
    allowance: '10,000,000 credits / month',
    badge: 'Most Popular',
    featured: true,
    ctaLabel: 'Subscribe to Pro',
    features: [
      'Up to 10M input, 100M cached, or 2.5M output tokens',
      '3 active devices · 32k token context window',
      'Monthly allowance resets every billing cycle',
      'Strictly GDPR-compliant & Zero Data Retention (EU)',
      'Instant license key emailed after checkout'
    ]
  },
  {
    id: 'power',
    name: 'Power',
    tagline: 'Built for heavy daily agent usage across all your Obsidian vaults and devices.',
    fallbackPrice: '$11',
    cadence: '/ month',
    allowance: '24,000,000 credits / month',
    ctaLabel: 'Subscribe to Power',
    features: [
      'Up to 24M input, 240M cached, or 6M output tokens',
      '5 active devices · 32k token context window',
      'High-volume allowance with prorated upgrades',
      'Strictly GDPR-compliant & Zero Data Retention (EU)',
      'Instant license key emailed after checkout'
    ]
  }
] as const;

export const NAV_ITEMS = [
  { id: 'home', label: 'Overview', href: '/' },
  { id: 'ai', label: 'AI Agent', href: '/ai/' },
  { id: 'pricing', label: 'Pricing', href: '/pricing/' },
  { id: 'docs', label: 'Docs ↗', href: SITE.docsUrl, external: true },
  { id: 'github', label: 'GitHub ↗', href: SITE.repoUrl, external: true }
] as const;
