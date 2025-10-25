import type { AIGenerationResponse } from '@/types/api';
import { BlockType, BlockContent } from '@/types/templates';
import { getTemplateById, ColorThemeKey } from './templates';

/**
 * AIウィザードの結果をブロック構造に変換
 */
export function convertAIResultToBlocks(aiResult: AIGenerationResponse | null): Array<{
  id: string;
  blockType: BlockType;
  content: BlockContent;
  order: number;
}> {
  console.log('AI Result:', aiResult);
  
  const blocks: Array<{
    id: string;
    blockType: BlockType;
    content: BlockContent;
    order: number;
  }> = [];

  if (!aiResult || !Array.isArray(aiResult.blocks)) {
    console.error('❌ AI Result missing blocks:', aiResult);
    return blocks;
  }

    console.log('AI Blocks:', aiResult.blocks);

  const palette = aiResult.palette;

  aiResult.blocks.forEach((aiBlock, index) => {
    const blockType = aiBlock.blockType as BlockType;
    console.log(`Processing block ${index}:`, blockType, aiBlock);

    const template = getTemplateById(blockType);

    if (!template) {
      console.warn(`Skipping unknown block type: ${blockType}`);
      console.log('Available block types:', [
        'top-hero-1',
        'top-highlights-1',
        'top-cta-1',
        'top-testimonials-1',
        'top-faq-1',
        'top-pricing-1',
        'top-before-after-1',
        'top-problem-1',
        'top-bonus-1',
        'top-guarantee-1',
        'top-countdown-1',
        'top-inline-cta-1',
      ]);
      return; // スキップして次のブロックへ
    }
    
    console.log(`Found template for ${blockType}:`, template.name);

    const defaultContent = structuredClone(template.defaultContent) as unknown as Record<string, unknown>;
    const overrides = (aiBlock.content ?? {}) as unknown as Record<string, unknown>;
    const content: Record<string, unknown> = {
      ...defaultContent,
      ...overrides,
    };

    if (palette) {
      if ('backgroundColor' in content || 'backgroundColor' in defaultContent) {
        content.backgroundColor = palette.background;
      }
      if ('textColor' in content || 'textColor' in defaultContent) {
        content.textColor = palette.text;
      }
      if ('buttonColor' in content) {
        content.buttonColor = palette.primary;
      }
      if ('accentColor' in content || 'accentColor' in defaultContent) {
        content.accentColor = palette.accent;
      }
    }

    if ('themeKey' in defaultContent || 'themeKey' in content) {
      const themeKey = (aiResult.theme as ColorThemeKey | undefined) ?? (content.themeKey as ColorThemeKey | undefined);
      if (themeKey) {
        content.themeKey = themeKey;
      }
    }

    const newBlock = {
      id: `ai-block-${index}-${Date.now()}`,
      blockType,
      content: content as unknown as BlockContent,
      order: index,
    };
    
    console.log(`Created block ${index}:`, newBlock);
    blocks.push(newBlock);
  });

  console.log(`Total blocks created: ${blocks.length}`, blocks);
  return blocks;
}

/**
 * ブロックコンテキストからAI生成用のコンテキストを作成
 */
export function createAIContext(lpData?: any, blockContent?: any): any {
  const context: any = {};

  if (lpData) {
    context.product = lpData.title;
  }

  if (blockContent) {
    if (blockContent.title) {
      context.headline = blockContent.title;
    }
    if (blockContent.features) {
      context.features = blockContent.features.map((f: any) => 
        typeof f === 'string' ? f : f.title || f.description
      );
    }
  }

  return context;
}
