'use client';

import React from 'react';
import type { CTABlockContent } from '@/types/templates';

interface HandwrittenCTABlockProps {
  content: CTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

export default function HandwrittenCTABlock({
  content,
  isEditing,
  productId,
  onProductClick,
  ctaIds,
  onCtaClick,
}: HandwrittenCTABlockProps) {
  const handleClick = (variant: 'primary' | 'secondary') => {
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
      className="py-12 md:py-20 px-4 md:px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="border-3 md:border-4 border-black rounded-xl md:rounded-2xl bg-white p-6 md:p-8 lg:p-12">
          {/* ブラウザトップバー */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 pb-3 md:pb-4 border-b-2 md:border-b-3 border-black">
            <div className="flex gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black bg-white"></div>
            </div>
            <div className="flex-1 border-2 border-black rounded-full px-2 md:px-4 py-1 bg-white">
              <span className="text-[10px] md:text-xs text-gray-400" style={{ fontFamily: "'Indie Flower', cursive" }}>https://your-url.com</span>
            </div>
          </div>

          <div className="text-center">
            {content.eyebrow && (
              <p
                className="text-sm font-bold uppercase tracking-widest mb-4 text-black"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.eyebrow}
              </p>
            )}

            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p
                className="text-base md:text-xl mb-6 md:mb-10 text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.subtitle}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleClick('primary')}
                className="px-6 md:px-10 py-3 md:py-5 text-base md:text-lg font-bold border-3 md:border-4 border-black bg-white"
                style={{ fontFamily: "'Architects Daughter', cursive" }}
                disabled={isEditing}
              >
                {content.buttonText}
              </button>

              {content.secondaryButtonText && (
                <button
                  onClick={() => handleClick('secondary')}
                  className="px-6 md:px-10 py-3 md:py-5 text-base md:text-lg font-bold border-3 md:border-4 border-black bg-white"
                  style={{ fontFamily: "'Architects Daughter', cursive" }}
                  disabled={isEditing}
                >
                  {content.secondaryButtonText}
                </button>
              )}
            </div>

            {/* 矢印装飾 */}
            <div className="mt-12">
              <svg width="60" height="40" viewBox="0 0 60 40" className="mx-auto">
                <path
                  d="M5 5 L30 30 L55 5"
                  stroke="#000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
