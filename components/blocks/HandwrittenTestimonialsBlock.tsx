'use client';

import React from 'react';
import type { TestimonialsBlockContent } from '@/types/templates';

interface HandwrittenTestimonialsBlockProps {
  content: TestimonialsBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function HandwrittenTestimonialsBlock({
  content,
}: HandwrittenTestimonialsBlockProps) {
  return (
    <section
      className="py-12 md:py-20 px-4 md:px-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="container mx-auto max-w-6xl">
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
              className="text-center text-2xl md:text-4xl lg:text-5xl font-black mb-8 md:mb-12 text-black"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border-2 md:border-3 border-black bg-white p-4 md:p-6"
              >
                {/* 引用符 */}
                <div className="mb-4">
                  <svg width="30" height="22" viewBox="0 0 40 30" className="md:w-10 md:h-[30px]">
                    <path
                      d="M5,15 Q5,5 15,5 L15,15 Q15,20 10,20 M25,15 Q25,5 35,5 L35,15 Q35,20 30,20"
                      stroke="#000"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>

                <p
                  className="mb-4 md:mb-6 text-sm md:text-base text-gray-700"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  {testimonial.quote}
                </p>

                <div className="border-t-2 border-black pt-4">
                  <p
                    className="font-bold text-black"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {testimonial.name}
                  </p>
                  {testimonial.role && (
                    <p
                      className="text-sm text-gray-600"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {testimonial.role}
                    </p>
                  )}
                  {testimonial.rating && (
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill={i < testimonial.rating! ? '#000' : 'none'}
                          stroke="#000"
                          strokeWidth="1"
                        >
                          <path d="M8,2 L9,6 L13,6 L10,9 L11,13 L8,10 L5,13 L6,9 L3,6 L7,6 Z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
