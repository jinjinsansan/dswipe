import {
  TemplateBlock,
  HeroBlockContent,
  FeaturesBlockContent,
  StickyCTABlockContent,
} from "@/types/templates";

const THEME_KEYS = [
  "urgent_red",
  "energy_orange",
  "gold_premium",
  "power_blue",
  "passion_pink",
] as const;

export type ColorThemeKey = (typeof THEME_KEYS)[number];

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
  urgent_red: {
    primary: "#DC2626",
    secondary: "#EF4444",
    accent: "#F59E0B",
    background: "#111827",
    text: "#FFFFFF",
    name: "緊急レッド",
    description: "投資・FX・副業に最適",
  },
  energy_orange: {
    primary: "#EA580C",
    secondary: "#F59E0B",
    accent: "#FBBF24",
    background: "#1F2937",
    text: "#FFFFFF",
    name: "エネルギーオレンジ",
    description: "ダイエット・筋トレに最適",
  },
  gold_premium: {
    primary: "#B45309",
    secondary: "#F59E0B",
    accent: "#FCD34D",
    background: "#0F172A",
    text: "#FFFFFF",
    name: "ゴールドプレミアム",
    description: "高額商品・コンサルに最適",
  },
  power_blue: {
    primary: "#1E40AF",
    secondary: "#3B82F6",
    accent: "#60A5FA",
    background: "#111827",
    text: "#FFFFFF",
    name: "パワーブルー",
    description: "学習・資格取得に最適",
  },
  passion_pink: {
    primary: "#BE185D",
    secondary: "#EC4899",
    accent: "#F472B6",
    background: "#1F2937",
    text: "#FFFFFF",
    name: "パッションピンク",
    description: "恋愛・美容に最適",
  },
};

export const TEMPLATE_LIBRARY: TemplateBlock[] = [];

export const INFO_PRODUCT_BLOCKS: TemplateBlock[] = [
  {
    id: "hero-aurora-1",
    templateId: "hero-aurora",
    name: "オーロラヒーロー",
    category: "header",
    description: "グラデーションとガラスモーフィズムを活かしたプレミアムヒーローセクション",
    defaultContent: {
      tagline: "NEXT WAVE",
      title: "AIが導く、24時間で完成するローンチ体験",
      subtitle:
        "ブランドとコンバージョンを両立するハイエンドLPを、AIワークフローで最短1日で公開。UI設計からコピーワークまで自動化。",
      highlightText: "AI LAUNCH ACCELERATOR",
      buttonText: "無料で試してみる",
      buttonUrl: "/register",
      secondaryButtonText: "デモを見る",
      secondaryButtonUrl: "/demo",
      imageUrl:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=960&q=80",
      stats: [
        { value: "12h", label: "初稿生成" },
        { value: "87%", label: "CVR改善率" },
        { value: "200+", label: "導入ブランド" },
      ],
    } as HeroBlockContent,
  },
  {
    id: "features-aurora-1",
    templateId: "features-aurora",
    name: "プレミアム特徴グリッド",
    category: "content",
    description: "ガラスモーフィズムカードで価値訴求を行うモダンな特徴セクション",
    defaultContent: {
      tagline: "VALUE STACK",
      title: "AI自動化とプロのクリエイティブで、ローンチを最短化",
      highlightText: "KEY FEATURES",
      features: [
        {
          icon: "⚡️",
          title: "AI Strategy Engine",
          description: "ハイコンバージョン構成とコピーをAIが瞬時に生成。訴求軸に合わせた最適なブロックを自動提案。",
        },
        {
          icon: "🎨",
          title: "Premium Theme Library",
          description: "最新トレンドのテンプレートを即利用。ブランドカラーやタイポグラフィもワンクリックで反映。",
        },
        {
          icon: "📈",
          title: "Launch Analytics",
          description: "ヒートマップやコンバージョン動線を自動分析。改善提案をAIがレコメンド。",
        },
        {
          icon: "🤝",
          title: "Collaborative Workflow",
          description: "チームメンバーとリアルタイム編集。承認フローやコメント機能で制作プロセスを効率化。",
        },
      ],
    } as FeaturesBlockContent,
  },
  {
    id: "sticky-cta-aurora-1",
    templateId: "sticky-cta-1",
    name: "フローティングCTA",
    category: "conversion",
    description: "AIローンチに合わせたフローティングCTAバー",
    defaultContent: {
      buttonText: "今すぐAIローンチを始める",
      buttonColor: "#6366F1",
      subText: "⚡ 24時間で初稿生成 / 87%がCVR向上を実感",
      position: "bottom",
      backgroundColor: "#050814",
      textColor: "#E2E8F0",
    } as StickyCTABlockContent,
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "header", name: "ヒーロー", icon: "🎯" },
  { id: "content", name: "コンテンツ", icon: "📝" },
  { id: "conversion", name: "コンバージョン", icon: "🚀" },
  { id: "info-product", name: "情報商材特化", icon: "🔥" },
];

export function getTemplatesByCategory(category: string) {
  if (category === "info-product") {
    return INFO_PRODUCT_BLOCKS;
  }

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
