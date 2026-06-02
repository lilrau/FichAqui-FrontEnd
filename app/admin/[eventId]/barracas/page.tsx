'use client';

import { useParams } from 'next/navigation';
import { BarracasManager } from '@/components/admin/barracas-manager';

export default function BarracasPage() {
  const { eventId } = useParams();
  return <BarracasManager eventId={eventId as string} />;
}
