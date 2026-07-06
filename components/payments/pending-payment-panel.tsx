'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentStatusPoll } from '@/lib/hooks/use-payment-status-poll';
import type { PaymentInfo } from '@/lib/types/payment';

interface PendingPaymentPanelProps {
  payment: PaymentInfo;
  onApproved: () => void;
  onRejected: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  approvedMessage?: string;
}

export function PendingPaymentPanel({
  payment,
  onApproved,
  onRejected,
  onCancel,
  title = 'Confirmando pagamento',
  message = 'Estamos aguardando a confirmação do seu cartão. Suas fichas serão liberadas assim que o pagamento for aprovado.',
  approvedMessage = 'Preparando seu pedido?',
}: PendingPaymentPanelProps) {
  const approvedHandledRef = useRef(false);
  const { isApproved, isRejected, error } = usePaymentStatusPoll(payment.id);

  useEffect(() => {
    if (!isApproved || approvedHandledRef.current) return;
    approvedHandledRef.current = true;
    onApproved();
  }, [isApproved, onApproved]);

  useEffect(() => {
    if (isRejected) onRejected();
  }, [isRejected, onRejected]);

  if (isApproved) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full max-w-sm flex-col items-center gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.15, 1] }}
              transition={{ delay: 0.1 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">Pagamento aprovado!</h1>
              <p className="text-sm text-muted-foreground">{approvedMessage}</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-[3px] border-primary border-t-transparent"
            />
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md space-y-6"
        >
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
            />
            Aguardando confirmação do pagamento?
          </div>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}

          <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
            Voltar ao pagamento
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
