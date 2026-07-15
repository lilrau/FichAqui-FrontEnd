/** ISO `YYYY-MM-DD` → `DD/MM/YYYY` (pt-BR). */
export function formatIsoDateBr(value: string | null | undefined): string {
  if (!value) return '—';

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('pt-BR');
}
