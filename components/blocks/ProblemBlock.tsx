'use client';

import React from 'react';
import { ProblemBlockContent } from '@/types/templates';

interface ProblemBlockProps {
  content: ProblemBlockContent;
}

export default function ProblemBlock({ content }: ProblemBlockProps) {
  const {
    backgroundColor = '#1F2937',
    titleColor,
    descriptionColor,
    textColor = '#FFFFFF',
    accentColor = '#EF4444',
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
            className="text-4xl md:text-5xl font-bold text-center mb-6"
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

        {/* 問題リスト */}
        <div className="max-w-3xl mx-auto space-y-6">
          {content.problems.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-4 border-2 rounded-xl p-6 hover:transition-colors"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}50`,
              }}
            >
              <div className="flex-shrink-0 text-3xl">
                {content.checkIcon || '❌'}
              </div>
              <p 
                className="text-lg md:text-xl leading-relaxed"
                style={{ color: textColor }}
              >
                {problem}
              </p>
            </div>
          ))}
        </div>

        {/* 共感メッセージ */}
        <div className="mt-12 text-center">
          <p 
            className="text-2xl md:text-3xl font-semibold"
            style={{ color: accentColor }}
          >
            もし1つでも当てはまるなら...
          </p>
          <p 
            className="text-xl md:text-2xl mt-4"
            style={{ color: descriptionColor || textColor }}
          >
            このページを最後まで読んでください
          </p>
        </div>
      </div>
    </div>
  );
}
