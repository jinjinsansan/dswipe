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
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* ワイヤーフレーム風ボックス */}
        <div className="border-4 border-black bg-white p-8">
          {content.tagline && (
            <p
              className="text-center text-sm font-bold uppercase tracking-widest mb-4 text-black"
              style={{
                fontFamily: "'Indie Flower', cursive",
              }}
            >
              {content.tagline}
            </p>
          )}

          {content.title && (
            <h2
              className="text-center text-4xl md:text-5xl font-black mb-16 text-black"
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              {content.title}
            </h2>
          )}

          <div className={`grid gap-8 ${content.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {content.features.map((feature, index) => (
              <div
                key={index}
                className="relative border-3 border-black bg-white p-6"
              >
                {/* ハッチングパターン背景 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  <defs>
                    <pattern id={`feature-hash-${index}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                      <path d="M0,6 L6,0" stroke="#000" strokeWidth="0.5" opacity="0.05"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#feature-hash-${index})`} />
                </svg>

                {/* コーナー装飾 */}
                <div className="absolute top-2 right-2">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M2,2 L18,2 M18,2 L18,18" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>

                {feature.icon && (
                  <div className="relative z-10 text-5xl mb-4">
                    {feature.icon}
                  </div>
                )}

                <h3
                  className="relative z-10 text-2xl font-bold mb-3 text-black"
                  style={{
                    fontFamily: "'Architects Daughter', cursive",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  className="relative z-10 text-lg leading-relaxed text-gray-700"
                  style={{
                    fontFamily: "'Indie Flower', cursive",
                  }}
                >
                  {feature.description}
                </p>

                {/* 手書き風アンダーライン */}
                <svg
                  className="absolute bottom-4 left-6 right-6 h-1"
                  viewBox="0 0 100 5"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,2 Q25,4 50,2 T100,3"
                    stroke="#000"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.2"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* 装飾図形 */}
          <div className="flex justify-center mt-12 gap-8">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15" stroke="#000" strokeWidth="2" fill="none" strokeDasharray="2 3"/>
            </svg>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <rect x="10" y="10" width="20" height="20" stroke="#000" strokeWidth="2" fill="none" strokeDasharray="2 3"/>
            </svg>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <polygon points="20,10 30,30 10,30" stroke="#000" strokeWidth="2" fill="none" strokeDasharray="2 3"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
