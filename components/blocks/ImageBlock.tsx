'use client';

import React from 'react';
import { ImageBlockContent } from '@/types/templates';

interface ImageBlockProps {
  content: ImageBlockContent;
  isEditing?: boolean;
}

export default function ImageBlock({ content, isEditing }: ImageBlockProps) {
  const {
    imageUrl,
    caption,
    backgroundColor,
    textColor,
    padding,
    borderRadius,
    shadow,
    maxWidth,
  } = content;

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || 'transparent',
    color: textColor || '#ffffff',
    padding: padding || '0px',
  };

  const imageStyle: React.CSSProperties = {
    borderRadius: borderRadius || '18px',
    boxShadow: shadow ? '0 25px 60px -35px rgba(15, 23, 42, 0.65)' : 'none',
    maxWidth: maxWidth || '980px',
  };

  return (
    <section
      className="w-full flex flex-col items-center justify-center px-6 py-10 sm:py-14"
      style={wrapperStyle}
    >
      {imageUrl ? (
        <figure className="w-full flex flex-col items-center gap-4">
          <img
            src={imageUrl}
            alt={caption || 'メインビジュアル画像'}
            className="w-full object-cover"
            style={imageStyle}
          />
          {caption && (
            <figcaption className="text-sm text-gray-300/80 tracking-wide">
              {caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="w-full max-w-3xl border-2 border-dashed border-white/15 rounded-2xl bg-white/5 p-10 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-base text-gray-300/80">
            {isEditing ? '画像をアップロードすると、ここに表示されます。' : '画像が設定されていません。'}
          </p>
        </div>
      )}
    </section>
  );
}
