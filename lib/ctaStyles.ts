/**
 * CTAボタンスタイルライブラリ（15種類）
 */

export interface CTAStyle {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  className: string;
  baseColors: {
    background: string;
    text: string;
    hover?: string;
    border?: string;
  };
  category: 'primary' | 'secondary' | 'accent' | 'outline' | 'gradient' | 'special';
}

export const CTA_STYLES: CTAStyle[] = [
  // Primary系（3種類）
  {
    id: 'primary-solid',
    name: 'プライマリーソリッド',
    description: '標準的な塗りつぶしボタン',
    className: 'px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105',
    baseColors: {
      background: '#3B82F6',
      text: '#FFFFFF',
      hover: '#2563EB',
    },
    category: 'primary',
  },
  {
    id: 'primary-rounded',
    name: 'プライマリー丸型',
    description: '丸みを帯びた柔らかい印象',
    className: 'px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105',
    baseColors: {
      background: '#3B82F6',
      text: '#FFFFFF',
      hover: '#2563EB',
    },
    category: 'primary',
  },
  {
    id: 'primary-pill',
    name: 'プライマリーピル',
    description: '横長のピル型ボタン',
    className: 'px-12 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all',
    baseColors: {
      background: '#3B82F6',
      text: '#FFFFFF',
      hover: '#2563EB',
    },
    category: 'primary',
  },

  // Accent系（3種類）
  {
    id: 'accent-danger',
    name: 'アクセント（レッド）',
    description: '強調したい重要なCTAに',
    className: 'px-10 py-5 rounded-lg font-bold text-xl shadow-2xl hover:brightness-110 transition-all hover:scale-105',
    baseColors: {
      background: '#EF4444',
      text: '#FFFFFF',
      hover: '#DC2626',
    },
    category: 'accent',
  },
  {
    id: 'accent-success',
    name: 'アクセント（グリーン）',
    description: '安心感を与える緑色',
    className: 'px-10 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105',
    baseColors: {
      background: '#10B981',
      text: '#FFFFFF',
      hover: '#059669',
    },
    category: 'accent',
  },
  {
    id: 'accent-warning',
    name: 'アクセント（オレンジ）',
    description: '注意を引く暖色系',
    className: 'px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105',
    baseColors: {
      background: '#F59E0B',
      text: '#FFFFFF',
      hover: '#D97706',
    },
    category: 'accent',
  },

  // Outline系（2種類）
  {
    id: 'outline-primary',
    name: 'アウトライン（ブルー）',
    description: 'シンプルな枠線ボタン',
    className: 'px-8 py-4 rounded-lg font-bold border-2 hover:bg-blue-50 transition-colors',
    baseColors: {
      background: 'transparent',
      text: '#3B82F6',
      border: '#3B82F6',
      hover: '#EFF6FF',
    },
    category: 'outline',
  },
  {
    id: 'outline-dark',
    name: 'アウトライン（ダーク）',
    description: 'ダークモード向け枠線',
    className: 'px-8 py-4 rounded-lg font-bold border-2 hover:bg-gray-800 transition-colors',
    baseColors: {
      background: 'transparent',
      text: '#111827',
      border: '#111827',
      hover: '#F9FAFB',
    },
    category: 'outline',
  },

  // Gradient系（3種類）
  {
    id: 'gradient-blue-purple',
    name: 'グラデーション（青→紫）',
    description: 'モダンなグラデーション',
    className: 'px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r',
    baseColors: {
      background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
      text: '#FFFFFF',
    },
    category: 'gradient',
  },
  {
    id: 'gradient-pink-orange',
    name: 'グラデーション（ピンク→オレンジ）',
    description: '暖色系グラデーション',
    className: 'px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r',
    baseColors: {
      background: 'linear-gradient(to right, #EC4899, #F59E0B)',
      text: '#FFFFFF',
    },
    category: 'gradient',
  },
  {
    id: 'gradient-green-blue',
    name: 'グラデーション（緑→青）',
    description: '爽やかなグラデーション',
    className: 'px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r',
    baseColors: {
      background: 'linear-gradient(to right, #10B981, #3B82F6)',
      text: '#FFFFFF',
    },
    category: 'gradient',
  },

  // Special系（4種類）
  {
    id: 'special-neon',
    name: 'ネオングロー',
    description: '光るネオン効果',
    className: 'px-8 py-4 rounded-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all hover:scale-105',
    baseColors: {
      background: '#3B82F6',
      text: '#FFFFFF',
    },
    category: 'special',
  },
  {
    id: 'special-3d',
    name: '3Dボタン',
    description: '立体的なボタン',
    className: 'px-8 py-4 rounded-lg font-bold shadow-[0_6px_0_0_rgba(37,99,235,1)] hover:shadow-[0_4px_0_0_rgba(37,99,235,1)] active:shadow-[0_2px_0_0_rgba(37,99,235,1)] transition-all active:translate-y-1',
    baseColors: {
      background: '#3B82F6',
      text: '#FFFFFF',
    },
    category: 'special',
  },
  {
    id: 'special-glass',
    name: 'グラスモーフィズム',
    description: '透明感のあるガラス風',
    className: 'px-8 py-4 rounded-xl font-bold backdrop-blur-md border border-white/20 hover:border-white/40 transition-all hover:scale-105',
    baseColors: {
      background: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
    },
    category: 'special',
  },
  {
    id: 'special-animated',
    name: 'アニメーション矢印',
    description: '矢印が動くボタン',
    className: 'px-8 py-4 rounded-lg font-bold shadow-lg transition-all hover:scale-105 group flex items-center justify-center gap-2',
    baseColors: {
      background: '#3B82F6',
      text: '#FFFFFF',
      hover: '#2563EB',
    },
    category: 'special',
  },
];

/**
 * カテゴリ別にスタイルを取得
 */
export function getStylesByCategory(category: CTAStyle['category']) {
  return CTA_STYLES.filter((style) => style.category === category);
}

/**
 * スタイルIDでスタイルを取得
 */
export function getStyleById(styleId: string) {
  return CTA_STYLES.find((style) => style.id === styleId);
}

/**
 * カテゴリ一覧
 */
export const CTA_CATEGORIES = [
  { id: 'primary', name: 'プライマリー', icon: 'Primary' },
  { id: 'accent', name: 'アクセント', icon: 'Accent' },
  { id: 'outline', name: 'アウトライン', icon: '⚪' },
  { id: 'gradient', name: 'グラデーション', icon: 'Gradient' },
  { id: 'special', name: 'スペシャル', icon: '✨' },
];
