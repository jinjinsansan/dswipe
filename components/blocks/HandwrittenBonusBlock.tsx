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
      className="py-20 px-6"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="border-4 border-black rounded-2xl bg-white p-8">
          {/* ブラウザトップバー */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-3 border-black">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-3 h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-3 h-3 rounded-full border-2 border-black bg-white"></div>
            </div>
            <div className="flex-1 border-2 border-black rounded-full px-4 py-1 bg-white">
              <span className="text-xs text-gray-400" style={{ fontFamily: "'Indie Flower', cursive" }}>https://your-url.com</span>
            </div>
          </div>

          {content.title && (
            <h2
              className="text-center text-4xl md:text-5xl font-black mb-12 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>
          )}

          <div className="space-y-6">
            {content.bonuses.map((bonus, index) => (
              <div
                key={index}
                className="border-3 border-black bg-white p-6 flex items-start gap-6"
              >
                {/* ボーナス番号 */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 border-3 border-black flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                      <defs>
                        <pattern id={`bonus-hash-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                          <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#bonus-hash-${index})`} />
                    </svg>
                    <span
                      className="relative z-10 text-2xl font-black"
                      style={{ fontFamily: "'Architects Daughter', cursive" }}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold mb-2 text-black"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {bonus.title}
                  </h3>
                  {bonus.description && (
                    <p
                      className="mb-3 text-gray-700"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {bonus.description}
                    </p>
                  )}
                  {bonus.value && (
                    <p
                      className="text-lg font-bold text-black"
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
            <div className="mt-8 text-center border-t-3 border-black pt-6">
              <p
                className="text-3xl font-black text-black"
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
