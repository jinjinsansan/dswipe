import {
  TemplateBlock,
  HeroBlockContent,
  FeaturesBlockContent,
  CTABlockContent,
  TemplateThemeKey,
} from '@/types/templates';

export type ColorThemeKey = TemplateThemeKey;

interface ThemeDefinition {
  primary: string;
  secondary?: string;
  accent: string;
  background: string;
  text: string;
  name: string;
  description: string;
}

export const COLOR_THEMES: Record<ColorThemeKey, ThemeDefinition> = {
  power_blue: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#60A5FA',
    background: '#111827',
    text: '#FFFFFF',
    name: 'パワーブルー',
    description: '学習・資格取得に最適',
  },
  urgent_red: {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#F59E0B',
    background: '#111827',
    text: '#FFFFFF',
    name: '緊急レッド',
    description: '投資・FX・副業に最適',
  },
  energy_orange: {
    primary: '#EA580C',
    secondary: '#F59E0B',
    accent: '#FBBF24',
    background: '#1F2937',
    text: '#FFFFFF',
    name: 'エネルギーオレンジ',
    description: 'ダイエット・筋トレに最適',
  },
  gold_premium: {
    primary: '#B45309',
    secondary: '#F59E0B',
    accent: '#FCD34D',
    background: '#0F172A',
    text: '#FFFFFF',
    name: 'ゴールドプレミアム',
    description: '高額商品・コンサルに最適',
  },
  passion_pink: {
    primary: '#BE185D',
    secondary: '#EC4899',
    accent: '#F472B6',
    background: '#1F2937',
    text: '#FFFFFF',
    name: 'パッションピンク',
    description: '恋愛・美容に最適',
  },
};

export const TEMPLATE_LIBRARY: TemplateBlock[] = [
  {
    id: 'top-hero-landing',
    templateId: 'top-hero-1',
    name: 'TOPスタイルヒーロー',
    category: 'header',
    description: 'TOPページのヒーローセクションを再現した軽量テンプレート',
    defaultContent: {
      title: '情報には鮮度がある。',
      subtitle: 'スワイプ型LP作成プラットフォームで、今すぐ情報商材を販売',
      tagline: 'NEXT LAUNCH',
      highlightText: '５分でLP公開',
      buttonText: '無料で始める',
      buttonUrl: '/register',
      secondaryButtonText: 'ログイン',
      secondaryButtonUrl: '/login',
      backgroundVideoUrl: '/videos/pixta.mp4',
      textColor: '#FFFFFF',
      backgroundColor: '#050814',
    } as HeroBlockContent,
  },
  {
    id: 'top-highlights-grid',
    templateId: 'top-highlights-1',
    name: 'TOPスタイルハイライト',
    category: 'content',
    description: 'TOPページのペインポイント/ソリューションスライド風の特徴ブロック',
    defaultContent: {
      title: 'こんな課題、ありませんか？',
      tagline: 'Pain Points',
      features: [
        {
          icon: '🎨',
          title: 'デザイン設計に時間を奪われる',
          description: 'ゼロから構成やビジュアルを整えるのは非効率で差別化も難しい。',
        },
        {
          icon: '🌐',
          title: 'ドメイン・サーバー整備が面倒',
          description: '取得・SSL対応まで段取りに追われ、初動が遅れる。',
        },
        {
          icon: '💳',
          title: '決済機能の実装ハードル',
          description: '安全な決済フローの準備には高い技術とセキュリティ知識が必要。',
        },
        {
          icon: '⏱️',
          title: 'スピード感が阻害される',
          description: '調整項目が多く、旬な情報を発信するタイミングを逃しがち。',
        },
        {
          icon: '💹',
          title: '販売手数料がかさむ',
          description: '高いプラットフォーム手数料で利益率が圧迫される。',
        },
        {
          icon: '🧠',
          title: '仕組み化が追いつかない',
          description: '運用が属人化し、制作から改善までのサイクルが重い。',
        },
      ],
      backgroundColor: '#F1F5F9',
      textColor: '#0F172A',
    } as FeaturesBlockContent,
  },
  {
    id: 'top-cta-gradient',
    templateId: 'top-cta-1',
    name: 'TOPスタイルCTA',
    category: 'conversion',
    description: 'TOPページ終盤の最終CTAを再現したブロック',
    defaultContent: {
      title: '今すぐ始めよう',
      subtitle: '情報には鮮度がある。５分でLPを公開して、今すぐ販売を開始。',
      buttonText: '無料で始める',
      buttonUrl: '/register',
      secondaryButtonText: 'デモを見る',
      secondaryButtonUrl: '/demo',
      backgroundColor: '#E0F2FE',
      textColor: '#0F172A',
    } as CTABlockContent,
  },
];

export const INFO_PRODUCT_BLOCKS: TemplateBlock[] = [];

export const TEMPLATE_CATEGORIES = [
  { id: 'header', name: 'ヒーロー', icon: 'Hero' },
  { id: 'content', name: 'コンテンツ', icon: 'Content' },
  { id: 'conversion', name: 'コンバージョン', icon: 'Conversion' },
];

export function getTemplatesByCategory(category: string) {
  const allTemplates = [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
  return allTemplates.filter((template) => template.category === category);
}

export function getTemplateById(templateId: string) {
  const allTemplates = [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
  return allTemplates.find((template) => template.templateId === templateId);
}

export function getAllTemplates() {
  return [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
}
