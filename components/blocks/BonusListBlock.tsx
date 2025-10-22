'use client';

import React from 'react';
import { GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { BonusListBlockContent } from '@/types/templates';

interface BonusListBlockProps {
  content: BonusListBlockContent;
}

export default function BonusListBlock({ content }: BonusListBlockProps) {
  const {
    backgroundColor = '#1F2937',
    titleColor,
    descriptionColor,
    textColor = '#FFFFFF',
    accentColor = '#EAB308',
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
        {/* タイトル */}
        {content.title && (
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            style={{ color: titleColor || textColor }}
          >
            {content.title}
          </h2>
        )}

        {/* サブタイトル */}
        {content.subtitle && (
          <p 
            className="text-xl md:text-2xl text-center mb-12"
            style={{ color: descriptionColor || textColor }}
          >
            {content.subtitle}
          </p>
        )}

        {/* ボーナスリスト */}
        <div className="space-y-6">
          {content.bonuses.map((bonus, index) => (
            <div
              key={index}
              className="border-2 rounded-xl p-6 hover:scale-105 transition-transform shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, ${accentColor}33, ${accentColor}1a)`,
                borderColor: `${accentColor}80`,
              }}
            >
              <div className="flex items-start gap-4">
                {/* アイコン */}
                <div className="flex-shrink-0">
                  {bonus.icon ? (
                    <span className="text-4xl" aria-hidden="true">{bonus.icon}</span>
                  ) : (
                    <GiftIcon className="h-10 w-10" aria-hidden="true" />
                  )}
                </div>

                {/* コンテンツ */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 
                      className="text-xl md:text-2xl font-bold"
                      style={{ color: accentColor }}
                    >
                      特典{index + 1}: {bonus.title}
                    </h3>
                    {bonus.value && (
                      <span 
                        className="px-4 py-1 rounded-full text-lg font-semibold"
                        style={{ 
                          backgroundColor: accentColor,
                          color: '#FFFFFF'
                        }}
                      >
                        {bonus.value}相当
                      </span>
                    )}
                  </div>
                  {bonus.description && (
                    <p 
                      className="text-lg"
                      style={{ color: descriptionColor || textColor }}
                    >
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
          <div 
            className="mt-12 rounded-2xl p-8 text-center shadow-2xl"
            style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor})` }}
          >
            <p className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-2" style={{ color: '#111827' }}>
              <SparklesIcon className="h-7 w-7" aria-hidden="true" />
              特典総額
              <SparklesIcon className="h-7 w-7" aria-hidden="true" />
            </p>
            <p className="text-5xl md:text-6xl font-bold" style={{ color: '#111827' }}>
              {content.totalValue}
            </p>
            <p className="text-xl md:text-2xl mt-4 animate-pulse" style={{ color: '#111827' }}>
              これら全てが今なら無料！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
