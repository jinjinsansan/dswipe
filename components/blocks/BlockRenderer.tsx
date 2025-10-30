import React from 'react';
import TopHeroBlock from './TopHeroBlock';
import TopHeroImageBlock from './TopHeroImageBlock';
import TopHighlightsBlock from './TopHighlightsBlock';
import TopCTASection from './TopCTASection';
import TopTestimonialsBlock from './TopTestimonialsBlock';
import TopFAQBlock from './TopFAQBlock';
import TopPricingBlock from './TopPricingBlock';
import TopBeforeAfterBlock from './TopBeforeAfterBlock';
import TopProblemBlock from './TopProblemBlock';
import TopBonusBlock from './TopBonusBlock';
import TopGuaranteeBlock from './TopGuaranteeBlock';
import TopCountdownBlock from './TopCountdownBlock';
import TopInlineCTABlock from './TopInlineCTABlock';
import TopMediaSpotlightBlock from './TopMediaSpotlightBlock';
import ContactBlock from './ContactBlock';
import TokushoBlock from './TokushoBlock';
import NewsletterBlock from './NewsletterBlock';
import HandwrittenHeroBlock from './HandwrittenHeroBlock';
import HandwrittenFeaturesBlock from './HandwrittenFeaturesBlock';
import HandwrittenFAQBlock from './HandwrittenFAQBlock';
import HandwrittenCTABlock from './HandwrittenCTABlock';
import HandwrittenTestimonialsBlock from './HandwrittenTestimonialsBlock';
import HandwrittenPricingBlock from './HandwrittenPricingBlock';
import HandwrittenProblemBlock from './HandwrittenProblemBlock';
import HandwrittenBonusBlock from './HandwrittenBonusBlock';
import HandwrittenGuaranteeBlock from './HandwrittenGuaranteeBlock';
import HandwrittenContactBlock from './HandwrittenContactBlock';
import { getFontStack } from '@/lib/fonts';

interface BlockRendererProps {
  blockType: string;
  content: any;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  withinEditor?: boolean;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

export default function BlockRenderer({
  blockType,
  content,
  isEditing,
  onEdit,
  productId,
  withinEditor, // eslint-disable-line @typescript-eslint/no-unused-vars
  onProductClick,
  ctaIds,
  onCtaClick,
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
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'top-hero-image-1':
      element = (
        <TopHeroImageBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
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
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'top-testimonials-1':
      element = <TopTestimonialsBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-faq-1':
      element = <TopFAQBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-pricing-1':
      element = (
        <TopPricingBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'top-before-after-1':
      element = <TopBeforeAfterBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-problem-1':
      element = <TopProblemBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-bonus-1':
      element = <TopBonusBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-guarantee-1':
      element = <TopGuaranteeBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-countdown-1':
      element = <TopCountdownBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-inline-cta-1':
      element = (
        <TopInlineCTABlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'top-media-spotlight-1':
      element = (
        <TopMediaSpotlightBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'top-contact-1':
      element = <ContactBlock content={content} />;
      break;
    case 'top-tokusho-1':
      element = <TokushoBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-newsletter-1':
      element = <NewsletterBlock content={content} />;
      break;
    
    // 手書き風ブロック
    case 'handwritten-hero-1':
      element = (
        <HandwrittenHeroBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'handwritten-features-1':
      element = <HandwrittenFeaturesBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'handwritten-faq-1':
      element = <HandwrittenFAQBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'handwritten-cta-1':
      element = (
        <HandwrittenCTABlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'handwritten-testimonials-1':
      element = <HandwrittenTestimonialsBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'handwritten-pricing-1':
      element = (
        <HandwrittenPricingBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          productId={productId}
          onProductClick={onProductClick}
          ctaIds={ctaIds}
          onCtaClick={onCtaClick}
        />
      );
      break;
    case 'handwritten-problem-1':
      element = <HandwrittenProblemBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'handwritten-bonus-1':
      element = <HandwrittenBonusBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'handwritten-guarantee-1':
      element = <HandwrittenGuaranteeBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'handwritten-contact-1':
      element = <HandwrittenContactBlock content={content} />;
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
