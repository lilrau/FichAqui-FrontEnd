export type ThemeValue = 'light' | 'system' | 'dark';

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resolveDarkClass(theme: ThemeValue): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncDomTheme(theme: ThemeValue) {
  const isDark = resolveDarkClass(theme);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

const THEME_TRANSITION_MS = 480;

/** Troca o tema com cross-fade (View Transitions) ou interpolação de tokens CSS. */
export function applyThemeWithTransition(
  setTheme: (theme: string) => void,
  theme: ThemeValue
) {
  const update = () => {
    syncDomTheme(theme);
    setTheme(theme);
  };

  if (prefersReducedMotion()) {
    update();
    return;
  }

  const doc = document as DocumentWithViewTransition;
  if (doc.startViewTransition) {
    doc.startViewTransition(update);
    return;
  }

  const html = document.documentElement;
  html.classList.add('theme-transition');
  update();
  window.setTimeout(() => html.classList.remove('theme-transition'), THEME_TRANSITION_MS);
}
