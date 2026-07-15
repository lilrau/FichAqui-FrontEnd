'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/components/navigation-provider';

const fadeTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

function PageTransitionInner({ children }: { children: ReactNode }) {
  const routeKey = usePathname();
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

      <motion.div
        key={routeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={fadeTransition}
        className="page-transition-screen min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return <PageTransitionInner>{children}</PageTransitionInner>;
}
