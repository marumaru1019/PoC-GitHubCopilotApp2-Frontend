'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode, createContext, useContext } from 'react';

const QueryClientContext = createContext<QueryClient | null>(null);

export function useQueryClientContext() {
  const context = useContext(QueryClientContext);
  if (!context) {
    throw new Error('useQueryClientContext must be used within Providers');
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <QueryClientContext.Provider value={queryClient}>
        {children}
      </QueryClientContext.Provider>
    </QueryClientProvider>
  );
}
