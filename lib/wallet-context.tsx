'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchWallet } from '@/lib/api/wallet';
import { getErrorMessage } from '@/lib/api/errors';
import type { SavedPaymentCard } from '@/lib/types/wallet';

interface WalletContextType {
  hydrated: boolean;
  loadError: string | null;
  balance: number;
  savedCards: SavedPaymentCard[];
  defaultCard: SavedPaymentCard | undefined;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { hydrated: authHydrated, isAuthenticated } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [savedCards, setSavedCards] = useState<SavedPaymentCard[]>([]);

  const refreshWallet = useCallback(async () => {
    const data = await fetchWallet();
    setBalance(data.balance);
    setSavedCards(data.savedCards);
    setLoadError(null);
  }, []);

  useEffect(() => {
    if (!authHydrated) return;

    let cancelled = false;

    (async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setBalance(0);
          setSavedCards([]);
          setLoadError(null);
          setHydrated(true);
        }
        return;
      }

      try {
        const data = await fetchWallet();
        if (cancelled) return;
        setBalance(data.balance);
        setSavedCards(data.savedCards);
        setLoadError(null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, 'Não foi possível carregar a carteira.'));
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated]);

  const defaultCard = useMemo(
    () => savedCards.find((card) => card.isDefault) ?? savedCards[0],
    [savedCards]
  );

  const value = useMemo(
    () => ({
      hydrated,
      loadError,
      balance,
      savedCards,
      defaultCard,
      refreshWallet,
    }),
    [hydrated, loadError, balance, savedCards, defaultCard, refreshWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}

export function formatWalletBalance(balance: number): string {
  return balance.toFixed(2).replace('.', ',');
}
