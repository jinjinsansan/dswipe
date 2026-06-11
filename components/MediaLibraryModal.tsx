'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  PlayCircleIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { mediaApi } from '@/lib/api';
import { GRAD_BRAND } from '@/lib/momentum';

type MediaType = 'image' | 'video' | 'file';

/* ストックグラデ背景 — mock: D-Swipe Asset Picker.html の photo/grad セット。
   SVG data URI として返すため、通常の画像URLと同様に背景画像等で機能する。 */
const gradientDataUri = (from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#g)"/></svg>`,
  )}`;

const STOCK_GRADIENTS: Array<{ name: string; from: string; to: string }> = [
  { name: 'ネイビー×ティール', from: '#0b1f3a', to: '#0e7490' },
  { name: 'ブランドシアン', from: '#0284c7', to: '#06b6d4' },
  { name: 'ティール×シアン', from: '#0e7490', to: '#22d3ee' },
  { name: 'ディープブルー', from: '#1b3a61', to: '#0284c7' },
  { name: 'ミッドナイト', from: '#0f2c52', to: '#0e7490' },
  { name: 'ディープシー', from: '#07142a', to: '#0e5d80' },
  { name: 'ナイト', from: '#0b1220', to: '#1b3a61' },
  { name: 'オーシャングリーン', from: '#0e7490', to: '#16a34a' },
  { name: 'スカイ×ネイビー', from: '#0284c7', to: '#0b1f3a' },
  { name: 'フレッシュ', from: '#16a34a', to: '#22d3ee' },
  { name: 'スカイライト', from: '#0ea5e9', to: '#06b6d4' },
  { name: 'サンセット', from: '#f59e0b', to: '#ef4444' },
  { name: 'クリムゾン', from: '#e11d48', to: '#f59e0b' },
  { name: 'ヴァイオレット×スカイ', from: '#7c3aed', to: '#0284c7' },
];

type AssetCategory = 'upload' | 'gradient';
type PreviewRatio = '9:16' | '1:1' | '16:9';

interface MediaItem {
  url: string;
  uploaded_at: string;
  mediaType: MediaType;
  contentType?: string | null;
  filename?: string | null;
  size?: number | null;
}

const inferMediaTypeFromUrl = (url: string, contentType?: string | null): MediaType => {
  if (contentType?.startsWith('video/')) {
    return 'video';
  }

  const lowered = url.toLowerCase();
  if (/(\.mp4|\.webm|\.mov|\.m4v)(\?|$)/.test(lowered)) {
    return 'video';
  }

  if (/(\.apng|\.avif|\.gif|\.jpe?g|\.png|\.svg|\.webp)(\?|$)/.test(lowered)) {
    return 'image';
  }

  return 'file';
};

const normalizeStoredMedia = (raw: unknown): MediaItem[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const url = (item as any).url;
      const uploadedAt = (item as any).uploaded_at;
      if (!url || typeof url !== 'string' || !uploadedAt || typeof uploadedAt !== 'string') {
        return null;
      }

      const storedMediaType = (item as any).mediaType as MediaType | undefined;
      const contentType = (item as any).contentType as string | null | undefined;
      const filename = (item as any).filename as string | null | undefined;
      const size = (item as any).size as number | null | undefined;

      return {
        url,
        uploaded_at: uploadedAt,
        mediaType: storedMediaType === 'video' || storedMediaType === 'image'
          ? storedMediaType
          : storedMediaType === 'file'
            ? 'file'
            : inferMediaTypeFromUrl(url, contentType),
        contentType: contentType ?? null,
        filename: filename ?? null,
        size: typeof size === 'number' ? size : null,
      } as MediaItem;
    })
    .filter((item): item is MediaItem => Boolean(item));
};

const detectMediaTypeFromFile = (file: File): MediaType => {
  if (file.type.startsWith('video/')) {
    return 'video';
  }
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  const loweredName = file.name.toLowerCase();
  if (/(\.mp4|\.webm|\.mov|\.m4v)$/.test(loweredName)) {
    return 'video';
  }
  if (/(\.apng|\.avif|\.gif|\.jpe?g|\.png|\.svg|\.webp)$/.test(loweredName)) {
    return 'image';
  }
  return 'file';
};

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, metadata?: { mediaType: MediaType; contentType?: string | null; filename?: string | null }) => void;
  allowedMediaTypes?: MediaType[];
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, allowedMediaTypes }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [category, setCategory] = useState<AssetCategory>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewRatio, setPreviewRatio] = useState<PreviewRatio>('9:16');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const persistMedia = useCallback((items: MediaItem[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('uploaded_media', JSON.stringify(items));
  }, []);

  const loadMedia = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedMedia = window.localStorage.getItem('uploaded_media');
      if (!storedMedia) {
        setMedia([]);
        return;
      }

      const parsed = JSON.parse(storedMedia);
      const normalized = normalizeStoredMedia(parsed);
      setMedia(normalized);
    } catch (err) {
      console.error('メディアの読み込みに失敗しました', err);
      setMedia([]);
    }
  }, []);

  const appendMediaItems = useCallback((items: MediaItem[]) => {
    if (items.length === 0) {
      return;
    }
    setMedia((prev) => {
      const combined = [...items, ...prev];
      const deduped = new Map<string, MediaItem>();

      combined.forEach((item) => {
        deduped.set(item.url, item);
      });

      const sorted = Array.from(deduped.values()).sort(
        (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
      );

      persistMedia(sorted);
      return sorted;
    });
  }, [persistMedia]);

  const allowedTypesSet = useMemo(() => {
    if (!allowedMediaTypes || allowedMediaTypes.length === 0) {
      return null;
    }
    return new Set<MediaType>(allowedMediaTypes);
  }, [allowedMediaTypes]);

  const displayedMedia = useMemo(() => {
    let items = media;
    if (allowedTypesSet) {
      items = items.filter((item) => allowedTypesSet.has(item.mediaType));
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      items = items.filter((item) =>
        `${item.filename ?? ''} ${item.url}`.toLowerCase().includes(query),
      );
    }
    return items;
  }, [allowedTypesSet, media, searchQuery]);

  const displayedGradients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return STOCK_GRADIENTS;
    return STOCK_GRADIENTS.filter((gradient) => gradient.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const gradientAllowed = !allowedTypesSet || allowedTypesSet.has('image');

  const inputAccept = useMemo(() => {
    if (!allowedTypesSet) {
      return 'image/*,video/mp4,video/webm,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    const accepts: string[] = [];
    if (allowedTypesSet.has('image')) {
      accepts.push('image/*');
    }
    if (allowedTypesSet.has('video')) {
      accepts.push('video/mp4', 'video/webm');
    }
    if (allowedTypesSet.has('file')) {
      accepts.push('application/pdf', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    return accepts.join(',') || 'image/*,video/mp4,video/webm';
  }, [allowedTypesSet]);

  const isFilteredEmpty = useMemo(
    () => displayedMedia.length === 0 && media.length > 0,
    [displayedMedia.length, media.length],
  );

  const filteredEmptyMessage = useMemo(() => {
    if (!isFilteredEmpty) {
      return null;
    }

    if (allowedTypesSet?.size === 1) {
      if (allowedTypesSet.has('video')) {
        return 'アップロード済みの動画ファイルがありません。新しくアップロードしてください。';
      }
      if (allowedTypesSet.has('image')) {
        return 'アップロード済みの画像ファイルがありません。新しくアップロードしてください。';
      }
    }

    return '指定された条件に合致するファイルがありません。';
  }, [allowedTypesSet, isFilteredEmpty]);

  const FilteredEmptyIcon = useMemo(() => {
    if (allowedTypesSet?.size === 1 && allowedTypesSet.has('video')) {
      return PlayCircleIcon;
    }
    return PhotoIcon;
  }, [allowedTypesSet]);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);
    const uploaded: MediaItem[] = [];

    try {
      for (const file of files) {
        const mediaType = detectMediaTypeFromFile(file);
        const response = await mediaApi.upload(file, {
          mediaType: mediaType === 'file' ? 'image' : mediaType,
          optimize: mediaType === 'image',
        });

        const { data } = response;
        const url: string | undefined = data?.url;
        if (!url) {
          continue;
        }

        const responseMediaType = data?.media_type === 'video'
          ? 'video'
          : data?.media_type === 'image'
            ? 'image'
            : mediaType;

        uploaded.push({
          url,
          uploaded_at: new Date().toISOString(),
          mediaType: responseMediaType,
          contentType: data?.content_type ?? file.type ?? null,
          filename: data?.filename ?? file.name ?? null,
          size: typeof data?.size === 'number' ? data.size : file.size ?? null,
        });
      }

      if (uploaded.length > 0) {
        appendMediaItems(uploaded);
        setSelectedItem(uploaded[0]);
      }
    } catch (err: any) {
      console.error('メディアのアップロードに失敗しました', err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' && detail.trim().length > 0 ? detail : 'ファイルのアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
      setIsDragOver(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [appendMediaItems]);

  const handleFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    void uploadFiles(Array.from(files));
  }, [uploadFiles]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const hasFiles = Array.from(event.dataTransfer?.items ?? []).some((item) => item.kind === 'file');
    if (!hasFiles) {
      return;
    }
    event.dataTransfer!.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) {
      return;
    }
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }
    void uploadFiles(Array.from(files));
  }, [uploadFiles]);

  const handleCopyUrl = useCallback(async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedUrl(item.url);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedUrl(null);
        copyTimeoutRef.current = null;
      }, 1600);
    } catch (err) {
      console.error('URLのコピーに失敗しました', err);
      alert('URLのコピーに失敗しました');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      loadMedia();
    }
  }, [isOpen, loadMedia]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setIsDragOver(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }
    // ストックグラデ（data URI）はアップロード一覧に存在しないため存在チェックを免除
    const isStockAsset = selectedItem.url.startsWith('data:');
    const exists = isStockAsset || media.some((item) => item.url === selectedItem.url);
    if (!exists) {
      setSelectedItem(null);
      return;
    }
    if (allowedTypesSet && !allowedTypesSet.has(selectedItem.mediaType)) {
      setSelectedItem(null);
    }
  }, [allowedTypesSet, media, selectedItem]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.url, {
        mediaType: selectedItem.mediaType,
        contentType: selectedItem.contentType ?? null,
        filename: selectedItem.filename ?? null,
      });
      onClose();
      setSelectedItem(null);
    }
  };

  if (!isOpen) return null;

  const isPreviewImage = selectedItem?.mediaType === 'image';
  const previewDims =
    previewRatio === '9:16'
      ? { width: 122, height: 217 }
      : previewRatio === '1:1'
        ? { width: 156, height: 156 }
        : { width: 204, height: 115 };

  /* mock: D-Swipe Asset Picker.html — ライト3カラム(カテゴリ/グリッド/フィットプレビュー) */
  return (
    <div className="fixed inset-0 bg-[rgba(7,15,30,.6)] backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[min(88vh,660px)] overflow-hidden flex flex-col shadow-[0_50px_120px_-40px_rgba(0,0,0,.7)]">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#e2ebf6] px-4 py-3 sm:px-5">
          <h2 className="text-[17px] font-extrabold tracking-tight text-[#0b1f3a]">素材を選ぶ</h2>
          <div className="relative ml-auto w-[280px] max-w-[40vw]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="キーワードで検索"
              className="w-full rounded-[10px] border border-[#e2ebf6] py-2 pl-9 pr-3 text-[13px] text-[#0b1f3a] placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-[3px] focus:ring-sky-500/15"
              aria-label="素材を検索"
            />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f4f8fd] text-slate-500 transition hover:text-[#0b1f3a]"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* Body: rail / grid / preview */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[176px_1fr_252px]">
          {/* カテゴリレール */}
          <div className="flex flex-row gap-1 overflow-x-auto border-b border-[#e2ebf6] p-2 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-3">
            <button
              type="button"
              onClick={() => setCategory('upload')}
              className={`flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
                category === 'upload' ? 'bg-[#e9f6fe] text-sky-600' : 'text-slate-600 hover:bg-[#f4f8fd] hover:text-[#0b1f3a]'
              }`}
            >
              <ArrowUpTrayIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              アップロード
              <span className="ml-auto hidden text-[11px] text-slate-600 lg:inline" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {media.length}
              </span>
            </button>
            {gradientAllowed ? (
              <button
                type="button"
                onClick={() => setCategory('gradient')}
                className={`flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
                  category === 'gradient' ? 'bg-[#e9f6fe] text-sky-600' : 'text-slate-600 hover:bg-[#f4f8fd] hover:text-[#0b1f3a]'
                }`}
              >
                <SwatchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                グラデ背景
                <span className="ml-auto hidden text-[11px] text-slate-600 lg:inline" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {STOCK_GRADIENTS.length}
                </span>
              </button>
            ) : null}
          </div>

          {/* グリッド */}
          <div
            className="relative min-h-0 overflow-y-auto p-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver ? (
              <div className="pointer-events-none absolute inset-2 z-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-400 bg-[#e9f6fe]/90 text-center text-sm font-bold text-sky-700">
                <p>ここにファイルをドロップして追加</p>
              </div>
            ) : null}

            {category === 'upload' ? (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">アップロード済み</div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={inputAccept}
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: GRAD_BRAND }}
                    >
                      <ArrowUpTrayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {isUploading ? 'アップロード中…' : 'ファイルを選択'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open('/media', '_blank', 'noopener')}
                      className="inline-flex items-center rounded-full border border-[#e2ebf6] px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#bfe6fb] hover:text-[#0b1f3a]"
                    >
                      メディアページ
                    </button>
                  </div>
                </div>
                {error ? (
                  <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    {error}
                  </div>
                ) : null}

                {media.length === 0 && !isUploading ? (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center text-slate-500">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f6fe] text-sky-600">
                      <PhotoIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#0b1f3a]">まだアップロードされたファイルがありません</p>
                      <p className="mt-1 text-xs text-slate-500">上のボタンから追加するか、この画面に直接ドロップしてください。</p>
                    </div>
                  </div>
                ) : null}

                {isFilteredEmpty && filteredEmptyMessage ? (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center text-slate-500">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f8fd] text-slate-600">
                      <FilteredEmptyIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="text-sm">{filteredEmptyMessage}</p>
                  </div>
                ) : null}

                {displayedMedia.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {displayedMedia.map((item) => {
                      const sanitizedUrl = item.url.split('?')[0] ?? item.url;
                      const filename = item.filename ?? sanitizedUrl.split('/').pop() ?? 'ファイル';
                      const isImage = item.mediaType === 'image';
                      const isVideo = item.mediaType === 'video';
                      const isSelected = selectedItem?.url === item.url;

                      return (
                        <div
                          key={item.url}
                          className={`group relative overflow-hidden rounded-[12px] border-2 shadow-sm transition-all ${
                            isSelected ? 'border-sky-600 ring-2 ring-sky-600/20' : 'border-transparent hover:border-[#bfe6fb]'
                          }`}
                        >
                          <button
                            type="button"
                            className="relative block w-full"
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="aspect-square bg-[#f4f8fd]">
                              {isImage ? (
                                <img src={item.url} alt={filename} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-500">
                                  {isVideo ? (
                                    <PlayCircleIcon className="h-9 w-9 text-sky-500" aria-hidden="true" />
                                  ) : (
                                    <PhotoIcon className="h-7 w-7 text-slate-600" aria-hidden="true" />
                                  )}
                                  <span className="max-w-full truncate px-2 text-[10px] font-semibold" title={filename}>{filename}</span>
                                </div>
                              )}
                            </div>
                            {isSelected ? (
                              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-pure-white">
                                <CheckIcon className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
                              </span>
                            ) : null}
                          </button>
                          <div className="flex items-center justify-between gap-1 bg-white px-2 py-1 text-[10px] text-slate-500">
                            <span className="truncate font-semibold" title={filename}>{filename}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(item)}
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 transition ${
                                copiedUrl === item.url
                                  ? 'bg-sky-600 text-pure-white'
                                  : 'bg-[#f4f8fd] text-slate-500 hover:text-[#0b1f3a]'
                              }`}
                              title="URLをコピー"
                            >
                              <DocumentDuplicateIcon className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {isUploading ? (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center">
                    <div className="rounded-full bg-[#e9f6fe] px-4 py-1 text-xs font-bold text-sky-600">アップロード中...</div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">グラデーション背景</div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {displayedGradients.map((gradient) => {
                    const url = gradientDataUri(gradient.from, gradient.to);
                    const isSelected = selectedItem?.url === url;
                    return (
                      <button
                        key={gradient.name}
                        type="button"
                        onClick={() =>
                          setSelectedItem({
                            url,
                            uploaded_at: '',
                            mediaType: 'image',
                            contentType: 'image/svg+xml',
                            filename: `gradient-${gradient.name}.svg`,
                          })
                        }
                        className={`relative aspect-square overflow-hidden rounded-[12px] border-2 shadow-sm transition-all ${
                          isSelected ? 'border-sky-600 ring-2 ring-sky-600/20' : 'border-transparent hover:border-[#bfe6fb]'
                        }`}
                        style={{ background: `linear-gradient(150deg, ${gradient.from}, ${gradient.to})` }}
                        title={gradient.name}
                      >
                        {isSelected ? (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-pure-white">
                            <CheckIcon className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
                          </span>
                        ) : null}
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,15,30,.55)] to-transparent px-2 pb-1.5 pt-4 text-left text-[10px] font-bold text-pure-white">
                          {gradient.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* フィットプレビュー — mock: .prev / .fit-phone / .safe */}
          <div className="hidden min-h-0 flex-col gap-3 overflow-y-auto border-l border-[#e2ebf6] p-4 lg:flex">
            {selectedItem && isPreviewImage ? (
              <>
                <div className="text-xs font-bold text-[#0b1f3a]">スライドへの自動フィット</div>
                <div className="flex justify-center rounded-[12px] border border-[#e2ebf6] bg-[#f4f8fd] p-4">
                  <div
                    className="relative overflow-hidden rounded-[14px] shadow-md"
                    style={{ width: previewDims.width, height: previewDims.height }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ backgroundImage: `url(${selectedItem.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[14px]"
                      style={{ outline: '2px dashed rgba(255,255,255,.65)', outlineOffset: '-9px' }}
                    />
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-2 py-0.5 text-[8px] font-bold text-pure-white">
                      セーフエリア
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['9:16', '1:1', '16:9'] as PreviewRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setPreviewRatio(ratio)}
                      className={`flex-1 rounded-[8px] border px-2 py-1.5 text-[11.5px] font-bold transition ${
                        previewRatio === ratio
                          ? 'border-sky-600 bg-[#e9f6fe] text-sky-600'
                          : 'border-[#e2ebf6] bg-white text-slate-600 hover:border-[#bfe6fb]'
                      }`}
                    >
                      {ratio === '9:16' ? '9:16 縦' : ratio}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  破線の内側がセーフエリアです。重要な被写体や文字は内側に収まるよう調整してください。
                </p>
                <button
                  type="button"
                  onClick={handleSelect}
                  className="mt-auto w-full rounded-[11px] px-4 py-2.5 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition"
                  style={{ background: GRAD_BRAND }}
                >
                  この素材を使う
                </button>
              </>
            ) : selectedItem ? (
              <>
                <div className="text-xs font-bold text-[#0b1f3a]">選択中のファイル</div>
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-500">
                  <PlayCircleIcon className="h-9 w-9 text-sky-500" aria-hidden="true" />
                  <p className="max-w-full truncate px-2 text-xs font-semibold" title={selectedItem.filename ?? selectedItem.url}>
                    {selectedItem.filename ?? '選択中のメディア'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelect}
                  className="mt-auto w-full rounded-[11px] px-4 py-2.5 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition"
                  style={{ background: GRAD_BRAND }}
                >
                  この素材を使う
                </button>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center text-slate-600">
                <PhotoIcon className="h-9 w-9 opacity-50" aria-hidden="true" />
                <p className="text-[12.5px] leading-relaxed">
                  素材を選ぶと、スライド比率への
                  <br />
                  自動フィットを確認できます
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-[#e2ebf6] p-3 sm:px-5">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#e2ebf6] bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#bfe6fb] hover:text-[#0b1f3a]"
          >
            キャンセル
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedItem}
            className="rounded-[10px] px-5 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: GRAD_BRAND }}
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
}
