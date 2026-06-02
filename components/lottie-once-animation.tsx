'use client';

import { useEffect, useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { cn } from '@/lib/utils';

interface LottieOnceAnimationProps {
  animationData: object;
  className?: string;
  onComplete?: () => void;
}

export function LottieOnceAnimation({
  animationData,
  className,
  onComplete,
}: LottieOnceAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    completedRef.current = false;
    lottieRef.current?.goToAndPlay(0, true);
  }, [animationData]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={false}
      autoplay
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
      className={cn(
        'mx-auto w-full [&_svg]:bg-transparent',
        className
      )}
      onComplete={() => {
        if (completedRef.current) return;
        completedRef.current = true;
        lottieRef.current?.pause();
        onCompleteRef.current?.();
      }}
    />
  );
}
