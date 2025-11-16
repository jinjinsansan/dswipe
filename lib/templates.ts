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
