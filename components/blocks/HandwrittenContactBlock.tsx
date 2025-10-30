'use client';

import React from 'react';
import type { ContactBlockContent } from '@/types/templates';

interface HandwrittenContactBlockProps {
  content: ContactBlockContent;
}

export default function HandwrittenContactBlock({
  content,
}: HandwrittenContactBlockProps) {
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="container mx-auto max-w-3xl">
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

            {content.description && (
              <p
                className="mb-10 text-base text-gray-700"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              >
                {content.description}
              </p>
            )}

            <a
              href={content.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-5 text-lg font-bold border-4 border-black bg-white"
              style={{ fontFamily: "'Architects Daughter', cursive" }}
            >
              {content.buttonText}
            </a>

            {/* 吹き出しアイコン */}
            <div className="mt-12">
              <svg width="80" height="60" viewBox="0 0 80 60" className="mx-auto">
                <defs>
                  <pattern id="contact-hash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M0,4 L4,0" stroke="#000" strokeWidth="0.5" opacity="0.1"/>
                  </pattern>
                </defs>
                <rect x="10" y="10" width="60" height="35" rx="5" stroke="#000" strokeWidth="2" fill="url(#contact-hash)" />
                <path d="M35 45 L40 55 L45 45" stroke="#000" strokeWidth="2" fill="url(#contact-hash)" />
                <text
                  x="40"
                  y="33"
                  textAnchor="middle"
                  fontSize="20"
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
      </div>
    </section>
  );
}
