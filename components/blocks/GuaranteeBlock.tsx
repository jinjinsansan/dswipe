'use client';

import React from 'react';
import { GuaranteeBlockContent } from '@/types/templates';

interface GuaranteeBlockProps {
  content: GuaranteeBlockContent;
}

export default function GuaranteeBlock({ content }: GuaranteeBlockProps) {
  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || '#0F172A',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-1 shadow-2xl">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12">
            {/* 保証バッジ */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-6 shadow-2xl">
                <span className="text-6xl">🛡️</span>
              </div>
            </div>

            {/* 保証タイプ */}
            {content.guaranteeType && (
              <div className="text-center mb-6">
                <span className="bg-green-500 text-white px-6 py-3 rounded-full text-2xl md:text-3xl font-bold shadow-lg inline-block">
                  {content.guaranteeType}
                </span>
              </div>
            )}

            {/* タイトル */}
            {content.title && (
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
                {content.title}
              </h2>
            )}

            {/* サブタイトル */}
            {content.subtitle && (
              <p className="text-xl md:text-2xl text-center text-gray-300 mb-8">
                {content.subtitle}
              </p>
            )}

            {/* 説明 */}
            {content.description && (
              <p className="text-lg md:text-xl text-center text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                {content.description}
              </p>
            )}

            {/* 保証内容リスト */}
            {content.features && content.features.length > 0 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {content.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
                  >
                    <span className="text-green-400 text-3xl flex-shrink-0">✓</span>
                    <span className="text-lg text-gray-200">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* バッジテキスト */}
            {content.badgeText && (
              <div className="mt-10 text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full text-xl md:text-2xl font-bold shadow-2xl">
                  <span>🔒</span>
                  <span>{content.badgeText}</span>
                  <span>🔒</span>
                </div>
              </div>
            )}

            {/* リスクフリー訴求 */}
            <p className="text-center text-green-400 text-xl md:text-2xl font-semibold mt-8">
              ✨ あなたにリスクは一切ありません ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
