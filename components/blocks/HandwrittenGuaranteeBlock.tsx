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
      className="py-12 md:py-20 px-4 md:px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="border-3 md:border-4 border-black rounded-xl md:rounded-2xl bg-white p-6 md:p-8">
          {/* ブラウザトップバー */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 pb-3 md:pb-4 border-b-2 md:border-b-3 border-black">
            <div className="flex gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black bg-white"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black bg-white"></div>
            </div>
            <div className="flex-1 border-2 border-black rounded-full px-2 md:px-4 py-1 bg-white">
              <span className="text-[10px] md:text-xs text-gray-400" style={{ fontFamily: "'Indie Flower', cursive" }}>https://your-url.com</span>
            </div>
          </div>

          <div className="text-center">
            {/* バッジ */}
            {content.badgeText && (
              <div className="inline-block mb-6">
                <div className="border-2 md:border-3 border-black px-4 md:px-6 py-2 md:py-3 relative">
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                    <defs>
                      <pattern id="badge-hash" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                        <path d="M0,6 L6,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#badge-hash)" />
                  </svg>
                  <span
                    className="relative z-10 text-base md:text-xl font-black"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {content.badgeText}
                  </span>
                </div>
              </div>
            )}

            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>

            {content.subtitle && (
              <p
                className="text-base md:text-xl mb-6 md:mb-8 text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.subtitle}
              </p>
            )}

            {content.guaranteeDetails && (
              <p
                className="text-sm md:text-base lg:text-lg mb-6 md:mb-8 text-gray-700"
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
              <svg width="60" height="75" viewBox="0 0 80 100" className="mx-auto md:w-20 md:h-[100px]">
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
