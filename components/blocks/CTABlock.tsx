import React from 'react';
import Link from 'next/link';

interface CTABlockProps {
  content: {
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonColor: string;
    backgroundColor: string;
    textColor: string;
  };
  isEditing?: boolean;
  onEdit?: (field: string, value: string) => void;
  productId?: string;
}

export default function CTABlock({ content, isEditing, onEdit, productId }: CTABlockProps) {
  const style = {
    backgroundColor: content.backgroundColor,
    color: content.textColor,
  };

  return (
    <div className="py-12 px-8" style={style}>
      <div className="max-w-4xl mx-auto text-center">
        {isEditing ? (
          <>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold mb-6 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="CTAタイトルを入力"
            />
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              className="w-full text-xl mb-8 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="サブタイトル（オプション）"
            />
            <input
              type="text"
              value={content.buttonText}
              onChange={(e) => onEdit?.('buttonText', e.target.value)}
              className="w-full text-lg bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="ボタンテキスト"
            />
          </>
        ) : (
          <>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {content.title || 'さあ、始めましょう'}
            </h2>
            {content.subtitle && (
              <p className="text-xl mb-8">
                {content.subtitle}
              </p>
            )}
            {productId ? (
              <Link
                href={`/points/purchase?product_id=${productId}`}
                className="inline-block px-12 py-5 rounded-lg font-bold text-xl shadow-2xl hover:scale-105 transition-transform"
                style={{ backgroundColor: content.buttonColor, color: '#FFFFFF' }}
              >
                {content.buttonText || '今すぐ始める'}
              </Link>
            ) : (
              <button
                className="px-12 py-5 rounded-lg font-bold text-xl shadow-2xl hover:scale-105 transition-transform"
                style={{ backgroundColor: content.buttonColor, color: '#FFFFFF' }}
              >
                {content.buttonText || '今すぐ始める'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
