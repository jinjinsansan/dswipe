'use client';

import React from 'react';
import type { PricingBlockContent } from '@/types/templates';

interface HandwrittenPricingBlockProps {
  content: PricingBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

export default function HandwrittenPricingBlock({
  content,
  isEditing,
  productId,
  onProductClick,
  ctaIds,
  onCtaClick,
}: HandwrittenPricingBlockProps) {
  const handleClick = (planIndex: number) => {
    if (isEditing) return;
    if (productId && onProductClick) {
      onProductClick(productId);
    }
    if (ctaIds && onCtaClick) {
      onCtaClick(ctaIds[planIndex], 'primary');
    }
  };

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

          <div className="grid gap-6 md:grid-cols-3">
            {content.plans.map((plan, index) => (
              <div
                key={index}
                className={`border-3 border-black bg-white p-6 relative ${plan.highlighted ? 'border-4' : ''}`}
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 border-2 border-black bg-white text-sm font-bold"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    おすすめ
                  </div>
                )}

                <h3
                  className="text-2xl font-bold mb-4 text-black"
                  style={{ fontFamily: "'Architects Daughter', cursive" }}
                >
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <p
                    className="text-4xl font-black text-black"
                    style={{ fontFamily: "'Architects Daughter', cursive" }}
                  >
                    {plan.price}
                  </p>
                  {plan.period && (
                    <p className="text-sm text-gray-600" style={{ fontFamily: "'Indie Flower', cursive" }}>
                      {plan.period}
                    </p>
                  )}
                </div>

                {plan.description && (
                  <p
                    className="mb-6 text-gray-700"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    {plan.description}
                  </p>
                )}

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                        <path
                          d="M3 10 L8 15 L17 5"
                          stroke="#000"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm" style={{ fontFamily: "'Indie Flower', cursive" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleClick(index)}
                  className="w-full px-6 py-3 text-base font-bold border-3 border-black bg-white"
                  style={{ fontFamily: "'Architects Daughter', cursive" }}
                  disabled={isEditing}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
