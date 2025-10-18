import React from 'react';
import HeroBlock from './HeroBlock';
import TextImageBlock from './TextImageBlock';
import CTABlock from './CTABlock';
import PricingBlock from './PricingBlock';
import FAQBlock from './FAQBlock';
import TestimonialBlock from './TestimonialBlock';
import FeaturesBlock from './FeaturesBlock';
import FeatureAuroraBlock from './FeatureAuroraBlock';
import FormBlock from './FormBlock';
import CountdownBlock from './CountdownBlock';
import SpecialPriceBlock from './SpecialPriceBlock';
import BonusListBlock from './BonusListBlock';
import GuaranteeBlock from './GuaranteeBlock';
import ProblemBlock from './ProblemBlock';
import BeforeAfterBlock from './BeforeAfterBlock';
import AuthorProfileBlock from './AuthorProfileBlock';
import UrgencyBlock from './UrgencyBlock';
import ScarcityBlock from './ScarcityBlock';
import StickyCTABlock from './StickyCTABlock';
import ImageBlock from './ImageBlock';
import HeroAuroraBlock from './HeroAuroraBlock';
import { getFontStack } from '@/lib/fonts';

interface BlockRendererProps {
  blockType: string;
  content: any;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  fullWidth?: boolean;
  withinEditor?: boolean;
  onProductClick?: (productId?: string) => void;
}

export default function BlockRenderer({
  blockType,
  content,
  isEditing,
  onEdit,
  productId,
  fullWidth,
  withinEditor,
  onProductClick,
}: BlockRendererProps) {
  // ブロックタイプに応じて適切なコンポーネントをレンダリング
  let element: React.ReactElement;
  switch (blockType) {
    // ヒーロー系
    case 'hero':
    case 'hero-1':
    case 'hero-2':
    case 'hero-3':
      element = (
        <HeroBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
        />
      );
      break;
    case 'hero-aurora':
      element = (
        <HeroAuroraBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
        />
      );
      break;
    
    // テキスト+画像系
    case 'text-image':
    case 'text-img-1':
    case 'text-img-2':
    case 'text-img-3':
      element = <TextImageBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    
    // 価格表系
    case 'pricing':
    case 'pricing-1':
    case 'pricing-2':
    case 'pricing-3':
      element = <PricingBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    
    // お客様の声系
    case 'testimonial':
    case 'testimonial-1':
    case 'testimonial-2':
    case 'testimonial-3':
      element = <TestimonialBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    
    // FAQ系
    case 'faq':
    case 'faq-1':
    case 'faq-2':
      element = <FAQBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    
    // 特徴系
    case 'features':
    case 'features-1':
    case 'features-2':
      element = <FeaturesBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'features-aurora':
      element = <FeatureAuroraBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    
    // フォーム系
    case 'form':
    case 'form-1':
    case 'form-2':
      element = <FormBlock content={content} isEditing={isEditing} onEdit={onEdit} productId={productId} />;
      break;
    
    // CTA系
    case 'cta':
    case 'cta-1':
    case 'cta-2':
    case 'cta-3':
      element = (
        <CTABlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          fullWidth={fullWidth}
          onProductClick={onProductClick}
        />
      );
      break;

    case 'image-1':
      element = <ImageBlock content={content} isEditing={isEditing} />;
      break;
    
    // 情報商材特化ブロック
    case 'countdown-1':
      element = <CountdownBlock content={content} />;
      break;
    
    case 'special-price-1':
      element = <SpecialPriceBlock content={content} />;
      break;
    
    case 'bonus-list-1':
      element = <BonusListBlock content={content} />;
      break;
    
    case 'guarantee-1':
      element = <GuaranteeBlock content={content} />;
      break;
    
    case 'problem-1':
      element = <ProblemBlock content={content} />;
      break;
    
    case 'before-after-1':
      element = <BeforeAfterBlock content={content} />;
      break;
    
    case 'author-profile-1':
      element = <AuthorProfileBlock content={content} />;
      break;
    
    case 'urgency-1':
      element = <UrgencyBlock content={content} />;
      break;
    
    case 'scarcity-1':
      element = <ScarcityBlock content={content} />;
      break;
    
    case 'sticky-cta-1':
      element = (
        <StickyCTABlock
          content={content}
          withinEditor={withinEditor}
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
