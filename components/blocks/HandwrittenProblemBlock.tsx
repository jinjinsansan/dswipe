'use client';

import React from 'react';
import type { ProblemBlockContent } from '@/types/templates';

interface HandwrittenProblemBlockProps {
  content: ProblemBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenProblemBlock({
  content,
}: HandwrittenProblemBlockProps) {
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="border-4 border-black rounded-2xl bg-white p-8">
          {/* ブラウザトップバー */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-3 border-black">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-3 h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-3 h-3 rounded-full border-2 border-black bg-white"></div>
            </div>
            <div className="flex-1 border-2 border-black rounded-full px-4 py-1 bg-white">
              <span className="text-xs text-gray-400" style={{ fontFamily: "'Indie Flower', cursive" }}>https://your-url.com</span>
            </div>
          </div>

          <h2
            className="text-center text-4xl md:text-5xl font-black mb-8 text-black"
            style={{ fontFamily: "'Architects Daughter', cursive" }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p
              className="text-center text-xl mb-12 text-gray-700"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              {content.subtitle}
            </p>
          )}

          <div className="space-y-4">
            {content.problems.map((problem, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border-3 border-black bg-white p-5"
              >
                <div className="flex-shrink-0 w-8 h-8 border-2 border-black flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <line x1="4" y1="4" x2="12" y2="12" stroke="#000" strokeWidth="2" />
                    <line x1="12" y1="4" x2="4" y2="12" stroke="#000" strokeWidth="2" />
                  </svg>
                </div>
                <p
                  className="flex-1 text-lg text-gray-700"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  {problem}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
