'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ScanLine, Loader2 } from 'lucide-react';
import { consumeFicha, lookupFichaByQr } from '@/lib/api/fichas';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth-context';
import { statusConfig } from '@/lib/order-status-config';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Ficha } from '@/lib/types/event-domain';

export default function RetiradaPage() {
  const { user } = useAuth();
  const [qrInput, setQrInput] = useState('');
  const [preview, setPreview] = useState<Ficha | null>(null);
  const [confirmed, setConfirmed] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    const qr = qrInput.trim();
    if (!qr) return;

    setLoading(true);
    setError(null);
    setConfirmed(null);
    try {
      const ficha = await lookupFichaByQr(qr);
      setPreview(ficha);
    } catch (lookupError) {
      setPreview(null);
      setError(getErrorMessage(lookupError, 'Ficha não encontrada.'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    setConfirming(true);
    setError(null);
    try {
      const updated = await consumeFicha(preview.id, preview.qrCode);
      setConfirmed(updated);
      setPreview(null);
      setQrInput('');
    } catch (consumeError) {
      setError(getErrorMessage(consumeError, 'Não foi possível confirmar a retirada.'));
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setConfirmed(null);
    setQrInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-foreground">Retirada</h1>
          <p className="text-sm text-muted-foreground">
            {user?.stallId ? `Barraca vinculada · ${user.stallId}` : 'Leitura de QR'}
          </p>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <ScanLine className="h-5 w-5" />
            <h2 className="font-semibold text-foreground">Código da ficha</h2>
          </div>
          <div className="flex gap-2">
            <Input
              value={qrInput}
              onChange={(event) => setQrInput(event.target.value)}
              placeholder="Cole ou digite o QR"
              className="h-12 rounded-xl font-mono text-sm"
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleLookup();
              }}
            />
            <Button
              type="button"
              className="h-12 shrink-0 rounded-xl px-5"
              onClick={() => void handleLookup()}
              disabled={loading || !qrInput.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </section>

        {preview && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <ProductImage
                src={preview.itemImage}
                alt={preview.itemName}
                emojiClassName="text-3xl"
                className="h-12 w-12 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{preview.itemName}</p>
                <p className="text-sm text-muted-foreground">{preview.stallName}</p>
                <span
                  className={cn(
                    'mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    statusConfig[preview.status].bgColor,
                    statusConfig[preview.status].color
                  )}
                >
                  {statusConfig[preview.status].label}
                </span>
              </div>
            </div>

            {preview.status === 'available' ? (
              <Button
                type="button"
                className="mt-4 h-12 w-full rounded-xl text-base font-semibold"
                onClick={() => void handleConfirm()}
                disabled={confirming}
              >
                {confirming ? 'Confirmando…' : 'Confirmar retirada'}
              </Button>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Esta ficha já foi entregue.</p>
            )}
          </motion.section>
        )}

        {confirmed && (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center"
          >
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <p className="mt-3 font-semibold text-foreground">Retirada confirmada</p>
            <p className="mt-1 text-sm text-muted-foreground">{confirmed.itemName}</p>
            <Button type="button" variant="outline" className="mt-4 rounded-xl" onClick={reset}>
              Nova leitura
            </Button>
          </motion.section>
        )}
      </main>
    </div>
  );
}
