'use client';

import { useEffect } from 'react';

import { useAccountShareStore } from '@/store/accountShareStore';
import { useAuthStore } from '@/store/authStore';

interface AccountShareProviderProps {
  children: React.ReactNode;
}

export function AccountShareProvider({ children }: AccountShareProviderProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const reset = useAccountShareStore((state) => state.reset);
  const fetchAccessibleOwners = useAccountShareStore((state) => state.fetchAccessibleOwners);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccessibleOwners().catch((error) => {
        console.error('Failed to initialize account sharing context:', error);
      });
    } else {
      reset();
    }
  }, [isAuthenticated, fetchAccessibleOwners, reset]);

  return <>{children}</>;
}
