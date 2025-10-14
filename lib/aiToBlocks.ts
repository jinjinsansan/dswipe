import { BlockType, BlockContent } from '@/types/templates';
import { getTemplateById } from './templates';

/**
 * AIウィザードの結果をブロック構造に変換
 */
export function convertAIResultToBlocks(aiResult: any): Array<{
  id: string;
  blockType: BlockType;
  content: BlockContent;
  order: number;
}> {
  const blocks: Array<{
    id: string;
    blockType: BlockType;
    content: BlockContent;
    order: number;
  }> = [];

  if (!aiResult || !aiResult.structure) {
    return blocks;
  }

  // AIが推奨したブロックを順番に変換
  aiResult.structure.forEach((aiBlock: any, index: number) => {
    const blockType = aiBlock.block as BlockType;
    const template = getTemplateById(blockType);

    if (!template) {
      console.warn(`Unknown block type: ${blockType}`);
      return;
    }

    // テンプレートのデフォルトコンテンツをベースに、AIが生成した内容で上書き
    const content = {
      ...template.defaultContent,
      ...convertAIBlockContent(aiBlock, blockType),
    };

    // カラースキームを適用
    if (aiResult.color_scheme) {
      if ('backgroundColor' in content) {
        content.backgroundColor = aiResult.color_scheme.background || content.backgroundColor;
      }
      if ('textColor' in content) {
        content.textColor = aiResult.color_scheme.text || content.textColor;
      }
      if ('buttonColor' in content) {
        (content as any).buttonColor = aiResult.color_scheme.primary || (content as any).buttonColor;
      }
    }

    blocks.push({
      id: `ai-block-${index}-${Date.now()}`,
      blockType,
      content: content as BlockContent,
      order: index,
    });
  });

  return blocks;
}

/**
 * AIブロックのコンテンツを適切な形式に変換
 */
function convertAIBlockContent(aiBlock: any, blockType: BlockType): Partial<BlockContent> {
  const content: any = {};

  // 共通フィールド
  if (aiBlock.title) content.title = aiBlock.title;
  if (aiBlock.subtitle) content.subtitle = aiBlock.subtitle;
  if (aiBlock.text) content.text = aiBlock.text;
  if (aiBlock.buttonText) content.buttonText = aiBlock.buttonText;
  if (aiBlock.buttonUrl) content.buttonUrl = aiBlock.buttonUrl;

  // ブロックタイプ別の特殊処理
  if (blockType.startsWith('pricing')) {
    // 価格表ブロック
    if (aiBlock.plans) {
      content.plans = aiBlock.plans;
    }
  } else if (blockType.startsWith('testimonial')) {
    // お客様の声ブロック
    if (aiBlock.testimonials) {
      content.testimonials = aiBlock.testimonials;
    }
  } else if (blockType.startsWith('faq')) {
    // FAQブロック
    if (aiBlock.faqs) {
      content.faqs = aiBlock.faqs;
    }
  } else if (blockType.startsWith('features')) {
    // 特徴ブロック
    if (aiBlock.features) {
      content.features = aiBlock.features;
    }
  } else if (blockType.startsWith('form')) {
    // フォームブロック
    if (aiBlock.fields) {
      content.fields = aiBlock.fields;
    }
  }

  return content;
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
