'use client';

import React from 'react';
import { BonusListBlockContent } from '@/types/templates';

interface BonusListBlockProps {
  content: BonusListBlockContent;
}

export default function BonusListBlock({ content }: BonusListBlockProps) {
  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor: content.backgroundColor || '#1F2937',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* タイトル */}
        {content.title && (
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {content.title}
          </h2>
        )}

        {/* サブタイトル */}
        {content.subtitle && (
          <p className="text-xl md:text-2xl text-center text-gray-300 mb-12">
            {content.subtitle}
          </p>
        )}

        {/* ボーナスリスト */}
        <div className="space-y-6">
          {content.bonuses.map((bonus, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl p-6 hover:scale-105 transition-transform shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* アイコン */}
                <div className="flex-shrink-0 text-4xl">
                  {bonus.icon || '🎁'}
                </div>

                {/* コンテンツ */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-400">
                      特典{index + 1}: {bonus.title}
                    </h3>
                    {bonus.value && (
                      <span className="bg-red-600 text-white px-4 py-1 rounded-full text-lg font-semibold">
                        {bonus.value}相当
                      </span>
                    )}
                  </div>
                  {bonus.description && (
                    <p className="text-gray-300 text-lg">
                      {bonus.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 合計価値 */}
        {content.totalValue && (
          <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center shadow-2xl">
            <p className="text-2xl md:text-3xl font-bold mb-2">
              🎉 特典総額 🎉
            </p>
            <p className="text-5xl md:text-6xl font-bold">
              {content.totalValue}
            </p>
            <p className="text-xl md:text-2xl mt-4 animate-pulse">
              これら全てが今なら無料！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
