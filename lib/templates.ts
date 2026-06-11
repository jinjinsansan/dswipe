import type { TemplateBlock, TemplateThemeKey } from '@/types/templates';

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
  /* D-Swipe標準テーマ。新規LP/ブロックの既定。高彩度テーマは強調用に残置 */
  momentum: {
    primary: '#0284C7',
    secondary: '#0EA5E9',
    accent: '#22D3EE',
    background: '#0B1F3A',
    text: '#FFFFFF',
    name: 'Momentum',
    description: 'D-Swipe標準。ネイビー×シアンの信頼感',
  },
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

export const TEMPLATE_CATEGORIES = [
  { id: 'header', name: 'ヒーロー', icon: 'Hero' },
  { id: 'content', name: 'コンテンツ', icon: 'Content' },
  { id: 'conversion', name: 'コンバージョン', icon: 'Conversion' },
  { id: 'trust', name: '信頼・実績', icon: 'Trust' },
  { id: 'urgency', name: '緊急性', icon: 'Urgency' },
  { id: 'handwritten', name: '手書き風', icon: 'Handwritten' },
] as const;

type TemplatesDataModule = typeof import('./templates.data');

let templatesModulePromise: Promise<TemplatesDataModule> | null = null;
let cachedBundle: TemplateDataBundle | null = null;
let cachedAllTemplates: TemplateBlock[] | null = null;

function importTemplatesModule(): Promise<TemplatesDataModule> {
  if (!templatesModulePromise) {
    templatesModulePromise = import('./templates.data');
  }
  return templatesModulePromise;
}

export type TemplateDataBundle = {
  templateLibrary: TemplateBlock[];
  infoProductBlocks: TemplateBlock[];
  contactBlocks: TemplateBlock[];
  tokushoBlocks: TemplateBlock[];
  newsletterBlocks: TemplateBlock[];
  handwrittenBlocks: TemplateBlock[];
};

function mapModuleToBundle(mod: TemplatesDataModule): TemplateDataBundle {
  return {
    templateLibrary: mod.TEMPLATE_LIBRARY,
    infoProductBlocks: mod.INFO_PRODUCT_BLOCKS,
    contactBlocks: mod.CONTACT_BLOCKS,
    tokushoBlocks: mod.TOKUSHO_BLOCKS,
    newsletterBlocks: mod.NEWSLETTER_BLOCKS,
    handwrittenBlocks: mod.HANDWRITTEN_BLOCKS,
  };
}

async function ensureBundle(): Promise<TemplateDataBundle> {
  if (cachedBundle) {
    return cachedBundle;
  }
  const mod = await importTemplatesModule();
  cachedBundle = mapModuleToBundle(mod);
  return cachedBundle;
}

function getAllFromBundle(bundle: TemplateDataBundle): TemplateBlock[] {
  if (!cachedAllTemplates) {
    cachedAllTemplates = [
      ...bundle.templateLibrary,
      ...bundle.infoProductBlocks,
      ...bundle.contactBlocks,
      ...bundle.tokushoBlocks,
      ...bundle.newsletterBlocks,
      ...bundle.handwrittenBlocks,
    ];
  }
  return cachedAllTemplates;
}

export async function loadTemplateBundle(): Promise<TemplateDataBundle> {
  return ensureBundle();
}

export async function getTemplatesByCategory(category: string): Promise<TemplateBlock[]> {
  const bundle = await ensureBundle();
  return getAllFromBundle(bundle).filter((template) => template.category === category);
}

export async function getTemplateById(templateId: string): Promise<TemplateBlock | undefined> {
  const bundle = await ensureBundle();
  return getAllFromBundle(bundle).find((template) => template.templateId === templateId);
}

export async function getTemplateByUniqueId(templateUniqueId: string): Promise<TemplateBlock | undefined> {
  const bundle = await ensureBundle();
  return getAllFromBundle(bundle).find((template) => template.id === templateUniqueId);
}

export async function getAllTemplates(): Promise<TemplateBlock[]> {
  const bundle = await ensureBundle();
  return getAllFromBundle(bundle);
}

/* ブロックライブラリの表示制御（Phase4b）
   旧素材はデータとして温存しつつ（既存LPのID参照・各種フローを壊さない）、
   ライブラリには Momentum 素材＋Momentum版が無い機能系ブロックのみを表示する。
   旧素材を復活させたい場合はこのリストに id を足すだけでよい。 */
const LIBRARY_EXTRA_VISIBLE_IDS = new Set<string>([
  'top-media-spotlight-default', // メディア(画像+解説)
  'top-image-plain-minimal',     // 画像のみ
  'top-flex-neutral',            // 自由ブロック
  'top-contact-line',            // お問い合わせ
  'top-tokusho-modern',          // 特定商取引法
  'top-newsletter-blue',         // ニュースレター登録
]);

export function isLibraryVisibleTemplate(template: TemplateBlock): boolean {
  /* 手書き風シリーズは旧デザインではなく独立した作風のため表示を維持 */
  if (template.category === 'handwritten') return true;
  return template.id.startsWith('momentum-') || LIBRARY_EXTRA_VISIBLE_IDS.has(template.id);
}

/** ブロック選択モーダル用: 表示対象の素材のみ返す */
export async function getLibraryTemplates(): Promise<TemplateBlock[]> {
  const all = await getAllTemplates();
  return all.filter(isLibraryVisibleTemplate);
}
