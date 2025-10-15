'use client';

import React from 'react';
import { BeforeAfterBlockContent } from '@/types/templates';

interface BeforeAfterBlockProps {
  content: BeforeAfterBlockContent;
}

export default function BeforeAfterBlock({ content }: BeforeAfterBlockProps) {
  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || '#111827',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        {content.title && (
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            {content.title}
          </h2>
        )}

        {/* Before & After比較 */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Before */}
          <div className="bg-gray-800 rounded-2xl p-8 border-4 border-red-500/50">
            <div className="text-center mb-6">
              <span className="bg-red-600 text-white px-6 py-2 rounded-full text-2xl font-bold inline-block">
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
              <div className="text-lg text-gray-300 leading-relaxed">
                {content.beforeText.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 flex items-start gap-2">
                    <span className="text-red-400 flex-shrink-0">❌</span>
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
          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-8 border-4 border-yellow-400">
            <div className="text-center mb-6">
              <span className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-2xl font-bold inline-block">
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
              <div className="text-lg text-white leading-relaxed">
                {content.afterText.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 flex items-start gap-2">
                    <span className="text-yellow-300 flex-shrink-0 text-2xl">✓</span>
                    <span className="font-semibold">{line}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 変化を促すメッセージ */}
        <div className="mt-16 text-center">
          <p className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
            あなたもこの変化を手に入れませんか？
          </p>
          <p className="text-xl text-gray-300">
            実践者全員が同じ結果を得ています
          </p>
        </div>
      </div>
    </div>
  );
}
