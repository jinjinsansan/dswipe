"use client";

import React from 'react';
import type { ImageDisplayBlockContent } from '@/types/templates';

interface ImageOnlyBlockProps {
  content: ImageDisplayBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function ImageOnlyBlock({ content, isEditing, onEdit }: ImageOnlyBlockProps) {
  const imageUrl = content?.imageUrl ?? '';
  const overlayColor = content?.imageOverlayColor ?? '#0F172A';
  const overlayOpacity = Math.min(Math.max(content?.imageOverlayOpacity ?? 0, 0), 1);
  const showOverlay = overlayOpacity > 0;

  const handleEdit = (field: keyof ImageDisplayBlockContent) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onEdit?.(field as string, e.target.value);
  };

  return (
    <section className="px-4 py-section-sm sm:py-section md:px-6">
      <div className="container mx-auto">
        <div className="relative mx-auto w-full overflow-hidden">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="アップロード画像"
                className="block h-auto w-full max-h-[90vh] object-contain"
              />
              {showOverlay ? (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-64 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 text-slate-400">
              画像をアップロードしてください
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-3 rounded-lg bg-slate-900/5 p-4 text-sm text-slate-700">
            <div>
              <label className="mb-1 block font-medium">画像URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={handleEdit('imageUrl')}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <p className="text-xs text-slate-500">
              プロパティパネルからアップロードまたはライブラリ選択ができます。
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
