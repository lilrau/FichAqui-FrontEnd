'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminSubpageHeader({
  eventId,
  title,
  right,
}: {
  eventId: string;
  title: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => router.push(`/admin/${eventId}`)}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </button>
        <h1 className="font-bold text-foreground">{title}</h1>
        <div className="w-16 flex justify-end">{right}</div>
      </div>
    </header>
  );
}
