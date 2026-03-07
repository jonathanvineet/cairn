"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { useWalletStore } from "@/stores/walletStore";

function WalletRestorer() {
  const restoreSession = useWalletStore((state) => state.restoreSession);
  
  useEffect(() => {
    // Restore wallet session on app mount
    restoreSession();
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
            staleTime: 60_000,
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
