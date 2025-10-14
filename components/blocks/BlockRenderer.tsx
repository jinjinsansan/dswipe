import React from 'react';
import HeroBlock from './HeroBlock';
import TextImageBlock from './TextImageBlock';
import CTABlock from './CTABlock';
import PricingBlock from './PricingBlock';
import FAQBlock from './FAQBlock';
import TestimonialBlock from './TestimonialBlock';
import FeaturesBlock from './FeaturesBlock';
import FormBlock from './FormBlock';
import CountdownBlock from './CountdownBlock';
import SpecialPriceBlock from './SpecialPriceBlock';
import BonusListBlock from './BonusListBlock';
import GuaranteeBlock from './GuaranteeBlock';

interface BlockRendererProps {
  blockType: string;
  content: any;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function BlockRenderer({ blockType, content, isEditing, onEdit }: BlockRendererProps) {
  // ブロックタイプに応じて適切なコンポーネントをレンダリング
  switch (blockType) {
    // ヒーロー系
    case 'hero':
    case 'hero-1':
    case 'hero-2':
    case 'hero-3':
      return <HeroBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // テキスト+画像系
    case 'text-image':
    case 'text-img-1':
    case 'text-img-2':
    case 'text-img-3':
      return <TextImageBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // 価格表系
    case 'pricing':
    case 'pricing-1':
    case 'pricing-2':
    case 'pricing-3':
      return <PricingBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // お客様の声系
    case 'testimonial':
    case 'testimonial-1':
    case 'testimonial-2':
    case 'testimonial-3':
      return <TestimonialBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // FAQ系
    case 'faq':
    case 'faq-1':
    case 'faq-2':
      return <FAQBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // 特徴系
    case 'features':
    case 'features-1':
    case 'features-2':
      return <FeaturesBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // フォーム系
    case 'form':
    case 'form-1':
    case 'form-2':
      return <FormBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // CTA系
    case 'cta':
    case 'cta-1':
    case 'cta-2':
    case 'cta-3':
      return <CTABlock content={content} isEditing={isEditing} onEdit={onEdit} />;
    
    // 情報商材特化ブロック
    case 'countdown-1':
      return <CountdownBlock content={content} />;
    
    case 'special-price-1':
      return <SpecialPriceBlock content={content} />;
    
    case 'bonus-list-1':
      return <BonusListBlock content={content} />;
    
    case 'guarantee-1':
      return <GuaranteeBlock content={content} />;
    
    default:
      return (
        <div className="py-16 px-8 bg-gray-100 text-center">
          <p className="text-gray-500">未対応のブロックタイプ: {blockType}</p>
          <p className="text-sm text-gray-400 mt-2">サポートされているブロックを選択してください</p>
        </div>
      );
  }
}
