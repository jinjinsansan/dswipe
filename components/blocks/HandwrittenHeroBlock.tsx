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
  onEdit,
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

  const bgColor = content.backgroundColor || '#FFFBEB';
  const textColor = content.textColor || '#78350F';
  const buttonColor = content.buttonColor || '#F59E0B';

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* 手書き風の装飾背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="handdrawn-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill={textColor} opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#handdrawn-dots)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20 text-center">
        {content.tagline && (
          <div className="mb-6 inline-block">
            <span
              className="px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-full border-2 border-dashed"
              style={{
                color: textColor,
                borderColor: textColor,
                fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive",
              }}
            >
              {content.tagline}
            </span>
          </div>
        )}

        <h1
          className="mx-auto max-w-4xl text-5xl md:text-7xl font-black mb-6 leading-tight"
          style={{
            color: textColor,
            fontFamily: "'Caveat', 'Patrick Hand', cursive",
            textShadow: '2px 2px 0px rgba(0,0,0,0.05)',
          }}
        >
          {content.title}
        </h1>

        {content.subtitle && (
          <p
            className="mx-auto max-w-2xl text-xl md:text-2xl mb-10 leading-relaxed"
            style={{
              color: textColor,
              fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive",
            }}
          >
            {content.subtitle}
          </p>
        )}

        {content.highlightText && (
          <div className="mb-10">
            <span
              className="inline-block px-6 py-3 text-lg font-bold rounded-2xl transform -rotate-2"
              style={{
                backgroundColor: '#FDE047',
                color: '#78350F',
                fontFamily: "'Caveat', cursive",
                boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
              }}
            >
              ✨ {content.highlightText}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => handleButtonClick('primary')}
            className="group relative px-8 py-4 text-lg font-bold rounded-full transform transition-all duration-200 hover:scale-105 hover:-rotate-1"
            style={{
              backgroundColor: buttonColor,
              color: '#FFFFFF',
              fontFamily: "'Patrick Hand', cursive",
              boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
            }}
            disabled={isEditing}
          >
            <span className="relative z-10">{content.buttonText}</span>
            {/* 手書き風アンダーライン */}
            <svg
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full h-2 opacity-50 group-hover:opacity-80 transition-opacity"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q25,2 50,6 T100,5"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {content.secondaryButtonText && (
            <button
              onClick={() => handleButtonClick('secondary')}
              className="px-8 py-4 text-lg font-bold rounded-full border-3 border-dashed transform transition-all duration-200 hover:scale-105 hover:rotate-1"
              style={{
                backgroundColor: 'transparent',
                color: textColor,
                borderColor: textColor,
                fontFamily: "'Patrick Hand', cursive",
              }}
              disabled={isEditing}
            >
              {content.secondaryButtonText}
            </button>
          )}
        </div>

        {/* 手書き風の矢印装飾 */}
        <div className="mt-16 flex justify-center">
          <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
            <path
              d="M20 5 Q18 15, 20 25 T20 45 L15 40 M20 45 L25 40"
              stroke={textColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
