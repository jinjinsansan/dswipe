'use client';

import React from 'react';
import { BeforeAfterBlockContent } from '@/types/templates';

interface BeforeAfterBlockProps {
  content: BeforeAfterBlockContent;
}

export default function BeforeAfterBlock({ content }: BeforeAfterBlockProps) {
  const {
    backgroundColor = '#111827',
    textColor = '#FFFFFF',
    titleColor,
    descriptionColor,
    beforeBgColor = '#1F2937',
    beforeTitleColor = '#EF4444',
    beforeTextColor = '#D1D5DB',
    beforeCheckColor = '#F87171',
    afterBgColor = '#059669',
    afterTitleColor = '#FBBF24',
    afterTextColor = '#FFFFFF',
    afterCheckColor = '#FCD34D',
    highlightColor = '#FBBF24',
  } = content;

  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        {content.title && (
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            style={{ color: titleColor || textColor }}
          >
            {content.title}
          </h2>
        )}

        {/* Before & After比較 */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Before */}
          <div 
            className="rounded-2xl p-8 border-4"
            style={{ 
              backgroundColor: beforeBgColor,
              borderColor: beforeTitleColor + '80',
            }}
          >
            <div className="text-center mb-6">
              <span 
                className="px-6 py-2 rounded-full text-2xl font-bold inline-block"
                style={{ 
                  backgroundColor: beforeTitleColor,
                  color: '#FFFFFF',
                }}
              >
                {content.beforeTitle || 'BEFORE'}
              </span>
            </div>
            
            {content.beforeImage && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={content.beforeImage}
                  alt="Before"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            
            {content.beforeText && (
              <div className="text-lg leading-relaxed" style={{ color: beforeTextColor }}>
                {content.beforeText.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 flex items-start gap-2">
                    <span className="flex-shrink-0" style={{ color: beforeCheckColor }}>❌</span>
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 矢印 */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-10">
            <div className="text-6xl animate-pulse">
              {content.arrowIcon || '➡️'}
            </div>
          </div>
          <div className="md:hidden text-center text-6xl my-4 animate-bounce">
            ⬇️
          </div>

          {/* After */}
          <div 
            className="rounded-2xl p-8 border-4"
            style={{ 
              backgroundImage: `linear-gradient(to bottom right, ${afterBgColor}, ${afterBgColor}dd)`,
              borderColor: highlightColor + '80',
            }}
          >
            <div className="text-center mb-6">
              <span 
                className="px-6 py-2 rounded-full text-2xl font-bold inline-block"
                style={{ 
                  backgroundColor: highlightColor,
                  color: '#111827',
                }}
              >
                {content.afterTitle || 'AFTER'}
              </span>
            </div>
            
            {content.afterImage && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={content.afterImage}
                  alt="After"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            
            {content.afterText && (
              <div className="text-lg leading-relaxed" style={{ color: afterTextColor }}>
                {content.afterText.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 flex items-start gap-2">
                    <span className="flex-shrink-0 text-2xl" style={{ color: afterCheckColor }}>✓</span>
                    <span className="font-semibold">{line}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 変化を促すメッセージ */}
        <div className="mt-16 text-center">
          <p 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: highlightColor }}
          >
            あなたもこの変化を手に入れませんか？
          </p>
          <p 
            className="text-xl"
            style={{ color: descriptionColor || textColor }}
          >
            実践者全員が同じ結果を得ています
          </p>
        </div>
      </div>
    </div>
  );
}
