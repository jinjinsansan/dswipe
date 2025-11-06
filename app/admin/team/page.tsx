"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { EnvelopeIcon, UsersIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

import AdminShell from '@/components/admin/AdminShell';
import { teamApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import type { TeamMember } from '@/types';
import type { TeamMemberListResponse } from '@/types/api';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  active: '参加中',
  invited: '招待中',
  disabled: '無効',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  invited: 'bg-amber-50 text-amber-600 border border-amber-200',
  disabled: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export default function TeamManagementPage() {
  const { user } = useAuthStore();
  const {
    teams,
    selectedTeamId,
    fetchStatus,
    fetchError,
    fetchTeams,
    membersByTeam,
    setMembers,
  } = useTeamStore((state) => ({
    teams: state.teams,
    selectedTeamId: state.selectedTeamId,
    fetchStatus: state.fetchStatus,
    fetchError: state.fetchError,
    fetchTeams: state.fetchTeams,
    membersByTeam: state.membersByTeam,
    setMembers: state.setMembers,
  }));

  const [members, setMembersState] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (fetchStatus === 'idle') {
      void fetchTeams();
    }
  }, [fetchStatus, fetchTeams]);

  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? null, [teams, selectedTeamId]);

  const loadMembers = useCallback(async (forceRefresh = false) => {
    if (!selectedTeamId) {
      setMembersState([]);
      return;
    }

    if (!forceRefresh) {
      const cached = membersByTeam[selectedTeamId];
      if (cached) {
        setMembersState(cached.members);
        return;
      }
    }

    setMembersLoading(true);
    setMembersError(null);
    try {
      const response = await teamApi.getMembers(selectedTeamId);
      const payload = response.data as TeamMemberListResponse;
      setMembersState(payload.members);
      setMembers(selectedTeamId, payload);
    } catch (error) {
      console.error('Failed to load team members', error);
      if (isAxiosError(error)) {
        setMembersError(error.response?.data?.detail ?? 'チームメンバーの取得に失敗しました');
      } else {
        setMembersError('チームメンバーの取得に失敗しました');
      }
    } finally {
      setMembersLoading(false);
    }
  }, [membersByTeam, selectedTeamId, setMembers]);

  useEffect(() => {
    void loadMembers(false);
  }, [loadMembers]);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeamId) return;
    const email = inviteEmail.trim();
    if (!email) return;

    setInviting(true);
    setSuccessMessage(null);
    setMembersError(null);
    try {
      await teamApi.inviteMember(selectedTeamId, { email });
      setInviteEmail('');
      setSuccessMessage(`${email} に招待メールを送信しました`);
    } catch (error) {
      console.error('Failed to invite team member', error);
      if (isAxiosError(error)) {
        setMembersError(error.response?.data?.detail ?? '招待メールの送信に失敗しました');
      } else {
        setMembersError('招待メールの送信に失敗しました');
      }
    } finally {
      setInviting(false);
      void loadMembers(true);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!selectedTeamId) return;
    if (member.role === 'owner') return;
    if (member.user_id === user?.id) return;
    const confirmed = window.confirm(`${member.username ?? member.email ?? 'このユーザー'} をチームから削除しますか？`);
    if (!confirmed) return;

    try {
      await teamApi.removeMember(selectedTeamId, member.user_id);
      setSuccessMessage('メンバーを削除しました');
      void loadMembers(true);
    } catch (error) {
      console.error('Failed to remove team member', error);
      if (isAxiosError(error)) {
        setMembersError(error.response?.data?.detail ?? 'メンバーの削除に失敗しました');
      } else {
        setMembersError('メンバーの削除に失敗しました');
      }
    }
  };

  return (
    <AdminShell
      pageTitle="チーム共有"
      pageSubtitle="管理者アカウントを複数メンバーで安全に共有できます"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <UsersIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">管理者限定でチーム共有が可能です。</p>
              <p>
                メンバーはオーナーと同じダッシュボードにアクセスできます。招待されたメンバーはメール内のリンクからログインし、参加後は自動的に管理者権限が付与されます。
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>管理者はLP・NOTE・ポイントなどの全機能にアクセスできます。</li>
                <li>招待リンクは数分以内に送信され、既存アカウントも招待できます。</li>
                <li>必要なくなったメンバーはいつでも削除できます（オーナーを除く）。</li>
              </ul>
            </div>
          </div>
        </section>

        {fetchStatus === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {fetchError ?? 'チーム情報の取得に失敗しました。時間をおいて再度お試しください。'}
          </div>
        )}

        {!selectedTeam && fetchStatus === 'success' && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
            アカウントに紐づくチームがまだありません。管理者の方が初回ログインすると自動的にチームが作成されます。
          </div>
        )}

        {selectedTeam && (
          <>
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <header className="mb-6 flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-slate-900">招待を送信</h2>
                <p className="text-sm text-slate-600">招待メールを送信すると、相手がログイン後すぐに管理者として参加できます。</p>
              </header>
              <form onSubmit={handleInvite} className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">招待するメールアドレス</span>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(event) => {
                        setInviteEmail(event.target.value);
                        setSuccessMessage(null);
                      }}
                      placeholder="example@company.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  disabled={inviting}
                >
                  {inviting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                      招待メールを送信
                    </>
                  )}
                </button>
              </form>
              <p className="mt-3 text-xs text-slate-500">※ 招待リンクの有効期限は 7 日間です。期限を過ぎた場合は再度招待してください。</p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">参加中のメンバー</h2>
                  <p className="text-sm text-slate-600">{selectedTeam.name ?? 'メインチーム'}（{selectedTeam.role === 'owner' ? 'オーナー' : '管理者'}）</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadMembers(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  disabled={membersLoading}
                >
                  <ArrowPathIcon className={cn('h-4 w-4', membersLoading ? 'animate-spin text-blue-500' : '')} aria-hidden="true" />
                  再読み込み
                </button>
              </header>

              {membersError && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {membersError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  {successMessage}
                </div>
              )}

              {membersLoading ? (
                <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-10 text-center text-sm text-blue-600">
                  メンバーを読み込み中です...
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
                  まだメンバーが登録されていません。右上のフォームから招待を送信してください。
                </div>
              ) : (
                <ul className="space-y-3">
                  {members.map((member) => {
                    const isCurrentUser = member.user_id === user?.id;
                    const canRemove = member.role !== 'owner' && !isCurrentUser;
                    const statusStyle = STATUS_STYLE[member.status] ?? STATUS_STYLE.active;
                    return (
                      <li key={member.user_id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{member.username ?? member.email ?? '不明なユーザー'}</span>
                            {member.email && (
                              <span className="text-xs text-slate-500">{member.email}</span>
                            )}
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                              {member.role === 'owner' ? 'OWNER' : 'MANAGER'}
                            </span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', statusStyle)}>
                              {STATUS_LABEL[member.status] ?? member.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {member.last_login_at ? `最終ログイン: ${new Date(member.last_login_at).toLocaleString('ja-JP')}` : '最終ログイン情報なし'}
                          </div>
                        </div>
                        {canRemove ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            削除
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            {isCurrentUser ? 'あなた自身です' : 'オーナーのため削除できません'}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
