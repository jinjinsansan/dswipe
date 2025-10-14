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
} from '@/types/templates';

/**
 * テンプレートライブラリ
 * 30種類のブロックテンプレート定義
 */
export const TEMPLATE_LIBRARY: TemplateBlock[] = [
  // ===== ヒーロー系 (3種類) =====
  {
    id: 'hero-1',
    templateId: 'hero-1',
    name: 'センター配置ヒーロー',
    category: 'header',
    description: 'シンプルな中央揃えヒーローセクション',
    defaultContent: {
      title: 'あなたの見出しをここに',
      subtitle: 'サブタイトルで詳細を伝えましょう',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      buttonText: '今すぐ始める',
      buttonColor: '#3B82F6',
      alignment: 'center',
    } as HeroBlockContent,
  },
  {
    id: 'hero-2',
    templateId: 'hero-2',
    name: '左右分割ヒーロー',
    category: 'header',
    description: 'テキストと画像を左右に配置',
    defaultContent: {
      title: '魅力的な見出し',
      subtitle: '詳しい説明をここに記載します',
      imageUrl: '',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      buttonText: '詳しく見る',
      buttonColor: '#10B981',
      alignment: 'left',
    } as HeroBlockContent,
  },
  {
    id: 'hero-3',
    templateId: 'hero-3',
    name: 'フルスクリーン画像ヒーロー',
    category: 'header',
    description: '背景画像にテキストをオーバーレイ',
    defaultContent: {
      title: 'インパクトのある見出し',
      subtitle: '画像の上に表示されます',
      imageUrl: '',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      textColor: '#FFFFFF',
      buttonText: '今すぐ体験',
      buttonColor: '#EF4444',
      alignment: 'center',
    } as HeroBlockContent,
  },

  // ===== テキスト+画像系 (3種類) =====
  {
    id: 'text-img-1',
    templateId: 'text-img-1',
    name: '左テキスト右画像',
    category: 'content',
    description: 'テキストを左、画像を右に配置',
    defaultContent: {
      title: '特徴タイトル',
      text: '詳しい説明文がここに入ります。製品やサービスの魅力を伝えましょう。',
      imageUrl: '',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
      imagePosition: 'right',
      imageWidth: '50%',
    } as TextImageBlockContent,
  },
  {
    id: 'text-img-2',
    templateId: 'text-img-2',
    name: '右テキスト左画像',
    category: 'content',
    description: '画像を左、テキストを右に配置',
    defaultContent: {
      title: '特徴タイトル',
      text: '詳しい説明文がここに入ります。',
      imageUrl: '',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      imagePosition: 'left',
      imageWidth: '50%',
    } as TextImageBlockContent,
  },
  {
    id: 'text-img-3',
    templateId: 'text-img-3',
    name: '上テキスト下画像',
    category: 'content',
    description: 'テキストを上、画像を下に配置',
    defaultContent: {
      title: '特徴タイトル',
      text: '詳しい説明文がここに入ります。',
      imageUrl: '',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
      imagePosition: 'bottom',
    } as TextImageBlockContent,
  },

  // ===== 価格表系 (3種類) =====
  {
    id: 'pricing-1',
    templateId: 'pricing-1',
    name: '3カラム価格表',
    category: 'conversion',
    description: '3つのプランを並べて表示',
    defaultContent: {
      plans: [
        {
          name: 'ベーシック',
          price: '¥1,000',
          period: '月額',
          description: '個人利用に最適',
          features: ['機能1', '機能2', '機能3'],
          buttonText: '選択する',
          highlighted: false,
        },
        {
          name: 'プロ',
          price: '¥3,000',
          period: '月額',
          description: 'ビジネス利用に',
          features: ['機能1', '機能2', '機能3', '機能4', '機能5'],
          buttonText: '選択する',
          highlighted: true,
        },
        {
          name: 'エンタープライズ',
          price: 'お問い合わせ',
          description: '大規模組織向け',
          features: ['全機能', '専任サポート', 'SLA保証'],
          buttonText: 'お問い合わせ',
          highlighted: false,
        },
      ],
      columns: 3,
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as PricingBlockContent,
  },
  {
    id: 'pricing-2',
    templateId: 'pricing-2',
    name: '2カラム価格表（対比型）',
    category: 'conversion',
    description: '2つのプランを対比して表示',
    defaultContent: {
      plans: [
        {
          name: '無料プラン',
          price: '¥0',
          features: ['基本機能', '制限あり'],
          buttonText: '始める',
        },
        {
          name: '有料プラン',
          price: '¥2,000',
          period: '月額',
          features: ['全機能', '制限なし', 'サポート付き'],
          buttonText: '今すぐ購入',
          highlighted: true,
        },
      ],
      columns: 2,
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as PricingBlockContent,
  },
  {
    id: 'pricing-3',
    templateId: 'pricing-3',
    name: 'シングルカラム価格表',
    category: 'conversion',
    description: '1つのプランを強調表示',
    defaultContent: {
      plans: [
        {
          name: 'スタンダードプラン',
          price: '¥5,000',
          period: '月額',
          description: '全機能が使える人気プラン',
          features: ['機能1', '機能2', '機能3', '機能4', '機能5', 'サポート'],
          buttonText: '今すぐ始める',
          highlighted: true,
        },
      ],
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as PricingBlockContent,
  },

  // ===== お客様の声系 (3種類) =====
  {
    id: 'testimonial-1',
    templateId: 'testimonial-1',
    name: 'カード型お客様の声',
    category: 'social-proof',
    description: '顧客レビューをカード形式で表示',
    defaultContent: {
      testimonials: [
        {
          name: '田中 太郎',
          role: '30代女性',
          text: '素晴らしい商品です！期待以上の結果が得られました。',
          rating: 5,
        },
        {
          name: '佐藤 花子',
          role: '40代男性',
          text: 'サポートが手厚く、安心して利用できています。',
          rating: 5,
        },
        {
          name: '鈴木 次郎',
          role: '20代女性',
          text: 'コストパフォーマンスが最高です。友人にも勧めています。',
          rating: 4,
        },
      ],
      layout: 'card',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as TestimonialBlockContent,
  },
  {
    id: 'testimonial-2',
    templateId: 'testimonial-2',
    name: 'スライダー型お客様の声',
    category: 'social-proof',
    description: 'スライダー形式でレビューを表示',
    defaultContent: {
      testimonials: [
        {
          name: '山田 一郎',
          role: 'CEO',
          company: '株式会社ABC',
          text: 'ビジネスの効率が3倍に向上しました。',
          imageUrl: '',
          rating: 5,
        },
      ],
      layout: 'slider',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as TestimonialBlockContent,
  },
  {
    id: 'testimonial-3',
    templateId: 'testimonial-3',
    name: 'グリッド型お客様の声',
    category: 'social-proof',
    description: 'グリッドレイアウトで多数のレビュー表示',
    defaultContent: {
      testimonials: [
        { name: '顧客A', text: '素晴らしい！', rating: 5 },
        { name: '顧客B', text: '満足しています', rating: 4 },
        { name: '顧客C', text: 'おすすめです', rating: 5 },
        { name: '顧客D', text: '良い商品', rating: 4 },
      ],
      layout: 'grid',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as TestimonialBlockContent,
  },

  // ===== FAQ系 (2種類) =====
  {
    id: 'faq-1',
    templateId: 'faq-1',
    name: 'アコーディオン型FAQ',
    category: 'content',
    description: 'よくある質問をアコーディオン形式で',
    defaultContent: {
      title: 'よくある質問',
      faqs: [
        {
          question: '質問1：これは何ですか？',
          answer: '回答1：詳しい説明がここに入ります。',
        },
        {
          question: '質問2：どうやって使いますか？',
          answer: '回答2：使い方の説明がここに入ります。',
        },
        {
          question: '質問3：料金はいくらですか？',
          answer: '回答3：料金に関する説明がここに入ります。',
        },
      ],
      layout: 'accordion',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as FAQBlockContent,
  },
  {
    id: 'faq-2',
    templateId: 'faq-2',
    name: '2カラムFAQ',
    category: 'content',
    description: 'FAQを2列で表示',
    defaultContent: {
      title: 'よくある質問',
      faqs: [
        { question: '質問1', answer: '回答1' },
        { question: '質問2', answer: '回答2' },
        { question: '質問3', answer: '回答3' },
        { question: '質問4', answer: '回答4' },
      ],
      layout: 'grid',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as FAQBlockContent,
  },

  // ===== 特徴系 (2種類) =====
  {
    id: 'features-1',
    templateId: 'features-1',
    name: 'アイコン付き3カラム特徴',
    category: 'content',
    description: '3つの特徴をアイコン付きで表示',
    defaultContent: {
      title: '主な特徴',
      features: [
        {
          icon: '⚡',
          title: '高速',
          description: '圧倒的なスピードを実現',
        },
        {
          icon: '🔒',
          title: '安全',
          description: '最高レベルのセキュリティ',
        },
        {
          icon: '💎',
          title: '高品質',
          description: 'プレミアムな体験を提供',
        },
      ],
      columns: 3,
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as FeaturesBlockContent,
  },
  {
    id: 'features-2',
    templateId: 'features-2',
    name: '横並び特徴リスト',
    category: 'content',
    description: '特徴を横並びで表示',
    defaultContent: {
      features: [
        { title: '特徴1', description: '説明1' },
        { title: '特徴2', description: '説明2' },
        { title: '特徴3', description: '説明3' },
        { title: '特徴4', description: '説明4' },
      ],
      columns: 4,
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as FeaturesBlockContent,
  },

  // ===== CTA系 (3種類) =====
  {
    id: 'cta-1',
    templateId: 'cta-1',
    name: 'シンプルCTA',
    category: 'conversion',
    description: '大きなボタンでアクションを促進',
    defaultContent: {
      title: '今すぐ始めましょう',
      subtitle: '無料トライアル実施中',
      buttonText: '無料で試す',
      buttonColor: '#EF4444',
      backgroundColor: '#FEF2F2',
      textColor: '#111827',
    } as CTABlockContent,
  },
  {
    id: 'cta-2',
    templateId: 'cta-2',
    name: '2ボタンCTA',
    category: 'conversion',
    description: 'プライマリとセカンダリボタン',
    defaultContent: {
      title: 'あなたに最適なプランを',
      subtitle: '今すぐ始めるか、まずは資料をダウンロード',
      buttonText: '今すぐ始める',
      buttonColor: '#3B82F6',
      secondaryButtonText: '資料をダウンロード',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as CTABlockContent,
  },
  {
    id: 'cta-3',
    templateId: 'cta-3',
    name: 'カウントダウン付きCTA',
    category: 'conversion',
    description: '期限付きオファーで緊急性を演出',
    defaultContent: {
      title: '期間限定オファー！',
      subtitle: 'このチャンスをお見逃しなく',
      buttonText: '今すぐ申し込む',
      buttonColor: '#EF4444',
      countdown: {
        endDate: '2025-12-31T23:59:59',
      },
      backgroundColor: '#FEF2F2',
      textColor: '#111827',
    } as CTABlockContent,
  },

  // ===== ギャラリー系 (2種類) =====
  {
    id: 'gallery-1',
    templateId: 'gallery-1',
    name: 'グリッドギャラリー',
    category: 'media',
    description: '画像をグリッド状に配置',
    defaultContent: {
      images: [
        { url: '', alt: '画像1' },
        { url: '', alt: '画像2' },
        { url: '', alt: '画像3' },
        { url: '', alt: '画像4' },
      ],
      layout: 'grid',
      columns: 3,
      backgroundColor: '#FFFFFF',
    } as GalleryBlockContent,
  },
  {
    id: 'gallery-2',
    templateId: 'gallery-2',
    name: 'マソンリーギャラリー',
    category: 'media',
    description: 'Pinterest風のレイアウト',
    defaultContent: {
      images: [
        { url: '', alt: '画像1' },
        { url: '', alt: '画像2' },
        { url: '', alt: '画像3' },
      ],
      layout: 'masonry',
      columns: 3,
      backgroundColor: '#F9FAFB',
    } as GalleryBlockContent,
  },

  // ===== 動画系 (2種類) =====
  {
    id: 'video-1',
    templateId: 'video-1',
    name: '埋め込み動画',
    category: 'media',
    description: 'YouTube/Vimeo動画を埋め込み',
    defaultContent: {
      videoUrl: '',
      autoplay: false,
      backgroundColor: '#000000',
    } as VideoBlockContent,
  },
  {
    id: 'video-2',
    templateId: 'video-2',
    name: '動画 + テキスト説明',
    category: 'media',
    description: '動画とテキストを組み合わせ',
    defaultContent: {
      videoUrl: '',
      title: '動画タイトル',
      description: '動画の説明文がここに入ります',
      autoplay: false,
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as VideoBlockContent,
  },

  // ===== フォーム系 (2種類) =====
  {
    id: 'form-1',
    templateId: 'form-1',
    name: 'シンプルフォーム',
    category: 'form',
    description: '名前とメールアドレスのみ',
    defaultContent: {
      title: 'お問い合わせ',
      fields: [
        { name: 'name', label: 'お名前', type: 'text', required: true },
        { name: 'email', label: 'メールアドレス', type: 'email', required: true },
        { name: 'message', label: 'メッセージ', type: 'textarea', required: false },
      ],
      submitButtonText: '送信',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as FormBlockContent,
  },
  {
    id: 'form-2',
    templateId: 'form-2',
    name: '多項目フォーム',
    category: 'form',
    description: '詳細情報を収集',
    defaultContent: {
      title: '詳細お問い合わせ',
      fields: [
        { name: 'name', label: 'お名前', type: 'text', required: true },
        { name: 'email', label: 'メールアドレス', type: 'email', required: true },
        { name: 'phone', label: '電話番号', type: 'tel', required: false },
        { name: 'company', label: '会社名', type: 'text', required: false },
        {
          name: 'interest',
          label: '興味のあるプラン',
          type: 'select',
          required: true,
          options: ['ベーシック', 'プロ', 'エンタープライズ'],
        },
        { name: 'message', label: 'メッセージ', type: 'textarea', required: true },
      ],
      submitButtonText: '送信する',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as FormBlockContent,
  },

  // ===== その他 (8種類) =====
  {
    id: 'stats-1',
    templateId: 'stats-1',
    name: '統計数値表示',
    category: 'social-proof',
    description: '実績を数値で訴求',
    defaultContent: {
      stats: [
        { value: '10,000+', label: '利用者数', icon: '👥' },
        { value: '99%', label: '満足度', icon: '⭐' },
        { value: '24/7', label: 'サポート', icon: '💬' },
      ],
      columns: 3,
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as StatsBlockContent,
  },
  {
    id: 'timeline-1',
    templateId: 'timeline-1',
    name: 'タイムライン',
    category: 'content',
    description: '時系列で情報を表示',
    defaultContent: {
      title: 'ロードマップ',
      items: [
        { date: '2024年1月', title: 'ステップ1', description: '説明1' },
        { date: '2024年3月', title: 'ステップ2', description: '説明2' },
        { date: '2024年6月', title: 'ステップ3', description: '説明3' },
      ],
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as TimelineBlockContent,
  },
  {
    id: 'team-1',
    templateId: 'team-1',
    name: 'チームメンバー紹介',
    category: 'content',
    description: 'チームを紹介',
    defaultContent: {
      title: '私たちのチーム',
      members: [
        { name: '山田 太郎', role: 'CEO', imageUrl: '', bio: '会社の創設者' },
        { name: '佐藤 花子', role: 'CTO', imageUrl: '', bio: '技術責任者' },
        { name: '鈴木 次郎', role: 'デザイナー', imageUrl: '', bio: 'UI/UXデザイン' },
      ],
      columns: 3,
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
    } as TeamBlockContent,
  },
  {
    id: 'logo-grid-1',
    templateId: 'logo-grid-1',
    name: 'ロゴグリッド',
    category: 'social-proof',
    description: '取引先やパートナーのロゴ表示',
    defaultContent: {
      title: '導入実績',
      logos: [
        { url: '', alt: '企業A' },
        { url: '', alt: '企業B' },
        { url: '', alt: '企業C' },
        { url: '', alt: '企業D' },
        { url: '', alt: '企業E' },
        { url: '', alt: '企業F' },
      ],
      columns: 6,
      backgroundColor: '#FFFFFF',
    } as LogoGridBlockContent,
  },
  {
    id: 'comparison-1',
    templateId: 'comparison-1',
    name: '比較表',
    category: 'conversion',
    description: 'プランや製品を比較',
    defaultContent: {
      title: 'プラン比較',
      products: [
        {
          name: '無料プラン',
          features: {
            '基本機能': true,
            'プレミアム機能': false,
            'サポート': '制限あり',
          },
        },
        {
          name: '有料プラン',
          features: {
            '基本機能': true,
            'プレミアム機能': true,
            'サポート': '24/7',
          },
        },
      ],
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
    } as ComparisonBlockContent,
  },
];

/**
 * カテゴリ別にテンプレートを取得
 */
export function getTemplatesByCategory(category: string) {
  return TEMPLATE_LIBRARY.filter((template) => template.category === category);
}

/**
 * テンプレートIDでテンプレートを取得
 */
export function getTemplateById(templateId: string) {
  return TEMPLATE_LIBRARY.find((template) => template.templateId === templateId);
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
];
