'use client';

import React from 'react';
import type { FeaturesBlockContent } from '@/types/templates';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface HandwrittenFeaturesBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenFeaturesBlock({
  content,
}: HandwrittenFeaturesBlockProps) {
  const backgroundColor = content?.backgroundColor ?? '#FFFFFF';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  return (
    <section
      className="relative py-12 md:py-20 px-4 md:px-6"
      style={backgroundStyle}
    >
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* ワイヤーフレーム風ブラウザボックス */}
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
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              {content.title}
            </h2>
          )}

          <div className={`grid gap-3 md:gap-6 ${content.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {content.features.map((feature, index) => (
              <div
                key={index}
                className="border-2 md:border-3 border-black bg-white p-3 md:p-6 relative flex md:flex-col items-center md:items-start gap-3 md:gap-0"
              >
                {/* モノクロ手書き風アイコン */}
                <div className="flex-shrink-0 mb-0 md:mb-4">
                  <svg width="40" height="40" viewBox="0 0 60 60" className="md:w-[60px] md:h-[60px]">
                    <defs>
                      <pattern id={`icon-hash-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.15"/>
                      </pattern>
                    </defs>
                    {index === 0 && (
                      // 星形アイコン
                      <path d="M30,10 L35,23 L48,23 L38,32 L42,45 L30,36 L18,45 L22,32 L12,23 L25,23 Z" 
                        stroke="#000" strokeWidth="2" fill="url(#icon-hash-0)" />
                    )}
                    {index === 1 && (
                      // 本アイコン
                      <>
                        <rect x="15" y="15" width="30" height="35" stroke="#000" strokeWidth="2" fill="url(#icon-hash-1)" />
                        <line x1="30" y1="15" x2="30" y2="50" stroke="#000" strokeWidth="2" />
                        <line x1="15" y1="25" x2="45" y2="25" stroke="#000" strokeWidth="1.5" />
                        <line x1="15" y1="32" x2="28" y2="32" stroke="#000" strokeWidth="1.5" />
                        <line x1="32" y1="32" x2="45" y2="32" stroke="#000" strokeWidth="1.5" />
                      </>
                    )}
                    {index === 2 && (
                      // 吹き出しアイコン
                      <>
                        <rect x="10" y="15" width="40" height="25" rx="5" stroke="#000" strokeWidth="2" fill="url(#icon-hash-2)" />
                        <path d="M25 40 L30 50 L35 40" stroke="#000" strokeWidth="2" fill="url(#icon-hash-2)" />
                        <circle cx="20" cy="27" r="2" fill="#000" />
                        <circle cx="30" cy="27" r="2" fill="#000" />
                        <circle cx="40" cy="27" r="2" fill="#000" />
                      </>
                    )}
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                <h3
                  className="text-base md:text-xl font-bold mb-1 md:mb-3 text-black"
                  style={{
                    fontFamily: "'Architects Daughter', cursive",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  className="text-xs md:text-base leading-snug md:leading-relaxed text-gray-700"
                  style={{
                    fontFamily: "'Indie Flower', cursive",
                  }}
                >
                  {feature.description}
                </p>
                </div>

                {/* 手書き風アンダーライン */}
                <svg
                  className="absolute bottom-3 left-6 right-6 h-1"
                  viewBox="0 0 100 5"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,2 Q25,4 50,2 T100,3"
                    stroke="#000"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
