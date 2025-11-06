"use client";

import { create } from 'zustand';
import { teamApi } from '@/lib/api';
import type { TeamMemberListResponse, TeamSummary } from '@/types/api';

const STORAGE_KEY = 'dswipe_selected_team_id';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

interface TeamState {
  teams: TeamSummary[];
  selectedTeamId: string | null;
  membersByTeam: Record<string, TeamMemberListResponse | null>;
  fetchStatus: FetchState;
  fetchError: string | null;
  fetchTeams: () => Promise<void>;
  setTeams: (teams: TeamSummary[]) => void;
  setSelectedTeam: (teamId: string | null) => void;
  setMembers: (teamId: string, payload: TeamMemberListResponse | null) => void;
  reset: () => void;
}

const inferInitialSelectedTeam = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  selectedTeamId: inferInitialSelectedTeam(),
  membersByTeam: {},
  fetchStatus: 'idle',
  fetchError: null,

  setTeams: (teams) => {
    const currentSelected = get().selectedTeamId;
    let nextSelected = currentSelected;

    if (!teams.some((team) => team.id === currentSelected)) {
      nextSelected = teams.length > 0 ? teams[0].id : null;
    }

    if (typeof window !== 'undefined') {
      if (nextSelected) {
        localStorage.setItem(STORAGE_KEY, nextSelected);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    set({ teams, selectedTeamId: nextSelected });
  },

  setSelectedTeam: (teamId) => {
    if (typeof window !== 'undefined') {
      if (teamId) {
        localStorage.setItem(STORAGE_KEY, teamId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    set({ selectedTeamId: teamId });
  },

  setMembers: (teamId, payload) => {
    set((state) => ({
      membersByTeam: {
        ...state.membersByTeam,
        [teamId]: payload,
      },
    }));
  },

  fetchTeams: async () => {
    const { fetchStatus } = get();
    if (fetchStatus === 'loading') return;

    set({ fetchStatus: 'loading', fetchError: null });
    try {
      const response = await teamApi.listMyTeams();
      const teams = response.data as TeamSummary[];
      get().setTeams(teams);
      set({ fetchStatus: 'success' });
    } catch (error) {
      console.error('Failed to fetch teams', error);
      set({ fetchStatus: 'error', fetchError: 'チーム情報の取得に失敗しました。' });
    }
  },

  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      teams: [],
      selectedTeamId: null,
      membersByTeam: {},
      fetchStatus: 'idle',
      fetchError: null,
    });
  },
}));
