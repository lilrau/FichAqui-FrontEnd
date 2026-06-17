'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, PartyPopper } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { checkoutOrder, type CheckoutPaymentMethod } from '@/lib/checkout';
import { getErrorMessage } from '@/lib/api/errors';
import { buildConsumerEventHref } from '@/lib/consumer-scope';
import { useEventId } from '@/lib/event-context';
import { formatWalletBalance, useWallet } from '@/lib/wallet-context';
import { useUserOrders } from '@/lib/user-orders-context';
import { OrderStatus, OrderQRCode } from '@/components/order-status';
import type { Order } from '@/lib/types/event-domain';
import { CardBrandLogo } from '@/components/card-brand-logo';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/menu-item-card';
import {
  PaymentFlowOverlay,
  type PaymentFlowPhase,
} from '@/components/payment-flow-overlay';
import { cn } from '@/lib/utils';

type PaymentMethod = CheckoutPaymentMethod;

function buildPaymentOptions(balance: number, total: number) {
  const walletDisabled = balance < total;

  return [
    {
      id: 'wallet' as const,
      label: 'Saldo da carteira',
      hint: walletDisabled
        ? `Saldo insuficiente (R$ ${formatWalletBalance(balance)})`
        : `Usar saldo disponível (R$ ${formatWalletBalance(balance)})`,
      disabled: walletDisabled,
    },
    { id: 'pix' as const, label: 'PIX', hint: 'Pagamento instantâneo' },
    {
      id: 'card' as const,
      label: 'Cartão de crédito',
      hint: 'Cobrança no crédito do cartão selecionado',
    },
  ];
}

const paymentSelectTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

function PedidoContent() {
  const router = useRouter();
  const eventId = useEventId();
  const { items, total, fulfillOrder, currentOrder, setCurrentOrder } = useCart();
  const { savedCards, defaultCard, balance, refreshWallet } = useWallet();
  const { refreshUserOrders } = useUserOrders();
  const cardapioHref = buildConsumerEventHref('/cardapio', eventId);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowPhase | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  const paymentOptions = buildPaymentOptions(balance, total);
  const canPayWithWallet = balance >= total;
  const canPayWithCard =
    paymentMethod !== 'card' || (savedCards.length > 0 && Boolean(selectedCardId));

  useEffect(() => {
    if (defaultCard) {
      setSelectedCardId(defaultCard.id);
    }
  }, [defaultCard]);

  const handleConfirm = async () => {
    if (items.length === 0) return;
    if (paymentMethod === 'card' && !selectedCardId) return;

    setIsConfirming(true);
    setPaymentFlow('processing');
    setPaymentError(null);

    try {
      const order = await checkoutOrder(eventId, items, paymentMethod, {
        cardId: selectedCardId,
      });
      await refreshWallet();
      await refreshUserOrders();
      setPendingOrder(order);
      setPaymentFlow('success');
    } catch (error) {
      setPaymentError(getErrorMessage(error, 'Não foi possível concluir o pagamento.'));
      setPaymentFlow('error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackToPayment = () => {
    setPaymentFlow(null);
    setPaymentError(null);
    setIsConfirming(false);
    setPendingOrder(null);
  };

  const handlePaymentSuccessFinished = () => {
    if (pendingOrder) {
      fulfillOrder(pendingOrder);
      setPendingOrder(null);
    }
    setShowSuccess(true);
    setPaymentFlow(null);
    setIsConfirming(false);
  };

  if (paymentFlow) {
    return (
      <PaymentFlowOverlay
        phase={paymentFlow}
        onBackToPayment={handleBackToPayment}
        onSuccessFinished={handlePaymentSuccessFinished}
        errorMessage={paymentError}
      />
    );
  }

  const hasNewCheckout = items.length > 0;

  // Pedido concluído — só quando o carrinho está vazio (nova compra usa o checkout)
  if ((currentOrder || showSuccess) && !hasNewCheckout) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => router.push(cardapioHref)}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
              Voltar ao cardápio
            </button>
          </div>
        </header>

        <main className="px-4 py-6 space-y-6">
          {/* Success Animation */}
          {showSuccess && !currentOrder && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2 }}
                className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <Check className="h-12 w-12 text-green-500" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-xl font-bold text-foreground"
              >
                Pedido confirmado!
              </motion.p>
            </motion.div>
          )}

          {currentOrder && (
            <>
              <OrderStatus order={currentOrder} />
              <OrderQRCode order={currentOrder} />

              {/* Order Items */}
              <div className="rounded-2xl bg-card p-4 shadow-md border border-border">
                <h3 className="font-bold text-card-foreground mb-4">Itens do pedido</h3>
                <div className="space-y-3">
                  {currentOrder.items.map((cartItem) => (
                    <div
                      key={cartItem.item.id}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">
                        {cartItem.item.image}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {cartItem.quantity}x {cartItem.item.name}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        R$ {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {currentOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Back Button */}
              <Button
                onClick={() => {
                  setCurrentOrder(null);
                  setShowSuccess(false);
                  router.push(cardapioHref);
                }}
                variant="outline"
                className="w-full h-14 rounded-xl text-lg"
              >
                <PartyPopper className="mr-2 h-5 w-5" />
                Fazer novo pedido
              </Button>
            </>
          )}
        </main>
      </div>
    );
  }

  // Tela de confirmação do pedido
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Confirmar Pedido</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 pb-32">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
              🛒
            </div>
            <p className="mt-4 font-semibold text-foreground">Carrinho vazio</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione itens do cardápio
            </p>
            <Button
              onClick={() => router.push(cardapioHref)}
              className="mt-6"
            >
              Ver cardápio
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-foreground">Seus itens</h2>
            
            {items.map((cartItem) => (
              <MenuItemCard
                key={cartItem.item.id}
                item={cartItem.item}
                variant="compact"
              />
            ))}

            {/* Summary */}
            <div className="mt-6 rounded-2xl bg-card p-4 shadow-md border border-border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de serviço</span>
                  <span className="text-foreground">R$ 0,00</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-card p-4 shadow-md border border-border">
              <h3 className="font-bold text-card-foreground mb-3">Forma de pagamento</h3>
              <LayoutGroup id="pedido-payment-method">
                <div className="space-y-2">
                  {paymentOptions.map((option) => {
                    const selected = paymentMethod === option.id;

                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'relative flex items-center gap-3 rounded-xl p-3',
                          option.disabled
                            ? 'cursor-not-allowed opacity-50 bg-secondary'
                            : 'cursor-pointer',
                          !selected && !option.disabled && 'bg-secondary'
                        )}
                      >
                        {selected && !option.disabled && (
                          <motion.div
                            layoutId="pedido-payment-method-active"
                            className="absolute inset-0 rounded-xl border border-primary bg-primary/5"
                            transition={paymentSelectTransition}
                          />
                        )}
                        <input
                          type="radio"
                          name="payment"
                          checked={selected}
                          disabled={option.disabled}
                          onChange={() => setPaymentMethod(option.id)}
                          className="relative z-10 h-5 w-5 accent-primary"
                        />
                        <div className="relative z-10 min-w-0 flex-1">
                          <span
                            className={cn(
                              'font-medium text-foreground',
                              selected && 'text-primary'
                            )}
                          >
                            {option.label}
                          </span>
                          {option.hint && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {option.hint}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {paymentMethod === 'card' && savedCards.length === 0 && (
                    <motion.p
                      key="no-cards"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 text-sm text-muted-foreground"
                    >
                      Nenhum cartão salvo na carteira. Escolha PIX ou saldo.
                    </motion.p>
                  )}
                  {paymentMethod === 'card' && savedCards.length > 0 && (
                    <motion.div
                      key="saved-cards"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Cartão de crédito para cobrança
                        </p>
                        <LayoutGroup id="pedido-payment-card">
                          {savedCards.map((card, index) => {
                            const selected = selectedCardId === card.id;

                            return (
                              <motion.label
                                key={card.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, ...paymentSelectTransition }}
                                className={cn(
                                  'relative flex cursor-pointer items-center gap-3 rounded-xl border p-3',
                                  !selected && 'border-border bg-background'
                                )}
                              >
                                {selected && (
                                  <motion.div
                                    layoutId="pedido-payment-card-active"
                                    className="absolute inset-0 rounded-xl border border-primary bg-primary/5"
                                    transition={paymentSelectTransition}
                                  />
                                )}
                                <input
                                  type="radio"
                                  name="payment-card"
                                  checked={selected}
                                  onChange={() => setSelectedCardId(card.id)}
                                  className="relative z-10 h-5 w-5 accent-primary"
                                />
                                <CardBrandLogo
                                  brand={card.brand}
                                  className="relative z-10 h-9 w-14"
                                />
                                <div className="relative z-10 min-w-0 flex-1">
                                  <p className="font-mono text-sm font-medium text-foreground">
                                    •••• {card.lastFour}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {card.holderName}
                                  </p>
                                </div>
                                {card.isDefault && (
                                  <span className="relative z-10 shrink-0 text-xs font-medium text-primary">
                                    Padrão
                                  </span>
                                )}
                              </motion.label>
                            );
                          })}
                        </LayoutGroup>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </LayoutGroup>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Footer */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-background border-t border-border px-4 py-4 pb-8">
          <Button
            onClick={() => void handleConfirm()}
            disabled={isConfirming || !canPayWithCard}
            className="w-full h-14 text-lg font-bold rounded-2xl"
          >
            {isConfirming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              `Confirmar Pedido • R$ ${total.toFixed(2)}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PedidoPage() {
  return <PedidoContent />;
}
