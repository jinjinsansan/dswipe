'use client';

import React, { useState } from 'react';
import type { FAQBlockContent } from '@/types/templates';

interface HandwrittenFAQBlockProps {
  content: FAQBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenFAQBlock({
  content,
}: HandwrittenFAQBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const bgColor = content.backgroundColor || '#FEF3C7';
  const textColor = content.textColor || '#78350F';

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto max-w-4xl">
        {content.title && (
          <h2
            className="text-center text-4xl md:text-5xl font-black mb-4"
            style={{
              color: textColor,
              fontFamily: "'Caveat', cursive",
            }}
          >
            {content.title}
          </h2>
        )}

        {content.subtitle && (
          <p
            className="text-center text-xl mb-12"
            style={{
              color: textColor,
              opacity: 0.8,
              fontFamily: "'Patrick Hand', cursive",
            }}
          >
            {content.subtitle}
          </p>
        )}

        <div className="space-y-6">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="group relative rounded-3xl border-3 border-dashed overflow-hidden transition-all duration-300"
                style={{
                  borderColor: textColor,
                  backgroundColor: '#FFFFFF',
                  boxShadow: isOpen ? '6px 6px 0px rgba(0,0,0,0.1)' : '3px 3px 0px rgba(0,0,0,0.05)',
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 flex items-start gap-4 transition-all"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transform transition-transform duration-300"
                      style={{
                        backgroundColor: isOpen ? '#F59E0B' : '#FDE047',
                        color: textColor,
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      }}
                    >
                      {isOpen ? '−' : '+'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold pr-4"
                      style={{
                        color: textColor,
                        fontFamily: "'Patrick Hand', cursive",
                      }}
                    >
                      {item.question}
                    </h3>
                    {isOpen && (
                      <div className="mt-4">
                        <p
                          className="text-lg leading-relaxed"
                          style={{
                            color: textColor,
                            opacity: 0.8,
                            fontFamily: "'Patrick Hand', cursive",
                          }}
                        >
                          {item.answer}
                        </p>
                        {/* 手書き風のチェックマーク */}
                        <div className="mt-4 flex items-center gap-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 12 L10 18 L20 6"
                              stroke="#10B981"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span
                            className="text-sm font-semibold"
                            style={{
                              color: '#10B981',
                              fontFamily: "'Patrick Hand', cursive",
                            }}
                          >
                            解決！
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* 手書き風のコーナー装飾 */}
                {!isOpen && (
                  <div className="absolute bottom-2 right-4 opacity-10">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <path
                        d="M5 20 Q15 15, 20 20 T35 20"
                        stroke={textColor}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="2 2"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 手書き風の吹き出し装飾 */}
        <div className="flex justify-center mt-16 opacity-20">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <ellipse
              cx="40"
              cy="35"
              rx="30"
              ry="25"
              stroke={textColor}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M30 55 L25 70 L35 60"
              stroke={textColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="40"
              y="40"
              textAnchor="middle"
              fontSize="24"
              fill={textColor}
            >
              ?
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
