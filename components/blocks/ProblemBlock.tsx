'use client';

import React from 'react';
import { ProblemBlockContent } from '@/types/templates';

interface ProblemBlockProps {
  content: ProblemBlockContent;
}

export default function ProblemBlock({ content }: ProblemBlockProps) {
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
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            {content.title}
          </h2>
        )}

        {/* サブタイトル */}
        {content.subtitle && (
          <p className="text-xl md:text-2xl text-center text-gray-300 mb-12">
            {content.subtitle}
          </p>
        )}

        {/* 問題リスト */}
        <div className="max-w-3xl mx-auto space-y-6">
          {content.problems.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6 hover:bg-red-500/20 transition-colors"
            >
              <div className="flex-shrink-0 text-3xl">
                {content.checkIcon || '❌'}
              </div>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                {problem}
              </p>
            </div>
          ))}
        </div>

        {/* 共感メッセージ */}
        <div className="mt-12 text-center">
          <p className="text-2xl md:text-3xl font-semibold text-yellow-400">
            もし1つでも当てはまるなら...
          </p>
          <p className="text-xl md:text-2xl mt-4 text-gray-300">
            このページを最後まで読んでください
          </p>
        </div>
      </div>
    </div>
  );
}
