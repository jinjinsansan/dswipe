'use client';

import React from 'react';
import { ExclamationTriangleIcon, FireIcon } from '@heroicons/react/24/outline';
import { UrgencyBlockContent } from '@/types/templates';

interface UrgencyBlockProps {
  content: UrgencyBlockContent;
}

export default function UrgencyBlock({ content }: UrgencyBlockProps) {
  const backgroundColor = content.backgroundColor || content.highlightColor || '#DC2626';
  const textColor = content.textColor || '#FFFFFF';
  
  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div 
          className="backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl"
          style={{
            backgroundColor: `#FFFFFF0D`,
            borderWidth: '4px',
            borderColor: `${textColor}4D`,
          }}
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* アイコン */}
            <div className="text-5xl md:text-6xl lg:text-7xl animate-pulse">
              {content.icon ? (
                <span aria-hidden="true">{content.icon}</span>
              ) : (
                <ExclamationTriangleIcon className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20" aria-hidden="true" />
              )}
            </div>

            {/* メッセージ */}
            <div className="flex-1 min-w-[250px] text-center md:text-left">
              {content.title && (
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  {content.title}
                </h3>
              )}
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                {content.message}
              </p>
            </div>

            {/* アイコン（右側） */}
            <div className="text-5xl md:text-6xl lg:text-7xl animate-pulse">
              {content.icon ? (
                <span aria-hidden="true">{content.icon}</span>
              ) : (
                <ExclamationTriangleIcon className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* 追加の警告 */}
          <div className="mt-6 text-center">
            <p className="flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl font-semibold animate-bounce">
              <FireIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
              今すぐ行動してください
              <FireIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
