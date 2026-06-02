import errorAnimation from '@/public/error.json';
import confirmationAnimation from '@/public/confirmation.json';

export const paymentLottie = {
  error: errorAnimation,
  success: confirmationAnimation,
} as const;

export type LottieRgba = [number, number, number, number];

/** Dark `--background` from globals.css (oklch 0.18 0.02 30) ≈ srgb. */
const DARK_BACKGROUND_LOTTIE: LottieRgba = [0.165, 0.141, 0.129, 1];

function isWhiteFill(value: unknown): value is LottieRgba {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    typeof value[2] === 'number' &&
    value[0] >= 0.99 &&
    value[1] >= 0.99 &&
    value[2] >= 0.99 &&
    value[3] > 0
  );
}

function walkAndReplaceWhiteFills(node: unknown, fill: LottieRgba): void {
  if (!node || typeof node !== 'object') return;

  const record = node as Record<string, unknown>;

  if (record.ty === 'fl' && record.c && typeof record.c === 'object') {
    const color = record.c as { k?: unknown };
    if (isWhiteFill(color.k)) {
      color.k = [...fill];
    }
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      value.forEach((child) => walkAndReplaceWhiteFills(child, fill));
    } else if (value && typeof value === 'object') {
      walkAndReplaceWhiteFills(value, fill);
    }
  }
}

/** Replace white fills on the `Empty` layer (inner circle of the success icon). */
export function applyEmptyLayerFill(
  animation: object,
  fill: LottieRgba
): object {
  const clone = structuredClone(animation) as {
    layers?: Array<{ nm?: string }>;
  };
  const emptyLayer = clone.layers?.find((layer) => layer.nm === 'Empty');
  if (!emptyLayer) return clone;

  walkAndReplaceWhiteFills(emptyLayer, fill);
  return clone;
}

export function isDarkModeActive(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/** Read themed `--background` as Lottie RGBA (0–1). */
export function getBackgroundLottieFill(): LottieRgba {
  if (typeof document === 'undefined') {
    return DARK_BACKGROUND_LOTTIE;
  }

  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;visibility:hidden;background-color:var(--background)';
  document.documentElement.appendChild(probe);

  const computed = getComputedStyle(probe).backgroundColor;
  probe.remove();

  return cssColorToLottieRgba(computed) ?? DARK_BACKGROUND_LOTTIE;
}

function cssColorToLottieRgba(css: string): LottieRgba | null {
  const normalized = css.trim();
  if (!normalized || normalized === 'transparent') return null;

  const rgbMatch = normalized.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/
  );
  if (rgbMatch) {
    return [
      Number(rgbMatch[1]) / 255,
      Number(rgbMatch[2]) / 255,
      Number(rgbMatch[3]) / 255,
      1,
    ];
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = normalized;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return null;
    return [r / 255, g / 255, b / 255, 1];
  } catch {
    return null;
  }
}

export function getThemedSuccessAnimation(): object {
  if (!isDarkModeActive()) {
    return paymentLottie.success;
  }

  return applyEmptyLayerFill(
    paymentLottie.success,
    getBackgroundLottieFill()
  );
}
