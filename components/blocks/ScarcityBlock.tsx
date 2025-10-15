'use client';

import React from 'react';
import { ScarcityBlockContent } from '@/types/templates';

interface ScarcityBlockProps {
  content: ScarcityBlockContent;
}

export default function ScarcityBlock({ content }: ScarcityBlockProps) {
  const percentage = content.totalCount && content.remainingCount
    ? ((content.totalCount - content.remainingCount) / content.totalCount) * 100
    : 0;

  return (
    <div
      className="px-4"
      style={{
        backgroundColor: content.backgroundColor || '#991B1B',
        color: content.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* タイトル */}
        {content.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            {content.title}
          </h2>
        )}

        {/* 残数表示 */}
        {content.remainingCount !== undefined && (
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 mb-6">
            <div className="text-center mb-6">
              <p className="text-xl md:text-2xl mb-4 text-gray-200">
                {content.message || '募集枠残りわずか！'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl md:text-7xl font-bold text-yellow-400 tabular-nums">
                  残り {content.remainingCount}名
                </span>
              </div>
              {content.totalCount && (
                <p className="text-lg md:text-xl mt-4 text-gray-300">
                  / 全{content.totalCount}名
                </p>
              )}
            </div>

            {/* プログレスバー */}
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 && (
                    <span className="text-white font-bold text-sm">
                      {Math.round(percentage)}% 埋まっています
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 警告メッセージ */}
        <div className="text-center space-y-4">
          <p className="text-xl md:text-2xl font-semibold animate-pulse text-yellow-300">
            ⚠️ 定員に達し次第、予告なく募集終了します ⚠️
          </p>
          <p className="text-lg md:text-xl text-gray-200">
            次回募集は未定です。今すぐご参加ください。
          </p>
        </div>
      </div>
    </div>
  );
}
