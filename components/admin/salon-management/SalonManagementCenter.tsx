"use client";

import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type {
  SalonMemberModeration,
  SalonModerationDetail,
  SalonModerationItem,
} from '@/types';

type RiskFilter = 'all' | 'low' | 'medium' | 'high';
type StatusFilter = 'all' | 'pending' | 'approved' | 'suspended' | 'rejected';

const RISK_THRESHOLDS: Record<RiskFilter, { label: string; min?: number; max?: number; className: string }> = {
  all: { label: 'すべて', className: 'bg-gray-100 text-gray-700' },
  low: { label: 'Low', max: 25, className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', min: 25, max: 50, className: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', min: 50, className: 'bg-red-100 text-red-700' },
};

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'pending', label: '審査待ち' },
  { value: 'approved', label: '公開中' },
  { value: 'suspended', label: '停止中' },
  { value: 'rejected', label: '却下' },
];

const SALON_STATUS_LABELS: Record<string, string> = {
  pending: '審査待ち',
  approved: '公開中',
  suspended: '停止中',
  rejected: '却下',
};

const formatNumber = (value: number) => new Intl.NumberFormat('ja-JP').format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    return error.response?.data?.detail ?? fallback;
  }
  return fallback;
};

const riskBadge = (score: number) => {
  if (score >= 50) return { label: 'High', className: 'bg-red-100 text-red-700' };
  if (score >= 25) return { label: 'Medium', className: 'bg-amber-100 text-amber-700' };
  return { label: 'Low', className: 'bg-emerald-100 text-emerald-700' };
};

export default function SalonManagementCenter() {
  const [salons, setSalons] = useState<SalonModerationItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');

  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [salonDetail, setSalonDetail] = useState<SalonModerationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [statusFormStatus, setStatusFormStatus] = useState<StatusFilter>('approved');
  const [statusFormReason, setStatusFormReason] = useState('');
  const [statusFormNotes, setStatusFormNotes] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [memberActionTarget, setMemberActionTarget] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (query.trim()) params.search = query.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (onlyFlagged) params.only_flagged = true;

      const riskConfig = RISK_THRESHOLDS[riskFilter];
      if (riskConfig.min !== undefined) params.min_risk = riskConfig.min;
      if (riskConfig.max !== undefined) params.max_risk = riskConfig.max;

      const { data } = await adminApi.listSalonModeration(params);
      setSalons(data.data);
    } catch (error) {
      setListError(extractErrorMessage(error, 'サロン一覧の取得に失敗しました'));
    } finally {
      setListLoading(false);
    }
  }, [query, statusFilter, riskFilter, onlyFlagged]);

  const fetchDetail = useCallback(async (salonId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const { data } = await adminApi.getSalonModerationDetail(salonId);
      setSalonDetail(data);
      setStatusFormStatus((data.status as StatusFilter) ?? 'approved');
      setStatusFormNotes(data.moderation_notes ?? '');
      setStatusFormReason('');
    } catch (error) {
      setDetailError(extractErrorMessage(error, 'サロン詳細の取得に失敗しました'));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  useEffect(() => {
    if (selectedSalonId) {
      fetchDetail(selectedSalonId);
    } else {
      setSalonDetail(null);
      setDetailError(null);
    }
  }, [selectedSalonId, fetchDetail]);

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setQuery(searchValue.trim());
    },
    [searchValue],
  );

  const handleRefresh = useCallback(() => {
    fetchSalons();
    if (selectedSalonId) fetchDetail(selectedSalonId);
  }, [fetchSalons, fetchDetail, selectedSalonId]);

  const handleSelectSalon = (salon: SalonModerationItem) => {
    setSelectedSalonId((prev) => (prev === salon.id ? null : salon.id));
    setActionMessage(null);
    setActionError(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSalonId) return;
    setStatusUpdating(true);
    setActionMessage(null);
    setActionError(null);
    try {
      await adminApi.updateSalonStatus(selectedSalonId, {
        status: statusFormStatus === 'all' ? 'approved' : statusFormStatus,
        reason: statusFormReason.trim() || undefined,
        moderation_notes: statusFormNotes.trim() || undefined,
      });
      setActionMessage('サロンステータスを更新しました');
      await fetchSalons();
      await fetchDetail(selectedSalonId);
    } catch (error) {
      setActionError(extractErrorMessage(error, 'サロンステータスの更新に失敗しました'));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleMemberAction = async (member: SalonMemberModeration, action: 'approve' | 'cancel') => {
    if (!selectedSalonId) return;
    const promptMessage =
      action === 'approve'
        ? 'この会員を承認しますか？理由があれば入力してください（任意）'
        : 'この会員を停止しますか？ユーザーにはアクセスができなくなります。理由を入力してください（任意）';
    const reason = window.prompt(promptMessage) ?? undefined;
    if (reason === null) return;
    setMemberActionTarget(member.id);
    setActionMessage(null);
    setActionError(null);
    try {
      await adminApi.updateSalonMember(selectedSalonId, member.id, {
        action,
        reason: reason?.trim() ? reason.trim() : undefined,
      });
      setActionMessage('会員ステータスを更新しました');
      await fetchSalons();
      await fetchDetail(selectedSalonId);
    } catch (error) {
      setActionError(extractErrorMessage(error, '会員ステータスの更新に失敗しました'));
    } finally {
      setMemberActionTarget(null);
    }
  };

  const selectedSalonSummary = useMemo(
    () => salons.find((salon) => salon.id === selectedSalonId) ?? null,
    [salons, selectedSalonId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">サロン管理センター</h2>
            <p className="text-sm text-gray-600">
              サロンの審査状況・会員動向・リスク指標を確認して運用アクションを実行できます。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
              最新情報に更新
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="サロン名で検索"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            検索
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  statusFilter === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(Object.keys(RISK_THRESHOLDS) as RiskFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRiskFilter(key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  riskFilter === key ? RISK_THRESHOLDS[key].className : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {RISK_THRESHOLDS[key].label}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={onlyFlagged}
              onChange={(event) => setOnlyFlagged(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            審査待ち/停止のみ
          </label>
        </div>
      </div>

      {listError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {listError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {listLoading ? '読み込み中...' : `取得件数: ${formatNumber(salons.length)}`}
            </div>
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">サロン</th>
                  <th className="px-4 py-3 text-left">運営者</th>
                  <th className="px-4 py-3 text-left">ステータス</th>
                  <th className="px-4 py-3 text-center">会員</th>
                  <th className="px-4 py-3 text-left">リスク</th>
                  <th className="px-4 py-3 text-left">更新日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                ) : salons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      対象のサロンがありません
                    </td>
                  </tr>
                ) : (
                  salons.map((salon) => {
                    const badge = riskBadge(salon.risk_score);
                    const isSelected = selectedSalonId === salon.id;
                    return (
                      <tr
                        key={salon.id}
                        className={cn('cursor-pointer transition-colors hover:bg-blue-50', isSelected && 'bg-blue-50')}
                        onClick={() => handleSelectSalon(salon)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{salon.title}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            月額 {salon.monthly_price_jpy ? `${formatNumber(salon.monthly_price_jpy)} 円` : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{salon.owner_username ?? '-'}</div>
                          <div className="text-xs text-gray-500">{salon.owner_email ?? '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {SALON_STATUS_LABELS[salon.status] ?? salon.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-semibold text-gray-900">{formatNumber(salon.total_members)}</div>
                          <div className="text-[11px] text-gray-500">
                            承認 {formatNumber(salon.active_members)} / 審査 {formatNumber(salon.pending_members)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', badge.className)}>
                            {badge.label}
                            <span className="text-[11px] text-gray-500">{salon.risk_score}</span>
                          </span>
                          <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                            {salon.risk_indicators.join(' / ') || '指標なし'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDateTime(salon.updated_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {!selectedSalonId && (
              <div className="text-sm text-gray-500">サロンを選択すると詳細が表示されます</div>
            )}
            {selectedSalonId ? (
              detailLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">詳細を読み込み中...</div>
              ) : detailError ? (
                <div className="text-sm text-red-600">{detailError}</div>
              ) : salonDetail ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{salonDetail.title}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', riskBadge(salonDetail.risk_score).className)}>
                        Risk {salonDetail.risk_score}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5">
                        {SALON_STATUS_LABELS[salonDetail.status] ?? salonDetail.status}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                        会員 {formatNumber(salonDetail.total_members)}
                      </span>
                    </div>
                    {salonDetail.description && (
                      <p className="text-sm text-gray-600">{salonDetail.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <div className="text-xs text-gray-500">承認済み会員</div>
                      <div className="font-semibold text-gray-900">{formatNumber(salonDetail.active_members)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">審査待ち</div>
                      <div className="font-semibold text-gray-900">{formatNumber(salonDetail.pending_members)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">停止済み</div>
                      <div className="font-semibold text-gray-900">{formatNumber(salonDetail.canceled_members)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">月額</div>
                      <div className="font-semibold text-gray-900">
                        {salonDetail.monthly_price_jpy ? `${formatNumber(salonDetail.monthly_price_jpy)} 円` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">作成日</div>
                      <div className="font-semibold text-gray-900">{formatDateTime(salonDetail.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">最終更新</div>
                      <div className="font-semibold text-gray-900">{formatDateTime(salonDetail.updated_at)}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <UserGroupIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      運営者情報
                    </div>
                    <div className="text-xs text-gray-500">
                      {salonDetail.owner_username ?? '-'} ({salonDetail.owner_email ?? '-'})
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      ステータス更新
                    </div>
                    <div className="space-y-3">
                      <div className="grid gap-3">
                        <label className="text-xs font-semibold text-gray-600">ステータス</label>
                        <select
                          value={statusFormStatus}
                          onChange={(event) => setStatusFormStatus(event.target.value as StatusFilter)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        >
                          {(['pending', 'approved', 'suspended', 'rejected'] as StatusFilter[]).map((value) => (
                            <option key={value} value={value}>
                              {SALON_STATUS_LABELS[value] ?? value}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-gray-600">運用メモ</label>
                        <textarea
                          value={statusFormNotes}
                          onChange={(event) => setStatusFormNotes(event.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                          placeholder="審査メモや運用注意点"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-gray-600">通知理由 (任意)</label>
                        <input
                          type="text"
                          value={statusFormReason}
                          onChange={(event) => setStatusFormReason(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                          placeholder="審査理由や注意事項"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleUpdateStatus}
                          disabled={statusUpdating}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                          更新する
                        </button>
                        {selectedSalonSummary?.owner_id && (
                          <Link
                            href={`/salons/${selectedSalonSummary.owner_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            運営者プロフィール
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {(actionMessage || actionError) && (
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 text-xs',
                        actionError
                          ? 'border border-red-200 bg-red-50 text-red-600'
                          : 'border border-blue-200 bg-blue-50 text-blue-700',
                      )}
                    >
                      {actionError ?? actionMessage}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <UserGroupIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      会員一覧 ({formatNumber(salonDetail.members.length)})
                    </div>
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {salonDetail.members.length === 0 ? (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs text-gray-500">
                          会員は登録されていません
                        </div>
                      ) : (
                        salonDetail.members.map((member) => {
                          const isProcessing = memberActionTarget === member.id;
                          return (
                            <div
                              key={member.id}
                              className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs text-gray-600"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {member.username ?? '-'}
                                  </div>
                                  <div className="text-[11px] text-gray-500">{member.email ?? '-'}</div>
                                  <div className="mt-1 text-[11px] text-gray-500">
                                    ステータス: {member.status}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMemberAction(member, 'approve')}
                                    disabled={isProcessing || member.status === 'ACTIVE'}
                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                                    承認
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMemberAction(member, 'cancel')}
                                    disabled={isProcessing || member.status === 'CANCELED'}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                    停止
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2 grid gap-1 text-[11px] text-gray-500">
                                <div>参加: {formatDateTime(member.joined_at)}</div>
                                <div>
                                  次回課金: {formatDateTime(member.next_charge_at)} / 最終課金: {formatDateTime(member.last_charged_at)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <DocumentMagnifyingGlassIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      アクティビティ概要
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                      <div>
                        <div className="text-gray-500">告知</div>
                        <div className="font-semibold text-gray-900">{formatNumber(salonDetail.announcements_count)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">イベント</div>
                        <div className="font-semibold text-gray-900">{formatNumber(salonDetail.events_count)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">投稿</div>
                        <div className="font-semibold text-gray-900">{formatNumber(salonDetail.posts_count)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">サロンを選択すると詳細が表示されます</div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
