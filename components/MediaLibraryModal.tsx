'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { mediaApi } from '@/lib/api';

interface MediaItem {
  url: string;
  uploaded_at: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const persistMedia = useCallback((items: MediaItem[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('uploaded_media', JSON.stringify(items));
  }, []);

  const loadMedia = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedMedia = window.localStorage.getItem('uploaded_media');
      if (storedMedia) {
        setMedia(JSON.parse(storedMedia));
      } else {
        setMedia([]);
      }
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
      const existingUrls = new Set(items.map((item) => item.url));
      const filteredPrev = prev.filter((item) => !existingUrls.has(item.url));
      const combined = [...items, ...filteredPrev];
      persistMedia(combined);
      return combined;
    });
  }, [persistMedia]);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);
    const uploaded: MediaItem[] = [];

    try {
      for (const file of files) {
        const response = await mediaApi.upload(file);
        const url: string | undefined = response.data?.url;
        if (!url) {
          continue;
        }
        uploaded.push({ url, uploaded_at: new Date().toISOString() });
      }

      if (uploaded.length > 0) {
        appendMediaItems(uploaded);
        setSelectedUrl(uploaded[0].url);
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

  useEffect(() => {
    if (isOpen) {
      setError(null);
      loadMedia();
    }
  }, [isOpen, loadMedia]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUrl(null);
      setIsDragOver(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
      setSelectedUrl(null);
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
                <p className="text-xs text-gray-400">画像やPDFなどのファイルを追加して、ノートに挿入できます。</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

          {media.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map((item, index) => {
                const sanitizedUrl = item.url.split('?')[0] ?? item.url;
                const isImage = /\.(apng|avif|gif|jpe?g|png|svg|webp)$/i.test(sanitizedUrl);
                const filename = sanitizedUrl.split('/').pop() ?? 'ファイル';

                return (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedUrl(item.url)}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                      selectedUrl === item.url
                        ? 'border-blue-500 ring-2 ring-blue-400/50'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="aspect-square bg-gray-900">
                      {isImage ? (
                        <img src={item.url} alt={filename} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300">
                          <PhotoIcon className="h-8 w-8 text-gray-500" aria-hidden="true" />
                          <span className="px-3 text-[11px] font-semibold">{filename}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-gray-900/60 px-2 py-1 text-[10px] text-gray-300">
                      <span className="truncate">{new Date(item.uploaded_at).toLocaleString()}</span>
                      {selectedUrl === item.url ? (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">選択中</span>
                      ) : null}
                    </div>
                  </button>
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
            disabled={!selectedUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
}
