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
      className="py-12 md:py-20 px-4 md:px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* ワイヤーフレーム風ブラウザボックス */}
        <div className="border-3 md:border-4 border-black rounded-xl md:rounded-2xl bg-white p-4 md:p-8">
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

          {content.title && (
            <h2
              className="text-center text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 text-black"
              style={{
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              {content.title}
            </h2>
          )}

          {content.subtitle && (
            <p
              className="text-center text-base md:text-xl mb-8 md:mb-12 text-gray-700"
              style={{
                fontFamily: "'Indie Flower', cursive",
              }}
            >
              {content.subtitle}
            </p>
          )}

          <div className="space-y-4">
            {content.items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border-2 md:border-3 border-black bg-white"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-3 md:p-5 flex items-start gap-3 md:gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {/* ハッチング付きの開閉ボタン */}
                      <div className="w-6 h-6 md:w-7 md:h-7 border-2 border-black flex items-center justify-center font-bold text-base md:text-lg relative bg-white">
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                          <defs>
                            <pattern id={`btn-hash-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                              <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity={isOpen ? "0.15" : "0.08"}/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#btn-hash-${index})`} />
                        </svg>
                        <span className="relative z-10 text-black">{isOpen ? '−' : '+'}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-base md:text-lg font-bold pr-2 md:pr-4 text-black"
                        style={{
                          fontFamily: "'Architects Daughter', cursive",
                        }}
                      >
                        {item.question}
                      </h3>
                      {isOpen && (
                        <div className="mt-4">
                          <p
                            className="text-sm md:text-base leading-relaxed text-gray-700"
                            style={{
                              fontFamily: "'Indie Flower', cursive",
                            }}
                          >
                            {item.answer}
                          </p>
                          {/* チェックマーク */}
                          <div className="mt-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path
                                d="M3 10 L8 15 L17 5"
                                stroke="#000"
                                strokeWidth="2.5"
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
        </div>
      </div>
    </section>
  );
}
