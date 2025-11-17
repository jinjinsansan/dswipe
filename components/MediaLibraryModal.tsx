'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, DocumentDuplicateIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { mediaApi } from '@/lib/api';

type MediaType = 'image' | 'video' | 'file';

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
    if (!allowedTypesSet) {
      return media;
    }
    return media.filter((item) => allowedTypesSet.has(item.mediaType));
  }, [allowedTypesSet, media]);

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
    const exists = media.some((item) => item.url === selectedItem.url);
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

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-light text-white">メディアライブラリ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="border-b border-gray-700 bg-gray-800/70">
          <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">アップロード</p>
                <p className="text-xs text-gray-400">画像や動画などのファイルを追加して、コンテンツに利用できます。</p>
              </div>
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
                  className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
                  {isUploading ? 'アップロード中…' : 'ファイルを選択'}
                </button>
                <button
                  type="button"
                  onClick={() => window.open('/media', '_blank', 'noopener')}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-gray-400 hover:text-white"
                >
                  メディアページを開く
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-gray-600 bg-gray-900/50 px-3 py-2 text-xs text-gray-400">
              このモーダルにファイルをドラッグ＆ドロップしてもアップロードできます。
            </div>
            {error ? (
              <div className="rounded-lg border border-red-400 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className="relative flex-1 overflow-y-auto p-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-blue-500/10 text-center text-sm font-semibold text-blue-200">
              <p>ここにファイルをドロップして追加</p>
              <p className="mt-1 text-xs text-blue-100">アップロード後にすぐノートへ挿入できます</p>
            </div>
          ) : null}

          {media.length === 0 && !isUploading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-400">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-gray-200">
                <PhotoIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-light text-white">まだアップロードされたファイルがありません</p>
                <p className="mt-1 text-sm text-gray-400">上のボタンからアップロードするか、この画面に直接ドロップしてください。</p>
              </div>
            </div>
          ) : null}

          {isFilteredEmpty && filteredEmptyMessage ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-gray-200">
                <FilteredEmptyIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <p className="text-sm font-light text-gray-200">{filteredEmptyMessage}</p>
            </div>
          ) : null}

          {displayedMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {displayedMedia.map((item) => {
                const sanitizedUrl = item.url.split('?')[0] ?? item.url;
                const filename = item.filename ?? sanitizedUrl.split('/').pop() ?? 'ファイル';
                const isImage = item.mediaType === 'image';
                const isVideo = item.mediaType === 'video';
                const isSelected = selectedItem?.url === item.url;

                return (
                  <div
                    key={item.url}
                    className={`group overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-400/40' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <button
                      type="button"
                      className="relative block w-full"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="aspect-square bg-gray-900">
                        {isImage ? (
                          <img src={item.url} alt={filename} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300">
                            {isVideo ? (
                              <PlayCircleIcon className="h-10 w-10 text-blue-300" aria-hidden="true" />
                            ) : (
                              <PhotoIcon className="h-8 w-8 text-gray-500" aria-hidden="true" />
                            )}
                            <span className="px-3 text-[11px] font-semibold truncate" title={filename}>{filename}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between bg-gray-900/60 px-2 py-1 text-[10px] text-gray-300">
                        <span className="truncate" title={new Date(item.uploaded_at).toLocaleString()}>
                          {new Date(item.uploaded_at).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {isVideo ? (
                            <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-blue-200">VIDEO</span>
                          ) : isImage ? (
                            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200">IMAGE</span>
                          ) : (
                            <span className="rounded-full bg-slate-500/30 px-1.5 py-0.5 text-[9px] font-semibold text-slate-200">FILE</span>
                          )}
                          {isSelected ? (
                            <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">選択中</span>
                          ) : null}
                        </span>
                      </div>
                    </button>
                    <div className="flex items-center justify-between gap-2 bg-gray-900/70 px-2 py-1.5 text-[11px] text-gray-300">
                      <span className="truncate" title={filename}>{filename}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition ${
                          copiedUrl === item.url
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600/80'
                        }`}
                      >
                        <DocumentDuplicateIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{copiedUrl === item.url ? 'コピーしました' : 'URLコピー'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {isUploading ? (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <div className="rounded-full bg-blue-500/20 px-4 py-1 text-xs font-semibold text-blue-200">アップロード中...</div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm font-light"
          >
            キャンセル
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedItem}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
}
