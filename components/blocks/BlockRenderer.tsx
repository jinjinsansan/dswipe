"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { getFontStack } from '@/lib/fonts';

const TopHeroBlock = dynamic(() => import('./TopHeroBlock'), {
  ssr: false,
  loading: () => null,
});
const TopHeroImageBlock = dynamic(() => import('./TopHeroImageBlock'), {
  ssr: false,
  loading: () => null,
});
const ImageOnlyBlock = dynamic(() => import('./ImageOnlyBlock'), {
  ssr: false,
  loading: () => null,
});
const TopHighlightsBlock = dynamic(() => import('./TopHighlightsBlock'), {
  ssr: false,
  loading: () => null,
});
const TopCTASection = dynamic(() => import('./TopCTASection'), {
  ssr: false,
  loading: () => null,
});
const TopTestimonialsBlock = dynamic(() => import('./TopTestimonialsBlock'), {
  ssr: false,
  loading: () => null,
});
const TopFAQBlock = dynamic(() => import('./TopFAQBlock'), {
  ssr: false,
  loading: () => null,
});
const TopPricingBlock = dynamic(() => import('./TopPricingBlock'), {
  ssr: false,
  loading: () => null,
});
const TopBeforeAfterBlock = dynamic(() => import('./TopBeforeAfterBlock'), {
  ssr: false,
  loading: () => null,
});
const TopProblemBlock = dynamic(() => import('./TopProblemBlock'), {
  ssr: false,
  loading: () => null,
});
const TopBonusBlock = dynamic(() => import('./TopBonusBlock'), {
  ssr: false,
  loading: () => null,
});
const TopGuaranteeBlock = dynamic(() => import('./TopGuaranteeBlock'), {
  ssr: false,
  loading: () => null,
});
const TopCountdownBlock = dynamic(() => import('./TopCountdownBlock'), {
  ssr: false,
  loading: () => null,
});
const TopInlineCTABlock = dynamic(() => import('./TopInlineCTABlock'), {
  ssr: false,
  loading: () => null,
});
const TopFlexibleBlock = dynamic(() => import('./TopFlexibleBlock'), {
  ssr: false,
  loading: () => null,
});
const TopMediaSpotlightBlock = dynamic(() => import('./TopMediaSpotlightBlock'), {
  ssr: false,
  loading: () => null,
});
const ContactBlock = dynamic(() => import('./ContactBlock'), {
  ssr: false,
  loading: () => null,
});
const TokushoBlock = dynamic(() => import('./TokushoBlock'), {
  ssr: false,
  loading: () => null,
});
const NewsletterBlock = dynamic(() => import('./NewsletterBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenHeroBlock = dynamic(() => import('./HandwrittenHeroBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenFeaturesBlock = dynamic(() => import('./HandwrittenFeaturesBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenFAQBlock = dynamic(() => import('./HandwrittenFAQBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenCTABlock = dynamic(() => import('./HandwrittenCTABlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenTestimonialsBlock = dynamic(() => import('./HandwrittenTestimonialsBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenPricingBlock = dynamic(() => import('./HandwrittenPricingBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenProblemBlock = dynamic(() => import('./HandwrittenProblemBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenBonusBlock = dynamic(() => import('./HandwrittenBonusBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenGuaranteeBlock = dynamic(() => import('./HandwrittenGuaranteeBlock'), {
  ssr: false,
  loading: () => null,
});
const HandwrittenContactBlock = dynamic(() => import('./HandwrittenContactBlock'), {
  ssr: false,
  loading: () => null,
});

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
  onRequestFieldFocus?: (field: string) => void;
  primaryLinkLock?: {
    type: 'product' | 'salon';
    label: string;
  };
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
  onRequestFieldFocus,
  primaryLinkLock,
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
          onFieldFocus={onRequestFieldFocus}
          withinEditor={withinEditor}
          primaryLinkLock={primaryLinkLock}
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
          withinEditor={withinEditor}
          primaryLinkLock={primaryLinkLock}
        />
      );
      break;
    case 'top-image-plain-1':
      element = (
        <ImageOnlyBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
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
          withinEditor={withinEditor}
          primaryLinkLock={primaryLinkLock}
        />
      );
      break;
    case 'top-testimonials-1':
      element = <TopTestimonialsBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
      break;
    case 'top-faq-1':
      element = (
        <TopFAQBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          onFieldFocus={onRequestFieldFocus}
        />
      );
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
          withinEditor={withinEditor}
          primaryLinkLock={primaryLinkLock}
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
      element = (
        <TopGuaranteeBlock
          content={content}
          isEditing={isEditing}
          onEdit={onEdit}
          onFieldFocus={onRequestFieldFocus}
        />
      );
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
          withinEditor={withinEditor}
          primaryLinkLock={primaryLinkLock}
          onFieldFocus={onRequestFieldFocus}
        />
      );
      break;
    case 'top-flex-1':
      element = <TopFlexibleBlock content={content} isEditing={isEditing} onEdit={onEdit} />;
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
          withinEditor={withinEditor}
          primaryLinkLock={primaryLinkLock}
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
