import type { BlockType } from '@/types/templates';

export const PRODUCT_CTA_BLOCKS: BlockType[] = [
  'top-hero-1',
  'top-hero-image-1',
  'top-cta-1',
  'top-inline-cta-1',
  'top-media-spotlight-1',
  'top-pricing-1',
];

export const PRODUCT_CTA_BLOCK_SET = new Set<BlockType>(PRODUCT_CTA_BLOCKS);

export const isProductCtaBlock = (blockType?: string | null): blockType is BlockType => {
  if (!blockType) return false;
  return PRODUCT_CTA_BLOCK_SET.has(blockType as BlockType);
};
