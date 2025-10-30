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
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* ワイヤーフレーム風ブラウザボックス */}
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

          {content.title && (
            <h2
              className="text-center text-4xl md:text-5xl font-black mb-12 text-black"
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              {content.title}
            </h2>
          )}

          <div className={`grid gap-6 ${content.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {content.features.map((feature, index) => (
              <div
                key={index}
                className="border-3 border-black bg-white p-6 relative"
              >
                {/* モノクロ手書き風アイコン */}
                <div className="mb-4">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <defs>
                      <pattern id={`icon-hash-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.15"/>
                      </pattern>
                    </defs>
                    {index === 0 && (
                      // 星形アイコン
                      <path d="M30,10 L35,23 L48,23 L38,32 L42,45 L30,36 L18,45 L22,32 L12,23 L25,23 Z" 
                        stroke="#000" strokeWidth="2" fill="url(#icon-hash-0)" />
                    )}
                    {index === 1 && (
                      // 本アイコン
                      <>
                        <rect x="15" y="15" width="30" height="35" stroke="#000" strokeWidth="2" fill="url(#icon-hash-1)" />
                        <line x1="30" y1="15" x2="30" y2="50" stroke="#000" strokeWidth="2" />
                        <line x1="15" y1="25" x2="45" y2="25" stroke="#000" strokeWidth="1.5" />
                        <line x1="15" y1="32" x2="28" y2="32" stroke="#000" strokeWidth="1.5" />
                        <line x1="32" y1="32" x2="45" y2="32" stroke="#000" strokeWidth="1.5" />
                      </>
                    )}
                    {index === 2 && (
                      // 吹き出しアイコン
                      <>
                        <rect x="10" y="15" width="40" height="25" rx="5" stroke="#000" strokeWidth="2" fill="url(#icon-hash-2)" />
                        <path d="M25 40 L30 50 L35 40" stroke="#000" strokeWidth="2" fill="url(#icon-hash-2)" />
                        <circle cx="20" cy="27" r="2" fill="#000" />
                        <circle cx="30" cy="27" r="2" fill="#000" />
                        <circle cx="40" cy="27" r="2" fill="#000" />
                      </>
                    )}
                  </svg>
                </div>

                <h3
                  className="text-xl font-bold mb-3 text-black"
                  style={{
                    fontFamily: "'Architects Daughter', cursive",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  className="text-base leading-relaxed text-gray-700"
                  style={{
                    fontFamily: "'Indie Flower', cursive",
                  }}
                >
                  {feature.description}
                </p>

                {/* 手書き風アンダーライン */}
                <svg
                  className="absolute bottom-3 left-6 right-6 h-1"
                  viewBox="0 0 100 5"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,2 Q25,4 50,2 T100,3"
                    stroke="#000"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
