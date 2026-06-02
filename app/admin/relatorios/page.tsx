'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRelatoriosRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/1/relatorios');
  }, [router]);
  return null;
}
