'use client';

import React from 'react';
import { LockClosedIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { GuaranteeBlockContent } from '@/types/templates';

interface GuaranteeBlockProps {
  content: GuaranteeBlockContent;
}

export default function GuaranteeBlock({ content }: GuaranteeBlockProps) {
  const {
    backgroundColor = '#0F172A',
    titleColor,
    descriptionColor,
    textColor = '#FFFFFF',
    badgeColor = '#22C55E',
    badgeTextColor = '#FFFFFF',
    accentColor = '#10B981',
  } = content;

  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br rounded-3xl p-1 shadow-2xl" style={{ backgroundImage: `linear-gradient(to bottom right, ${accentColor}, #7C3AED)` }}>
          <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor }}>
            {/* 保証バッジ */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r rounded-full p-6 shadow-2xl" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor})` }}>
                <ShieldCheckIcon className="h-12 w-12 text-white" aria-hidden="true" />
              </div>
            </div>

            {/* 保証タイプ */}
            {content.guaranteeType && (
              <div className="text-center mb-6">
                <span 
                  className="px-6 py-3 rounded-full text-2xl md:text-3xl font-bold shadow-lg inline-block"
                  style={{ backgroundColor: badgeColor, color: badgeTextColor }}
                >
                  {content.guaranteeType}
                </span>
              </div>
            )}

            {/* タイトル */}
            {content.title && (
              <h2 
                className="text-4xl md:text-5xl font-bold text-center mb-6"
                style={{ color: titleColor || textColor }}
              >
                {content.title}
              </h2>
            )}

            {/* サブタイトル */}
            {content.subtitle && (
              <p 
                className="text-xl md:text-2xl text-center mb-8"
                style={{ color: descriptionColor || textColor }}
              >
                {content.subtitle}
              </p>
            )}

            {/* 説明 */}
            {content.description && (
              <p 
                className="text-lg md:text-xl text-center mb-10 leading-relaxed max-w-3xl mx-auto"
                style={{ color: descriptionColor || textColor }}
              >
                {content.description}
              </p>
            )}

            {/* 保証内容リスト */}
            {content.features && content.features.length > 0 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {content.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 border rounded-xl p-4"
                    style={{ 
                      backgroundColor: `${accentColor}15`,
                      borderColor: `${accentColor}50`,
                      color: textColor,
                    }}
                  >
                    <span 
                      className="text-3xl flex-shrink-0"
                      style={{ color: accentColor }}
                    >
                      ✓
                    </span>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* バッジテキスト */}
            {content.badgeText && (
              <div className="mt-10 text-center">
                <div 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xl md:text-2xl font-bold shadow-2xl"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor})`,
                    color: '#111827',
                  }}
                >
                  <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
                  <span>{content.badgeText}</span>
                  <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            )}

            {/* リスクフリー訴求 */}
            <p 
              className="flex items-center justify-center gap-2 text-center text-xl md:text-2xl font-semibold mt-8"
              style={{ color: accentColor }}
            >
              <SparklesIcon className="h-5 w-5" aria-hidden="true" />
              あなたにリスクは一切ありません
              <SparklesIcon className="h-5 w-5" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
