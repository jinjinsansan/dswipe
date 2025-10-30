'use client';

import React from 'react';
import type { BonusListBlockContent } from '@/types/templates';

interface HandwrittenBonusBlockProps {
  content: BonusListBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenBonusBlock({
  content,
}: HandwrittenBonusBlockProps) {
  return (
    <section
      className="py-12 md:py-20 px-4 md:px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="border-3 md:border-4 border-black rounded-xl md:rounded-2xl bg-white p-4 md:p-8">
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

          {content.title && (
            <h2
              className="text-center text-2xl md:text-4xl lg:text-5xl font-black mb-8 md:mb-12 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>
          )}

          <div className="space-y-6">
            {content.bonuses.map((bonus, index) => (
              <div
                key={index}
                className="border-2 md:border-3 border-black bg-white p-2 md:p-6 flex items-start gap-2 md:gap-6"
              >
                {/* ボーナス番号 */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 border-2 md:border-3 border-black flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                      <defs>
                        <pattern id={`bonus-hash-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                          <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#bonus-hash-${index})`} />
                    </svg>
                    <span
                      className="relative z-10 text-base md:text-2xl font-black"
                      style={{ fontFamily: "'Architects Daughter', cursive" }}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3
                    className="text-sm md:text-2xl font-bold mb-1 text-black"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {bonus.title}
                  </h3>
                  {bonus.description && (
                    <p
                      className="mb-1.5 md:mb-3 text-[10px] md:text-base leading-tight text-gray-700"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {bonus.description}
                    </p>
                  )}
                  {bonus.value && (
                    <p
                      className="text-xs md:text-lg font-bold text-black"
                      style={{ fontFamily: "'Architects Daughter', cursive" }}
                    >
                      価値: {bonus.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {content.totalValue && (
            <div className="mt-4 md:mt-8 text-center border-t-2 md:border-t-3 border-black pt-3 md:pt-6">
              <p
                className="text-lg md:text-3xl font-black text-black"
                style={{ fontFamily: "'Architects Daughter', cursive" }}
              >
                合計価値: {content.totalValue}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
