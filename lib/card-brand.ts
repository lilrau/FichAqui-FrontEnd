/**
 * Detecção de bandeira por BIN/número.
 * Elo deve ser testada por último (sobreposição com Visa/Master).
 */

export type CardNetwork =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'hipercard'
  | 'banese'
  | 'cabal'
  | 'sorocred'
  | 'valecard'
  | 'elo';

export type CardBrand = CardNetwork;

const BRAND_PATTERNS: { brand: CardNetwork; pattern: RegExp }[] = [
  { brand: 'visa', pattern: /^4\d{12}(?:\d{3})?$/ },
  {
    brand: 'mastercard',
    pattern:
      /^(5[1-5]\d{4}|222[1-9]\d{2}|22[3-9]\d{3}|2[3-6]\d{4}|27[01]\d{3}|2720\d{2})\d{10}$/,
  },
  { brand: 'amex', pattern: /^3[47]\d{13}$/ },
  { brand: 'discover', pattern: /^6(?:011|5\d{2}|4[4-9]\d)\d{12}$/ },
  { brand: 'diners', pattern: /^3(?:0[0-5]|[68]\d)\d{11}$/ },
  { brand: 'jcb', pattern: /^(?:2131|1800|35\d{3})\d{11}$/ },
  { brand: 'hipercard', pattern: /^(?:606282\d{10}|3841(?:[046])0\d{11})$/ },
  { brand: 'banese', pattern: /^636117\d+$/ },
  { brand: 'cabal', pattern: /^(?:60420[1-9]|6042[1-9]\d|6043\d{2}|604400)\d+$/ },
  { brand: 'sorocred', pattern: /^(?:627892|636414)\d+$/ },
  { brand: 'valecard', pattern: /^(?:606444|606458|606482)\d+$/ },
  {
    brand: 'elo',
    pattern:
      /^(?:4011(78|79)|43(1274|8935)|45(1416|7393|763[12])|50(4175|6699|67[0-6]\d|677[0-8]|9[0-8]\d{2}|99[0-8]\d|999[0-9])|627780|63(6297|6368|6369)|65(0(0(3([1-3]|[5-9])|4\d|5[0-1])|4(0[5-9]|[1-3]\d|8[5-9]|9\d)|5([0-2]\d|3[0-8]|4[1-9]|[5-8]\d|9[0-8])|7(0\d|1[0-8]|2[0-7])|9(0[1-9]|[1-6]\d|7[0-8]))|16(5[2-9]|[6-7]\d)|50(0\d|1\d|2[1-9]|[3-4]\d|5[0-8])))\d{10}$/,
  },
];

/** Prefixos enquanto o usuário digita (mesma ordem: Elo por último). */
const PARTIAL_RULES: { brand: CardNetwork; test: (digits: string) => boolean }[] = [
  { brand: 'visa', test: (d) => /^4/.test(d) },
  {
    brand: 'mastercard',
    test: (d) => /^(5[1-5]|22[2-9]|2[3-7])/.test(d),
  },
  { brand: 'amex', test: (d) => /^3[47]/.test(d) },
  { brand: 'discover', test: (d) => /^6(?:011|5|4[4-9])/.test(d) },
  { brand: 'diners', test: (d) => /^3(?:0[0-5]|[68])/.test(d) },
  { brand: 'jcb', test: (d) => /^(?:2131|1800|35)/.test(d) },
  { brand: 'hipercard', test: (d) => /^(?:606282|3841)/.test(d) },
  { brand: 'banese', test: (d) => /^636117/.test(d) },
  { brand: 'cabal', test: (d) => /^6042/.test(d) },
  { brand: 'sorocred', test: (d) => /^(?:627892|636414)/.test(d) },
  { brand: 'valecard', test: (d) => /^(?:606444|606458|606482)/.test(d) },
  {
    brand: 'elo',
    test: (d) =>
      /^(?:4011(78|79)|43(1274|8935)|45(1416|7393|763)|5067|509|627780|636(297|368|369)|650)/.test(
        d
      ),
  },
];

export function detectCardNetwork(digits: string): CardNetwork | null {
  const normalized = digits.replace(/\D/g, '');
  if (!normalized) return null;

  for (const { brand, pattern } of BRAND_PATTERNS) {
    if (pattern.test(normalized)) return brand;
  }

  for (const { brand, test } of PARTIAL_RULES) {
    if (test(normalized)) return brand;
  }

  return null;
}

/** @deprecated Use detectCardNetwork */
export function detectCardBrand(digits: string): CardNetwork | null {
  return detectCardNetwork(digits);
}

export function getCardNumberLength(brand: CardNetwork | null): number {
  switch (brand) {
    case 'amex':
      return 15;
    case 'diners':
      return 14;
    default:
      return 16;
  }
}

export function getCardNumberGroups(brand: CardNetwork | null): number[] {
  switch (brand) {
    case 'amex':
      return [4, 6, 5];
    case 'diners':
      return [4, 6, 4];
    default:
      return [4, 4, 4, 4];
  }
}

export const CARD_BRAND_LABELS: Record<CardNetwork, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  elo: 'Elo',
  hipercard: 'Hipercard',
  banese: 'Banese Card',
  cabal: 'Cabal',
  sorocred: 'Sorocred',
  valecard: 'Valecard',
};

/** Caminho dos ícones em public/card-brands/ (SVG ou PNG). */
export function getCardBrandIconPath(brand: CardNetwork): string {
  return `/card-brands/${brand}.svg`;
}
