'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/components/navigation-provider';

const transition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 34,
  mass: 0.85,
};

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
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
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={transition}
          className="min-h-screen will-change-[opacity,transform]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
