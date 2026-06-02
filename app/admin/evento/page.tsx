'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEventoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/1/evento');
  }, [router]);
  return null;
}
