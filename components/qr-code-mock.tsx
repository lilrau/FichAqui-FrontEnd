import { cn } from '@/lib/utils';

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isCellFilled(qrCode: string, index: number): boolean {
  const hash = hashCode(`${qrCode}-${index}`);
  return hash % 10 > 3;
}

interface QrCodeMockProps {
  qrCode: string;
  size?: 'sm' | 'md';
}

export function QrCodeMock({ qrCode, size = 'md' }: QrCodeMockProps) {
  const dimension = size === 'sm' ? 'w-32 h-32' : 'w-48 h-48';

  return (
    <div className={cn('mx-auto bg-foreground rounded-2xl p-4 relative overflow-hidden', dimension)}>
      <div className="absolute inset-4 grid grid-cols-7 gap-1">
        {Array.from({ length: 49 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm',
              isCellFilled(qrCode, i) ? 'bg-background' : 'bg-transparent'
            )}
          />
        ))}
      </div>
    </div>
  );
}
