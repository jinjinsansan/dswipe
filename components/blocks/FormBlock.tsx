'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormBlockContent } from '@/types/templates';

interface FormBlockProps {
  content: FormBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
}

export default function FormBlock({ content, isEditing, onEdit, productId }: FormBlockProps) {
  const router = useRouter();
  const { 
    title, 
    fields, 
    submitButtonText = '送信', 
    backgroundColor = '#FFFFFF', 
    textColor = '#111827',
    buttonColor = '#2563EB',
    accentColor = '#DC2626',
  } = content;
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 色の計算
  const formBgColor = '#FFFFFF';
  const labelColor = textColor;
  const requiredMarkColor = accentColor;
  const borderColor = `${textColor}33`;
  const focusRingColor = buttonColor;
  const checkboxColor = buttonColor;
  const buttonBgColor = buttonColor;
  const disabledBgColor = `${textColor}10`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) return;

    setIsSubmitting(true);
    // TODO: フォーム送信処理（バックエンドAPI連携）
    // await api.post('/form-submit', formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({});
      
      // 商品が紐づいている場合は購入ページへリダイレクト
      if (productId) {
        router.push(`/points/purchase?product_id=${productId}`);
      } else {
        alert('送信しました！');
      }
    }, 1000);
  };

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <section
      className="py-12 px-8"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-2xl mx-auto">
        {/* タイトル */}
        {title && (
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8"
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

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="rounded-xl shadow-lg p-8 space-y-6" style={{ backgroundColor: formBgColor }}>
          {fields.map((field, index) => (
            <div key={index}>
              <label
                htmlFor={field.name}
                className="block text-sm sm:text-base md:text-lg font-medium mb-2"
                style={{ color: labelColor }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditing && onEdit) {
                    const newFields = [...fields];
                    newFields[index].label = e.currentTarget.textContent || '';
                    onEdit('fields', newFields);
                  }
                }}
              >
                {field.label}
                {field.required && <span className="ml-1" style={{ color: requiredMarkColor }}>*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={isEditing}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor,
                    borderWidth: '1px',
                    backgroundColor: formBgColor,
                    color: textColor,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${focusRingColor}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={isEditing}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor,
                    borderWidth: '1px',
                    backgroundColor: formBgColor,
                    color: textColor,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${focusRingColor}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">選択してください</option>
                  {field.options?.map((option, optIndex) => (
                    <option key={optIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    required={field.required}
                    disabled={isEditing}
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{
                      borderColor,
                      borderWidth: '1px',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${focusRingColor}33`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <label htmlFor={field.name} className="ml-2 text-sm" style={{ color: labelColor }}>
                    {field.placeholder || field.label}
                  </label>
                </div>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={isEditing}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor,
                    borderWidth: '1px',
                    backgroundColor: formBgColor,
                    color: textColor,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${focusRingColor}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              )}
            </div>
          ))}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || isEditing}
            className="w-full py-3 px-6 sm:py-4 sm:px-8 text-base sm:text-lg md:text-xl font-semibold rounded-lg transition-colors shadow-lg"
            style={{
              backgroundColor: buttonBgColor,
              color: '#FFFFFF',
              opacity: isSubmitting || isEditing ? 0.5 : 1,
              cursor: isSubmitting || isEditing ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && !isEditing) {
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (isEditing && onEdit) {
                  onEdit('submitButtonText', e.currentTarget.textContent);
                }
              }}
            >
              {isSubmitting ? '送信中...' : submitButtonText}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}
