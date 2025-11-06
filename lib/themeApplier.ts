/**
 * 11段階のカラーシェードをブロックに自動的に割り当てる
 * Kigenで生成したシェードを各ブロック要素に分散させる
 */

import type { ColorShades } from './colorGenerator';

type GenericRecord = Record<string, unknown>;

export interface ThemeBlock {
  blockType?: string | null;
  content?: GenericRecord;
}

type ThemeContent = GenericRecord;

type PricingPlan = GenericRecord & { highlighted?: boolean };
type TestimonialItem = GenericRecord;
type FAQItem = GenericRecord;
type FeatureItem = GenericRecord;
type BonusItem = GenericRecord;
type ComparisonItem = GenericRecord;
type ProblemItem = GenericRecord;
type StatItem = GenericRecord;

/**
 * ブロックコンテンツにシェードを適用する
 * PropertyPanel の個別設定を保持する（微調整用）
 */
export function applyThemeShadesToBlock<T extends ThemeBlock>(
  block: T,
  shades: ColorShades
): T {
  const blockType = block.blockType ?? '';
  const normalizedBlockType = blockType.replace(/^(top|handwritten)-/, '');
  const content: ThemeContent = { ...(block.content ?? {}) };

  const baseUpdate: ThemeContent = {
    backgroundColor: shades[50],
  };

  const assignOptionalShade = (key: string, shade: keyof ColorShades) => {
    if (Object.prototype.hasOwnProperty.call(content, key)) {
      baseUpdate[key as keyof ThemeContent] = shades[shade];
    }
  };

  assignOptionalShade('textColor', 900);
  assignOptionalShade('titleColor', 900);
  assignOptionalShade('descriptionColor', 700);
  assignOptionalShade('accentColor', 600);
  assignOptionalShade('buttonColor', 500);
  assignOptionalShade('secondaryButtonColor', 200);
  assignOptionalShade('buttonTextColor', 50);
  assignOptionalShade('surfaceColor', 100);
  assignOptionalShade('cardBackgroundColor', 100);
  assignOptionalShade('borderColor', 200);
  assignOptionalShade('iconColor', 600);
  assignOptionalShade('badgeColor', 500);
  assignOptionalShade('badgeTextColor', 50);
  assignOptionalShade('overlayColor', 800);

  let updatedContent: ThemeContent = { ...content, ...baseUpdate };

  // ブロックタイプ別の詳細な色割り当て
  if (normalizedBlockType.startsWith('hero')) {
    updatedContent = applyHeroTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('pricing')) {
    updatedContent = applyPricingTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('testimonial')) {
    updatedContent = applyTestimonialTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('faq')) {
    updatedContent = applyFAQTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('features')) {
    updatedContent = applyFeaturesTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('cta')) {
    updatedContent = applyCTATheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('text-img')) {
    updatedContent = applyTextImageTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('stats')) {
    updatedContent = applyStatsTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('comparison')) {
    updatedContent = applyComparisonTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('bonus-list')) {
    updatedContent = applyBonusListTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('guarantee')) {
    updatedContent = applyGuaranteeTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('problem')) {
    updatedContent = applyProblemTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('special-price')) {
    updatedContent = applySpecialPriceTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('before-after')) {
    updatedContent = applyBeforeAfterTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('author-profile')) {
    updatedContent = applyAuthorProfileTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('scarcity')) {
    updatedContent = applyScarcityTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('urgency')) {
    updatedContent = applyUrgencyTheme(updatedContent, shades);
  } else if (normalizedBlockType.startsWith('countdown')) {
    updatedContent = applyCountdownTheme(updatedContent, shades);
  }

  return {
    ...block,
    content: updatedContent,
  } as T;
}

// ===== ブロックタイプ別テーマ適用関数 =====

function applyHeroTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyPricingTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawPlans = Array.isArray(content.plans) ? (content.plans as PricingPlan[]) : [];
  const updatedPlans = rawPlans.map((plan) => ({
    ...plan,
    backgroundColor: plan.highlighted ? shades[600] : shades[100],
    textColor: plan.highlighted ? shades[50] : shades[900],
    buttonColor: plan.highlighted ? shades[500] : shades[600],
    borderColor: shades[200],
    priceColor: shades[500],
  }));
  return {
    ...content,
    backgroundColor: shades[50],
    textColor: shades[900],
    accentColor: shades[600],
    plans: updatedPlans,
  };
}

function applyTestimonialTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawTestimonials = Array.isArray(content.testimonials)
    ? (content.testimonials as TestimonialItem[])
    : [];
  const updatedTestimonials = rawTestimonials.map((testimonial) => ({
    ...testimonial,
    nameColor: shades[900],
    textColor: shades[800],
    roleColor: shades[600],
    backgroundColor: shades[100],
    borderColor: shades[200],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    accentColor: shades[600],
    testimonials: updatedTestimonials,
  };
}

function applyFAQTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawFaqs = Array.isArray(content.faqs) ? (content.faqs as FAQItem[]) : [];
  const updatedFAQs = rawFaqs.map((faq) => ({
    ...faq,
    questionColor: shades[700],
    answerColor: shades[800],
    backgroundColor: shades[100],
    accentColor: shades[500],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    borderColor: shades[200],
    faqs: updatedFAQs,
  };
}

function applyFeaturesTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawFeatures = Array.isArray(content.features) ? (content.features as FeatureItem[]) : [];
  const updatedFeatures = rawFeatures.map((feature) => ({
    ...feature,
    titleColor: shades[900],
    descriptionColor: shades[800],
    iconColor: shades[600],
    backgroundColor: shades[100],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    taglineColor: shades[700],
    accentColor: shades[600],
    features: updatedFeatures,
  };
}

function applyCTATheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyTextImageTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    textColor: shades[800],
    accentColor: shades[600],
    borderColor: shades[200],
  };
}

function applyStatsTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawStats = Array.isArray(content.stats) ? (content.stats as StatItem[]) : [];
  const updatedStats = rawStats.map((stat) => ({
    ...stat,
    numberColor: shades[500],
    labelColor: shades[800],
    backgroundColor: shades[100],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    accentColor: shades[600],
    stats: updatedStats,
  };
}

function applyComparisonTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawRows = Array.isArray(content.rows) ? (content.rows as ComparisonItem[]) : [];
  const updatedRows = rawRows.map((row) => ({
    ...row,
    headerColor: shades[900],
    highlightedColor: shades[500],
    normalColor: shades[800],
    backgroundColor: shades[100],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    borderColor: shades[200],
    rows: updatedRows,
  };
}

function applyBonusListTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawBonuses = Array.isArray(content.bonuses) ? (content.bonuses as BonusItem[]) : [];
  const updatedBonuses = rawBonuses.map((bonus) => ({
    ...bonus,
    titleColor: shades[900],
    descriptionColor: shades[800],
    highlightColor: shades[500],
    checkmarkColor: shades[600],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    accentColor: shades[600],
    bonuses: updatedBonuses,
  };
}

function applyGuaranteeTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyProblemTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  const rawItems = Array.isArray(content.items) ? (content.items as ProblemItem[]) : [];
  const updatedItems = rawItems.map((item) => ({
    ...item,
    titleColor: shades[900],
    checkColor: shades[600],
    backgroundColor: shades[100],
  }));

  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    accentColor: shades[600],
    items: updatedItems,
  };
}

function applySpecialPriceTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyBeforeAfterTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyAuthorProfileTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyScarcityTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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

function applyUrgencyTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
  return {
    ...content,
    backgroundColor: shades[50],
    titleColor: shades[900],
    messageColor: shades[800],
    highlightColor: shades[600],
    accentColor: shades[600],
  };
}

function applyCountdownTheme(content: ThemeContent, shades: ColorShades): ThemeContent {
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
