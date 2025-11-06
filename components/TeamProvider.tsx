"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';

export default function TeamProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
  }));

  const fetchTeams = useTeamStore((state) => state.fetchTeams);
  const resetTeams = useTeamStore((state) => state.reset);

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      void fetchTeams();
    } else {
      resetTeams();
    }
  }, [fetchTeams, resetTeams, isAuthenticated, isInitialized]);

  return <>{children}</>;
}
