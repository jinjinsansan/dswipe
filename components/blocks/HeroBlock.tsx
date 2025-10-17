import React from 'react';
import Image from 'next/image';

interface HeroBlockProps {
  content: {
    title: string;
    subtitle: string;
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    buttonText?: string;
    buttonColor?: string;
  };
  isEditing?: boolean;
  onEdit?: (field: string, value: string) => void;
}

export default function HeroBlock({ content, isEditing, onEdit }: HeroBlockProps) {
  const style = {
    backgroundColor: content.backgroundColor,
    color: content.textColor,
  };

  return (
    <div 
      className="min-h-full flex items-center justify-center px-4 md:px-8"
      style={style}
    >
      <div
        className="w-full text-center px-4"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(2.5rem, 8vh, 4rem)',
          maxWidth: 'min(1100px, 90vw)',
          marginInline: 'auto',
        }}
      >
        {isEditing ? (
          <>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              className="w-full text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-transparent border-2 border-dashed px-4 py-3 rounded"
              style={{ borderColor: content.textColor, color: content.textColor }}
              placeholder="見出しを入力"
            />
            <textarea
              value={content.subtitle}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              className="w-full text-lg md:text-xl lg:text-2xl bg-transparent border-2 border-dashed px-4 py-3 rounded resize-none"
              style={{ borderColor: content.textColor, color: content.textColor }}
              rows={2}
              placeholder="サブタイトルを入力"
            />
          </>
        ) : (
          <>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {content.title || '見出しをここに入力'}
            </h1>
            <p className="text-xl md:text-2xl lg:text-[1.65rem] max-w-4xl mx-auto" style={{ lineHeight: 1.6 }}>
              {content.subtitle || 'サブタイトルをここに入力'}
            </p>
          </>
        )}

        {content.imageUrl && (
          <div className="relative w-full max-w-3xl mx-auto aspect-[16/9]">
            <Image 
              src={content.imageUrl} 
              alt="Hero" 
              fill
              className="rounded-lg md:rounded-xl shadow-2xl object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              priority
            />
          </div>
        )}

        {content.buttonText && (
          <div className="flex justify-center">
            <button
              className="px-7 md:px-10 lg:px-12 py-3.5 md:py-4.5 rounded-full font-semibold text-base md:text-lg lg:text-xl shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: content.buttonColor }}
            >
              {content.buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
