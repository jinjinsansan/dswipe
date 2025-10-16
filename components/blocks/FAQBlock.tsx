'use client';

import React, { useState } from 'react';
import { FAQBlockContent } from '@/types/templates';

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
      <section
        className="py-12 px-8"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="max-w-7xl mx-auto">
          {title && (
            <h2
              className="text-4xl font-bold text-center mb-12"
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
          
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg p-6 shadow-md" style={{ backgroundColor: accentColor + '11', borderLeft: `4px solid ${accentColor}` }}>
                <h3
                  className="text-xl font-semibold mb-3"
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
                  className="leading-relaxed"
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
      </section>
    );
  }

  // アコーディオンレイアウト（デフォルト）
  return (
    <section
      className="py-12 px-8"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2
            className="text-4xl font-bold text-center mb-12"
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
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: backgroundColor + 'F0', borderLeft: `4px solid ${accentColor}` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
                style={{ backgroundColor: backgroundColor + 'F0' }}
              >
                <h3
                  className="text-lg font-semibold flex-1"
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
                  className={`w-6 h-6 transition-transform ${
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
                <div className="px-6 pb-6">
                  <p
                    className="leading-relaxed"
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
    </section>
  );
}
