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

  // 情報商材特化ブロック
  if (blockType === 'countdown-1') {
    // targetDateがない場合は24時間後をデフォルトに設定
    content.targetDate = aiBlock.targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    if (aiBlock.urgencyText) content.urgencyText = aiBlock.urgencyText;
    if (aiBlock.showDays !== undefined) content.showDays = aiBlock.showDays;
    if (aiBlock.showHours !== undefined) content.showHours = aiBlock.showHours;
    if (aiBlock.showMinutes !== undefined) content.showMinutes = aiBlock.showMinutes;
    if (aiBlock.showSeconds !== undefined) content.showSeconds = aiBlock.showSeconds;
  } else if (blockType === 'problem-1') {
    if (aiBlock.problems) content.problems = aiBlock.problems;
    if (aiBlock.checkIcon) content.checkIcon = aiBlock.checkIcon;
  } else if (blockType === 'special-price-1') {
    if (aiBlock.originalPrice) content.originalPrice = aiBlock.originalPrice;
    if (aiBlock.specialPrice) content.specialPrice = aiBlock.specialPrice;
    if (aiBlock.discountBadge) content.discountBadge = aiBlock.discountBadge;
    if (aiBlock.currency) content.currency = aiBlock.currency;
    if (aiBlock.period) content.period = aiBlock.period;
    if (aiBlock.features) content.features = aiBlock.features;
  } else if (blockType === 'bonus-list-1') {
    if (aiBlock.bonuses) content.bonuses = aiBlock.bonuses;
    if (aiBlock.totalValue) content.totalValue = aiBlock.totalValue;
  } else if (blockType === 'guarantee-1') {
    if (aiBlock.guaranteeType) content.guaranteeType = aiBlock.guaranteeType;
    if (aiBlock.description) content.description = aiBlock.description;
    if (aiBlock.badgeText) content.badgeText = aiBlock.badgeText;
    if (aiBlock.features) content.features = aiBlock.features;
  } else if (blockType === 'before-after-1') {
    if (aiBlock.beforeTitle) content.beforeTitle = aiBlock.beforeTitle;
    if (aiBlock.beforeText) content.beforeText = aiBlock.beforeText;
    if (aiBlock.beforeImage) content.beforeImage = aiBlock.beforeImage;
    if (aiBlock.afterTitle) content.afterTitle = aiBlock.afterTitle;
    if (aiBlock.afterText) content.afterText = aiBlock.afterText;
    if (aiBlock.afterImage) content.afterImage = aiBlock.afterImage;
    if (aiBlock.arrowIcon) content.arrowIcon = aiBlock.arrowIcon;
  } else if (blockType === 'author-profile-1') {
    if (aiBlock.name) content.name = aiBlock.name;
    if (aiBlock.imageUrl) content.imageUrl = aiBlock.imageUrl;
    if (aiBlock.bio) content.bio = aiBlock.bio;
    if (aiBlock.achievements) content.achievements = aiBlock.achievements;
    if (aiBlock.mediaLogos) content.mediaLogos = aiBlock.mediaLogos;
  } else if (blockType === 'urgency-1') {
    if (aiBlock.message) content.message = aiBlock.message;
    if (aiBlock.icon) content.icon = aiBlock.icon;
    if (aiBlock.highlightColor) content.highlightColor = aiBlock.highlightColor;
  } else if (blockType === 'scarcity-1') {
    if (aiBlock.remainingCount !== undefined) content.remainingCount = aiBlock.remainingCount;
    if (aiBlock.totalCount !== undefined) content.totalCount = aiBlock.totalCount;
    if (aiBlock.message) content.message = aiBlock.message;
    if (aiBlock.progressColor) content.progressColor = aiBlock.progressColor;
  } else if (blockType === 'sticky-cta-1') {
    if (aiBlock.subText) content.subText = aiBlock.subText;
    if (aiBlock.position) content.position = aiBlock.position;
  }
  // 既存ブロック
  else if (blockType.startsWith('pricing')) {
    if (aiBlock.plans) content.plans = aiBlock.plans;
  } else if (blockType.startsWith('testimonial')) {
    if (aiBlock.testimonials) content.testimonials = aiBlock.testimonials;
  } else if (blockType.startsWith('faq')) {
    if (aiBlock.faqs) content.faqs = aiBlock.faqs;
  } else if (blockType.startsWith('features')) {
    if (aiBlock.features) content.features = aiBlock.features;
  } else if (blockType.startsWith('form')) {
    if (aiBlock.fields) content.fields = aiBlock.fields;
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
