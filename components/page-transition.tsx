'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FrozenRoute } from '@/components/frozen-route';
import { useNavigation } from '@/components/navigation-provider';

const fadeTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeTransition}
          className="page-transition-screen min-h-screen"
        >
          <FrozenRoute>{children}</FrozenRoute>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return <PageTransitionInner>{children}</PageTransitionInner>;
}
