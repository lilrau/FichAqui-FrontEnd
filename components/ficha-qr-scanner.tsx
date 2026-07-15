'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { CameraOff, Loader2, ScanLine } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FichaQrScannerProps {
  active: boolean;
  className?: string;
  onScan: (qrCode: string) => void;
  pausedLabel?: string;
}

type RuntimeStatus = 'idle' | 'starting' | 'scanning';
type CameraError = 'denied' | 'unavailable';

export function FichaQrScanner({
  active,
  className,
  onScan,
  pausedLabel = 'Leitura pausada',
}: FichaQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onScanRef = useRef(onScan);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>('idle');
  const [cameraError, setCameraError] = useState<CameraError | null>(null);

  onScanRef.current = onScan;

  useEffect(() => {
    if (!active || cameraError) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      if (!active) setRuntimeStatus('idle');
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const start = async () => {
      setRuntimeStatus('starting');
      try {
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
          if (cancelled || !result) return;
          const text = result.getText().trim();
          if (text) onScanRef.current(text);
        });

        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setRuntimeStatus('scanning');
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof DOMException ? error.name : '';
        setCameraError(
          name === 'NotAllowedError' || name === 'PermissionDeniedError' ? 'denied' : 'unavailable'
        );
        setRuntimeStatus('idle');
      }
    };

    void start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, cameraError]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
        <video ref={videoRef} className="aspect-4/3 w-full object-cover" muted playsInline />

        {active && !cameraError && (runtimeStatus === 'starting' || runtimeStatus === 'idle') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {!active && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 px-4 text-center text-white">
            <ScanLine className="h-8 w-8 opacity-80" />
            <p className="text-sm font-medium">{pausedLabel}</p>
          </div>
        )}

        {active && runtimeStatus === 'scanning' && !cameraError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-44 w-44 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex min-h-48 items-center justify-center bg-black/85 p-4">
            <Alert className="border-white/20 bg-black/40 text-white">
              <CameraOff className="text-white" />
              <AlertTitle>Câmera indisponível</AlertTitle>
              <AlertDescription className="text-white/80">
                {cameraError === 'denied'
                  ? 'Permita o acesso à câmera nas configurações do navegador ou digite o código abaixo.'
                  : 'Não foi possível iniciar a câmera. Use o campo de digitação abaixo.'}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {active && runtimeStatus === 'scanning' && !cameraError && (
        <p className="text-center text-xs text-muted-foreground">Aponte para o QR da ficha</p>
      )}
    </div>
  );
}
