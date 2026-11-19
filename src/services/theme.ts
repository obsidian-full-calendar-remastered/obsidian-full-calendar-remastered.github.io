export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'fcr-site-theme';

export function getCurrentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function initTheme(): Theme {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }

  const resolved: Theme = saved === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
