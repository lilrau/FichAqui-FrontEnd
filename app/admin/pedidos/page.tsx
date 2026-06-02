'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPedidosRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/1/pedidos');
  }, [router]);
  return null;
}
