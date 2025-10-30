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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* ワイヤーフレーム風ボックス */}
        <div className="border-4 border-black bg-white p-8">
          {content.title && (
            <h2
              className="text-center text-4xl md:text-5xl font-black mb-4 text-black"
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              {content.title}
            </h2>
          )}

          {content.subtitle && (
            <p
              className="text-center text-xl mb-12 text-gray-700"
              style={{
                fontFamily: "'Indie Flower', cursive",
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
                  className="border-3 border-black bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {/* ハッチング付きの開閉ボタン */}
                      <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-bold text-lg relative">
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                          <defs>
                            <pattern id={`btn-hash-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                              <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity={isOpen ? "0.1" : "0.05"}/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#btn-hash-${index})`} />
                        </svg>
                        <span className="relative z-10">{isOpen ? '−' : '+'}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold pr-4 text-black"
                        style={{
                          fontFamily: "'Architects Daughter', cursive",
                        }}
                      >
                        {item.question}
                      </h3>
                      {isOpen && (
                        <div className="mt-4">
                          <p
                            className="text-lg leading-relaxed text-gray-700"
                            style={{
                              fontFamily: "'Indie Flower', cursive",
                            }}
                          >
                            {item.answer}
                          </p>
                          {/* チェックマーク */}
                          <div className="mt-4 flex items-center gap-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M4 12 L10 18 L20 6"
                                stroke="#000"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              className="text-sm font-semibold text-black"
                              style={{
                                fontFamily: "'Architects Daughter', cursive",
                              }}
                            >
                              解決！
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* 吹き出し装飾 */}
          <div className="flex justify-center mt-12">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <ellipse
                cx="40"
                cy="35"
                rx="30"
                ry="25"
                stroke="#000"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <path
                d="M30 55 L25 70 L35 60"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="40"
                y="43"
                textAnchor="middle"
                fontSize="28"
                fontWeight="bold"
                fill="#000"
                fontFamily="'Architects Daughter', cursive"
              >
                ?
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
