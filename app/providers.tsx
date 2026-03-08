"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useWalletStore } from "@/stores/walletStore";

function WalletRestorer() {
  const restoreSession = useWalletStore((state) => state.restoreSession);
  const hasRestored = useRef(false);
  
  useEffect(() => {
    // CLEAR ALL WALLETCONNECT SESSIONS ON APP LOAD
    // This ensures no auto-connection occurs
    if (typeof window !== 'undefined' && !hasRestored.current) {
      // Clear all WalletConnect localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('wc@2') || key === 'wallet-storage')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      hasRestored.current = true;
      restoreSession();
    }
  }, [restoreSession]);
  
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            staleTime: 60_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletRestorer />
      {children}
    </QueryClientProvider>
  );
}
