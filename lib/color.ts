export interface RGB {
  r: number;
  g: number;
  b: number;
}

const HEX_SHORT_REGEX = /^#([0-9a-fA-F]{3})$/;
const HEX_LONG_REGEX = /^#([0-9a-fA-F]{6})$/;
const RGB_REGEX = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/;

function expandShortHex(hex: string): string {
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseHexColor(color: string): RGB | null {
  const trimmed = color.trim();
  if (HEX_SHORT_REGEX.test(trimmed)) {
    return parseHexColor(expandShortHex(trimmed));
  }

  const match = trimmed.match(HEX_LONG_REGEX);
  if (!match) return null;

  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
}

function parseRgbColor(color: string): RGB | null {
  const match = color.trim().match(RGB_REGEX);
  if (!match) return null;

  const r = clamp(Number(match[1]), 0, 255);
  const g = clamp(Number(match[2]), 0, 255);
  const b = clamp(Number(match[3]), 0, 255);

  return { r, g, b };
}

function parseColor(color: string | undefined | null): RGB | null {
  if (!color) return null;
  return parseHexColor(color) ?? parseRgbColor(color);
}

export function withAlpha(color: string | undefined, alpha: number, fallback = '#0F172A'): string {
  const clampedAlpha = clamp(alpha, 0, 1);
  const base = parseColor(color) ?? parseColor(fallback) ?? { r: 15, g: 23, b: 42 };
  return `rgba(${base.r}, ${base.g}, ${base.b}, ${clampedAlpha})`;
}

export function getContrastColor(
  color: string | undefined,
  lightFallback = '#F8FAFC',
  darkFallback = '#0F172A'
): string {
  const rgb = parseColor(color);
  if (!rgb) return lightFallback;

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.6 ? darkFallback : lightFallback;
}

export function mixWith(color: string | undefined, mixColor: string, weight: number): string {
  const base = parseColor(color) ?? parseColor('#0F172A') ?? { r: 15, g: 23, b: 42 };
  const mix = parseColor(mixColor) ?? { r: 255, g: 255, b: 255 };

  const clampedWeight = clamp(weight, 0, 1);
  const r = Math.round(base.r * (1 - clampedWeight) + mix.r * clampedWeight);
  const g = Math.round(base.g * (1 - clampedWeight) + mix.g * clampedWeight);
  const b = Math.round(base.b * (1 - clampedWeight) + mix.b * clampedWeight);

  return `rgb(${r}, ${g}, ${b})`;
}
