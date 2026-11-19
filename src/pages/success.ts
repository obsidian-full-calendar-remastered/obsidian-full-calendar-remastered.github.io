import '../styles/main.css';
import { mountSiteChrome } from '../components/layout';
import { getPaddleConfig } from '../config/paddle';
import { CLAIM_TOKEN_STORAGE_KEY } from '../services/paddleClient';

interface ClaimReadyResponse {
  status: 'ready';
  license_key: string;
  plan_tier: 'pro' | 'power';
}

interface ClaimPendingResponse {
  status: 'pending';
}

type ClaimResponse = ClaimReadyResponse | ClaimPendingResponse;

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderKeyCard(container: HTMLElement, licenseKey: string, planTier: 'pro' | 'power'): void {
  const tierLabel = planTier === 'power' ? 'Power Plan' : 'Pro Plan';
  container.hidden = false;
  container.innerHTML = `
    <div class="license-reveal-card">
      <div class="license-reveal-header">
        <span class="badge badge-emerald">✓ ${tierLabel} Active</span>
        <span style="font-size: 0.84rem; color: var(--text-muted)">Shown once — also sent to your email</span>
      </div>
      <div class="license-key-box">
        <code class="license-key-value" data-license-key-text>${escapeHtml(licenseKey)}</code>
        <button type="button" class="btn btn-primary btn-sm" data-copy-license-btn>
          Copy License Key
        </button>
      </div>
    </div>
  `;

  const copyBtn = container.querySelector<HTMLButtonElement>('[data-copy-license-btn]');
  copyBtn?.addEventListener('click', () => {
    void navigator.clipboard
      ?.writeText(licenseKey)
      .then(() => {
        copyBtn.textContent = 'Copied!';
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy License Key';
        }, 2000);
      })
      .catch(() => {
        copyBtn.textContent = 'Select & Copy';
      });
  });
}

async function pollForLicenseKey(container: HTMLElement, claimToken: string): Promise<void> {
  const { gatewayBaseUrl } = getPaddleConfig();
  container.hidden = false;
  container.innerHTML = `
    <div class="license-reveal-card">
      <p style="font-size: 0.94rem; color: var(--text-secondary)">
        Generating your instant license key… (usually takes 2–5 seconds)
      </p>
    </div>
  `;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${gatewayBaseUrl}/v1/licenses/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_token: claimToken })
      });

      if (res.status === 200) {
        const data = (await res.json()) as ClaimResponse;
        if (data.status === 'ready' && data.license_key) {
          try {
            window.sessionStorage.removeItem(CLAIM_TOKEN_STORAGE_KEY);
          } catch {
            // Ignore storage errors
          }
          renderKeyCard(container, data.license_key, data.plan_tier);
          return;
        }
      } else if (res.status === 400) {
        break;
      }
    } catch {
      // Retry on transient network hiccups while webhook finishes
    }

    await sleep(POLL_INTERVAL_MS);
  }

  container.innerHTML = `
    <div class="callout">
      <div>
        <strong>Your key is on its way by email.</strong>
        It is taking a few extra seconds to provision. Check your inbox (and spam folder) for your
        <code>fcr_live_</code> / <code>fcr_test_</code> activation key.
      </div>
    </div>
  `;
}

function readClaimToken(): string | null {
  const hashMatch = window.location.hash.match(/(?:^#|&)claim=([0-9a-f]{64})(?:&|$)/i);
  if (hashMatch?.[1]) {
    const token = hashMatch[1].toLowerCase();
    try {
      window.sessionStorage.setItem(CLAIM_TOKEN_STORAGE_KEY, token);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      // Ignore storage/history errors
    }
    return token;
  }

  try {
    const stored = window.sessionStorage.getItem(CLAIM_TOKEN_STORAGE_KEY)?.trim().toLowerCase();
    if (stored && /^[0-9a-f]{64}$/.test(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}

function initSuccessPage(): void {
  mountSiteChrome('success');

  const container = document.querySelector<HTMLElement>('[data-license-reveal]');
  if (!container) return;

  const claimToken = readClaimToken();
  if (claimToken) {
    void pollForLicenseKey(container, claimToken);
  }
}

initSuccessPage();
