/**
 * テンプレートブロックの型定義
 */

// ブロックタイプ
export type BlockType = 
  | 'top-hero-1'
  | 'top-highlights-1'
  | 'top-cta-1';

// カテゴリ
export type BlockCategory =
  | 'header'        // ヒーロー系
  | 'content'       // コンテンツ系
  | 'conversion';

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
}

// ヒーローブロックコンテンツ
export interface HeroBlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
  alignment?: 'left' | 'center' | 'right';
  tagline?: string;
  highlightText?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  stats?: {
    label: string;
    value: string;
  }[];
  themeKey?: TemplateThemeKey;
  backgroundVideoUrl?: string;
}

// テキスト+画像ブロックコンテンツ
export interface TextImageBlockContent extends BaseBlockContent {
  title: string;
  text: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
  imageWidth?: string;
}

// 価格表ブロックコンテンツ
export interface PricingBlockContent extends BaseBlockContent {
  plans: {
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    buttonText?: string;
    buttonUrl?: string;
    highlighted?: boolean;
  }[];
  columns?: 2 | 3;
  titleColor?: string;
  descriptionColor?: string;
  fontFamily?: string;
  themeKey?: TemplateThemeKey;
}

// お客様の声ブロックコンテンツ
export interface TestimonialBlockContent extends BaseBlockContent {
  testimonials: {
    name: string;
    role?: string;
    text: string;
    imageUrl?: string;
    rating?: number;
    company?: string;
  }[];
  layout?: 'card' | 'slider' | 'grid';
  titleColor?: string;
  descriptionColor?: string;
  fontFamily?: string;
  themeKey?: TemplateThemeKey;
}

// FAQブロックコンテンツ
export interface FAQBlockContent extends BaseBlockContent {
  title?: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  layout?: 'accordion' | 'grid';
  titleColor?: string;
  descriptionColor?: string;
  themeKey?: TemplateThemeKey;
}

// 特徴ブロックコンテンツ
export interface FeaturesBlockContent extends BaseBlockContent {
  title?: string;
  tagline?: string;
  highlightText?: string;
  features: {
    icon?: string;
    title: string;
    description: string;
  }[];
  columns?: 2 | 3 | 4;
  titleColor?: string;
  descriptionColor?: string;
  iconColor?: string;
  themeKey?: TemplateThemeKey;
}

// CTAブロックコンテンツ
export interface CTABlockContent extends BaseBlockContent {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl?: string;
  buttonColor?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  countdown?: {
    endDate: string;
  };
  themeKey?: TemplateThemeKey;
}

// ギャラリーブロックコンテンツ
export interface GalleryBlockContent extends BaseBlockContent {
  images: {
    url: string;
    alt?: string;
    caption?: string;
  }[];
  layout?: 'grid' | 'masonry';
  columns?: 2 | 3 | 4;
}

// 動画ブロックコンテンツ
export interface VideoBlockContent extends BaseBlockContent {
  videoUrl: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  autoplay?: boolean;
}

// フォームブロックコンテンツ
export interface FormBlockContent extends BaseBlockContent {
  title?: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
    placeholder?: string;
    required?: boolean;
    options?: string[]; // selectの場合
  }[];
  submitButtonText?: string;
  submitUrl?: string;
  buttonColor?: string;
  accentColor?: string;
}

// 画像ブロックコンテンツ
export interface ImageBlockContent extends BaseBlockContent {
  imageUrl?: string;
  caption?: string;
  borderRadius?: string;
  shadow?: boolean;
  maxWidth?: string;
}

// 統計ブロックコンテンツ
export interface StatsBlockContent extends BaseBlockContent {
  stats: {
    value: string;
    label: string;
    icon?: string;
  }[];
  columns?: 2 | 3 | 4;
}

// タイムラインブロックコンテンツ
export interface TimelineBlockContent extends BaseBlockContent {
  title?: string;
  items: {
    date: string;
    title: string;
    description: string;
  }[];
}

// チームブロックコンテンツ
export interface TeamBlockContent extends BaseBlockContent {
  title?: string;
  members: {
    name: string;
    role: string;
    imageUrl?: string;
    bio?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  }[];
  columns?: 2 | 3 | 4;
}

// ロゴグリッドブロックコンテンツ
export interface LogoGridBlockContent extends BaseBlockContent {
  title?: string;
  logos: {
    url: string;
    alt: string;
    link?: string;
  }[];
  columns?: 3 | 4 | 5 | 6;
}

// 比較表ブロックコンテンツ
export interface ComparisonBlockContent extends BaseBlockContent {
  title?: string;
  products: {
    name: string;
    features: {
      [key: string]: boolean | string;
    };
  }[];
}

// 情報商材特化ブロックコンテンツ
// カウントダウンタイマー
export interface CountdownBlockContent extends BaseBlockContent {
  title?: string;
  targetDate: string; // ISO日時
  urgencyText?: string;
  showDays?: boolean;
  themeKey?: TemplateThemeKey;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

// 特別価格ブロック
export interface SpecialPriceBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  originalPrice: string;
  specialPrice: string;
  discountBadge?: string;
  currency?: string;
  period?: string;
  features?: string[];
  buttonText?: string;
  buttonColor?: string;
  titleColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  priceColor?: string;
  originalPriceColor?: string;
  themeKey?: TemplateThemeKey;
}

// ボーナス特典リスト
export interface BonusListBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  bonuses: {
    title: string;
    value?: string;
    description?: string;
    icon?: string;
  }[];
  totalValue?: string;
  titleColor?: string;
  descriptionColor?: string;
  themeKey?: TemplateThemeKey;
}

// 保証セクション
export interface GuaranteeBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  guaranteeType?: string;
  description?: string;
  badgeText?: string;
  features?: string[];
  titleColor?: string;
  descriptionColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  themeKey?: TemplateThemeKey;
}

// 問題提起ブロック
export interface ProblemBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  problems: string[];
  checkIcon?: string;
  titleColor?: string;
  descriptionColor?: string;
  themeKey?: TemplateThemeKey;
}

// ビフォーアフター
export interface BeforeAfterBlockContent extends BaseBlockContent {
  title?: string;
  beforeTitle?: string;
  beforeText?: string;
  beforeImage?: string;
  afterTitle?: string;
  afterText?: string;
  afterImage?: string;
  arrowIcon?: string;
  titleColor?: string;
  descriptionColor?: string;
  beforeBgColor?: string;
  beforeTitleColor?: string;
  beforeTextColor?: string;
  beforeCheckColor?: string;
  afterBgColor?: string;
  afterTitleColor?: string;
  afterTextColor?: string;
  afterCheckColor?: string;
  highlightColor?: string;
  themeKey?: TemplateThemeKey;
}

// 著者プロフィール
export interface AuthorProfileBlockContent extends BaseBlockContent {
  name: string;
  title?: string;
  imageUrl?: string;
  bio?: string;
  achievements?: string[];
  mediaLogos?: string[];
  titleColor?: string;
  descriptionColor?: string;
  nameColor?: string;
  borderColor?: string;
  accentColor?: string;
  themeKey?: TemplateThemeKey;
}

// 緊急性訴求
export interface UrgencyBlockContent extends BaseBlockContent {
  title?: string;
  message: string;
  icon?: string;
  highlightColor?: string;
  titleColor?: string;
  descriptionColor?: string;
}

// 限定性訴求
export interface ScarcityBlockContent extends BaseBlockContent {
  title?: string;
  remainingCount?: number;
  totalCount?: number;
  message?: string;
  progressColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  numberColor?: string;
  accentColor?: string;
  themeKey?: TemplateThemeKey;
}

// インラインCTA
export interface InlineCTABlockContent extends BaseBlockContent {
  subText?: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl?: string;
  buttonColor?: string;
  descriptionColor?: string;
  themeKey?: TemplateThemeKey;
}

// ブロックコンテンツの型（Union型）
export type BlockContent =
  | HeroBlockContent
  | FeaturesBlockContent
  | CTABlockContent;

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
  image_url?: string; // 旧形式との互換性
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
