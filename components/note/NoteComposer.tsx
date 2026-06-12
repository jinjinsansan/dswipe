'use client';

/* note.com型の統一記事エディタ(Phase11)
   mock: design_handoff_dswipe/D-Swipe Note Editor.html
   - 白い執筆キャンバス(タイトル+本文)だけを見せ、設定は「公開に進む」のサイドシートに隔離
   - create/edit を単一コンポーネントで統一(旧 note/create 70KB + note/[id]/edit 74KB を置換)
   - エンジンは既存 NoteRichEditor(Tiptap+有料エリア属性)を流用
   - classic(ブロック型)記事は読み込み時にリッチへ自動変換(ユーザー承認済み) */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { noteApi, salonApi } from '@/lib/api';
import { appConfirm } from '@/components/ui/Feedback';
import { GRAD_BRAND } from '@/lib/momentum';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';
import { noteBlocksToRichContent } from '@/lib/noteBlocksToRich';
import { useAuthStore } from '@/store/authStore';
import type {
  NoteDetail,
  NoteRichContent,
  NoteVisibility,
  Salon,
  SalonListResult,
} from '@/types';
import NoteRichEditor from './NoteRichEditor';

const MediaLibraryModal = dynamic(() => import('@/components/MediaLibraryModal'), {
  loading: () => null,
  ssr: false,
});

const MIN_TITLE_LENGTH = 3;
const AUTOSAVE_DELAY_MS = 2500;

const EMPTY_RICH_CONTENT: NoteRichContent = {
  type: 'doc',
  content: [{ type: 'paragraph', attrs: { access: 'public' }, content: [] }],
};

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface NoteComposerProps {
  mode: 'create' | 'edit';
  noteId?: string;
}

const richContentHasBody = (doc: NoteRichContent | null | undefined): boolean => {
  if (!doc || (doc as { type?: string }).type !== 'doc' || !Array.isArray((doc as { content?: unknown[] }).content)) {
    return false;
  }
  const visit = (nodes: unknown[]): boolean => {
    for (const node of nodes as Array<Record<string, any>>) {
      if (!node) continue;
      if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) return true;
      if (node.type === 'image' && typeof node.attrs?.src === 'string' && node.attrs.src.trim().length > 0) return true;
      if (Array.isArray(node.content) && visit(node.content)) return true;
    }
    return false;
  };
  return visit((doc as { content: unknown[] }).content);
};

export default function NoteComposer({ mode, noteId: initialNoteId }: NoteComposerProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, token } = useAuthStore();

  /* ----- 記事本体 ----- */
  const [noteId, setNoteId] = useState<string | null>(initialNoteId ?? null);
  const [title, setTitle] = useState('');
  const [richContent, setRichContent] = useState<NoteRichContent>(EMPTY_RICH_CONTENT);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [slug, setSlug] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [convertedFromClassic, setConvertedFromClassic] = useState(false);

  /* ----- 公開シート設定 ----- */
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [pricePoints, setPricePoints] = useState('');
  const [priceJpy, setPriceJpy] = useState('');
  const [allowPointPurchase, setAllowPointPurchase] = useState(true);
  const [allowJpyPurchase, setAllowJpyPurchase] = useState(false);
  const [taxRate, setTaxRate] = useState('10');
  const [taxInclusive, setTaxInclusive] = useState(true);
  const [visibility, setVisibility] = useState<NoteVisibility>('private');
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [allowShareUnlock, setAllowShareUnlock] = useState(false);
  const [salonOptions, setSalonOptions] = useState<Salon[]>([]);
  const [selectedSalonIds, setSelectedSalonIds] = useState<string[]>([]);

  /* ----- 保存と通知 ----- */
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCoverMediaOpen, setIsCoverMediaOpen] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const noteIdRef = useRef<string | null>(initialNoteId ?? null);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  /* ----- 認証ガード ----- */
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  /* ----- 既存記事の読み込み(edit) ----- */
  useEffect(() => {
    if (mode !== 'edit' || !initialNoteId || !isInitialized || !isAuthenticated) return;
    let mounted = true;
    (async () => {
      try {
        const response = await noteApi.get(initialNoteId);
        if (!mounted) return;
        const detail = response.data as NoteDetail;
        setTitle(detail.title ?? '');
        setCoverImageUrl(detail.cover_image_url ?? '');
        setExcerpt(detail.excerpt ?? '');
        setCategories(detail.categories ?? []);
        setIsPaid(Boolean(detail.is_paid));
        setPricePoints(detail.price_points ? String(detail.price_points) : '');
        setPriceJpy(detail.price_jpy ? String(detail.price_jpy) : '');
        setAllowPointPurchase(detail.allow_point_purchase ?? true);
        setAllowJpyPurchase(detail.allow_jpy_purchase ?? false);
        setTaxRate(detail.tax_rate != null ? String(detail.tax_rate) : '10');
        setTaxInclusive(detail.tax_inclusive ?? true);
        setVisibility(detail.visibility ?? 'private');
        setRequiresLogin(Boolean(detail.requires_login));
        setAllowShareUnlock(Boolean(detail.allow_share_unlock));
        setSelectedSalonIds(detail.salon_access_ids ?? []);
        setStatus(detail.status ?? 'draft');
        setSlug(detail.slug ?? '');
        setShareUrl(detail.share_url ?? null);

        if (detail.editor_type === 'note' && detail.rich_content) {
          setRichContent(detail.rich_content as NoteRichContent);
        } else if (detail.editor_type === 'classic') {
          // ブロック型 → リッチへ自動変換(次回保存で note 型として確定)
          setRichContent(noteBlocksToRichContent(detail.content_blocks ?? []));
          setConvertedFromClassic(true);
        } else {
          setRichContent((detail.rich_content as NoteRichContent) ?? EMPTY_RICH_CONTENT);
        }
      } catch (err: any) {
        if (!mounted) return;
        const detail = err?.response?.data?.detail;
        setLoadError(typeof detail === 'string' ? detail : '記事の読み込みに失敗しました');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mode, initialNoteId, isInitialized, isAuthenticated]);

  /* ----- サロン一覧 ----- */
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    salonApi
      .list()
      .then((response) => {
        if (!mounted) return;
        const payload = response.data as SalonListResult;
        setSalonOptions(payload?.data ?? []);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  /* ----- タイトルtextareaの自動リサイズ ----- */
  const resizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useEffect(() => {
    resizeTitle();
  }, [title, isLoading, resizeTitle]);

  /* ----- 有料判定/バリデーション ----- */
  const effectivePaid = useMemo(() => {
    const hasPaidNodes = JSON.stringify(richContent).includes('"access":"paid"');
    return isPaid || hasPaidNodes;
  }, [isPaid, richContent]);

  const validate = useCallback((): string | null => {
    if (!title || title.trim().length < MIN_TITLE_LENGTH) {
      return `タイトルは${MIN_TITLE_LENGTH}文字以上で入力してください`;
    }
    if (!richContentHasBody(richContent)) {
      return '本文を入力してください';
    }
    if (effectivePaid) {
      if (!allowPointPurchase && !allowJpyPurchase) {
        return '有料記事には販売方法(ポイント/円)を1つ以上設定してください';
      }
      if (allowPointPurchase) {
        const value = Number(pricePoints);
        if (!Number.isFinite(value) || value <= 0) return 'ポイント価格を入力してください';
      }
      if (allowJpyPurchase) {
        const value = Number(priceJpy);
        if (!Number.isFinite(value) || value <= 0) return '円価格を入力してください';
      }
    }
    return null;
  }, [title, richContent, effectivePaid, allowPointPurchase, allowJpyPurchase, pricePoints, priceJpy]);

  /* ----- ペイロード構築(旧create/editと同一仕様) ----- */
  const buildPayload = useCallback(() => {
    const parsedPoints = Number(pricePoints);
    const parsedJpy = Number(priceJpy);
    const normalizedTaxRate = taxRate.trim();
    const parsedTaxRate = normalizedTaxRate === '' ? null : Number(normalizedTaxRate);
    return {
      title: title.trim(),
      cover_image_url: coverImageUrl.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content_blocks: [],
      rich_content: richContent,
      editor_type: 'note' as const,
      is_paid: effectivePaid,
      price_points: effectivePaid && allowPointPurchase && Number.isFinite(parsedPoints) ? parsedPoints : 0,
      price_jpy: effectivePaid && allowJpyPurchase && Number.isFinite(parsedJpy) ? parsedJpy : null,
      allow_point_purchase: effectivePaid ? allowPointPurchase : false,
      allow_jpy_purchase: effectivePaid ? allowJpyPurchase : false,
      tax_rate: effectivePaid && parsedTaxRate !== null && !Number.isNaN(parsedTaxRate) ? parsedTaxRate : null,
      tax_inclusive: effectivePaid ? taxInclusive : true,
      categories,
      allow_share_unlock: allowShareUnlock,
      salon_ids: selectedSalonIds,
      visibility,
      requires_login: visibility === 'public' ? requiresLogin : false,
    };
  }, [
    title, coverImageUrl, excerpt, richContent, effectivePaid,
    allowPointPurchase, allowJpyPurchase, pricePoints, priceJpy,
    taxRate, taxInclusive, categories, allowShareUnlock,
    selectedSalonIds, visibility, requiresLogin,
  ]);

  /* ----- 保存(下書き/オートセーブ共通) ----- */
  const saveDraft = useCallback(
    async (options?: { silent?: boolean }): Promise<boolean> => {
      if (savingRef.current) return false;
      const validationError = validate();
      if (validationError) {
        if (!options?.silent) setErrorMessage(validationError);
        return false;
      }
      savingRef.current = true;
      setSaveState('saving');
      setErrorMessage(null);
      try {
        const payload = buildPayload();
        if (!noteIdRef.current) {
          const response = await noteApi.create(payload);
          const createdId = response.data?.id;
          if (createdId) {
            noteIdRef.current = createdId;
            setNoteId(createdId);
            setSlug(response.data?.slug ?? '');
            // 執筆を中断せずURLだけ編集ページに揃える(リロード対応)
            window.history.replaceState(null, '', `/note/${createdId}/edit`);
          }
        } else {
          // note型の更新では content_blocks を送らない
          // (バックエンドが「NOTE風エディタの記事は rich_content を更新してください」と拒否するため。
          //  旧edit実装も note型では rich_content のみ送信していた)
          const { content_blocks: _omitted, ...updatePayload } = payload;
          void _omitted;
          const response = await noteApi.update(noteIdRef.current, updatePayload as never);
          setStatus(response.data?.status ?? status);
          setSlug(response.data?.slug ?? slug);
          setShareUrl(response.data?.share_url ?? shareUrl);
        }
        dirtyRef.current = false;
        setSaveState('saved');
        setLastSavedAt(new Date());
        if (convertedFromClassic) setConvertedFromClassic(false);
        return true;
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setSaveState('error');
        setErrorMessage(typeof detail === 'string' ? detail : '保存に失敗しました');
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [validate, buildPayload, status, slug, shareUrl, convertedFromClassic],
  );

  /* ----- オートセーブ ----- */
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setSaveState((prev) => (prev === 'saving' ? prev : 'dirty'));
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      if (dirtyRef.current && validate() === null) {
        void saveDraft({ silent: true });
      }
    }, AUTOSAVE_DELAY_MS);
  }, [validate, saveDraft]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    markDirty();
  };

  const handleRichChange = useCallback(
    (next: NoteRichContent) => {
      setRichContent(next);
      markDirty();
    },
    [markDirty],
  );

  /* ----- 公開/非公開/削除 ----- */
  const handlePublish = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const saved = await saveDraft();
      if (!saved || !noteIdRef.current) return;
      const response = await noteApi.publish(noteIdRef.current);
      const detail = response.data;
      setStatus(detail?.status ?? 'published');
      const nextSlug = detail?.slug ?? slug;
      setSlug(nextSlug);
      setShareUrl(detail?.share_url ?? shareUrl);
      setIsSheetOpen(false);
      if (nextSlug) {
        router.push(`/notes/${nextSlug}`);
      } else if (detail?.share_url) {
        router.push(detail.share_url);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : '公開に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (actionLoading || !noteIdRef.current) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const response = await noteApi.unpublish(noteIdRef.current);
      setStatus(response.data?.status ?? 'draft');
      setShareUrl(response.data?.share_url ?? shareUrl);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : '非公開に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading || !noteIdRef.current) return;
    const confirmed = await appConfirm({
      title: 'この記事を削除しますか？',
      message: '削除した記事は元に戻せません。',
      confirmLabel: '削除する',
      danger: true,
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await noteApi.delete(noteIdRef.current);
      router.push('/note');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(typeof detail === 'string' ? detail : '削除に失敗しました');
      setActionLoading(false);
    }
  };

  /* ----- アイキャッチ ----- */
  const handleCoverSelect = (url: string) => {
    setCoverImageUrl(url);
    setIsCoverMediaOpen(false);
    markDirty();
  };

  /* ----- 限定公開URL ----- */
  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* noop */
    }
  };

  const handleRotateShareToken = async () => {
    if (!noteIdRef.current || actionLoading) return;
    setActionLoading(true);
    try {
      const response = await noteApi.rotateShareToken(noteIdRef.current);
      setShareUrl(response.data?.share_url ?? shareUrl);
    } catch {
      setErrorMessage('限定URLの再発行に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCategory = (value: string) => {
    setCategories((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    markDirty();
  };

  const toggleSalon = (id: string) => {
    setSelectedSalonIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    markDirty();
  };

  /* ----- 文字数(本文テキストノード合計) ----- */
  const charCount = useMemo(() => {
    let count = 0;
    const visit = (nodes: unknown[]): void => {
      for (const node of nodes as Array<Record<string, any>>) {
        if (!node) continue;
        if (node.type === 'text' && typeof node.text === 'string') count += node.text.length;
        if (Array.isArray(node.content)) visit(node.content);
      }
    };
    const doc = richContent as { content?: unknown[] };
    if (Array.isArray(doc?.content)) visit(doc.content);
    return count;
  }, [richContent]);

  /* ----- 保存状態表示 ----- */
  const saveStatusLabel = useMemo(() => {
    if (saveState === 'saving') return '保存中…';
    if (saveState === 'error') return '保存エラー';
    if (saveState === 'saved' && lastSavedAt) {
      return `保存済み ${lastSavedAt.getHours().toString().padStart(2, '0')}:${lastSavedAt.getMinutes().toString().padStart(2, '0')}`;
    }
    if (saveState === 'dirty') return '未保存の変更';
    return mode === 'create' ? '下書き' : '';
  }, [saveState, lastSavedAt, mode]);

  if (!isInitialized || (mode === 'edit' && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        読み込み中…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-sm font-semibold text-red-600">{loadError}</p>
        <Link href="/note" className="text-sm font-semibold text-sky-600 hover:underline">
          記事一覧に戻る
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-[10px] border border-line-soft bg-white px-3 py-2 text-sm text-navy-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-[3px] focus:ring-sky-500/15';

  return (
    <div className="min-h-screen bg-white">
      {/* ----- 最小限のトップバー(note.com流) ----- */}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[960px] items-center gap-3 px-4">
          <Link
            href="/note"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-navy-900"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">記事一覧</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {status === 'published' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                公開中
              </span>
            ) : null}
            <span className={saveState === 'error' ? 'font-semibold text-red-500' : ''}>{saveStatusLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:inline" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {charCount.toLocaleString()} 文字
            </span>
            {status === 'published' && slug ? (
              <a
                href={`/notes/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full border border-tint-border px-3.5 py-1.5 text-xs font-bold text-sky-600 transition hover:bg-brand-tint sm:inline-flex"
              >
                記事を見る
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition hover:-translate-y-px"
              style={{ background: GRAD_BRAND }}
            >
              <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
              公開に進む
            </button>
          </div>
        </div>
      </header>

      {errorMessage ? (
        <div className="mx-auto mt-4 flex max-w-[760px] items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {convertedFromClassic ? (
        <div className="mx-auto mt-4 max-w-[760px] rounded-xl border border-tint-border bg-brand-tint px-4 py-3 text-xs leading-relaxed text-slate-600">
          この記事は旧ブロックエディタで作成されたため、新エディタ用に変換して表示しています。保存すると新形式で確定します。
        </div>
      ) : null}

      {/* ----- 執筆キャンバス ----- */}
      <main className="mx-auto max-w-[760px] px-4 pb-32 pt-8 sm:pt-12">
        {/* アイキャッチ */}
        {coverImageUrl ? (
          <div className="group relative mb-6 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="アイキャッチ画像" className="max-h-[320px] w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setCoverImageUrl('');
                markDirty();
              }}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-pure-white opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
              削除
            </button>
          </div>
        ) : (
          <div className="mb-5 flex justify-center">
            {/* note.com流: タイトル上の丸い画像追加ボタン */}
            <button
              type="button"
              onClick={() => setIsCoverMediaOpen(true)}
              title="ヘッダー画像を追加"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-slate-400 transition hover:bg-brand-tint hover:text-sky-600"
            >
              {isCoverUploading ? (
                <span className="text-[10px] font-bold">…</span>
              ) : (
                <PhotoIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {/* タイトル — note.com流に中央寄せの大きな置き場 */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="記事タイトル"
          rows={1}
          className="w-full resize-none border-0 bg-transparent text-center text-[28px] font-extrabold leading-snug tracking-tight text-navy-900 placeholder-slate-300 focus:outline-none focus:ring-0 sm:text-[32px]"
        />

        {/* 本文(Tiptap) */}
        <div className="mt-2">
          <NoteRichEditor value={richContent} onChange={handleRichChange} />
        </div>
      </main>

      {/* ----- 公開サイドシート ----- */}
      {isSheetOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-[rgba(7,15,30,.45)] backdrop-blur-sm"
            onClick={() => setIsSheetOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-label="公開設定"
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-30px_0_80px_-40px_rgba(0,0,0,.5)]"
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-navy-900">公開設定</h2>
                <p className="text-xs text-slate-500">価格・カテゴリ・公開範囲を確認して公開します</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-slate-500 transition hover:text-navy-900"
                aria-label="閉じる"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {/* 販売設定 */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">販売</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaid(false);
                      setPricePoints('');
                      setPriceJpy('');
                      markDirty();
                    }}
                    className={`flex-1 rounded-[10px] border px-3 py-2.5 text-sm font-bold transition ${
                      !effectivePaid
                        ? 'border-sky-600 bg-brand-tint text-sky-600'
                        : 'border-line-soft bg-white text-slate-600 hover:border-tint-border'
                    }`}
                  >
                    無料
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaid(true);
                      if (!allowPointPurchase && !allowJpyPurchase) setAllowPointPurchase(true);
                      markDirty();
                    }}
                    className={`flex-1 rounded-[10px] border px-3 py-2.5 text-sm font-bold transition ${
                      effectivePaid
                        ? 'border-sky-600 bg-brand-tint text-sky-600'
                        : 'border-line-soft bg-white text-slate-600 hover:border-tint-border'
                    }`}
                  >
                    有料
                  </button>
                </div>
                {effectivePaid ? (
                  <div className="space-y-3 rounded-xl border border-line-soft bg-canvas p-3">
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      本文中の「有料エリア」より下が購入者限定になります。エリア未設定の場合は全文が有料です。
                    </p>
                    <label className="flex items-center justify-between gap-2 text-sm text-navy-900">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <input
                          type="checkbox"
                          checked={allowPointPurchase}
                          onChange={(event) => {
                            setAllowPointPurchase(event.target.checked);
                            markDirty();
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        ポイント販売
                      </span>
                      <span className="flex items-center gap-1">
                        <input
                          value={pricePoints}
                          onChange={(event) => {
                            if (!/^\d*$/.test(event.target.value)) return;
                            setPricePoints(event.target.value);
                            markDirty();
                          }}
                          placeholder="500"
                          disabled={!allowPointPurchase}
                          className={`${inputClass} w-24 text-right disabled:opacity-40`}
                        />
                        <span className="text-xs text-slate-500">P</span>
                      </span>
                    </label>
                    <label className="flex items-center justify-between gap-2 text-sm text-navy-900">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <input
                          type="checkbox"
                          checked={allowJpyPurchase}
                          onChange={(event) => {
                            setAllowJpyPurchase(event.target.checked);
                            markDirty();
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        円(カード)販売
                      </span>
                      <span className="flex items-center gap-1">
                        <input
                          value={priceJpy}
                          onChange={(event) => {
                            if (!/^\d*$/.test(event.target.value)) return;
                            setPriceJpy(event.target.value);
                            markDirty();
                          }}
                          placeholder="980"
                          disabled={!allowJpyPurchase}
                          className={`${inputClass} w-24 text-right disabled:opacity-40`}
                        />
                        <span className="text-xs text-slate-500">円</span>
                      </span>
                    </label>
                    {allowJpyPurchase ? (
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span>税率</span>
                        <span className="flex items-center gap-2">
                          <input
                            value={taxRate}
                            onChange={(event) => {
                              if (!/^\d*(\.\d{0,2})?$/.test(event.target.value)) return;
                              setTaxRate(event.target.value);
                              markDirty();
                            }}
                            className={`${inputClass} w-16 text-right`}
                          />
                          %
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={taxInclusive}
                              onChange={(event) => {
                                setTaxInclusive(event.target.checked);
                                markDirty();
                              }}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600"
                            />
                            内税
                          </label>
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              {/* 公開範囲 */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">公開範囲</h3>
                {(
                  [
                    { value: 'public', label: '公開', hint: '一覧やマーケットに表示されます' },
                    { value: 'limited', label: '限定公開', hint: 'URLを知っている人だけが読めます' },
                    { value: 'private', label: '非公開', hint: '自分だけが見られます(下書き)' },
                  ] as Array<{ value: NoteVisibility; label: string; hint: string }>
                ).map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-[10px] border px-3 py-2.5 transition ${
                      visibility === option.value
                        ? 'border-sky-600 bg-brand-tint'
                        : 'border-line-soft bg-white hover:border-tint-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="note-visibility"
                      checked={visibility === option.value}
                      onChange={() => {
                        setVisibility(option.value);
                        if (option.value !== 'public') setRequiresLogin(false);
                        markDirty();
                      }}
                      className="mt-0.5 h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>
                      <span className="block text-sm font-bold text-navy-900">{option.label}</span>
                      <span className="block text-[11px] text-slate-500">{option.hint}</span>
                    </span>
                  </label>
                ))}
                {visibility === 'public' ? (
                  <label className="flex items-center gap-2 px-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={requiresLogin}
                      onChange={(event) => {
                        setRequiresLogin(event.target.checked);
                        markDirty();
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600"
                    />
                    閲覧にログインを必須にする
                  </label>
                ) : null}
                {visibility === 'limited' && shareUrl ? (
                  <div className="space-y-2 rounded-[10px] border border-line-soft bg-canvas p-3">
                    <p className="break-all text-[11px] text-slate-500">{shareUrl}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopyShareUrl}
                        className="rounded-full border border-tint-border px-3 py-1 text-[11px] font-bold text-sky-600 hover:bg-brand-tint"
                      >
                        URLをコピー
                      </button>
                      <button
                        type="button"
                        onClick={handleRotateShareToken}
                        disabled={actionLoading}
                        className="rounded-full border border-line-soft px-3 py-1 text-[11px] font-semibold text-slate-500 hover:text-navy-900 disabled:opacity-50"
                      >
                        URLを再発行
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>

              {/* カテゴリ */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">カテゴリ</h3>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_CATEGORY_OPTIONS.map((option) => {
                    const isSelected = categories.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleCategory(option.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          isSelected
                            ? 'border-sky-600 bg-brand-tint text-sky-600'
                            : 'border-line-soft bg-white text-slate-600 hover:border-tint-border'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 抜粋 */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">抜粋(一覧・OGP用)</h3>
                <textarea
                  value={excerpt}
                  onChange={(event) => {
                    setExcerpt(event.target.value);
                    markDirty();
                  }}
                  rows={3}
                  placeholder="記事の紹介文(未入力なら本文冒頭が使われます)"
                  className={`${inputClass} resize-none`}
                />
              </section>

              {/* シェアで解錠 */}
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">シェアで解錠</h3>
                <label className="flex items-start gap-2.5 text-sm text-navy-900">
                  <input
                    type="checkbox"
                    checked={allowShareUnlock}
                    onChange={(event) => {
                      setAllowShareUnlock(event.target.checked);
                      markDirty();
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    <span className="block font-semibold">Xシェアで有料エリアを解錠可能にする</span>
                    <span className="block text-[11px] text-slate-500">
                      公式ポストの指定は公開後に記事一覧の「シェア設定」から行えます。
                    </span>
                  </span>
                </label>
              </section>

              {/* サロン特典 */}
              {salonOptions.length > 0 ? (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">サロン会員に無料公開</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {salonOptions.map((salon) => {
                      const isSelected = selectedSalonIds.includes(salon.id);
                      return (
                        <button
                          key={salon.id}
                          type="button"
                          onClick={() => toggleSalon(salon.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-line-soft bg-white text-slate-600 hover:border-tint-border'
                          }`}
                        >
                          {salon.title || '無題のサロン'}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* 危険ゾーン */}
              {mode === 'edit' || noteId ? (
                <section className="space-y-2 border-t border-line-soft pt-4">
                  <div className="flex flex-wrap gap-2">
                    {status === 'published' ? (
                      <button
                        type="button"
                        onClick={handleUnpublish}
                        disabled={actionLoading}
                        className="rounded-full border border-line-soft px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-tint-border hover:text-navy-900 disabled:opacity-50"
                      >
                        非公開に戻す
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      記事を削除
                    </button>
                  </div>
                </section>
              ) : null}
            </div>

            {/* シートフッター */}
            <div className="space-y-2 border-t border-line-soft px-5 py-4">
              <button
                type="button"
                onClick={handlePublish}
                disabled={actionLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition disabled:opacity-60"
                style={{ background: GRAD_BRAND }}
              >
                <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                {actionLoading ? '処理中…' : status === 'published' ? '更新を公開する' : '公開する'}
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={actionLoading}
                className="w-full rounded-[12px] border border-line-soft px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-tint-border hover:text-navy-900 disabled:opacity-50"
              >
                下書き保存して閉じない
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {isCoverMediaOpen ? (
        <MediaLibraryModal
          isOpen={isCoverMediaOpen}
          onClose={() => setIsCoverMediaOpen(false)}
          onSelect={handleCoverSelect}
          allowedMediaTypes={['image']}
        />
      ) : null}
    </div>
  );
}
