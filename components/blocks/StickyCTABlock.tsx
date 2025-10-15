'use client';

import React from 'react';
import { StickyCTABlockContent } from '@/types/templates';

interface StickyCTABlockProps {
  content: StickyCTABlockContent;
}

export default function StickyCTABlock({ content }: StickyCTABlockProps) {
  const position = content.position || 'bottom';

  return (
    <div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 shadow-2xl`}
      style={{
        backgroundColor: content.backgroundColor || '#111827',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* サブテキスト */}
          {content.subText && (
            <div className="hidden md:block">
              <p className="text-lg font-semibold text-gray-300">
                {content.subText}
              </p>
            </div>
          )}

          {/* CTAボタン */}
          <button
            className="flex-1 md:flex-none md:min-w-[300px] py-4 px-8 rounded-xl text-xl font-bold transition-transform hover:scale-105 shadow-2xl animate-pulse"
            style={{
              backgroundColor: content.buttonColor || '#EF4444',
              color: '#FFFFFF',
            }}
          >
            {content.buttonText}
          </button>

          {/* モバイル用サブテキスト */}
          {content.subText && (
            <div className="md:hidden w-full text-center text-sm text-gray-400">
              {content.subText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
