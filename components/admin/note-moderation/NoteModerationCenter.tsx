"use client";

import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { NoteModerationDetail, NoteModerationItem } from '@/types';

type RiskFilter = 'all' | 'low' | 'medium' | 'high';
type StatusFilter = 'all' | 'published' | 'draft';

const RISK_THRESHOLDS: Record<RiskFilter, { label: string; min?: number; max?: number; className: string }> = {
  all: { label: 'すべて', className: 'bg-gray-100 text-gray-700' },
  low: { label: 'Low', max: 25, className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', min: 25, max: 50, className: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', min: 50, className: 'bg-red-100 text-red-700' },
};

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'published', label: '公開中' },
  { value: 'draft', label: '下書き' },
];

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
  if (score >= 50) {
    return { label: 'High', className: 'bg-red-100 text-red-700' };
  }
  if (score >= 25) {
    return { label: 'Medium', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Low', className: 'bg-emerald-100 text-emerald-700' };
};

export default function NoteModerationCenter() {
  const [notes, setNotes] = useState<NoteModerationItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('published');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [onlySuspicious, setOnlySuspicious] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteDetail, setNoteDetail] = useState<NoteModerationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [actionTarget, setActionTarget] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (query.trim()) params.search = query.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (onlySuspicious) params.only_suspicious = true;

      const riskConfig = RISK_THRESHOLDS[riskFilter];
      if (riskConfig.min !== undefined) params.min_risk = riskConfig.min;
      if (riskConfig.max !== undefined) params.max_risk = riskConfig.max;

      const { data } = await adminApi.listNoteModeration(params);
      setNotes(data.data);
    } catch (error) {
      setListError(extractErrorMessage(error, 'NOTE一覧の取得に失敗しました'));
    } finally {
      setListLoading(false);
    }
  }, [query, statusFilter, riskFilter, onlySuspicious]);

  const fetchDetail = useCallback(async (noteId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const { data } = await adminApi.getNoteModerationDetail(noteId);
      setNoteDetail(data);
    } catch (error) {
      setDetailError(extractErrorMessage(error, 'NOTE詳細の取得に失敗しました'));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (selectedNoteId) {
      fetchDetail(selectedNoteId);
    } else {
      setNoteDetail(null);
      setDetailError(null);
    }
  }, [selectedNoteId, fetchDetail]);

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setQuery(searchValue.trim());
    },
    [searchValue],
  );

  const handleRefresh = useCallback(() => {
    fetchNotes();
    if (selectedNoteId) {
      fetchDetail(selectedNoteId);
    }
  }, [fetchNotes, fetchDetail, selectedNoteId]);

  const handleSelectNote = (note: NoteModerationItem) => {
    setSelectedNoteId((prev) => (prev === note.id ? null : note.id));
    setActionMessage(null);
  };

  const handleUnpublish = async (note: NoteModerationItem) => {
    const reason = window.prompt('非公開理由を入力してください（任意）');
    if (reason === null) return;
    try {
      setActionTarget(note.id);
      await adminApi.unpublishUserNote(note.author_id, note.id, reason ? { reason } : undefined);
      setActionMessage('NOTEを非公開にしました');
      await fetchNotes();
      await fetchDetail(note.id);
    } catch (error) {
      setActionMessage(extractErrorMessage(error, 'NOTEの非公開に失敗しました'));
    } finally {
      setActionTarget(null);
    }
  };

  const handleDelete = async (note: NoteModerationItem) => {
    const confirmed = window.confirm('このNOTEを削除しますか？この操作は元に戻せません。');
    if (!confirmed) return;
    const reason = window.prompt('削除理由を入力してください（任意）') ?? undefined;
    try {
      setActionTarget(note.id);
      await adminApi.deleteUserNote(note.author_id, note.id, reason ? { reason } : undefined);
      setActionMessage('NOTEを削除しました');
      setSelectedNoteId(null);
      await fetchNotes();
    } catch (error) {
      setActionMessage(extractErrorMessage(error, 'NOTEの削除に失敗しました'));
    } finally {
      setActionTarget(null);
    }
  };

  const selectedNoteSummary = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">NOTEモデレーションセンター</h2>
            <p className="text-sm text-gray-600">
              公開中のNOTEステータス、購入履歴、シェア状況を確認して審査アクションを実行できます。
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
              placeholder="NOTEタイトルで検索"
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
              checked={onlySuspicious}
              onChange={(event) => setOnlySuspicious(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            疑わしいシェアのみ
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
              {listLoading ? '読み込み中...' : `取得件数: ${formatNumber(notes.length)}`}
            </div>
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">NOTE</th>
                  <th className="px-4 py-3 text-left">販売者</th>
                  <th className="px-4 py-3 text-left">リスク</th>
                  <th className="px-4 py-3 text-center">購入</th>
                  <th className="px-4 py-3 text-center">シェア</th>
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
                ) : notes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                      対象のNOTEがありません
                    </td>
                  </tr>
                ) : (
                  notes.map((note) => {
                    const badge = riskBadge(note.risk_score);
                    const isSelected = selectedNoteId === note.id;
                    return (
                      <tr
                        key={note.id}
                        className={cn('cursor-pointer transition-colors hover:bg-blue-50', isSelected && 'bg-blue-50')}
                        onClick={() => handleSelectNote(note)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{note.title}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5">{note.status}</span>
                            {note.categories.slice(0, 3).map((category) => (
                              <span key={category} className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                                #{category}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{note.author_username ?? '-'} </div>
                          <div className="text-xs text-gray-500">{note.author_email ?? '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', badge.className)}>
                            {badge.label}
                            <span className="text-[11px] text-gray-500">{note.risk_score}</span>
                          </span>
                          <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                            {note.risk_indicators.join(' / ') || '指標なし'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-semibold text-gray-900">{formatNumber(note.total_purchases)}</div>
                          <div className="text-[11px] text-gray-500">返金 {formatNumber(note.total_refunds)}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-semibold text-gray-900">{formatNumber(note.total_shares)}</div>
                          <div className="text-[11px] text-gray-500">疑い {formatNumber(note.suspicious_shares)}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDateTime(note.updated_at)}</td>
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
            {!selectedNoteId && (
              <div className="text-sm text-gray-500">NOTEを選択すると詳細が表示されます</div>
            )}
            {selectedNoteId && (
              detailLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">詳細を読み込み中...</div>
              ) : detailError ? (
                <div className="text-sm text-red-600">{detailError}</div>
              ) : noteDetail ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{noteDetail.title}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', riskBadge(noteDetail.risk_score).className)}>
                        Risk {noteDetail.risk_score}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5">{noteDetail.status}</span>
                      {noteDetail.categories.map((category) => (
                        <span key={category} className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                          #{category}
                        </span>
                      ))}
                    </div>
                    {noteDetail.excerpt && <p className="text-sm text-gray-600">{noteDetail.excerpt}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <div className="text-xs text-gray-500">購入数</div>
                      <div className="font-semibold text-gray-900">{formatNumber(noteDetail.total_purchases)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">シェア数</div>
                      <div className="font-semibold text-gray-900">{formatNumber(noteDetail.total_shares)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">疑いフラグ</div>
                      <div className="font-semibold text-gray-900">{formatNumber(noteDetail.suspicious_shares)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">返金数</div>
                      <div className="font-semibold text-gray-900">{formatNumber(noteDetail.total_refunds)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">公開日</div>
                      <div className="font-semibold text-gray-900">{formatDateTime(noteDetail.published_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">最終更新</div>
                      <div className="font-semibold text-gray-900">{formatDateTime(noteDetail.updated_at)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div>販売者: {noteDetail.author_username ?? '-'} ({noteDetail.author_email ?? '-'})</div>
                    {noteDetail.official_share_tweet_url && (
                      <div className="truncate">
                        公式ポスト: <a className="text-blue-600 underline" href={noteDetail.official_share_tweet_url} target="_blank" rel="noreferrer">{noteDetail.official_share_tweet_url}</a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUnpublish(noteDetail)}
                      disabled={actionTarget === noteDetail.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                      非公開にする
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(noteDetail)}
                      disabled={actionTarget === noteDetail.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      削除する
                    </button>
                    <Link
                      href={`/note/${noteDetail.id}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      編集画面を開く
                    </Link>
                  </div>

                  {actionMessage && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      {actionMessage}
                    </div>
                  )}

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      リスク指標
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {noteDetail.risk_indicators.length === 0 ? (
                        <span>指標はありません</span>
                      ) : (
                        noteDetail.risk_indicators.map((indicator) => (
                          <span key={indicator} className="rounded-full bg-white px-2 py-1 shadow-sm">
                            {indicator}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">NOTEを選択すると詳細が表示されます</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
