import React from 'react';
import Image from 'next/image';
import { TestimonialBlockContent } from '@/types/templates';

interface TestimonialBlockProps {
  content: TestimonialBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TestimonialBlock({ content, isEditing, onEdit }: TestimonialBlockProps) {
  const { testimonials, layout = 'card', backgroundColor = '#F9FAFB', textColor = '#111827' } = content;

  const renderStars = (rating: number = 5) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
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
      <section
        className="py-16 px-8"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                {testimonial.rating && renderStars(testimonial.rating)}
                <p
                  className="text-gray-700 my-4"
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
                  className="font-semibold text-gray-900"
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
      </section>
    );
  }

  // カードレイアウト（デフォルト）
  return (
    <section
      className="py-16 px-8"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
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
                className="text-gray-700 text-center mb-6 leading-relaxed"
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
                  className="font-semibold text-gray-900"
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
                    className="text-sm text-gray-600"
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
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
