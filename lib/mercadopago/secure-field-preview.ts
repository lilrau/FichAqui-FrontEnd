const CHANGE_DEBOUNCE_MS = 50;

export function buildCardDisplayDigits(bin: string, length: number): string {
  const binDigits = bin.replace(/\D/g, '');
  let result = '';

  for (let index = 0; index < length; index++) {
    result += index < binDigits.length ? binDigits[index] : '·';
  }

  return result;
}

export function getCardDisplayChar(
  index: number,
  digit: string,
  maxLen: number,
  filledLength: number
): string {
  if (index >= filledLength) return '';

  const unknown = digit === '·' || digit === 'x';
  const isFirst = index < 4;
  const isLast = index >= maxLen - 4;
  const isMiddle = !isFirst && !isLast;

  if (unknown) return '*';
  if (isMiddle) return '*';
  return digit;
}

type CardNumberLengthTracker = {
  get: () => number;
  reset: () => void;
  onBinChange: (bin: string | null | undefined) => void;
  onChange: () => void;
};

export function createCardNumberLengthTracker(
  getMaxLength: () => number,
  onUpdate: (length: number) => void
): CardNumberLengthTracker {
  let length = 0;
  let knownBin = '';
  let rafId = 0;
  let skipNextChange = false;
  let lastUpdateAt = 0;

  const clamp = (value: number) => {
    const max = getMaxLength();
    return Math.max(0, Math.min(value, max));
  };

  const applyLength = (next: number) => {
    const clamped = clamp(next);
    if (clamped === length) return;
    length = clamped;
    onUpdate(length);
  };

  const scheduleChange = (mutate: () => void) => {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      rafId = 0;
      const now = Date.now();
      if (now - lastUpdateAt < CHANGE_DEBOUNCE_MS) return;
      lastUpdateAt = now;
      mutate();
    });
  };

  return {
    get: () => length,
    reset: () => {
      length = 0;
      knownBin = '';
      skipNextChange = false;
      lastUpdateAt = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      onUpdate(0);
    },
    onBinChange: (bin) => {
      skipNextChange = true;

      // MP sends null when BIN is invalid (e.g. 1–7 digits). Never reset here.
      if (bin == null) return;

      const binDigits = bin.replace(/\D/g, '');
      const prevBinDigits = knownBin.replace(/\D/g, '');

      if (!binDigits) {
        knownBin = '';
        applyLength(0);
        return;
      }

      knownBin = bin;

      if (binDigits.length < prevBinDigits.length) {
        applyLength(binDigits.length);
        return;
      }

      applyLength(Math.max(length, binDigits.length));
    },
    onChange: () => {
      if (skipNextChange) {
        skipNextChange = false;
        return;
      }

      scheduleChange(() => {
        const max = getMaxLength();
        const binLen = knownBin.replace(/\D/g, '').length;

        if (length >= max) {
          applyLength(Math.max(binLen, length - 1));
          return;
        }

        if (binLen > 0 && length < binLen) {
          applyLength(binLen);
          return;
        }

        applyLength(length + 1);
      });
    },
  };
}

type SimpleLengthTracker = {
  reset: () => void;
  onChange: () => void;
};

export function createSimpleLengthTracker(
  getMaxLength: () => number,
  getLength: () => number,
  setLength: (value: number) => void
): SimpleLengthTracker {
  let rafId = 0;
  let lastUpdateAt = 0;

  const applyLength = (next: number) => {
    const max = getMaxLength();
    const clamped = Math.max(0, Math.min(next, max));
    if (clamped === getLength()) return;
    setLength(clamped);
  };

  return {
    reset: () => {
      lastUpdateAt = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      applyLength(0);
    },
    onChange: () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const now = Date.now();
        if (now - lastUpdateAt < CHANGE_DEBOUNCE_MS) return;
        lastUpdateAt = now;

        const current = getLength();
        const max = getMaxLength();

        if (current >= max) {
          applyLength(current - 1);
          return;
        }

        applyLength(current + 1);
      });
    },
  };
}
