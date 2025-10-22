import {
  TemplateBlock,
  HeroBlockContent,
  FeaturesBlockContent,
  StickyCTABlockContent,
  TestimonialBlockContent,
  FAQBlockContent,
  CTABlockContent,
  PricingBlockContent,
  ImageBlockContent,
  TemplateThemeKey,
} from "@/types/templates";

const THEME_KEYS: TemplateThemeKey[] = [
  "urgent_red",
  "energy_orange",
  "gold_premium",
  "power_blue",
  "passion_pink",
];

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
    name: "オーロラヒーロー（ブルー）",
    category: "header",
    description: "学習・副業系に最適な冷静で信頼感のあるヒーローセクション",
    defaultContent: {
      themeKey: "power_blue",
      backgroundColor: "#0B1120",
      textColor: "#E2E8F0",
      accentColor: "#60A5FA",
      buttonColor: "#6366F1",
      tagline: "NEXT WAVE",
      title: "AIが導く、24時間で完成するローンチ体験",
      subtitle: "ブランドとコンバージョンを両立するハイエンドLPを、AIワークフローで最短1日で公開。UI設計からコピーまで自動化。",
      highlightText: "AI LAUNCH ACCELERATOR",
      buttonText: "無料で試してみる",
      buttonUrl: "/register",
      secondaryButtonText: "デモを見る",
      secondaryButtonUrl: "/demo",
      imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=960&q=80",
      stats: [
        { value: "12h", label: "初稿生成" },
        { value: "87%", label: "CVR改善率" },
        { value: "200+", label: "導入ブランド" },
      ],
    } as HeroBlockContent,
  },
  {
    id: "hero-aurora-2",
    templateId: "hero-aurora",
    name: "オーロラヒーロー（ピンク）",
    category: "header",
    description: "恋愛・美容コンテンツに特化したエモーショナルなヒーロー",
    defaultContent: {
      themeKey: "passion_pink",
      backgroundColor: "#1B0F1B",
      textColor: "#FCE7F3",
      accentColor: "#F472B6",
      buttonColor: "#F43F5E",
      tagline: "HEART DATA",
      title: "感情データ×AIで、距離を縮める",
      subtitle: "恋愛・マッチング市場に特化したメッセージ自動化システム。LINE配信からシナリオ最適化まで一気通貫で支援。",
      highlightText: "EMOTIONAL ENGINE",
      buttonText: "90秒デモを見る",
      buttonUrl: "/demo",
      secondaryButtonText: "導入事例資料",
      secondaryButtonUrl: "/case-study",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      stats: [
        { value: "6.2x", label: "反応率改善" },
        { value: "45日", label: "継続課金率" },
        { value: "92%", label: "LINE移行率" },
      ],
    } as HeroBlockContent,
  },
  {
    id: "hero-aurora-3",
    templateId: "hero-aurora",
    name: "オーロラヒーロー（ゴールド）",
    category: "header",
    description: "高単価・ラグジュアリー系プロダクト向けの重厚なヒーロー",
    defaultContent: {
      themeKey: "gold_premium",
      backgroundColor: "#120D03",
      textColor: "#FEF3C7",
      accentColor: "#FCD34D",
      buttonColor: "#F59E0B",
      tagline: "PREMIUM LAUNCH",
      title: "高額講座のローンチを、データで精密に",
      subtitle: "2,000万円超のローンチを8回成功に導いたプレミアムフレームワーク。受講動線の最適化、FP管理、離脱防止まで網羅。",
      highlightText: "EXECUTIVE PLAYBOOK",
      buttonText: "コンサルティング予約",
      buttonUrl: "/consulting",
      secondaryButtonText: "成果レポートを見る",
      secondaryButtonUrl: "/results",
      imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=960&q=80",
      stats: [
        { value: "¥48M", label: "累計売上" },
        { value: "210%", label: "LTV向上" },
        { value: "38名", label: "コンサル顧客" },
      ],
    } as HeroBlockContent,
  },
  {
    id: "hero-aurora-4",
    templateId: "hero-aurora",
    name: "オーロラヒーロー（オレンジ）",
    category: "header",
    description: "ダイエット・フィットネス系のアクティブなヒーロー",
    defaultContent: {
      themeKey: "energy_orange",
      backgroundColor: "#1A1207",
      textColor: "#FFEAD5",
      accentColor: "#F97316",
      buttonColor: "#EA580C",
      tagline: "BODY HACK",
      title: "科学的アプローチで、最短60日シェイプ",
      subtitle: "管理栄養士×AIコーチングが毎日のトレーニングを最適化。習慣化と食事管理をダブルでサポートします。",
      highlightText: "METABOLIC SCIENCE",
      buttonText: "無料カウンセリング",
      buttonUrl: "/trial",
      secondaryButtonText: "成功者インタビュー",
      secondaryButtonUrl: "/voices",
      imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=960&q=80",
      stats: [
        { value: "-7.6kg", label: "平均減量" },
        { value: "93%", label: "継続率" },
        { value: "14日", label: "習慣化サイクル" },
      ],
    } as HeroBlockContent,
  },
  {
    id: "features-aurora-1",
    templateId: "features-aurora",
    name: "機能ハイライト（ブルー）",
    category: "content",
    description: "SaaS・学習系に最適な信頼感のある特徴セクション",
    defaultContent: {
      themeKey: "power_blue",
      backgroundColor: "#0F172A",
      textColor: "#E2E8F0",
      accentColor: "#60A5FA",
      tagline: "VALUE STACK",
      title: "AI自動化とプロのクリエイティブで、ローンチを最短化",
      highlightText: "KEY FEATURES",
      features: [
        { icon: "⚡️", title: "AI Strategy Engine", description: "ハイコンバージョン構成とコピーをAIが瞬時に生成。訴求軸に合わせた最適なブロックを自動提案。" },
        { icon: "Theme", title: "Premium Theme Library", description: "最新トレンドのテンプレートを即利用。ブランドカラーやタイポグラフィもワンクリックで反映。" },
        { icon: "Analytics", title: "Launch Analytics", description: "ヒートマップやコンバージョン動線を自動分析。改善提案をAIがレコメンド。" },
        { icon: "Team", title: "Collaborative Workflow", description: "チームメンバーとリアルタイム編集。承認フローやコメント機能で制作プロセスを効率化。" },
      ],
    } as FeaturesBlockContent,
  },
  {
    id: "features-aurora-2",
    templateId: "features-aurora",
    name: "機能ハイライト（ピンク）",
    category: "content",
    description: "感情訴求を重視した柔らかいトーンの特徴セクション",
    defaultContent: {
      themeKey: "passion_pink",
      backgroundColor: "#1B0F1B",
      textColor: "#FBCFE8",
      accentColor: "#F472B6",
      tagline: "EMOTIONAL BENEFITS",
      title: "恋愛・美容顧客の共感を生む4つの仕掛け",
      highlightText: "CUSTOMER LOVE",
      features: [
        { icon: "Message", title: "感情テンプレ", description: "10種類の恋愛心理テンプレートから最適なメッセージを自動提案。" },
        { icon: "Insight", title: "顧客インサイトAI", description: "チャット履歴を解析し、刺さる訴求パターンと禁止ワードを自動で提示。" },
        { icon: "Automation", title: "LINE自動分岐", description: "開封・反応データから最適なシナリオに自動分岐。ワンクリックで改善サイクル。" },
        { icon: "Score", title: "感情スコア", description: "共感・信頼・行動意欲をスコアリングし、最適なCTAタイミングを可視化。" },
      ],
    } as FeaturesBlockContent,
  },
  {
    id: "features-aurora-3",
    templateId: "features-aurora",
    name: "機能ハイライト（ゴールド）",
    category: "content",
    description: "プレミアム講座・投資商材向けの重厚な特徴セクション",
    defaultContent: {
      themeKey: "gold_premium",
      backgroundColor: "#120D03",
      textColor: "#FDE68A",
      accentColor: "#F59E0B",
      tagline: "WHY IT WORKS",
      title: "高単価ローンチを成功に導く4つの仕組み",
      highlightText: "EXECUTIVE STACK",
      features: [
        { icon: "Diagnostic", title: "プレローンチ診断", description: "過去の成約データを学習したAIが、提供価値と顧客課題のずれを指摘。" },
        { icon: "Pricing", title: "価格最適化モデル", description: "希望売上と目標人数から最適な価格設計と特典シナリオを算出。" },
        { icon: "Dashboard", title: "ライブ改善ダッシュボード", description: "ウェビナー参加率・滞在時間・チャット温度をリアルタイム分析。" },
        { icon: "Community", title: "VIPコミュニティ運用", description: "高単価顧客の継続率を高めるオンボーディングとフォロー導線を生成。" },
      ],
    } as FeaturesBlockContent,
  },
  {
    id: "features-aurora-4",
    templateId: "features-aurora",
    name: "機能ハイライト（オレンジ）",
    category: "content",
    description: "フィットネス・健康習慣訴求に合わせたエネルギッシュな特徴",
    defaultContent: {
      themeKey: "energy_orange",
      backgroundColor: "#1F1206",
      textColor: "#FFEDD5",
      accentColor: "#F97316",
      tagline: "PROGRAM DESIGN",
      title: "習慣化と成果を両立する4つのサイクル",
      highlightText: "BODY TRANSFORMATION",
      features: [
        { icon: "Nutrition", title: "個別栄養ハック", description: "血糖値と活動量から食事サイクルを自動アジャスト。" },
        { icon: "Mind", title: "メンタルトラッキング", description: "朝晩の気分ログを解析し、挫折リスクを事前検知。" },
        { icon: "Roadmap", title: "60日ロードマップ", description: "成果が出やすい順番でトレーニングと休息を設計。" },
        { icon: "Notify", title: "行動通知AI", description: "最適なタイミングでリマインドを送信し、継続率を最大化。" },
      ],
    } as FeaturesBlockContent,
  },
  {
    id: "testimonial-aurora-1",
    templateId: "testimonial-1",
    name: "導入事例（ブルー）",
    category: "social-proof",
    description: "3カラムで権威性と安心感を訴求する導入事例セクション",
    defaultContent: {
      themeKey: "power_blue",
      backgroundColor: "#0B1120",
      textColor: "#E2E8F0",
      accentColor: "#60A5FA",
      testimonials: [
        { name: "株式会社NovaWorks / 代表取締役", role: "年商3億円案件", text: "LP制作をAI化したことで、制作期間が1/3・CVRが1.8倍に。社内リソースをコア業務に集中できるようになりました。", rating: 5 },
        { name: "FXコミュニティ運営 / 佐藤様", role: "会員数1,200名", text: "ローンチのたびに夜通しで準備していた過去には戻れません。構成・コピー・デザインが一気通貫で仕上がります。", rating: 5 },
        { name: "英語学習アプリ / PM", role: "DL数28万件", text: "ABテストを回す速度が圧倒的に向上。AIが出した仮説を元に改善するだけで初回課金率が26%向上しました。", rating: 5 },
      ],
      layout: "card",
    } as TestimonialBlockContent,
  },
  {
    id: "faq-aurora-1",
    templateId: "faq-1",
    name: "よくある質問（ブルー）",
    category: "content",
    description: "導入前の不安を払拭するアコーディオン型FAQ",
    defaultContent: {
      themeKey: "power_blue",
      backgroundColor: "#0F172A",
      textColor: "#E2E8F0",
      accentColor: "#60A5FA",
      title: "よくあるご質問",
      faqs: [
        { question: "本当に1日でLPを公開できますか？", answer: "AIヒアリングに回答すると、約30分で初稿が生成されます。1クリックでデプロイまで行えるため、最短24時間で公開可能です。" },
        { question: "デザインを自社のブランドカラーに合わせられますか？", answer: "カラーテーマを選択するだけで全ブロックに反映されます。固有のブランドカラーも3色まで設定可能です。" },
        { question: "既存のCRMや決済システムと連携できますか？", answer: "WebhookとZapier連携を標準搭載。Shopify・Stripe・Pardotなど主要ツールとの連携テンプレートも提供しています。" },
      ],
      layout: "accordion",
    } as FAQBlockContent,
  },
  {
    id: "pricing-aurora-1",
    templateId: "pricing-1",
    name: "価格プラン（ゴールド）",
    category: "conversion",
    description: "高単価商品向けの3カラム価格表。特典と保証を明確に訴求",
    defaultContent: {
      themeKey: "gold_premium",
      backgroundColor: "#120D03",
      textColor: "#FDE68A",
      accentColor: "#F59E0B",
      plans: [
        {
          name: "ライトプラン",
          price: "¥98,000",
          period: "分割可",
          description: "個別チャットサポート30日 / 週次グループ講義",
          features: ["ローンチ設計テンプレート", "AIコピー10本", "チェックリスト付き"],
          buttonText: "今すぐ申し込む",
        },
        {
          name: "プレミアム",
          price: "¥298,000",
          period: "人気",
          description: "専属コンサル60日伴走 / フルAI構成 / 成果保証",
          features: ["パーソナル戦略会議", "CVR最適化AI", "ウェビナー台本付き"],
          buttonText: "プレミアムで申し込む",
          highlighted: true,
        },
        {
          name: "エグゼクティブ",
          price: "¥680,000",
          period: "限定10社",
          description: "実装チーム派遣 / 広告運用設計 / 収益最大化",
          features: ["ローンチ全工程代行", "広告クリエイティブ制作", "売上シェア型も可"],
          buttonText: "相談する",
        },
      ],
      columns: 3,
    } as PricingBlockContent,
  },
  {
    id: "cta-aurora-1",
    templateId: "cta-1",
    name: "フル幅CTA（レッド）",
    category: "conversion",
    description: "緊急性と行動喚起を高めるリッチCTAセクション",
    defaultContent: {
      themeKey: "urgent_red",
      backgroundColor: "#111116",
      textColor: "#F8FAFC",
      accentColor: "#F97316",
      title: "今すぐローンチをスタートしませんか？",
      subtitle: "無料トライアル30日 + CV改善レポートを今だけ進呈しています。",
      buttonText: "無料アカウントを作成",
      buttonUrl: "/register",
      buttonColor: "#DC2626",
      secondaryButtonText: "導入相談を予約",
      secondaryButtonUrl: "/contact",
    } as CTABlockContent,
  },
  {
    id: "sticky-cta-aurora-1",
    templateId: "sticky-cta-1",
    name: "フローティングCTA（ブルー）",
    category: "conversion",
    description: "視認性の高いフローティングCTAバー",
    defaultContent: {
      themeKey: "power_blue",
      backgroundColor: "#050814",
      textColor: "#E2E8F0",
      accentColor: "#60A5FA",
      buttonText: "今すぐAIローンチを始める",
      buttonColor: "#6366F1",
      subText: "⚡ 24時間で初稿生成 / 87%がCVR向上を実感",
      position: "bottom",
    } as StickyCTABlockContent,
  },
  {
    id: "sticky-cta-aurora-2",
    templateId: "sticky-cta-1",
    name: "フローティングCTA（ピンク）",
    category: "conversion",
    description: "恋愛・美容系LPにマッチする華やかなCTAバー",
    defaultContent: {
      themeKey: "passion_pink",
      backgroundColor: "#1B0F1B",
      textColor: "#FCE7F3",
      accentColor: "#F472B6",
      buttonText: "限定キャンペーンに参加",
      buttonColor: "#F43F5E",
      subText: "今だけ初月0円 / 残席3名",
      position: "bottom",
    } as StickyCTABlockContent,
  },
  {
    id: "image-aurora-1",
    templateId: "image-1",
    name: "ビジュアルギャラリー（ダーク）",
    category: "image",
    description: "AI生成結果に任意のキービジュアルを差し込めるフル幅イメージブロック",
    defaultContent: {
      backgroundColor: "#050814",
      textColor: "#E2E8F0",
      shadow: true,
      padding: "48px 24px",
      maxWidth: "960px",
      borderRadius: "28px",
      caption: "ビジュアルに合わせてキャプションを編集できます",
      imageUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1280&q=80",
    } as ImageBlockContent,
  },
];

export const TEMPLATE_CATEGORIES = [
{ id: "header", name: "ヒーロー", icon: "Hero" },
{ id: "content", name: "コンテンツ", icon: "Content" },
{ id: "conversion", name: "コンバージョン", icon: "Conversion" },
{ id: "info-product", name: "情報商材特化", icon: "Special" },
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
