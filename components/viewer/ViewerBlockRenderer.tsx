'use client';

import type { ReactElement } from 'react';
import BlockRenderer from '@/components/blocks/BlockRenderer';

interface ViewerBlockRendererProps {
  blockType: string;
  content: Record<string, unknown> | undefined;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

export default function ViewerBlockRenderer({
  blockType,
  content,
  productId,
  onProductClick,
}: ViewerBlockRendererProps): ReactElement | null {
  if (!content) {
    return null;
  }

  return (
    <BlockRenderer
      blockType={blockType}
      content={content}
      isEditing={false}
      productId={productId}
      withinEditor={false}
      onProductClick={onProductClick}
    />
  );
}
