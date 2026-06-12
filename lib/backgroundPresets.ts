/* ブロック背景プリセット — mock: design_handoff_dswipe/editor/editor-blocks.jsx BG_PRESETS。
   TOPページと同じ「光の差すネイビー」等の多層グラデーションをワンクリックで適用する。
   base はグラデ非対応コンテキスト(サムネイル等)向けの近似単色フォールバック。
   textColor/accentColor は選択時に推奨される文字色ペア。 */

export type BackgroundPresetKey = 'navy' | 'cyan' | 'teal' | 'deep' | 'aurora' | 'light';

export interface BackgroundPreset {
  key: BackgroundPresetKey;
  label: string;
  css: string;
  base: string;
  light: boolean;
  textColor: string;
  accentColor: string;
}

export const BACKGROUND_PRESETS: Record<BackgroundPresetKey, BackgroundPreset> = {
  navy: {
    key: 'navy',
    label: 'ネイビー（シアンの光）',
    css: 'radial-gradient(360px 220px at 70% 12%, rgba(34,211,238,.3), transparent 60%), linear-gradient(165deg,#0b1f3a 0%,#0e5d80 130%)',
    base: '#0B1F3A',
    light: false,
    textColor: '#FFFFFF',
    accentColor: '#22D3EE',
  },
  cyan: {
    key: 'cyan',
    label: 'シアングラデ',
    css: 'linear-gradient(150deg,#0284c7,#06b6d4)',
    base: '#0284C7',
    light: false,
    textColor: '#FFFFFF',
    accentColor: '#E0F2FE',
  },
  teal: {
    key: 'teal',
    label: 'ティール→ネイビー',
    css: 'linear-gradient(170deg,#0e7490,#0b1f3a)',
    base: '#0E7490',
    light: false,
    textColor: '#FFFFFF',
    accentColor: '#22D3EE',
  },
  deep: {
    key: 'deep',
    label: 'ディープネイビー',
    css: 'linear-gradient(170deg,#111a2e,#0b1220)',
    base: '#0B1220',
    light: false,
    textColor: '#F8FAFC',
    accentColor: '#22D3EE',
  },
  aurora: {
    key: 'aurora',
    label: 'オーロラ（琥珀の光）',
    css: 'radial-gradient(280px 200px at 50% 0%, rgba(245,158,11,.2), transparent 60%), linear-gradient(170deg,#0b1f3a,#07142a)',
    base: '#0B1F3A',
    light: false,
    textColor: '#FFFFFF',
    accentColor: '#F59E0B',
  },
  light: {
    key: 'light',
    label: 'ライト',
    css: '#f4f8fd',
    base: '#F4F8FD',
    light: true,
    textColor: '#0B1F3A',
    accentColor: '#0284C7',
  },
};

export const BACKGROUND_PRESET_ORDER: BackgroundPresetKey[] = ['navy', 'cyan', 'teal', 'deep', 'aurora', 'light'];

export const getBackgroundPreset = (key?: string | null): BackgroundPreset | null => {
  if (!key) return null;
  return BACKGROUND_PRESETS[key as BackgroundPresetKey] ?? null;
};
