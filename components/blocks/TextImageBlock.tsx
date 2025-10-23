import React from 'react';
import Image from 'next/image';

interface TextImageBlockProps {
  content: {
    title: string;
    text: string;
    imageUrl?: string;
    backgroundColor: string;
    textColor: string;
    imagePosition?: 'left' | 'right';
  };
  isEditing?: boolean;
  onEdit?: (field: string, value: string) => void;
}

export default function TextImageBlock({ content, isEditing, onEdit }: TextImageBlockProps) {
  const style = {
    backgroundColor: content.backgroundColor,
    color: content.textColor,
  };

  const imageOnRight = content.imagePosition !== 'left';

  return (
    <div className="py-12 px-8" style={style}>
      <div className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${!imageOnRight ? 'md:flex-row-reverse' : ''}`}>
        <div className={imageOnRight ? 'order-1' : 'order-2'}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={content.title}
                onChange={(e) => onEdit?.('title', e.target.value)}
                className="w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-transparent border-2 border-dashed px-4 py-2 rounded"
                style={{ borderColor: content.textColor, color: content.textColor }}
                placeholder="タイトルを入力"
              />
              <textarea
                value={content.text}
                onChange={(e) => onEdit?.('text', e.target.value)}
                className="w-full text-base sm:text-lg md:text-xl bg-transparent border-2 border-dashed px-4 py-2 rounded resize-none"
                style={{ borderColor: content.textColor, color: content.textColor }}
                rows={6}
                placeholder="説明文を入力"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {content.title || 'タイトルをここに入力'}
              </h2>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                {content.text || '説明文をここに入力してください。商品やサービスの特徴を詳しく説明します。'}
              </p>
            </>
          )}
        </div>

        <div className={imageOnRight ? 'order-2' : 'order-1'}>
          {content.imageUrl ? (
            <div className="relative w-full aspect-video">
              <Image 
                src={content.imageUrl} 
                alt={content.title} 
                fill
                className="rounded-xl shadow-lg object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div 
              className="w-full aspect-video rounded-xl flex items-center justify-center"
              style={{ backgroundColor: content.textColor + '20', color: content.textColor }}
            >
              <span>画像をアップロード</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
