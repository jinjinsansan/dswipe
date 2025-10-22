'use client';

import React, { useState } from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { CTA_CATEGORIES, CTAStyle, getStylesByCategory } from '@/lib/ctaStyles';

interface CTAStyleSelectorProps {
  onSelectStyle: (style: CTAStyle) => void;
  onClose: () => void;
}

export default function CTAStyleSelector({ onSelectStyle, onClose }: CTAStyleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CTAStyle['category']>('primary');
  
  const filteredStyles = getStylesByCategory(selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">CTAボタンスタイル</h2>
            <p className="text-gray-400 text-sm mt-1">15種類のスタイルから選択</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* カテゴリタブ */}
        <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          {CTA_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as CTAStyle['category'])}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* スタイルグリッド */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  onSelectStyle(style);
                  onClose();
                }}
                className="bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all p-6 text-left group"
              >
                {/* プレビュー */}
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-8 mb-4 flex items-center justify-center min-h-[120px]">
                  <div
                    className={style.className}
                    style={{
                      background: style.baseColors.background,
                      color: style.baseColors.text,
                      borderColor: style.baseColors.border,
                    }}
                  >
                    {style.id === 'special-animated' ? (
                      <>
                        <span>クリックする</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    ) : (
                      'クリックする'
                    )}
                  </div>
                </div>

                {/* スタイル情報 */}
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                  {style.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{style.description}</p>

                {/* カラー情報 */}
                <div className="flex gap-2">
                  {style.baseColors.background !== 'transparent' && !style.baseColors.background.includes('gradient') && (
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-600"
                      style={{ backgroundColor: style.baseColors.background }}
                      title={style.baseColors.background}
                    />
                  )}
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-600"
                    style={{ backgroundColor: style.baseColors.text }}
                    title={style.baseColors.text}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="flex items-center justify-center gap-2 text-gray-400 text-xs text-center">
            <LightBulbIcon className="h-4 w-4" aria-hidden="true" />
            スタイルを選択すると、ボタンの色やサイズをさらにカスタマイズできます
          </p>
        </div>
      </div>
    </div>
  );
}
