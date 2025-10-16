/**
 * RGB色からTailwind CSS互換の11段階シェードを生成
 * Kigen.design のようなカラージェネレーター
 */

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

// HEX を RGB に変換
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// RGB を HEX に変換
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
}

// RGB を HSL に変換
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// HSL を RGB に変換
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * RGB から11段階のシェードを生成
 * Tailwind CSS の 50, 100, 200...900, 950 に対応
 */
export function generateColorShades(r: number, g: number, b: number): ColorShades {
  const hsl = rgbToHsl(r, g, b);
  
  // ベースの lightness をシェード500とする
  const baseLightness = hsl.l;

  // 各シェードの lightness 値（Tailwindに準拠）
  const shadeMap: Record<number, number> = {
    50: 97,   // 最も明るい
    100: 94,
    200: 86,
    300: 77,
    400: 64,
    500: baseLightness, // ベースカラー
    600: Math.max(baseLightness - 15, 25),
    700: Math.max(baseLightness - 28, 18),
    800: Math.max(baseLightness - 38, 12),
    900: Math.max(baseLightness - 48, 6),
    950: 3,   // 最も暗い
  };

  const shades: ColorShades = {} as ColorShades;

  (Object.keys(shadeMap).map(Number) as Array<keyof ColorShades>).forEach((key) => {
    const targetLightness = shadeMap[key as number];
    const rgb = hslToRgb(hsl.h, hsl.s, targetLightness);
    shades[key] = rgbToHex(rgb.r, rgb.g, rgb.b);
  });

  return shades;
}

/**
 * RGB 文字列（#RRGGBB）からシェードを生成
 */
export function generateShadesFromHex(hex: string): ColorShades {
  const rgb = hexToRgb(hex);
  return generateColorShades(rgb.r, rgb.g, rgb.b);
}

/**
 * RGB オブジェクトからシェードを生成
 */
export function generateShadesFromRgb(rgb: RGBColor): ColorShades {
  return generateColorShades(rgb.r, rgb.g, rgb.b);
}
