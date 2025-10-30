'use client';

import React from 'react';
import type { HeroBlockContent } from '@/types/templates';

interface HandwrittenHeroBlockProps {
  content: HeroBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: string) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

export default function HandwrittenHeroBlock({
  content,
  isEditing,
  productId,
  onProductClick,
  ctaIds,
  onCtaClick,
}: HandwrittenHeroBlockProps) {
  const handleButtonClick = (variant: 'primary' | 'secondary') => {
    if (isEditing) return;
    if (productId && onProductClick) {
      onProductClick(productId);
    }
    if (ctaIds && onCtaClick) {
      onCtaClick(ctaIds[variant === 'primary' ? 0 : 1], variant);
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* ワイヤーフレーム風ブラウザフレーム */}
      <div className="relative md:absolute md:top-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-2 md:px-0">
        <div className="border-2 md:border-4 border-black rounded-lg md:rounded-3xl bg-white p-2 md:p-8" style={{ fontFamily: "'Architects Daughter', 'Indie Flower', cursive" }}>
          {/* ブラウザトップバー */}
          <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-6 pb-1.5 md:pb-4 border-b-2 border-black">
            <div className="flex gap-2">
              <div className="w-2 h-2 md:w-4 md:h-4 rounded-full border-2 border-black"></div>
              <div className="w-2 h-2 md:w-4 md:h-4 rounded-full border-2 border-black"></div>
              <div className="w-2 h-2 md:w-4 md:h-4 rounded-full border-2 border-black"></div>
            </div>
            <div className="flex-1 border-2 border-black rounded-full px-1.5 md:px-4 py-0.5 md:py-1 text-[9px] md:text-sm text-gray-500">https://your-url.com</div>
          </div>

      <div className="container relative z-10 mx-auto px-3 md:px-6 py-3 md:py-12 text-center">
        {content.tagline && (
          <div className="mb-6 inline-block">
            <span
              className="px-6 py-2 text-sm font-bold uppercase tracking-widest border-3 border-black bg-white"
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              {content.tagline}
            </span>
          </div>
        )}

        <h1
          className="mx-auto max-w-4xl text-2xl md:text-5xl lg:text-7xl font-black mb-2 md:mb-6 leading-tight text-black"
          style={{
            fontFamily: "'Architects Daughter', cursive",
          }}
        >
          {content.title}
        </h1>

        {content.subtitle && (
          <p
            className="mx-auto max-w-2xl text-xs md:text-xl lg:text-2xl mb-2 md:mb-10 leading-snug md:leading-relaxed text-gray-700"
            style={{
              fontFamily: "'Indie Flower', cursive",
            }}
          >
            {content.subtitle}
          </p>
        )}

        {content.highlightText && (
          <div className="mb-2 md:mb-10">
            <div className="inline-block relative">
              {/* ハッチングパターン背景 */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                <defs>
                  <pattern id="hash-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M0,8 L8,0" stroke="#000" strokeWidth="1" opacity="0.1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hash-pattern)" />
              </svg>
              <span
                className="relative z-10 inline-block px-2 md:px-6 py-1 md:py-3 text-xs md:text-lg font-bold border-2 md:border-3 border-black"
                style={{
                  fontFamily: "'Architects Daughter', cursive",
                }}
              >
                → {content.highlightText}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center items-center">
          <button
            onClick={() => handleButtonClick('primary')}
            className="px-3 md:px-8 py-1.5 md:py-4 text-xs md:text-lg font-bold border-2 md:border-3 border-black bg-white"
            style={{
              fontFamily: "'Architects Daughter', cursive",
            }}
            disabled={isEditing}
          >
            {content.buttonText}
          </button>

          {content.secondaryButtonText && (
            <button
              onClick={() => handleButtonClick('secondary')}
              className="px-3 md:px-8 py-1.5 md:py-4 text-xs md:text-lg font-bold border-2 md:border-3 border-black bg-white"
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
              disabled={isEditing}
            >
              {content.secondaryButtonText}
            </button>
          )}
        </div>

        {/* 手書き風アイコン装飾 */}
        <div className="mt-3 md:mt-12 flex justify-center gap-3 md:gap-8">
          {/* 星 - ハッチング */}
          <svg width="30" height="30" viewBox="0 0 60 60" className="md:w-[60px] md:h-[60px]">
            <defs>
              <pattern id="star-hash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <path d="M30,10 L35,25 L50,25 L38,35 L43,50 L30,40 L17,50 L22,35 L10,25 L25,25 Z" stroke="#000" strokeWidth="2" fill="url(#star-hash)" />
          </svg>
          {/* 三角形 - ハッチング */}
          <svg width="30" height="30" viewBox="0 0 60 60" className="md:w-[60px] md:h-[60px]">
            <defs>
              <pattern id="triangle-hash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <path d="M30,10 L50,50 L10,50 Z" stroke="#000" strokeWidth="2" fill="url(#triangle-hash)" />
          </svg>
          {/* 雲 - ハッチング */}
          <svg width="45" height="34" viewBox="0 0 80 60" className="md:w-20 md:h-[60px]">
            <defs>
              <pattern id="cloud-hash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <path d="M20,35 Q20,25 30,25 Q35,15 45,20 Q55,18 60,28 Q70,28 70,38 Q70,48 60,48 L25,48 Q15,48 15,38 Q15,35 20,35" stroke="#000" strokeWidth="2" fill="url(#cloud-hash)" />
          </svg>
        </div>
      </div>
        </div>
      </div>
    </section>
  );
}
