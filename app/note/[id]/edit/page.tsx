'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NoteEditor from '@/components/note/NoteEditor';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { mediaApi, noteApi } from '@/lib/api';
import { createEmptyBlock, normalizeBlock, isPaidBlock } from '@/lib/noteBlocks';
import type { NoteBlock, NoteDetail } from '@/types';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';

const MIN_TITLE_LENGTH = 3;
const MAX_CATEGORIES = 5;

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return null;
  }
};

interface NoteShareStats {
  total_shares: number;
  total_reward_points: number;
  verified_shares: number;
  suspicious_shares: number;
}

export default function NoteEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const { isAuthenticated, isInitialized, token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [pricePoints, setPricePoints] = useState('');
  const [blocks, setBlocks] = useState<NoteBlock[]>(() => [createEmptyBlock('paragraph')]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [allowShareUnlock, setAllowShareUnlock] = useState(false);
  const [shareStats, setShareStats] = useState<NoteShareStats | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCoverMediaOpen, setIsCoverMediaOpen] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId || !isInitialized) return;
      setLoading(true);
      setError(null);
      try {
        const response = await noteApi.get(noteId);
        const detail: NoteDetail = response.data;
        setTitle(detail.title ?? '');
        setCoverImageUrl(detail.cover_image_url ?? '');
        setExcerpt(detail.excerpt ?? '');
        setIsPaid(Boolean(detail.is_paid));
        setPricePoints(detail.price_points ? String(detail.price_points) : '');
        setCategories(Array.isArray(detail.categories) ? detail.categories : []);
        setAllowShareUnlock(Boolean(detail.allow_share_unlock));
        setBlocks(
          (detail.content_blocks && detail.content_blocks.length
            ? detail.content_blocks
            : [createEmptyBlock('paragraph')]
          ).map((block) => normalizeBlock(block))
        );
        setStatus(detail.status ?? 'draft');
        setPublishedAt(detail.published_at ?? null);
        
        // シェア統計を取得
        fetchShareStats();
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'NOTEが見つかりませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, isInitialized]);
  
  const fetchShareStats = async () => {
    if (!noteId || !token) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/notes/${noteId}/share-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setShareStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error);
    }
  };

  const handleCoverMediaSelect = (url: string) => {
    setCoverImageUrl(url);
    setIsCoverMediaOpen(false);
  };

  const openCoverFilePicker = () => {
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
      coverFileInputRef.current.click();
    }
  };

  const handleCoverFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsCoverUploading(true);
    try {
      const response = await mediaApi.upload(file, { optimize: true, max_width: 1920, max_height: 1080 });
      const url: string | undefined = response.data?.url;
      if (!url) {
        throw new Error('アップロード結果にURLが含まれていません');
      }
      setCoverImageUrl(url);
    } catch (uploadError) {
      console.error('カバー画像のアップロードに失敗しました', uploadError);
      alert('カバー画像のアップロードに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsCoverUploading(false);
      event.target.value = '';
    }
  };

  const toggleCategory = (value: string) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        return prev.filter((category) => category !== value);
      }
      if (prev.length >= MAX_CATEGORIES) {
        alert(`カテゴリは最大${MAX_CATEGORIES}件まで選択できます`);
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleBlocksChange = useCallback((next: NoteBlock[]) => {
    setBlocks(next.map((block) => normalizeBlock(block)));
  }, []);

  const paidBlockExists = useMemo(() => blocks.some((block) => isPaidBlock(block)), [blocks]);
  const effectivePaid = isPaid || paidBlockExists;

  const handlePaidToggle = (checked: boolean) => {
    setIsPaid(checked);
    if (!checked) {
      setBlocks((prev) => prev.map((block) => normalizeBlock({ ...block, access: 'public' })));
      setPricePoints('');
    }
  };

  const handlePriceChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPricePoints(value);
  };

  const validate = () => {
    if (!title || title.trim().length < MIN_TITLE_LENGTH) {
      return 'タイトルを3文字以上で入力してください';
    }

    const hasContent = blocks.some((block) => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
        return Boolean(block.data?.text && String(block.data.text).trim().length > 0);
      }
      if (block.type === 'list') {
        return Array.isArray(block.data?.items) && block.data.items.length > 0;
      }
      if (block.type === 'image') {
        return Boolean(block.data?.url && String(block.data.url).trim().length > 0);
      }
      return true;
    });

    if (!hasContent) {
      return '本文を入力してください';
    }

    if (effectivePaid) {
      const priceValue = Number(pricePoints);
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        return '有料記事の価格を1ポイント以上で設定してください';
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (saving) return;
    setError(null);
    setInfo(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!noteId) {
      setError('NOTE IDが見つかりません');
      return;
    }

    try {
      setSaving(true);
      const normalizedBlocks = blocks.map((block) => normalizeBlock(block));
      const payload = {
        title: title.trim(),
        cover_image_url: coverImageUrl.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content_blocks: normalizedBlocks,
        is_paid: effectivePaid,
        price_points: effectivePaid ? Number(pricePoints) || 0 : 0,
        categories,
        allow_share_unlock: allowShareUnlock,
      };

      const response = await noteApi.update(noteId, payload);
      setInfo('下書きとして保存しました。最新情報に更新されました。');
      setStatus(response.data?.status ?? status);
      setPublishedAt(response.data?.published_at ?? publishedAt);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'NOTEの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (action: 'publish' | 'unpublish') => {
    if (!noteId || actionLoading) return;
    setError(null);
    setInfo(null);

    try {
      setActionLoading(true);
      if (action === 'publish') {
        await noteApi.publish(noteId);
        setStatus('published');
        setPublishedAt(new Date().toISOString());
        setInfo('記事を公開しました');
      } else {
        await noteApi.unpublish(noteId);
        setStatus('draft');
        setPublishedAt(null);
        setInfo('記事を下書きに戻しました');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : action === 'publish'
            ? '公開に失敗しました'
            : '非公開に失敗しました'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (!isInitialized || loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const subtitle =
    status === 'published' ? '公開中の記事を編集しています' : '下書きの記事を編集しています';

  return (
    <DashboardLayout pageTitle="NOTE編集" pageSubtitle={subtitle}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {status === 'published' ? '公開中' : '下書き'}
            </span>
            {publishedAt ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                最終公開: {formatDateTime(publishedAt) ?? '---'}
              </span>
            ) : null}
          </div>
          <div className="text-xs text-slate-500">
            {status === 'published'
              ? '公開中の記事です。変更後は再度公開状態で保存してください。'
              : '現在は下書きです。公開ボタンから公開できます。'}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {info ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</div>
        ) : null}

        {/* シェア統計セクション */}
        {shareStats && shareStats.total_shares > 0 ? (
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-blue-900">📊 シェア統計</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">総シェア数</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{shareStats.total_shares}回</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">獲得ポイント</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{shareStats.total_reward_points}P</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">検証済み</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{shareStats.verified_shares}件</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">不正疑い</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">{shareStats.suspicious_shares}件</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="記事タイトル"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={saving || actionLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">概要</label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="記事の要約"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={saving || actionLoading}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">カバー画像</label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openCoverFilePicker}
                    disabled={saving || actionLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    画像をアップロード
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCoverMediaOpen(true)}
                    disabled={saving || actionLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    メディアから選択
                  </button>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileSelect}
                  />
                </div>
                {isCoverUploading ? (
                  <p className="mt-2 text-xs font-semibold text-blue-600">アップロード中...</p>
                ) : null}
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={saving || actionLoading}
                />
                {coverImageUrl.trim() ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <img src={coverImageUrl} alt="cover preview" className="h-40 w-full object-cover" />
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-600">公開状況</p>
                <p className="mt-1">
                  {status === 'published'
                    ? 'この記事は公開中です。変更を反映するには再度公開状態で保存してください。'
                    : '現在は下書きです。公開するとマーケットに表示されます。'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">カテゴリーを選択</p>
                  <p className="text-xs text-slate-500">最大{MAX_CATEGORIES}件まで選択できます。マーケットでの露出を高めるためにも設定がおすすめです。</p>
                </div>
                {categories.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                    <span>選択中:</span>
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600"
                      >
                        #{NOTE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {NOTE_CATEGORY_OPTIONS.map((option) => {
                  const isActive = categories.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleCategory(option.value)}
                      disabled={saving || actionLoading}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } ${(saving || actionLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">有料記事として販売する</p>
                  <p className="text-xs text-slate-500">有料ブロックがある場合は自動的に有料記事になります。</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={isPaid}
                    onChange={(event) => handlePaidToggle(event.target.checked)}
                    disabled={saving || actionLoading}
                  />
                  有料設定を手動でオンにする
                </label>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">価格 (ポイント)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pricePoints}
                    onChange={(event) => handlePriceChange(event.target.value)}
                    placeholder="例: 1200"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    disabled={saving || actionLoading || !effectivePaid}
                  />
                </div>
                <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs text-slate-600">
                  <p>
                    {effectivePaid
                      ? paidBlockExists
                        ? '有料ブロックが含まれているため自動的に有料記事扱いになります。'
                        : '有料設定がオンです。購入後のみ閲覧できるブロックを設定してください。'
                      : 'すべてのブロックが無料公開されます。'}
                  </p>
                </div>
              </div>
            </div>

            {effectivePaid && (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Xシェアで無料解放を許可</p>
                    <p className="text-xs text-amber-700">
                      読者がXでシェアすることで、ポイント支払いなしで記事を読めるようにします。
                      シェアされるたびにあなたにポイント報酬が付与されます。
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-amber-900">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      checked={allowShareUnlock}
                      onChange={(event) => setAllowShareUnlock(event.target.checked)}
                      disabled={saving || actionLoading}
                    />
                    許可する
                  </label>
                </div>
                {allowShareUnlock && (
                  <div className="mt-3 rounded-xl border border-amber-300 bg-white/80 px-3 py-2 text-xs text-amber-800">
                    <p className="font-semibold">💡 ヒント</p>
                    <p className="mt-1">
                      シェア解放を許可すると、拡散力が高まり多くの読者に届きやすくなります。
                      シェア数に応じてポイント報酬も獲得できます（レートは管理者が設定）。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">本文ブロック</h2>
              <p className="mt-1 text-xs text-slate-500">段落・見出し・画像などを自由に組み合わせて記事を構成できます。</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              {blocks.length} ブロック
            </div>
          </div>
          <NoteEditor value={blocks} onChange={handleBlocksChange} disabled={saving || actionLoading} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePublishToggle(status === 'published' ? 'unpublish' : 'publish')}
              disabled={actionLoading}
              className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
                status === 'published'
                  ? 'border border-slate-300 text-slate-600 hover:border-slate-400'
                  : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {actionLoading
                ? '処理中...'
                : status === 'published'
                  ? '非公開にする'
                  : '公開する'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/note"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
            >
              ノート一覧へ戻る
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || actionLoading}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? '保存中...' : '下書きを保存'}
            </button>
          </div>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isCoverMediaOpen}
        onClose={() => setIsCoverMediaOpen(false)}
        onSelect={handleCoverMediaSelect}
      />
    </DashboardLayout>
  );
}
