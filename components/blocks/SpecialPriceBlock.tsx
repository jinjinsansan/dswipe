'use client';

import React from 'react';
import { SpecialPriceBlockContent } from '@/types/templates';

interface SpecialPriceBlockProps {
  content: SpecialPriceBlockContent;
}

export default function SpecialPriceBlock({ content }: SpecialPriceBlockProps) {
  return (
    <div
      className="px-4"
      style={{
        backgroundColor: content.backgroundColor || '#111827',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* タイトル */}
        {content.title && (
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            {content.title}
          </h2>
        )}

        {/* 価格カード */}
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-1 shadow-2xl">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12">
            {/* 割引バッジ */}
            {content.discountBadge && (
              <div className="flex justify-center mb-6">
                <span className="bg-red-600 text-white px-6 py-2 rounded-full text-xl font-bold animate-pulse shadow-lg">
                  🔥 {content.discountBadge} 🔥
                </span>
              </div>
            )}

            {/* 価格表示 */}
            <div className="text-center mb-8">
              {/* 通常価格（打ち消し線） */}
              <div className="mb-4">
                <span className="text-gray-400 text-xl md:text-2xl line-through">
                  通常価格: {content.currency || '¥'}{content.originalPrice}
                </span>
              </div>

              {/* 特別価格 */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-yellow-400 text-5xl md:text-7xl font-bold">
                  {content.currency || '¥'}{content.specialPrice}
                </span>
                {content.period && (
                  <span className="text-gray-300 text-xl">
                    / {content.period}
                  </span>
                )}
              </div>

              {/* 節約額 */}
              {content.originalPrice && content.specialPrice && (
                <div className="mt-4 text-green-400 text-2xl font-semibold">
                  💰 {(parseInt(content.originalPrice.replace(/,/g, '')) - parseInt(content.specialPrice.replace(/,/g, ''))).toLocaleString()}円もお得！
                </div>
              )}
            </div>

            {/* 特典リスト */}
            {content.features && content.features.length > 0 && (
              <div className="space-y-3 mb-8">
                {content.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-gray-100"
                  >
                    <span className="text-green-400 text-2xl flex-shrink-0">✓</span>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTAボタン */}
            {content.buttonText && (
              <button
                className="w-full py-6 rounded-xl text-xl md:text-2xl font-bold transition-transform hover:scale-105 shadow-2xl animate-pulse"
                style={{
                  backgroundColor: content.buttonColor || '#EF4444',
                  color: '#FFFFFF',
                }}
              >
                {content.buttonText}
              </button>
            )}

            {/* 注意書き */}
            <p className="text-center text-yellow-400 mt-6 text-sm animate-pulse">
              ⚠️ この特別価格は予告なく終了する可能性があります
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
