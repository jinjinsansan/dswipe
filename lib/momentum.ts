/* Momentum デザイントークン（共有）
   各ページに散在していたグラデーション/フォールバック配色の単一ソース。
   仕様: design_handoff_dswipe/c-system/tokens.css（gitignore・ローカル参照） */

/** ブランドグラデーション（btn-primary / KPIアイコン / バッジ） */
export const GRAD_BRAND = 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)';

/** ネイビーカード/CTAパネル背景 */
export const NAVY_CARD_BG = 'linear-gradient(160deg, #0b1f3a, #0f2c52)';

/** 公開ページのネイビーヒーローヘッダー背景 */
export const HEAD_BG =
  'radial-gradient(700px 320px at 80% -30%, #0e7490 0%, transparent 60%), linear-gradient(150deg, #0b1f3a, #0f2c52)';

/** サムネイル未設定時のフォールバック背景（idハッシュで選択） */
export const THUMB_FALLBACKS = [
  'linear-gradient(150deg,#0b1f3a,#0e7490)',
  'linear-gradient(150deg,#0284c7,#06b6d4)',
  'linear-gradient(150deg,#0e7490,#22d3ee)',
  'linear-gradient(150deg,#1b3a61,#0284c7)',
  'linear-gradient(150deg,#0f2c52,#0e7490)',
  'linear-gradient(150deg,#0b1f3a,#1b3a61)',
];

/** アバターイニシャル背景（ユーザー名ハッシュで選択） */
export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#22d3ee,#0284c7)',
  'linear-gradient(135deg,#16a34a,#22d3ee)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#0ea5e9,#22d3ee)',
  'linear-gradient(135deg,#7c3aed,#0284c7)',
];

export const hashIndex = (value: string, mod: number) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return mod > 0 ? h % mod : 0;
};

export const pickThumbFallback = (seed: string) => THUMB_FALLBACKS[hashIndex(seed, THUMB_FALLBACKS.length)];

export const pickAvatarGradient = (seed: string) => AVATAR_GRADIENTS[hashIndex(seed, AVATAR_GRADIENTS.length)];
