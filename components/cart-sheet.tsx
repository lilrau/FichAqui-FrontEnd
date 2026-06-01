'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSheet({ isOpen, onClose, onCheckout }: CartSheetProps) {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-card shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-card-foreground">Seu Pedido</h2>
                  <p className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="max-h-[45vh] overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">Carrinho vazio</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Adicione itens do cardápio
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((cartItem) => (
                    <motion.div
                      key={cartItem.item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-card text-2xl shadow-sm">
                        {cartItem.item.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {cartItem.item.name}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          R$ {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-sm"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-foreground">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Clear Cart */}
                  <button
                    onClick={clearCart}
                    className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar carrinho
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 pb-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={onCheckout}
                  className="w-full h-14 text-lg font-bold rounded-xl"
                  size="lg"
                >
                  Finalizar Pedido
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'fixed bottom-24 left-4 right-4 z-50',
        'flex items-center justify-between',
        'h-16 rounded-2xl bg-primary px-5 shadow-lg shadow-primary/30',
        'text-primary-foreground'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/20">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <span className="font-semibold">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </span>
      </div>
      <span className="text-lg font-bold">R$ {total.toFixed(2)}</span>
    </motion.button>
  );
}

interface FloatingOrderButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function FloatingOrderButton({ visible, onClick }: FloatingOrderButtonProps) {
  const { total } = useCart();

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="floating-order"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className={cn(
            'fixed bottom-32 left-4 right-4 z-50',
            'flex items-center justify-between gap-3',
            'h-16 rounded-2xl bg-primary px-5 shadow-lg shadow-primary/30',
            'text-primary-foreground'
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="truncate text-left font-semibold">Pagar e emitir fichas</span>
          </div>
          <span className="shrink-0 text-lg font-bold">R$ {total.toFixed(2)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
