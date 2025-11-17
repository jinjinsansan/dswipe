'use client';

import React from 'react';
import type { ProblemBlockContent } from '@/types/templates';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface HandwrittenProblemBlockProps {
  content: ProblemBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenProblemBlock({
  content,
}: HandwrittenProblemBlockProps) {
  const backgroundColor = content?.backgroundColor ?? '#FFFFFF';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  return (
    <section className="relative py-12 md:py-20 px-4 md:px-6" style={backgroundStyle}>
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="container relative z-10 mx-auto max-w-4xl">
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

          <h2
            className="text-center text-2xl md:text-4xl lg:text-5xl font-black mb-6 md:mb-8 text-black"
            style={{ fontFamily: "'Architects Daughter', cursive" }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p
              className="text-center text-base md:text-xl mb-8 md:mb-12 text-gray-700"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              {content.subtitle}
            </p>
          )}

          <div className="space-y-4">
            {content.problems.map((problem, index) => (
              <div
                key={index}
                className="flex items-start gap-3 md:gap-4 border-2 md:border-3 border-black bg-white p-4 md:p-5"
              >
                <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 border-2 border-black flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 16 16" className="md:w-4 md:h-4">
                    <line x1="4" y1="4" x2="12" y2="12" stroke="#000" strokeWidth="2" />
                    <line x1="12" y1="4" x2="4" y2="12" stroke="#000" strokeWidth="2" />
                  </svg>
                </div>
                <p
                  className="flex-1 text-sm md:text-base lg:text-lg text-gray-700"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  {problem}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
