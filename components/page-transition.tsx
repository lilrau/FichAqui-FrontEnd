'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/components/navigation-provider';

const fadeTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

function useRouteKey(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function PageTransitionInner({ children }: { children: ReactNode }) {
  const routeKey = useRouteKey();
  const { isPending } = useNavigation();

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {isPending && (
          <motion.div
            key="nav-pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 0.85,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
              style={{ width: '40%' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen">{children}</div>}>
      <PageTransitionInner>{children}</PageTransitionInner>
    </Suspense>
  );
}
