'use client';

import React from 'react';
import type { FeaturesBlockContent } from '@/types/templates';

interface HandwrittenFeaturesBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenFeaturesBlock({
  content,
}: HandwrittenFeaturesBlockProps) {
  const bgColor = content.backgroundColor || '#FFFFFF';
  const textColor = content.textColor || '#1F2937';

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto max-w-6xl">
        {content.tagline && (
          <p
            className="text-center text-sm font-bold uppercase tracking-widest mb-4"
            style={{
              color: textColor,
              opacity: 0.6,
              fontFamily: "'Patrick Hand', cursive",
            }}
          >
            {content.tagline}
          </p>
        )}

        {content.title && (
          <h2
            className="text-center text-4xl md:text-5xl font-black mb-16"
            style={{
              color: textColor,
              fontFamily: "'Caveat', cursive",
            }}
          >
            {content.title}
          </h2>
        )}

        <div className={`grid gap-8 ${content.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          {content.features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-3xl border-3 border-dashed transform transition-all duration-300 hover:scale-105 hover:-rotate-1"
              style={{
                borderColor: textColor,
                backgroundColor: index % 2 === 0 ? '#FEF3C7' : '#DBEAFE',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.05)',
              }}
            >
              {/* 手書き風のコーナー装飾 */}
              <div
                className="absolute top-4 right-4 w-8 h-8 opacity-20"
                style={{ color: textColor }}
              >
                <svg viewBox="0 0 32 32" fill="none">
                  <path
                    d="M2 2 L30 2 M30 2 L30 30"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {feature.icon && (
                <div className="text-6xl mb-4 transform -rotate-6">
                  {feature.icon}
                </div>
              )}

              <h3
                className="text-2xl font-bold mb-3"
                style={{
                  color: textColor,
                  fontFamily: "'Patrick Hand', cursive",
                }}
              >
                {feature.title}
              </h3>

              <p
                className="text-lg leading-relaxed"
                style={{
                  color: textColor,
                  opacity: 0.8,
                  fontFamily: "'Patrick Hand', cursive",
                }}
              >
                {feature.description}
              </p>

              {/* 手書き風アンダーライン */}
              <svg
                className="absolute bottom-4 left-8 right-8 h-2 opacity-30"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,5 Q25,7 50,5 T100,6"
                  stroke={textColor}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* スケッチ風装飾 */}
        <div className="flex justify-center mt-16 gap-8 opacity-20">
          {[0, 1, 2].map((i) => (
            <svg key={i} width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle
                cx="30"
                cy="30"
                r="25"
                stroke={textColor}
                strokeWidth="2"
                strokeDasharray="3 3"
                transform={`rotate(${i * 30} 30 30)`}
              />
            </svg>
          ))}
        </div>
      </div>
    </section>
  );
}
