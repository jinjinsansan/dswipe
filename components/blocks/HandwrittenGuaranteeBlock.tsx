'use client';

import React from 'react';
import type { GuaranteeBlockContent } from '@/types/templates';

interface HandwrittenGuaranteeBlockProps {
  content: GuaranteeBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenGuaranteeBlock({
  content,
}: HandwrittenGuaranteeBlockProps) {
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

          <div className="text-center">
            {/* バッジ */}
            {content.badgeText && (
              <div className="inline-block mb-6">
                <div className="border-3 border-black px-6 py-3 relative">
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                    <defs>
                      <pattern id="badge-hash" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                        <path d="M0,6 L6,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#badge-hash)" />
                  </svg>
                  <span
                    className="relative z-10 text-xl font-black"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {content.badgeText}
                  </span>
                </div>
              </div>
            )}

            <h2
              className="text-4xl md:text-5xl font-black mb-6 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p
                className="text-xl mb-8 text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.subtitle}
              </p>
            )}

            {content.guaranteeDetails && (
              <p
                className="text-lg mb-8 text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.guaranteeDetails}
              </p>
            )}

            {content.bulletPoints && content.bulletPoints.length > 0 && (
              <ul className="text-left max-w-2xl mx-auto space-y-3 mb-8">
                {content.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0 mt-1">
                      <path
                        d="M3 10 L8 15 L17 5"
                        stroke="#000"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className="text-base text-gray-700"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* シールドアイコン */}
            <div className="mt-8">
              <svg width="80" height="100" viewBox="0 0 80 100" className="mx-auto">
                <defs>
                  <pattern id="shield-hash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                  </pattern>
                </defs>
                <path
                  d="M40,10 L65,20 L65,50 Q65,75 40,90 Q15,75 15,50 L15,20 Z"
                  stroke="#000"
                  strokeWidth="3"
                  fill="url(#shield-hash)"
                />
                <path
                  d="M30 50 L37 58 L52 38"
                  stroke="#000"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
