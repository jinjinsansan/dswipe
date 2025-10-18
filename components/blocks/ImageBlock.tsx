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

  const containerStyle: React.CSSProperties = {
    borderRadius: borderRadius || '18px',
    boxShadow: shadow ? '0 25px 60px -35px rgba(15, 23, 42, 0.65)' : 'none',
    maxWidth: maxWidth || '980px',
    width: '100%',
  };

  return (
    <section
      className="w-full flex flex-col items-center justify-center px-0 sm:px-6 py-10 sm:py-14"
      style={wrapperStyle}
    >
      {imageUrl ? (
        <figure className="w-full flex flex-col items-center gap-4 px-4 sm:px-0">
          <div
            className="flex w-full justify-center overflow-hidden"
            style={containerStyle}
          >
            <img
              src={imageUrl}
              alt={caption || 'メインビジュアル画像'}
              className="block h-auto w-full object-contain max-h-[70vh] sm:max-h-[80vh] md:max-h-[75vh] xl:max-h-[70vh]"
              style={{
                borderRadius: borderRadius || '18px',
              }}
            />
          </div>
          {caption && (
            <figcaption 
              className="text-sm tracking-wide"
              style={{ color: textColor ? textColor + 'CC' : '#ffffff' }}
            >
              {caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div 
          className="w-full max-w-3xl border-2 border-dashed rounded-2xl p-10 text-center"
          style={{
            backgroundColor: `${textColor || '#ffffff'}08`,
            borderColor: `${textColor || '#ffffff'}26`,
            color: textColor || '#ffffff',
          }}
        >
          <div className="text-4xl mb-3">🖼️</div>
          <p 
            className="text-base"
            style={{ color: textColor ? `${textColor}CC` : '#E5E7EB' }}
          >
            {isEditing ? '画像をアップロードすると、ここに表示されます。' : '画像が設定されていません。'}
          </p>
        </div>
      )}
    </section>
  );
}
