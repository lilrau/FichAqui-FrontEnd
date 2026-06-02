'use client';

import { useParams } from 'next/navigation';
import { EventoForm } from '@/components/admin/evento-form';

export default function EventoPage() {
  const { eventId } = useParams();
  return <EventoForm eventId={eventId as string} />;
}
