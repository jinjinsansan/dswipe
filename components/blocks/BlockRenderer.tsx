import React from 'react';
import TopHeroBlock from './TopHeroBlock';
import TopHighlightsBlock from './TopHighlightsBlock';
import TopCTASection from './TopCTASection';
import { getFontStack } from '@/lib/fonts';

interface BlockRendererProps {
  blockType: string;
  content: any;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  withinEditor?: boolean;
  onProductClick?: (productId?: string) => void;
}

export default function BlockRenderer({
  blockType,
  content,
  isEditing,
  onEdit,
  productId,
  withinEditor, // eslint-disable-line @typescript-eslint/no-unused-vars
  onProductClick,
}: BlockRendererProps) {
  // ブロックタイプに応じて適切なコンポーネントをレンダリング
  let element: React.ReactElement;
  switch (blockType) {
    // ヒーロー系
    case 'top-hero-1':
      element = (
        <TopHeroBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
        />
      );
      break;
    
    case 'top-highlights-1':
      element = <TopHighlightsBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-cta-1':
      element = (
        <TopCTASection
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
        />
      );
      break;
    
    default:
      element = (
        <div 
          className="px-8 text-center"
          style={{ 
            backgroundColor: content?.backgroundColor || '#F3F4F6',
            color: content?.textColor || '#6B7280',
          }}
        >
          <p style={{ color: content?.textColor || '#6B7280' }}>未対応のブロックタイプ: {blockType}</p>
          <p 
            className="text-sm mt-2"
            style={{ color: content?.textColor ? `${content.textColor}99` : '#9CA3AF' }}
          >
            サポートされているブロックを選択してください
          </p>
        </div>
      );
      break;
  }

  const fontStack = content?.fontFamily ? getFontStack(content.fontFamily) : undefined;

  if (!fontStack) {
    return element;
  }

  return (
    <div style={{ fontFamily: fontStack }}>
      {element}
    </div>
  );
}
