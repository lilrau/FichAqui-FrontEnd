export function formatBrl(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function pickupPercent(delivered: number, issued: number): number {
  if (issued <= 0) return 0;
  return Math.round((delivered / issued) * 100);
}
