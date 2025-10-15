import {
  TemplateBlock,
  HeroBlockContent,
  TextImageBlockContent,
  PricingBlockContent,
  TestimonialBlockContent,
  FAQBlockContent,
  FeaturesBlockContent,
  CTABlockContent,
  GalleryBlockContent,
  VideoBlockContent,
  FormBlockContent,
  StatsBlockContent,
  TimelineBlockContent,
  TeamBlockContent,
  LogoGridBlockContent,
  ComparisonBlockContent,
  CountdownBlockContent,
  SpecialPriceBlockContent,
  BonusListBlockContent,
  GuaranteeBlockContent,
  ProblemBlockContent,
  BeforeAfterBlockContent,
  AuthorProfileBlockContent,
  UrgencyBlockContent,
  ScarcityBlockContent,
  StickyCTABlockContent,
  ImageBlockContent,
} from '@/types/templates';

// ===== 配色バリエーション（情報商材特化） =====
export const COLOR_THEMES = {
  // 1. 緊急レッド（投資・FX・副業向け）
  urgent_red: {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#F59E0B',
    background: '#111827',
    text: '#FFFFFF',
    name: '緊急レッド',
    description: '投資・FX・副業に最適',
  },
  // 2. エネルギーオレンジ（ダイエット・筋トレ向け）
  energy_orange: {
    primary: '#EA580C',
    secondary: '#F59E0B',
    accent: '#FBBF24',
    background: '#1F2937',
    text: '#FFFFFF',
    name: 'エネルギーオレンジ',
    description: 'ダイエット・筋トレに最適',
  },
  // 3. ゴールドプレミアム（高額商品向け）
  gold_premium: {
    primary: '#B45309',
    secondary: '#F59E0B',
    accent: '#FCD34D',
    background: '#0F172A',
    text: '#FFFFFF',
    name: 'ゴールドプレミアム',
    description: '高額商品・コンサルに最適',
  },
  // 4. パワーブルー（学習・資格向け）
  power_blue: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    accent: '#60A5FA',
    background: '#111827',
    text: '#FFFFFF',
    name: 'パワーブルー',
    description: '学習・資格取得に最適',
  },
  // 5. パッションピンク（恋愛・美容向け）
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

/**
 * テンプレートライブラリ
 * 情報商材特化 - 既存テンプレート削除済み
 * INFO_PRODUCT_BLOCKSが実質的なテンプレートライブラリ
 */
export const TEMPLATE_LIBRARY: TemplateBlock[] = [];

// ===== 業種別プリセットLP（10業種） =====
export const INDUSTRY_PRESETS = {
  investment: {
    name: '投資・FX・仮想通貨',
    icon: '💰',
    colorTheme: 'urgent_red',
    recommendedBlocks: ['countdown-1', 'problem-1', 'before-after-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'author-profile-1', 'scarcity-1', 'sticky-cta-1'],
    description: '実績訴求と緊急性を重視',
  },
  fitness: {
    name: 'ダイエット・筋トレ',
    icon: '💪',
    colorTheme: 'energy_orange',
    recommendedBlocks: ['countdown-1', 'before-after-1', 'problem-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'urgency-1', 'sticky-cta-1'],
    description: '視覚的変化を強調',
  },
  business: {
    name: '副業・ビジネス',
    icon: '💼',
    colorTheme: 'urgent_red',
    recommendedBlocks: ['countdown-1', 'problem-1', 'before-after-1', 'author-profile-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'scarcity-1', 'sticky-cta-1'],
    description: '権威性と実績を前面に',
  },
  education: {
    name: '英語・資格学習',
    icon: '📚',
    colorTheme: 'power_blue',
    recommendedBlocks: ['problem-1', 'before-after-1', 'author-profile-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'countdown-1', 'sticky-cta-1'],
    description: '信頼性重視',
  },
  romance: {
    name: '恋愛・モテ術',
    icon: '❤️',
    colorTheme: 'passion_pink',
    recommendedBlocks: ['problem-1', 'before-after-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'urgency-1', 'sticky-cta-1'],
    description: '共感重視',
  },
  marketing: {
    name: 'SNS・集客',
    icon: '📱',
    colorTheme: 'urgent_red',
    recommendedBlocks: ['countdown-1', 'problem-1', 'before-after-1', 'author-profile-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'scarcity-1', 'sticky-cta-1'],
    description: '実績数字を強調',
  },
  resale: {
    name: '転売・物販',
    icon: '🏪',
    colorTheme: 'gold_premium',
    recommendedBlocks: ['countdown-1', 'problem-1', 'before-after-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'author-profile-1', 'scarcity-1', 'sticky-cta-1'],
    description: '具体的利益を提示',
  },
  writing: {
    name: 'ライティング',
    icon: '✍️',
    colorTheme: 'power_blue',
    recommendedBlocks: ['problem-1', 'before-after-1', 'author-profile-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'urgency-1', 'sticky-cta-1'],
    description: 'スキル向上を訴求',
  },
  coaching: {
    name: '自己啓発',
    icon: '🧠',
    colorTheme: 'gold_premium',
    recommendedBlocks: ['problem-1', 'before-after-1', 'author-profile-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'urgency-1', 'sticky-cta-1'],
    description: '変革を約束',
  },
  other: {
    name: 'その他ノウハウ',
    icon: '🎯',
    colorTheme: 'urgent_red',
    recommendedBlocks: ['countdown-1', 'problem-1', 'before-after-1', 'special-price-1', 'bonus-list-1', 'guarantee-1', 'author-profile-1', 'scarcity-1', 'sticky-cta-1'],
    description: '汎用性の高い定番構成',
  },
};

/**
 * カテゴリ別にテンプレートを取得
 */
export function getTemplatesByCategory(category: string) {
  if (category === 'info-product') {
    return INFO_PRODUCT_BLOCKS;
  }

  const allTemplates = [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
  return allTemplates.filter((template) => template.category === category);
}

/**
 * テンプレートIDでテンプレートを取得
 */
export function getTemplateById(templateId: string) {
  const allTemplates = [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
  return allTemplates.find((template) => template.templateId === templateId);
}

/**
 * すべてのテンプレートを取得（情報商材ブロック含む）
 */
export function getAllTemplates() {
  return [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
}

/**
 * すべてのカテゴリを取得
 */
export const TEMPLATE_CATEGORIES = [
  { id: 'header', name: 'ヒーロー', icon: '🎯' },
  { id: 'content', name: 'コンテンツ', icon: '📝' },
  { id: 'conversion', name: 'コンバージョン', icon: '🚀' },
  { id: 'social-proof', name: '社会的証明', icon: '⭐' },
  { id: 'media', name: 'メディア', icon: '🎬' },
  { id: 'form', name: 'フォーム', icon: '📋' },
  { id: 'info-product', name: '情報商材特化', icon: '🔥' },
];

// ===== 情報商材特化ブロック =====
export const INFO_PRODUCT_BLOCKS: TemplateBlock[] = [
  {
    id: 'hero-aurora-1',
    templateId: 'hero-aurora',
    name: 'オーロラヒーロー',
    category: 'header',
    description: 'グラデーションとガラスモーフィズムを活かしたプレミアムヒーローセクション',
    defaultContent: {
      tagline: 'NEXT WAVE',
      title: 'AIが導く、24時間で完成するローンチ体験',
      subtitle: 'ブランドとコンバージョンを両立するハイエンドLPを、AIワークフローで最短1日で公開。UI設計からコピーワークまで自動化。',
      highlightText: 'AI LAUNCH ACCELERATOR',
      buttonText: '無料で試してみる',
      buttonUrl: '/register',
      secondaryButtonText: 'デモを見る',
      secondaryButtonUrl: '/demo',
      imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=960&q=80',
      stats: [
        { value: '12h', label: '初稿生成' },
        { value: '87%', label: 'CVR改善率' },
        { value: '200+', label: '導入ブランド' },
      ],
    } as HeroBlockContent,
  },
  // フル幅画像ブロック
  {
    id: 'image-standalone-1',
    templateId: 'image-1',
    name: 'フル幅画像',
    category: 'image',
    description: '用意した画像を印象的に表示するシンプルなビジュアルブロック',
    defaultContent: {
      imageUrl: '',
      caption: '',
      backgroundColor: '#0B1120',
      textColor: '#FFFFFF',
      padding: '40px 0',
      borderRadius: '20px',
      shadow: true,
      maxWidth: '960px',
    } as ImageBlockContent,
  },

  // カウントダウンタイマー
  {
    id: 'countdown-1',
    templateId: 'countdown-1',
    name: 'カウントダウンタイマー',
    category: 'conversion',
    description: '緊急性を訴求するタイマー',
    defaultContent: {
      title: '⏰ 特別価格は残りわずか！',
      targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      urgencyText: '今すぐ申し込まないと、この価格では二度と手に入りません',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      backgroundColor: '#EF4444',
      textColor: '#FFFFFF',
    } as CountdownBlockContent,
  },

  // 特別価格ブロック
  {
    id: 'special-price-1',
    templateId: 'special-price-1',
    name: '特別価格（打ち消し線）',
    category: 'conversion',
    description: '通常価格を打ち消して特別価格を強調',
    defaultContent: {
      title: '🔥 今だけ特別価格 🔥',
      originalPrice: '298,000',
      specialPrice: '98,000',
      discountBadge: '67% OFF',
      currency: '¥',
      period: '一括',
      features: [
        '✓ 全コンテンツ永久アクセス',
        '✓ 個別サポート6ヶ月',
        '✓ 限定コミュニティ参加権',
        '✓ 実践テンプレート30種',
        '✓ 月1回のグループコンサル',
      ],
      buttonText: '今すぐ特別価格で申し込む',
      buttonColor: '#EF4444',
      backgroundColor: '#111827',
      textColor: '#FFFFFF',
    } as SpecialPriceBlockContent,
  },

  // ボーナス特典リスト
  {
    id: 'bonus-list-1',
    templateId: 'bonus-list-1',
    name: 'ボーナス特典リスト',
    category: 'conversion',
    description: '無料特典を一覧表示',
    defaultContent: {
      title: '🎁 今だけ豪華特典プレゼント 🎁',
      subtitle: '本編に加えて、以下の特典が全て無料でついてきます',
      bonuses: [
        {
          title: '実践ワークシート集',
          value: '29,800円',
          description: 'そのまま使える実践テンプレート50種',
          icon: '📋',
        },
        {
          title: '個別コンサルティング（60分）',
          value: '50,000円',
          description: 'あなた専用の戦略を一緒に作ります',
          icon: '👨‍💼',
        },
        {
          title: '限定コミュニティ参加権',
          value: '月額9,800円',
          description: '成功者たちと繋がれる秘密のグループ',
          icon: '👥',
        },
        {
          title: '最新情報アップデート（永久）',
          value: 'プライスレス',
          description: '常に最新のノウハウが手に入る',
          icon: '🔄',
        },
      ],
      totalValue: '189,600円',
      backgroundColor: '#1F2937',
      textColor: '#FFFFFF',
    } as BonusListBlockContent,
  },

  // 保証セクション
  {
    id: 'guarantee-1',
    templateId: 'guarantee-1',
    name: '100%返金保証',
    category: 'conversion',
    description: 'リスクフリーを訴求',
    defaultContent: {
      title: '100%満足保証',
      subtitle: 'あなたのリスクはゼロです',
      guaranteeType: '90日間 全額返金保証',
      description: '万が一、90日間実践しても結果が出なかった場合は、理由を問わず全額返金いたします。メール一本で対応可能。面倒な手続きは一切ありません。',
      badgeText: '完全リスクフリー',
      features: [
        '90日間じっくり試せる',
        '理由不要で全額返金',
        'メール一本で手続き完了',
        '返品不要（デジタル商品）',
        '購入後すぐ実践可能',
      ],
      backgroundColor: '#0F172A',
      textColor: '#FFFFFF',
    } as GuaranteeBlockContent,
  },

  // 問題提起ブロック
  {
    id: 'problem-1',
    templateId: 'problem-1',
    name: '問題提起リスト',
    category: 'conversion',
    description: 'ターゲットの悩みをチェックリスト形式で訴求',
    defaultContent: {
      title: 'こんなお悩みありませんか？',
      subtitle: '1つでも当てはまる方は、このまま読み進めてください',
      problems: [
        '何をやっても結果が出ない...',
        '自己流でやってきたけど限界を感じている',
        '正しいやり方が分からず、時間だけが過ぎていく',
        '周りは成功しているのに、自分だけ取り残されている',
        'もっと効率的な方法があるはずなのに見つからない',
      ],
      checkIcon: '❌',
      backgroundColor: '#1F2937',
      textColor: '#FFFFFF',
    } as ProblemBlockContent,
  },

  // ビフォーアフターブロック
  {
    id: 'before-after-1',
    templateId: 'before-after-1',
    name: 'ビフォーアフター比較',
    category: 'social-proof',
    description: '実践前後の変化を視覚的に表示',
    defaultContent: {
      title: '🎯 驚きの変化をご覧ください',
      beforeTitle: 'BEFORE',
      beforeText: '収入が不安定で将来が心配\n副業を始めても全く稼げない\n何から手をつければいいか分からない',
      beforeImage: '',
      afterTitle: 'AFTER',
      afterText: '月収50万円を安定して達成\n自動化の仕組みで時間に余裕\n好きなことで収入を得られる喜び',
      afterImage: '',
      arrowIcon: '➡️',
      backgroundColor: '#111827',
      textColor: '#FFFFFF',
    } as BeforeAfterBlockContent,
  },

  // 著者プロフィールブロック
  {
    id: 'author-profile-1',
    templateId: 'author-profile-1',
    name: '著者プロフィール',
    category: 'social-proof',
    description: '権威性と信頼性を訴求',
    defaultContent: {
      name: '山田太郎',
      title: 'オンラインビジネスコンサルタント',
      imageUrl: '',
      bio: '20年以上のビジネス経験を持ち、3000名以上の起業家・経営者を成功に導いてきました。独自のメソッドで初心者でも最短3ヶ月で月収100万円を達成させることに成功。',
      achievements: [
        '累計3000名以上の指導実績',
        'ビジネス書籍5冊出版（累計50万部突破）',
        '主要メディア（日経、東洋経済）で特集',
        '年商10億円企業を3社創業',
        'オンラインスクール卒業生の95%が収益化',
      ],
      mediaLogos: [],
      backgroundColor: '#0F172A',
      textColor: '#FFFFFF',
    } as AuthorProfileBlockContent,
  },

  // 緊急性訴求ブロック
  {
    id: 'urgency-1',
    templateId: 'urgency-1',
    name: '緊急性バナー',
    category: 'conversion',
    description: '今すぐ行動を促す緊急メッセージ',
    defaultContent: {
      title: '⚠️ 重要なお知らせ',
      message: 'このページは24時間限定公開です！今すぐお申し込みください',
      icon: '⚠️',
      highlightColor: '#DC2626',
      backgroundColor: '#DC2626',
      textColor: '#FFFFFF',
    } as UrgencyBlockContent,
  },

  // 限定性訴求ブロック
  {
    id: 'scarcity-1',
    templateId: 'scarcity-1',
    name: '限定枠表示',
    category: 'conversion',
    description: '残り枠数を視覚的に表示して希少性を訴求',
    defaultContent: {
      title: '🔥 募集枠残りわずか 🔥',
      remainingCount: 3,
      totalCount: 50,
      message: '定員に達し次第、募集終了となります',
      progressColor: '#EF4444',
      backgroundColor: '#991B1B',
      textColor: '#FFFFFF',
    } as ScarcityBlockContent,
  },

  // スティッキーCTAブロック
  {
    id: 'sticky-cta-1',
    templateId: 'sticky-cta-1',
    name: '固定CTAバー',
    category: 'conversion',
    description: '画面に常に表示される行動喚起ボタン',
    defaultContent: {
      buttonText: '今すぐ申し込む',
      buttonColor: '#EF4444',
      subText: '🔥 残り3名で募集終了',
      position: 'bottom',
      backgroundColor: '#111827',
      textColor: '#FFFFFF',
    } as StickyCTABlockContent,
  },
];
