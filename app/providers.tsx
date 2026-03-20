"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useWalletStore } from "@/stores/walletStore";

function WalletRestorer() {
  const restoreSession = useWalletStore((state) => state.restoreSession);
  const hasRestored = useRef(false);
  
  useEffect(() => {
    // Restore persisted wallet session on app load
    if (typeof window !== 'undefined' && !hasRestored.current) {
      hasRestored.current = true;
      console.log('📱 App initialized - attempting to restore wallet session...');
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
