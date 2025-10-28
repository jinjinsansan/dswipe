export interface NoteCategoryOption {
  value: string;
  label: string;
  description?: string;
}

export const NOTE_CATEGORY_OPTIONS: NoteCategoryOption[] = [
  { value: 'business', label: 'ビジネス戦略' },
  { value: 'marketing', label: 'マーケティング' },
  { value: 'technology', label: 'テクノロジー' },
  { value: 'education', label: '教育・ノウハウ' },
  { value: 'finance', label: '資産形成・投資' },
  { value: 'mindset', label: 'マインドセット' },
  { value: 'lifestyle', label: 'ライフスタイル' },
  { value: 'community', label: 'コミュニティ運営' },
  { value: 'case-study', label: '事例・ケーススタディ' },
  { value: 'news', label: '最新トレンド' },
  { value: 'other', label: 'その他' },
];

export function getCategoryLabel(value: string): string {
  return NOTE_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
