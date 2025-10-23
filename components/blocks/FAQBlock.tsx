'use client';

import React, { useState } from 'react';
import { FAQBlockContent } from '@/types/templates';
import { Section } from '@/components/ui';

interface FAQBlockProps {
  content: FAQBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function FAQBlock({ content, isEditing, onEdit }: FAQBlockProps) {
  const { 
    title, 
    faqs, 
    layout = 'accordion', 
    backgroundColor = '#FFFFFF', 
    textColor = '#111827', 
    accentColor = '#3B82F6',
    titleColor,
    descriptionColor,
  } = content;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (layout === 'grid') {
    // 2カラムレイアウト
    return (
      <Section
        tone="none"
        padding="condensed"
        className="transform origin-top scale-[0.88] pt-9 pb-8 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:origin-center lg:scale-[0.98] xl:scale-100"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="max-w-6xl mx-auto" style={{ paddingInline: 0 }}>
          {title && (
            <h2
              className="mb-8 text-3xl font-bold text-center sm:mb-10 sm:text-4xl"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (isEditing && onEdit) {
                  onEdit('title', e.currentTarget.textContent);
                }
              }}
            >
              {title}
            </h2>
          )}
          
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg sm:rounded-xl p-5 sm:p-6 md:p-7 shadow-md" style={{ backgroundColor: accentColor + '11', borderLeft: `4px solid ${accentColor}` }}>
                <h3
                  className="mb-2 text-lg font-semibold sm:text-xl"
                  style={{ color: titleColor || textColor }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newFaqs = [...faqs];
                      newFaqs[index].question = e.currentTarget.textContent || '';
                      onEdit('faqs', newFaqs);
                    }
                  }}
                >
                  {faq.question}
                </h3>
                <p
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{ color: descriptionColor || textColor, opacity: 0.8 }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newFaqs = [...faqs];
                      newFaqs[index].answer = e.currentTarget.textContent || '';
                      onEdit('faqs', newFaqs);
                    }
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  // アコーディオンレイアウト（デフォルト）
  return (
    <Section
      tone="none"
      padding="condensed"
      className="transform origin-top scale-[0.88] pt-9 pb-8 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:origin-center lg:scale-[0.98] xl:scale-100"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-4xl mx-auto" style={{ paddingInline: 0 }}>
        {title && (
          <h2
            className="mb-8 text-3xl font-bold text-center sm:mb-10 sm:text-4xl"
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              if (isEditing && onEdit) {
                onEdit('title', e.currentTarget.textContent);
              }
            }}
          >
            {title}
          </h2>
        )}
        
        <div className="space-y-4 sm:space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: backgroundColor + 'F0', borderLeft: `4px solid ${accentColor}` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors sm:px-6 sm:py-5"
                style={{ backgroundColor: backgroundColor + 'F0' }}
              >
                <h3
                  className="flex-1 text-base sm:text-lg md:text-xl font-semibold"
                  style={{ color: titleColor || textColor }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    e.stopPropagation();
                    if (isEditing && onEdit) {
                      const newFaqs = [...faqs];
                      newFaqs[index].question = e.currentTarget.textContent || '';
                      onEdit('faqs', newFaqs);
                    }
                  }}
                  onClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                    }
                  }}
                >
                  {faq.question}
                </h3>
                <svg
                  className={`h-5 w-5 transition-transform sm:h-6 sm:w-6 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: `${textColor}99` }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 md:px-7 md:pb-7">
                  <p
                    className="text-sm sm:text-base md:text-lg leading-relaxed"
                    style={{ color: descriptionColor || textColor, opacity: 0.8 }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (isEditing && onEdit) {
                        const newFaqs = [...faqs];
                        newFaqs[index].answer = e.currentTarget.textContent || '';
                        onEdit('faqs', newFaqs);
                      }
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
