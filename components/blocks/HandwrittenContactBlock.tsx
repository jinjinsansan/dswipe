'use client';

import React from 'react';
import type { ContactBlockContent } from '@/types/templates';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface HandwrittenContactBlockProps {
  content: ContactBlockContent;
}

export default function HandwrittenContactBlock({
  content,
}: HandwrittenContactBlockProps) {
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
      <div className="container relative z-10 mx-auto max-w-3xl">
        <div className="border-3 md:border-4 border-black rounded-xl md:rounded-2xl bg-white p-6 md:p-8">
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
            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p
                className="text-base md:text-xl mb-6 md:mb-8 text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.subtitle}
              </p>
            )}

            {content.description && (
              <p
                className="mb-6 md:mb-10 text-sm md:text-base text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.description}
              </p>
            )}

            <a
              href={content.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 md:px-10 py-3 md:py-5 text-base md:text-lg font-bold border-3 md:border-4 border-black bg-white"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.buttonText}
            </a>

            {/* 吹き出しアイコン */}
            <div className="mt-12">
              <svg width="60" height="45" viewBox="0 0 80 60" className="mx-auto md:w-20 md:h-[60px]">
                <defs>
                  <pattern id="contact-hash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                  </pattern>
                </defs>
                <rect x="10" y="10" width="60" height="35" rx="5" stroke="#000" strokeWidth="2" fill="url(#contact-hash)" />
                <path d="M35 45 L40 55 L45 45" stroke="#000" strokeWidth="2" fill="url(#contact-hash)" />
                <text
                  x="40"
                  y="33"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#000"
                  fontFamily="'Architects Daughter', cursive"
                >
                  ?
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
