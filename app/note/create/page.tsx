'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';
import DSwipeLogo from '@/components/DSwipeLogo';
import {
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import DashboardMobileNav from '@/components/dashboard/DashboardMobileNav';
import NoteEditor from '@/components/note/NoteEditor';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { mediaApi, noteApi } from '@/lib/api';
import { createEmptyBlock, normalizeBlock, isPaidBlock } from '@/lib/noteBlocks';
import type { NoteBlock } from '@/types';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';

const MIN_TITLE_LENGTH = 3;
const MAX_CATEGORIES = 5;

export default function NoteCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();

  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [pricePoints, setPricePoints] = useState('');
  const [blocks, setBlocks] = useState<NoteBlock[]>(() => [createEmptyBlock('paragraph')]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCoverMediaOpen, setIsCoverMediaOpen] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  const navLinks = useMemo(
    () => getDashboardNavLinks({ isAdmin, userType: user?.user_type }),
    [isAdmin, user?.user_type]
  );
  const navGroups = useMemo(() => groupDashboardNavLinks(navLinks), [navLinks]);

  const handleLogout = () => {
    logout();
    router.push('/');
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

  const handleCoverMediaSelect = (url: string) => {
    setCoverImageUrl(url);
    setIsCoverMediaOpen(false);
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
      };

      const response = await noteApi.create(payload);
      setInfo('下書きとして保存しました。編集画面に移動します。');
      setTimeout(() => {
        router.push(`/note/${response.data.id}/edit`);
      }, 600);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'NOTEの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden sm:flex w-52 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 h-16 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="flex flex-col gap-4">
            {navGroups.map((group) => {
              const meta = getDashboardNavGroupMeta(group.key);
              return (
                <div key={group.key} className="space-y-1.5">
                  <p className={`px-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.headingClass}`}>
                    {meta.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((link) => {
                      const active = isDashboardLinkActive(pathname, link.href);
                      const linkProps = link.external
                        ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
                        : { href: link.href };
                      const styles = getDashboardNavClasses(link, { variant: 'desktop', active });

                      return (
                        <Link
                          key={link.href}
                          {...linkProps}
                          className={`flex items-center justify-between gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${styles.container}`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className={`flex h-5 w-5 items-center justify-center ${styles.icon}`}>
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </span>
                          {link.badge ? (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 text-sm font-medium truncate">{user?.username}</div>
              <div className="text-slate-500 text-xs capitalize">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
          <div className="hidden sm:block flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0.5">新規NOTE作成</h1>
            <p className="text-slate-500 text-[11px] sm:text-xs font-medium truncate">noteスタイルの記事をブロック単位で作成できます</p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            フェーズ3: エディタ実装中
          </div>
        </div>

        <div className="sm:hidden border-b border-slate-200 bg-white/90">
          <DashboardMobileNav navGroups={navGroups} pathname={pathname} />
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {info}
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
                    placeholder="例：月収100万円を達成したオンライン講座運営の全ステップ"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">概要</label>
                    <textarea
                      rows={3}
                      value={excerpt}
                      onChange={(event) => setExcerpt(event.target.value)}
                      placeholder="記事の要約やリード文を入力してください"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">カバー画像</label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={openCoverFilePicker}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        画像をアップロード
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCoverMediaOpen(true)}
                        disabled={saving}
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
                      disabled={saving}
                    />
                    {coverImageUrl.trim() ? (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                        <img src={coverImageUrl} alt="cover preview" className="h-40 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <p className="font-semibold text-slate-600">公開ステータス</p>
                    <p className="mt-1">このページでは下書きが保存されます。公開は編集画面で切り替えられます。</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">カテゴリーを選択</p>
                      <p className="text-xs text-slate-500">最大{MAX_CATEGORIES}件まで選択できます。記事のテーマに近いものを選んでください。</p>
                    </div>
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                        <span>選択中:</span>
                        {categories.map((category) => (
                          <span key={category} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600">
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
                          disabled={saving}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                      <p className="text-xs text-slate-500">ブロック単位の有料設定を行うと自動的に有料記事扱いになります。</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={isPaid}
                        onChange={(event) => handlePaidToggle(event.target.checked)}
                        disabled={saving}
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
                        disabled={saving || !effectivePaid}
                      />
                    </div>
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs text-slate-600">
                      <p>
                        {effectivePaid
                          ? paidBlockExists
                            ? '有料ブロックが含まれているため自動的に有料記事になります。'
                            : '有料設定がオンです。購入前に読めないブロックを設定してください。'
                          : 'すべてのブロックが無料公開されます。'}
                      </p>
                    </div>
                  </div>
                </div>
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
              <NoteEditor value={blocks} onChange={handleBlocksChange} disabled={saving} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/note"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
              >
                キャンセル
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? '保存中...' : '下書きを保存'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <MediaLibraryModal
        isOpen={isCoverMediaOpen}
        onClose={() => setIsCoverMediaOpen(false)}
        onSelect={handleCoverMediaSelect}
      />
    </div>
  );
}
