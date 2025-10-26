/**
 * テンプレートブロックの型定義
 */

// ブロックタイプ
export type BlockType =
  | 'top-hero-1'
  | 'top-hero-image-1'
  | 'top-highlights-1'
  | 'top-cta-1'
  | 'top-testimonials-1'
  | 'top-faq-1'
  | 'top-pricing-1'
  | 'top-before-after-1'
  | 'top-problem-1'
  | 'top-bonus-1'
  | 'top-guarantee-1'
  | 'top-countdown-1'
  | 'top-inline-cta-1'
  | 'top-media-spotlight-1'
  | 'top-contact-1'
  | 'top-tokusho-1'
  | 'top-newsletter-1';

// カテゴリ
export type BlockCategory =
  | 'header'        // ヒーロー系
  | 'content'       // コンテンツ系
  | 'conversion'    // コンバージョン系
  | 'trust'         // 社会的証明・信頼
  | 'urgency';      // 緊急性訴求

export type TemplateThemeKey =
  | 'urgent_red'
  | 'energy_orange'
  | 'gold_premium'
  | 'power_blue'
  | 'passion_pink';

// 共通のブロックコンテンツ
export interface BaseBlockContent {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  accentColor?: string;
  themeKey?: TemplateThemeKey;
}

// ヒーローブロック
export interface HeroBlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  tagline?: string;
  highlightText?: string;
  buttonText: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundVideoUrl?: string;
  backgroundImageUrl?: string;
  alignment?: 'left' | 'center';
  buttonColor?: string;
  secondaryButtonColor?: string;
  overlayColor?: string;
}

// 特徴・ハイライト
export interface FeaturesBlockContent extends BaseBlockContent {
  title?: string;
  tagline?: string;
  features: {
    icon?: string;
    title: string;
    description: string;
  }[];
  layout?: 'grid' | 'list';
}

// CTA
export interface CTABlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  eyebrow?: string;
  buttonColor?: string;
  secondaryButtonColor?: string;
  surfaceColor?: string;
  backgroundGradient?: string;
}

// お客様の声
export interface TestimonialsBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  testimonials: {
    quote: string;
    name: string;
    role?: string;
    rating?: number;
  }[];
}

// FAQ
export interface FAQBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  items: {
    question: string;
    answer: string;
  }[];
}

// 価格表
export interface PricingBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  plans: {
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    buttonText: string;
    buttonUrl?: string;
    highlighted?: boolean;
  }[];
  buttonColor?: string;
}

// ビフォーアフター
export interface BeforeAfterBlockContent extends BaseBlockContent {
  title?: string;
  before: {
    label?: string;
    description: string;
  };
  after: {
    label?: string;
    description: string;
  };
}

// 問題提起
export interface ProblemBlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  problems: string[];
}

// 特典
export interface BonusListBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  bonuses: {
    title: string;
    description?: string;
    value?: string;
  }[];
  totalValue?: string;
}

// 保証
export interface GuaranteeBlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  guaranteeDetails?: string;
  bulletPoints?: string[];
  badgeText?: string;
}

// カウントダウン
export interface CountdownBlockContent extends BaseBlockContent {
  title?: string;
  targetDate: string;
  urgencyText?: string;
}

// インラインCTA
export interface InlineCTABlockContent extends BaseBlockContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl?: string;
  buttonColor?: string;
}

// メディアスポットライト
export interface MediaSpotlightBlockContent extends BaseBlockContent {
  tagline?: string;
  title: string;
  subtitle?: string;
  caption?: string;
  imageUrl?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
}

// お問い合わせブロック
export interface ContactBlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

// 特定商取引法ブロック
export interface TokushoItem {
  label: string;
  value: string;
  icon: string;
  show: boolean;
}

export interface TokushoBlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  items: TokushoItem[];
  cardBackgroundColor?: string;
  borderColor?: string;
}

// メルマガ購読ブロック
export interface NewsletterBlockContent extends BaseBlockContent {
  title?: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

// ブロックコンテンツのUnion
export type BlockContent =
  | HeroBlockContent
  | FeaturesBlockContent
  | CTABlockContent
  | TestimonialsBlockContent
  | FAQBlockContent
  | PricingBlockContent
  | BeforeAfterBlockContent
  | ProblemBlockContent
  | BonusListBlockContent
  | GuaranteeBlockContent
  | CountdownBlockContent
  | InlineCTABlockContent
  | MediaSpotlightBlockContent
  | ContactBlockContent
  | TokushoBlockContent
  | NewsletterBlockContent;

// テンプレートブロック定義
export interface TemplateBlock {
  id: string;
  templateId: BlockType;
  name: string;
  category: BlockCategory;
  description: string;
  thumbnailUrl?: string;
  defaultContent: BlockContent;
  previewImageUrl?: string;
}

export interface TemplateThemePalette {
  primary: string;
  accent: string;
  secondary?: string;
  background: string;
  surface: string;
  text: string;
}

export interface TemplateTheme {
  id: string;
  name: string;
  description?: string;
  palette: TemplateThemePalette;
  typography?: {
    display: string;
    body: string;
  };
}

export interface GeneratedBlock {
  blockType: BlockType;
  content: BlockContent;
  theme?: string;
  reason?: string;
}

export interface GeneratedTemplate {
  theme: string;
  outline: string[];
  blocks: GeneratedBlock[];
}

// LPステップ（content_data使用）
export interface LPStepWithTemplate {
  id: string;
  lp_id: string;
  step_order: number;
  image_url?: string;
  video_url?: string;
  animation_type?: string;
  content_data: {
    blockType: BlockType;
    templateId?: string;
    content: BlockContent;
  };
  step_views: number;
  step_exits: number;
  created_at: string;
}
