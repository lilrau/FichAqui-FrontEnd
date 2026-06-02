'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBarracasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/1/barracas');
  }, [router]);
  return null;
}
