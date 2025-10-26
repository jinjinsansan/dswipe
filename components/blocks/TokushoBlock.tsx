import React from 'react';
import { TokushoBlockContent } from '@/types/templates';

interface TokushoBlockProps {
  content: TokushoBlockContent;
}

export default function TokushoBlock({ content }: TokushoBlockProps) {
  const {
    title = '特定商取引法に基づく表記',
    subtitle = 'Legal Information',
    items = [],
    backgroundColor = '#F9FAFB',
    textColor = '#111827',
    cardBackgroundColor = '#FFFFFF',
    borderColor = '#E5E7EB',
  } = content;

  // 表示する項目のみフィルタリング
  const visibleItems = items.filter(item => item.show);

  return (
    <div
      className="min-h-screen w-full py-16 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          {subtitle && (
            <p
              className="text-sm font-semibold tracking-wider uppercase mb-3 opacity-60"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md"
              style={{
                backgroundColor: cardBackgroundColor,
                borderColor: borderColor,
              }}
            >
              {/* アイコンとラベル */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{item.icon}</span>
                <h3
                  className="text-sm font-bold uppercase tracking-wide opacity-70"
                  style={{ color: textColor }}
                >
                  {item.label}
                </h3>
              </div>

              {/* 値 */}
              <p
                className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap"
                style={{ color: textColor }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* フッター注釈 */}
        <div className="mt-12 text-center">
          <p
            className="text-sm opacity-60"
            style={{ color: textColor }}
          >
            ※ この表記は特定商取引法に基づき義務付けられています
          </p>
        </div>
      </div>
    </div>
  );
}
