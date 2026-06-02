'use client';

import { useParams } from 'next/navigation';
import { RelatoriosDashboard } from '@/components/admin/relatorios-dashboard';

export default function RelatoriosPage() {
  const { eventId } = useParams();
  return <RelatoriosDashboard eventId={eventId as string} />;
}
