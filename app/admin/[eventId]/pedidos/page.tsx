'use client';

import { useParams } from 'next/navigation';
import { PedidosBoard } from '@/components/admin/pedidos-board';

export default function AdminPedidosPage() {
  const { eventId } = useParams();
  return <PedidosBoard eventId={eventId as string} />;
}
