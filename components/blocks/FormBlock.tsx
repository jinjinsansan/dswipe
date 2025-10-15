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
  const { title, fields, submitButtonText = '送信', backgroundColor = '#FFFFFF', textColor = '#111827' } = content;
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            className="text-4xl font-bold text-center mb-8"
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
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {fields.map((field, index) => (
            <div key={index}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-2"
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
                {field.required && <span className="text-red-500 ml-1">*</span>}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              )}
            </div>
          ))}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || isEditing}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
