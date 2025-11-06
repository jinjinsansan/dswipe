"use client";

import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTeamStore } from '@/store/teamStore';
import { useAuthStore } from '@/store/authStore';

type TeamSwitcherProps = {
  compact?: boolean;
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'オーナー',
  manager: '管理者',
};

export default function TeamSwitcher({ compact = false }: TeamSwitcherProps) {
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }));

  const {
    teams,
    selectedTeamId,
    fetchStatus,
    fetchError,
    fetchTeams,
    setSelectedTeam,
  } = useTeamStore((state) => ({
    teams: state.teams,
    selectedTeamId: state.selectedTeamId,
    fetchStatus: state.fetchStatus,
    fetchError: state.fetchError,
    fetchTeams: state.fetchTeams,
    setSelectedTeam: state.setSelectedTeam,
  }));

  useEffect(() => {
    if (!isAuthenticated) return;
    if (fetchStatus === 'idle') {
      void fetchTeams();
    }
  }, [fetchStatus, fetchTeams, isAuthenticated]);

  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? null, [teams, selectedTeamId]);

  if (!isAuthenticated) return null;

  if (fetchStatus === 'loading') {
    return (
      <div className={cn(
        'rounded-lg border border-dashed border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500',
        compact ? '' : 'hidden lg:flex'
      )}
      >
        チーム情報を取得中...
      </div>
    );
  }

  if (fetchStatus === 'error') {
    return (
      <div className={cn(
        'rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600',
        compact ? '' : 'hidden lg:flex'
      )}
      >
        {fetchError ?? 'チーム情報の取得に失敗しました'}
      </div>
    );
  }

  if (!selectedTeam) {
    return null;
  }

  const roleLabel = ROLE_LABEL[selectedTeam.role] ?? selectedTeam.role;
  const baseClass = compact
    ? 'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600'
    : 'hidden lg:inline-flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700';

  if (teams.length <= 1) {
    const label = selectedTeam.name?.trim().length ? selectedTeam.name : 'メインチーム';
    return (
      <div className={baseClass}>
        <span className="text-xs font-semibold text-gray-500">共有中:</span>
        <span className="font-semibold text-current">{label}</span>
        <span className="text-xs text-blue-500">{roleLabel}</span>
      </div>
    );
  }

  return (
    <label className={baseClass}>
      <span className="text-xs font-semibold text-current">表示チーム</span>
      <select
        value={selectedTeamId ?? ''}
        onChange={(event) => setSelectedTeam(event.target.value || null)}
        className={cn(
          'rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
          compact ? 'w-36' : 'w-52'
        )}
      >
        {teams.map((team) => {
          const label = team.name?.trim().length ? team.name : 'メインチーム';
          const tag = ROLE_LABEL[team.role] ?? team.role;
          return (
            <option key={team.id} value={team.id}>
              {label}（{tag}）
            </option>
          );
        })}
      </select>
    </label>
  );
}
