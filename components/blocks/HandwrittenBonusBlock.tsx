'use client';

import React from 'react';
import type { BonusListBlockContent } from '@/types/templates';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface HandwrittenBonusBlockProps {
  content: BonusListBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenBonusBlock({
  content,
}: HandwrittenBonusBlockProps) {
  const backgroundColor = content?.backgroundColor ?? '#FFFFFF';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  return (
    <section
      className="relative px-4 py-section-sm sm:py-section md:px-6"
      style={backgroundStyle}
    >
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="container relative z-10 mx-auto max-w-5xl">
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
              className="mb-8 text-center font-black text-black typo-headline text-pretty md:mb-12"
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
                    className="mb-1 font-bold text-black typo-subheadline text-pretty"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {bonus.title}
                  </h3>
                  {bonus.description && (
                    <p
                      className="mb-1.5 text-gray-700 typo-body text-pretty md:mb-3"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {bonus.description}
                    </p>
                  )}
                  {bonus.value && (
                    <p
                      className="font-bold text-black typo-body-lg text-pretty"
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
                className="font-black text-black typo-headline text-pretty"
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
