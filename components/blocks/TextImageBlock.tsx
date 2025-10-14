import React from 'react';

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
    <div className="py-16 px-8" style={style}>
      <div className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${!imageOnRight ? 'md:flex-row-reverse' : ''}`}>
        <div className={imageOnRight ? 'order-1' : 'order-2'}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={content.title}
                onChange={(e) => onEdit?.('title', e.target.value)}
                className="w-full text-3xl md:text-4xl font-bold mb-6 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
                placeholder="タイトルを入力"
              />
              <textarea
                value={content.text}
                onChange={(e) => onEdit?.('text', e.target.value)}
                className="w-full text-lg bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded resize-none"
                rows={6}
                placeholder="説明文を入力"
              />
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {content.title || 'タイトルをここに入力'}
              </h2>
              <p className="text-lg leading-relaxed">
                {content.text || '説明文をここに入力してください。商品やサービスの特徴を詳しく説明します。'}
              </p>
            </>
          )}
        </div>

        <div className={imageOnRight ? 'order-2' : 'order-1'}>
          {content.imageUrl ? (
            <img 
              src={content.imageUrl} 
              alt={content.title} 
              className="w-full rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">画像をアップロード</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
