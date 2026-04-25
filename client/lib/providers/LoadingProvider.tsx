'use client';

import React, { createContext, useContext, useTransition } from 'react';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface LoadingContextType {
  isTransitioning: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, startTransition] = useTransition();

  return (
    <LoadingContext.Provider value={{ isTransitioning }}>
      {children}
      <LoadingOverlay isVisible={isTransitioning} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
