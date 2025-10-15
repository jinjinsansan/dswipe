/**
 * テンプレートブロックの型定義
 */

// ブロックタイプ
export type BlockType = 
  | 'hero-1'       // センター配置ヒーロー
  | 'hero-2'       // 左右分割ヒーロー
  | 'hero-3'       // フルスクリーン画像 + オーバーレイテキスト
  | 'hero-aurora'  // グラデーションヒーロー
  | 'text-img-1'   // 左テキスト右画像
  | 'text-img-2'   // 右テキスト左画像
  | 'text-img-3'   // 上テキスト下画像
  | 'pricing-1'    // 3カラム価格表
  | 'pricing-2'    // 2カラム価格表（対比型）
  | 'pricing-3'    // シングルカラム価格表
  | 'testimonial-1' // カード型お客様の声
  | 'testimonial-2' // スライダー型お客様の声
  | 'testimonial-3' // グリッド型お客様の声
  | 'faq-1'        // アコーディオン型FAQ
  | 'faq-2'        // 2カラムFAQ
  | 'features-1'   // アイコン付き3カラム特徴
  | 'features-2'   // 横並び特徴リスト
  | 'features-aurora' // プレミアム特徴セクション
  | 'cta-1'        // シンプルCTA
  | 'cta-2'        // 2ボタンCTA
  | 'cta-3'        // カウントダウン付きCTA
  | 'image-1'      // フル幅画像ブロック
  | 'gallery-1'    // グリッドギャラリー
  | 'gallery-2'    // マソンリーギャラリー
  | 'video-1'      // 埋め込み動画
  | 'video-2'      // 動画 + テキスト説明
  | 'form-1'       // シンプルフォーム
  | 'form-2'       // 多項目フォーム
  | 'stats-1'      // 統計数値表示
  | 'timeline-1'   // タイムライン
  | 'team-1'       // チームメンバー紹介
  | 'logo-grid-1'  // ロゴグリッド（取引先等）
  | 'comparison-1' // 比較表
  // 情報商材特化ブロック
  | 'countdown-1'  // カウントダウンタイマー
  | 'special-price-1' // 特別価格（打ち消し線）
  | 'bonus-list-1' // ボーナス特典リスト
  | 'guarantee-1'  // 保証セクション
  | 'problem-1'    // 問題提起（チェックリスト）
  | 'before-after-1' // ビフォーアフター
  | 'author-profile-1' // 著者プロフィール
  | 'urgency-1'    // 緊急性訴求
  | 'scarcity-1'   // 限定性訴求
  | 'sticky-cta-1'; // スティッキーCTA

// カテゴリ
export type BlockCategory =
  | 'header'        // ヒーロー系
  | 'content'       // コンテンツ系
  | 'conversion'    // コンバージョン系
  | 'social-proof'  // 社会的証明
  | 'media'         // メディア系
  | 'form'         // フォーム系
  | 'image';       // 画像ブロック

// 共通のブロックコンテンツ
export interface BaseBlockContent {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
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
}

// FAQブロックコンテンツ
export interface FAQBlockContent extends BaseBlockContent {
  title?: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  layout?: 'accordion' | 'grid';
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
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

// 特別価格ブロック
export interface SpecialPriceBlockContent extends BaseBlockContent {
  title?: string;
  originalPrice: string;
  specialPrice: string;
  discountBadge?: string;
  currency?: string;
  period?: string;
  features?: string[];
  buttonText?: string;
  buttonColor?: string;
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
}

// 保証セクション
export interface GuaranteeBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  guaranteeType?: string;
  description?: string;
  badgeText?: string;
  features?: string[];
}

// 問題提起ブロック
export interface ProblemBlockContent extends BaseBlockContent {
  title?: string;
  subtitle?: string;
  problems: string[];
  checkIcon?: string;
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
}

// 著者プロフィール
export interface AuthorProfileBlockContent extends BaseBlockContent {
  name: string;
  title?: string;
  imageUrl?: string;
  bio?: string;
  achievements?: string[];
  mediaLogos?: string[];
}

// 緊急性訴求
export interface UrgencyBlockContent extends BaseBlockContent {
  title?: string;
  message: string;
  icon?: string;
  highlightColor?: string;
}

// 限定性訴求
export interface ScarcityBlockContent extends BaseBlockContent {
  title?: string;
  remainingCount?: number;
  totalCount?: number;
  message?: string;
  progressColor?: string;
}

// スティッキーCTA
export interface StickyCTABlockContent extends BaseBlockContent {
  buttonText: string;
  buttonColor?: string;
  subText?: string;
  position?: 'top' | 'bottom';
}

// ブロックコンテンツの型（Union型）
export type BlockContent =
  | HeroBlockContent
  | TextImageBlockContent
  | PricingBlockContent
  | TestimonialBlockContent
  | FAQBlockContent
  | FeaturesBlockContent
  | CTABlockContent
  | ImageBlockContent
  | GalleryBlockContent
  | VideoBlockContent
  | FormBlockContent
  | StatsBlockContent
  | TimelineBlockContent
  | TeamBlockContent
  | LogoGridBlockContent
  | ComparisonBlockContent
  | CountdownBlockContent
  | SpecialPriceBlockContent
  | BonusListBlockContent
  | GuaranteeBlockContent
  | ProblemBlockContent
  | BeforeAfterBlockContent
  | AuthorProfileBlockContent
  | UrgencyBlockContent
  | ScarcityBlockContent
  | StickyCTABlockContent;

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
