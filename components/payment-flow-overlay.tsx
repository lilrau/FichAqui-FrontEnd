'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LottieOnceAnimation } from '@/components/lottie-once-animation';
import {
  getThemedSuccessAnimation,
  paymentLottie,
} from '@/lib/payment-lottie';

export type PaymentFlowPhase = 'processing' | 'error' | 'success';

interface PaymentFlowOverlayProps {
  phase: PaymentFlowPhase;
  onBackToPayment: () => void;
  onSuccessFinished: () => void;
  errorMessage?: string | null;
}

const SUCCESS_HOLD_MS = 700;

export function PaymentFlowOverlay({
  phase,
  onBackToPayment,
  onSuccessFinished,
  errorMessage,
}: PaymentFlowOverlayProps) {
  const [errorReady, setErrorReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const [successAnimation, setSuccessAnimation] = useState<object>(
    paymentLottie.success
  );

  const successLottieKey = useMemo(
    () => `success-lottie-${resolvedTheme ?? 'system'}`,
    [resolvedTheme]
  );

  useLayoutEffect(() => {
    if (phase !== 'success') return;
    setSuccessAnimation(getThemedSuccessAnimation());
  }, [phase, resolvedTheme]);

  useEffect(() => {
    if (phase !== 'error') {
      setErrorReady(false);
    }
  }, [phase]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {phase === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-12 w-12 rounded-full border-[3px] border-primary border-t-transparent"
            />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Confirmando pagamento
              </h1>
              <p className="max-w-xs text-sm text-muted-foreground">
                Aguarde enquanto processamos seu pagamento…
              </p>
            </div>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full max-w-sm flex-col items-center gap-6"
          >
            <LottieOnceAnimation
              animationData={paymentLottie.error}
              className="max-w-[260px]"
              onComplete={() => setErrorReady(true)}
            />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Pagamento não aprovado
              </h1>
              <p className="text-sm text-muted-foreground">
                {errorMessage ?? 'Não foi possível concluir o pagamento. Tente novamente.'}
              </p>
            </div>
            {errorReady && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full pt-2"
              >
                <Button
                  type="button"
                  onClick={onBackToPayment}
                  className="h-14 w-full rounded-2xl text-base font-semibold"
                >
                  Voltar ao pagamento
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full max-w-sm flex-col items-center gap-4"
          >
            <LottieOnceAnimation
              key={successLottieKey}
              animationData={successAnimation}
              className="max-w-[320px]"
              onComplete={() => {
                window.setTimeout(onSuccessFinished, SUCCESS_HOLD_MS);
              }}
            />
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">Pagamento aprovado!</h1>
              <p className="text-sm text-muted-foreground">
                Suas fichas estão sendo liberadas.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
