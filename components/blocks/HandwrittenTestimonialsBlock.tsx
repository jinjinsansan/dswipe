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
      className="py-20 px-6"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="container mx-auto max-w-6xl">
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
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.title}
            </h2>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border-3 border-black bg-white p-6"
              >
                {/* 引用符 */}
                <div className="mb-4">
                  <svg width="40" height="30" viewBox="0 0 40 30">
                    <path
                      d="M5,15 Q5,5 15,5 L15,15 Q15,20 10,20 M25,15 Q25,5 35,5 L35,15 Q35,20 30,20"
                      stroke="#000"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>

                <p
                  className="mb-6 text-base text-gray-700"
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
