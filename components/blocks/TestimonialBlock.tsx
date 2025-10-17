import React from 'react';
import Image from 'next/image';
import { TestimonialBlockContent } from '@/types/templates';
import { getFontStack } from '@/lib/fonts';
import { Section } from '@/components/ui';

interface TestimonialBlockProps {
  content: TestimonialBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TestimonialBlock({ content, isEditing, onEdit }: TestimonialBlockProps) {
  const { 
    testimonials, 
    layout = 'card', 
    backgroundColor = '#F9FAFB', 
    textColor = '#111827', 
    accentColor = '#3B82F6',
    titleColor,
    descriptionColor,
  } = content;
  
  const fontStack = getFontStack((content as any).fontFamily);

  const renderStars = (rating: number = 5) => {
    const starColor = accentColor || '#FBBF24';
    const emptyStarColor = `${textColor}66`;
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ color: i < rating ? starColor : emptyStarColor }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (layout === 'grid') {
    // グリッドレイアウト
    return (
      <Section
        tone="none"
        padding="default"
        style={{ backgroundColor, color: textColor, fontFamily: fontStack }}
      >
        <div className="max-w-7xl mx-auto" style={{ paddingInline: 0 }}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="rounded-lg p-5 sm:p-6 shadow-md" style={{ backgroundColor: backgroundColor, borderLeft: `4px solid ${accentColor}` }}>
                {testimonial.rating && renderStars(testimonial.rating)}
                <p
                  className="my-4"
                  style={{ color: textColor, opacity: 0.9 }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newTestimonials = [...testimonials];
                      newTestimonials[index].text = e.currentTarget.textContent || '';
                      onEdit('testimonials', newTestimonials);
                    }
                  }}
                >
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <p
                  className="font-semibold"
                  style={{ color: textColor }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newTestimonials = [...testimonials];
                      newTestimonials[index].name = e.currentTarget.textContent || '';
                      onEdit('testimonials', newTestimonials);
                    }
                  }}
                >
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  // カードレイアウト（デフォルト）
  return (
    <Section
      tone="none"
      padding="default"
      style={{ backgroundColor, color: textColor, fontFamily: fontStack }}
    >
      <div className="max-w-7xl mx-auto" style={{ paddingInline: 0 }}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-xl p-6 md:p-8 shadow-lg" style={{ backgroundColor: backgroundColor, borderTop: `3px solid ${accentColor}` }}>
              {/* 画像 */}
              {testimonial.imageUrl && (
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <Image
                    src={testimonial.imageUrl}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="64px"
                  />
                </div>
              )}

              {/* 評価 */}
              {testimonial.rating && (
                <div className="flex justify-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
              )}

              {/* テキスト */}
              <p
                className="text-center mb-6 leading-relaxed"
                style={{ color: descriptionColor || textColor, opacity: 0.9 }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditing && onEdit) {
                    const newTestimonials = [...testimonials];
                    newTestimonials[index].text = e.currentTarget.textContent || '';
                    onEdit('testimonials', newTestimonials);
                  }
                }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* 名前 */}
              <div className="text-center">
                <p
                  className="font-semibold"
                  style={{ color: titleColor || textColor }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newTestimonials = [...testimonials];
                      newTestimonials[index].name = e.currentTarget.textContent || '';
                      onEdit('testimonials', newTestimonials);
                    }
                  }}
                >
                  {testimonial.name}
                </p>
                {testimonial.role && (
                  <p
                    className="text-sm"
                    style={{ color: descriptionColor || textColor, opacity: 0.7 }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (isEditing && onEdit) {
                        const newTestimonials = [...testimonials];
                        newTestimonials[index].role = e.currentTarget.textContent || '';
                        onEdit('testimonials', newTestimonials);
                      }
                    }}
                  >
                    {testimonial.role}
                  </p>
                )}
                {testimonial.company && (
                  <p className="text-sm" style={{ color: descriptionColor || textColor, opacity: 0.6 }}>{testimonial.company}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
