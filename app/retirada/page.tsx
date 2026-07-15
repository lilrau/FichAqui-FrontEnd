'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, RotateCcw, ScanLine } from 'lucide-react';
import { consumeFicha, lookupFichaByQr } from '@/lib/api/fichas';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth-context';
import { statusConfig } from '@/lib/order-status-config';
import { FichaQrScanner } from '@/components/ficha-qr-scanner';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Ficha } from '@/lib/types/event-domain';

const AUTO_RESET_MS = 2000;

export default function RetiradaPage() {
  const { user } = useAuth();
  const [qrInput, setQrInput] = useState('');
  const [preview, setPreview] = useState<Ficha | null>(null);
  const [successFlash, setSuccessFlash] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(true);
  const [blockedQr, setBlockedQr] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const scheduleAutoReset = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setPreview(null);
      setSuccessFlash(null);
      setError(null);
      setQrInput('');
      setBlockedQr(null);
      setScannerActive(true);
      resetTimerRef.current = null;
    }, AUTO_RESET_MS);
  }, [clearResetTimer]);

  useEffect(() => () => clearResetTimer(), [clearResetTimer]);

  const lookupQr = useCallback(
    async (qr: string) => {
      const trimmed = qr.trim();
      if (!trimmed || loading || confirming) return;
      if (blockedQr === trimmed) return;

      setBlockedQr(trimmed);
      setQrInput(trimmed);
      setScannerActive(false);
      setError(null);
      setSuccessFlash(null);
      setLoading(true);

      try {
        const ficha = await lookupFichaByQr(trimmed);
        setPreview(ficha);
        if (ficha.status === 'delivered') {
          scheduleAutoReset();
        }
      } catch (lookupError) {
        setPreview(null);
        setError(getErrorMessage(lookupError, 'Ficha não encontrada.'));
      } finally {
        setLoading(false);
      }
    },
    [blockedQr, confirming, loading, scheduleAutoReset]
  );

  const handleScan = useCallback(
    (qr: string) => {
      void lookupQr(qr);
    },
    [lookupQr]
  );

  const handleLookup = () => {
    void lookupQr(qrInput);
  };

  const handleConfirm = async () => {
    if (!preview) return;

    setConfirming(true);
    setError(null);
    try {
      const updated = await consumeFicha(preview.id, preview.qrCode);
      setPreview(null);
      setSuccessFlash(updated);
      scheduleAutoReset();
    } catch (consumeError) {
      setError(getErrorMessage(consumeError, 'Não foi possível confirmar a retirada.'));
    } finally {
      setConfirming(false);
    }
  };

  const handleScanAnother = () => {
    clearResetTimer();
    setPreview(null);
    setSuccessFlash(null);
    setError(null);
    setQrInput('');
    setBlockedQr(null);
    setScannerActive(true);
  };

  const handleRetryAfterError = () => {
    clearResetTimer();
    setError(null);
    setBlockedQr(null);
    setScannerActive(true);
  };

  const pausedLabel =
    preview?.status === 'available'
      ? 'Confirme a retirada ou escaneie outro'
      : loading
        ? 'Buscando ficha…'
        : 'Leitura pausada';

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
        <FichaQrScanner
          active={scannerActive && !loading}
          onScan={handleScan}
          pausedLabel={pausedLabel}
        />

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
                if (event.key === 'Enter') handleLookup();
              }}
            />
            <Button
              type="button"
              className="h-12 shrink-0 rounded-xl px-5"
              onClick={handleLookup}
              disabled={loading || !qrInput.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
            </Button>
          </div>
          {error && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              {error && !preview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleRetryAfterError}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
              )}
            </div>
          )}
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
              <div className="mt-4 space-y-2">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl text-base font-semibold"
                  onClick={() => void handleConfirm()}
                  disabled={confirming}
                >
                  {confirming ? 'Confirmando…' : 'Confirmar retirada'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={handleScanAnother}
                  disabled={confirming}
                >
                  Escanear outro
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Esta ficha já foi entregue.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={handleScanAnother}
                >
                  Escanear outro
                </Button>
              </div>
            )}
          </motion.section>
        )}

        {successFlash && (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center"
          >
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <p className="mt-3 font-semibold text-foreground">Retirada confirmada</p>
            <p className="mt-1 text-sm text-muted-foreground">{successFlash.itemName}</p>
          </motion.section>
        )}
      </main>
    </div>
  );
}
