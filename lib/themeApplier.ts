/**
 * 11段階のカラーシェードをブロックに自動的に割り当てる
 * Kigenで生成したシェードを各ブロック要素に分散させる
 */

import type { BlockContent } from '@/types/templates';
import type { ColorShades } from './colorGenerator';

/**
 * ブロックコンテンツにシェードを適用する
 * PropertyPanel の個別設定を保持する（微調整用）
 */
export function applyThemeShadesToBlock(
  block: any,
  shades: ColorShades
): any {
  const blockType = block.blockType || '';
  const content = block.content || {};

  // PropertyPanel で設定された個別カラーを保存（微調整用として保持）
  const individualColors = {
    titleColor: content.titleColor,
    descriptionColor: content.descriptionColor,
    iconColor: content.iconColor,
  };

  // 基本的なカラー割り当て（個別設定がなければテーマから）
  const baseUpdate = {
    backgroundColor: content.backgroundColor || shades[50],
    textColor: content.textColor || shades[800],
    accentColor: content.accentColor || shades[600],
    buttonColor: content.buttonColor || shades[500],
  };

  let updatedContent = { ...content, ...baseUpdate };

  // ブロックタイプ別の詳細な色割り当て
  if (blockType.startsWith('hero')) {
    updatedContent = applyHeroTheme(updatedContent, shades);
  } else if (blockType.startsWith('pricing')) {
    updatedContent = applyPricingTheme(updatedContent, shades);
  } else if (blockType.startsWith('testimonial')) {
    updatedContent = applyTestimonialTheme(updatedContent, shades);
  } else if (blockType.startsWith('faq')) {
    updatedContent = applyFAQTheme(updatedContent, shades);
  } else if (blockType.startsWith('features')) {
    updatedContent = applyFeaturesTheme(updatedContent, shades);
  } else if (blockType.startsWith('cta')) {
    updatedContent = applyCTATheme(updatedContent, shades);
  } else if (blockType.startsWith('text-img')) {
    updatedContent = applyTextImageTheme(updatedContent, shades);
  } else if (blockType.startsWith('stats')) {
    updatedContent = applyStatsTheme(updatedContent, shades);
  } else if (blockType.startsWith('comparison')) {
    updatedContent = applyComparisonTheme(updatedContent, shades);
  } else if (blockType.startsWith('bonus-list')) {
    updatedContent = applyBonusListTheme(updatedContent, shades);
  } else if (blockType.startsWith('guarantee')) {
    updatedContent = applyGuaranteeTheme(updatedContent, shades);
  } else if (blockType.startsWith('problem')) {
    updatedContent = applyProblemTheme(updatedContent, shades);
  } else if (blockType.startsWith('special-price')) {
    updatedContent = applySpecialPriceTheme(updatedContent, shades);
  } else if (blockType.startsWith('before-after')) {
    updatedContent = applyBeforeAfterTheme(updatedContent, shades);
  } else if (blockType.startsWith('author-profile')) {
    updatedContent = applyAuthorProfileTheme(updatedContent, shades);
  } else if (blockType.startsWith('scarcity')) {
    updatedContent = applyScarcityTheme(updatedContent, shades);
  } else if (blockType.startsWith('urgency')) {
    updatedContent = applyUrgencyTheme(updatedContent, shades);
  } else if (blockType.startsWith('countdown')) {
    updatedContent = applyCountdownTheme(updatedContent, shades);
  }

  // PropertyPanel の個別設定を優先（微調整として上書き）
  if (individualColors.titleColor) {
    updatedContent.titleColor = individualColors.titleColor;
  }
  if (individualColors.descriptionColor) {
    updatedContent.descriptionColor = individualColors.descriptionColor;
  }
  if (individualColors.iconColor) {
    updatedContent.iconColor = individualColors.iconColor;
  }

  return {
    ...block,
    content: updatedContent,
  };
}

// ===== ブロックタイプ別テーマ適用関数 =====

function applyHeroTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    textColor: shades[900],
    buttonColor: shades[500],
    accentColor: shades[600],
    // 見出しは最も濃い色
    taglineColor: shades[700],
  };
}

function applyPricingTheme(content: any, shades: ColorShades): any {
  const updatedPlans = content.plans?.map((plan: any) => ({
    ...plan,
    backgroundColor: plan.highlighted ? shades[600] : shades[100],
    textColor: plan.highlighted ? shades[50] : shades[900],
    buttonColor: plan.highlighted ? shades[500] : shades[600],
    borderColor: shades[200],
    priceColor: shades[500],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    textColor: shades[900],
    accentColor: shades[600],
    plans: updatedPlans,
  };
}

function applyTestimonialTheme(content: any, shades: ColorShades): any {
  const updatedTestimonials = content.testimonials?.map((testimonial: any) => ({
    ...testimonial,
    nameColor: shades[900],
    textColor: shades[800],
    roleColor: shades[600],
    backgroundColor: shades[100],
    borderColor: shades[200],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    accentColor: shades[600],
    testimonials: updatedTestimonials,
  };
}

function applyFAQTheme(content: any, shades: ColorShades): any {
  const updatedFAQs = content.faqs?.map((faq: any) => ({
    ...faq,
    questionColor: shades[700],
    answerColor: shades[800],
    backgroundColor: shades[100],
    accentColor: shades[500],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    borderColor: shades[200],
    faqs: updatedFAQs,
  };
}

function applyFeaturesTheme(content: any, shades: ColorShades): any {
  const updatedFeatures = content.features?.map((feature: any) => ({
    ...feature,
    titleColor: shades[900],
    descriptionColor: shades[800],
    iconColor: shades[600],
    backgroundColor: shades[100],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    taglineColor: shades[700],
    accentColor: shades[600],
    features: updatedFeatures,
  };
}

function applyCTATheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    subtitleColor: shades[800],
    buttonColor: shades[500],
    buttonTextColor: shades[50],
    accentColor: shades[600],
    borderColor: shades[200],
  };
}

function applyTextImageTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    textColor: shades[800],
    accentColor: shades[600],
    borderColor: shades[200],
  };
}

function applyStatsTheme(content: any, shades: ColorShades): any {
  const updatedStats = content.stats?.map((stat: any) => ({
    ...stat,
    numberColor: shades[500],
    labelColor: shades[800],
    backgroundColor: shades[100],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    accentColor: shades[600],
    stats: updatedStats,
  };
}

function applyComparisonTheme(content: any, shades: ColorShades): any {
  const updatedRows = content.rows?.map((row: any) => ({
    ...row,
    headerColor: shades[900],
    highlightedColor: shades[500],
    normalColor: shades[800],
    backgroundColor: shades[100],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    borderColor: shades[200],
    rows: updatedRows,
  };
}

function applyBonusListTheme(content: any, shades: ColorShades): any {
  const updatedBonuses = content.bonuses?.map((bonus: any) => ({
    ...bonus,
    titleColor: shades[900],
    descriptionColor: shades[800],
    highlightColor: shades[500],
    checkmarkColor: shades[600],
    backgroundColor: shades[100],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    accentColor: shades[600],
    bonuses: updatedBonuses,
  };
}

function applyGuaranteeTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[100],
    titleColor: shades[900],
    descriptionColor: shades[800],
    badgeColor: shades[500],
    accentColor: shades[600],
    borderColor: shades[600],
  };
}

function applyProblemTheme(content: any, shades: ColorShades): any {
  const updatedItems = content.items?.map((item: any) => ({
    ...item,
    titleColor: shades[900],
    checkColor: shades[600],
    backgroundColor: shades[100],
  })) || [];

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    accentColor: shades[600],
    items: updatedItems,
  };
}

function applySpecialPriceTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[950],
    titleColor: shades[50],
    priceColor: shades[400],
    originalPriceColor: shades[500],
    badgeColor: shades[500],
    badgeTextColor: shades[50],
    accentColor: shades[600],
  };
}

function applyBeforeAfterTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    beforeBgColor: shades[900],
    beforeTitleColor: shades[500],
    beforeTextColor: shades[200],
    beforeCheckColor: shades[500],
    afterBgColor: shades[600],
    afterTitleColor: shades[400],
    afterTextColor: shades[100],
    afterCheckColor: shades[300],
    highlightColor: shades[400],
  };
}

function applyAuthorProfileTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[950],
    nameColor: shades[400],
    titleColor: shades[500],
    bioColor: shades[200],
    achievementColor: shades[400],
    borderColor: shades[400],
    accentColor: shades[500],
  };
}

function applyScarcityTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    numberColor: shades[400],
    messageColor: shades[800],
    progressColor: shades[500],
    accentColor: shades[600],
  };
}

function applyUrgencyTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    messageColor: shades[800],
    highlightColor: shades[600],
    accentColor: shades[600],
  };
}

function applyCountdownTheme(content: any, shades: ColorShades): any {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    urgencyTextColor: shades[700],
    timerColor: shades[500],
    labelColor: shades[800],
    accentColor: shades[600],
  };
}
