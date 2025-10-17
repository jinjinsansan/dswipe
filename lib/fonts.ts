export type FontKey =
  | 'system'
  | 'sans'
  | 'serif'
  | 'rounded'
  | 'mono';

export interface FontOption {
  key: FontKey;
  label: string;
  stack: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'system',
    label: '標準 (スマートマッチ)',
    stack: 'Inter, "Noto Sans JP", "Helvetica Neue", Arial, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    key: 'sans',
    label: 'サンセリフ (スッキリ)',
    stack: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Helvetica Neue", Arial, sans-serif',
  },
  {
    key: 'serif',
    label: 'セリフ (クラシック)',
    stack: '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "Times New Roman", serif',
  },
  {
    key: 'rounded',
    label: '丸ゴシック (柔らかい)',
    stack: '"Zen Maru Gothic", "Rounded Mplus 1c", "Hiragino Maru Gothic ProN", "Arial Rounded MT", sans-serif',
  },
  {
    key: 'mono',
    label: '等幅 (テック)',
    stack: '"Roboto Mono", "Fira Code", "Source Code Pro", "Courier New", monospace',
  },
];

export const DEFAULT_FONT_KEY: FontKey = 'system';

const FONT_STACK_MAP: Record<FontKey, string> = FONT_OPTIONS.reduce(
  (acc, option) => {
    acc[option.key] = option.stack;
    return acc;
  },
  {} as Record<FontKey, string>,
);

export function getFontStack(fontKey?: string | null): string | undefined {
  if (!fontKey) {
    return FONT_STACK_MAP[DEFAULT_FONT_KEY];
  }
  if (fontKey in FONT_STACK_MAP) {
    return FONT_STACK_MAP[fontKey as FontKey];
  }
  return fontKey;
}
