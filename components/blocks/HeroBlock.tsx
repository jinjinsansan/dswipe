import React from 'react';

interface HeroBlockProps {
  content: {
    title: string;
    subtitle: string;
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    buttonText?: string;
    buttonColor?: string;
  };
  isEditing?: boolean;
  onEdit?: (field: string, value: string) => void;
}

export default function HeroBlock({ content, isEditing, onEdit }: HeroBlockProps) {
  const style = {
    backgroundColor: content.backgroundColor,
    color: content.textColor,
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-8 py-16"
      style={style}
    >
      <div className="max-w-4xl w-full text-center">
        {isEditing ? (
          <>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              className="w-full text-5xl md:text-6xl font-bold mb-6 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="見出しを入力"
            />
            <textarea
              value={content.subtitle}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              className="w-full text-xl md:text-2xl mb-12 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded resize-none"
              rows={2}
              placeholder="サブタイトルを入力"
            />
          </>
        ) : (
          <>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content.title || '見出しをここに入力'}
            </h1>
            <p className="text-xl md:text-2xl mb-12">
              {content.subtitle || 'サブタイトルをここに入力'}
            </p>
          </>
        )}

        {content.imageUrl && (
          <div className="mb-12">
            <img 
              src={content.imageUrl} 
              alt="Hero" 
              className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl"
            />
          </div>
        )}

        {content.buttonText && (
          <button
            className="px-10 py-4 rounded-lg font-bold text-xl shadow-lg hover:scale-105 transition-transform"
            style={{ backgroundColor: content.buttonColor }}
          >
            {content.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
