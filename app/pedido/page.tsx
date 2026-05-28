'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, PartyPopper } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { OrderStatus, OrderQRCode } from '@/components/order-status';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/menu-item-card';

function PedidoContent() {
  const router = useRouter();
  const { items, total, createOrder, currentOrder } = useCart();
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    
    // Simular processamento
    setTimeout(() => {
      createOrder();
      setShowSuccess(true);
    }, 1500);
  };

  // Se já tem um pedido atual, mostrar status
  if (currentOrder || showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => router.push('/cardapio')}
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
                onClick={() => router.push('/cardapio')}
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
              onClick={() => router.push('/cardapio')}
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

            {/* Payment Method (mock) */}
            <div className="rounded-2xl bg-card p-4 shadow-md border border-border">
              <h3 className="font-bold text-card-foreground mb-3">Forma de pagamento</h3>
              <div className="space-y-2">
                {['PIX', 'Dinheiro', 'Cartão'].map((method, index) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked={index === 0}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="font-medium text-foreground">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Footer */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-background border-t border-border px-4 py-4 pb-8">
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
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
