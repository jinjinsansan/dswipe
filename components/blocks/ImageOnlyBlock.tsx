"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { getBlockBackgroundStyle } from '@/lib/blockBackground';
import type { ImageDisplayBlockContent } from '@/types/templates';

interface ImageOnlyBlockProps {
  content: ImageDisplayBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

const aspectClassMap: Record<string, string> = {
  'ratio-16-9': 'aspect-[16/9]',
  'ratio-4-3': 'aspect-[4/3]',
  'ratio-3-2': 'aspect-[3/2]',
  'ratio-1-1': 'aspect-square',
};

const focalPointMap: Record<string, string> = {
  center: 'center',
  top: 'center top',
  bottom: 'center bottom',
};

export default function ImageOnlyBlock({ content, isEditing, onEdit }: ImageOnlyBlockProps) {
  const imageUrl = typeof content?.imageUrl === 'string' ? content.imageUrl.trim() : '';
  const overlayColor = content?.imageOverlayColor ?? '#0F172A';
  const overlayOpacity = Math.min(Math.max(content?.imageOverlayOpacity ?? 0, 0), 1);
  const showOverlay = overlayOpacity > 0;

  const widthMode = content?.imageWidthMode ?? 'full';
  const fitMode = content?.imageFitMode ?? 'cover';
  const heightMode = content?.imageHeightMode ?? 'viewport';
  const focalPoint = content?.imageFocalPoint ?? 'center';

  const aspectClass = aspectClassMap[heightMode] ?? null;
  const isAutoHeight = heightMode === 'auto';
  const isViewport = heightMode === 'viewport';
  const objectPosition = focalPointMap[focalPoint] ?? focalPointMap.center;

  const sectionPaddingClass = widthMode === 'full' ? 'px-0' : 'px-4 md:px-6';
  const outerBoundsClass = widthMode === 'full' ? 'w-full' : 'mx-auto w-full max-w-6xl';

  const containerClasses = cn(
    'relative w-full overflow-hidden',
    widthMode === 'full' ? 'rounded-none' : 'rounded-3xl shadow-xl',
    !isAutoHeight && !aspectClass && !isViewport && 'min-h-[40vh]',
    aspectClass,
    isViewport && 'min-h-[60vh] sm:min-h-[70vh] max-h-[95vh]',
    fitMode === 'contain' ? 'bg-slate-950/10' : undefined,
  );

  const autoHeightImageClasses = cn(
    'w-full transition-transform duration-500',
    fitMode === 'cover' ? 'h-auto object-cover' : 'h-auto object-contain',
  );

  const fixedHeightImageClasses = cn(
    'absolute inset-0 h-full w-full transition-transform duration-500',
    fitMode === 'cover' ? 'object-cover' : 'object-contain',
  );

  const handleEdit = (field: keyof ImageDisplayBlockContent) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onEdit?.(field as string, e.target.value);
  };

  return (
    <section
      className={cn(sectionPaddingClass, 'py-section-sm sm:py-section')}
      style={getBlockBackgroundStyle(content)}
    >
      <div className={outerBoundsClass}>
        <div className={containerClasses}>
          {imageUrl ? (
            <>
              {isAutoHeight ? (
                <>
                  <img
                    src={imageUrl}
                    alt="アップロード画像"
                    className={autoHeightImageClasses}
                    style={fitMode === 'cover' ? { objectPosition } : undefined}
                    loading="lazy"
                  />
                  {showOverlay ? (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <img
                    src={imageUrl}
                    alt="アップロード画像"
                    className={fixedHeightImageClasses}
                    style={fitMode === 'cover' ? { objectPosition } : undefined}
                    loading="lazy"
                  />
                  {showOverlay ? (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
                    />
                  ) : null}
                </>
              )}
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
