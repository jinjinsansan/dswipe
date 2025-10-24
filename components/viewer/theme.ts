import type { TemplateThemeKey } from '@/types/templates';

type ViewerPalette = {
  name: string;
  background: string;
  backgroundGlow: string;
  surface: string;
  surfaceStrong: string;
  surfaceSoft: string;
  overlay: string;
  overlaySoft: string;
  accent: string;
  accentAlt: string;
  accentSoft: string;
  text: string;
  muted: string;
  divider: string;
  border: string;
};

const viewerPalettes: Record<string, ViewerPalette> = {
  default: {
    name: 'Nebula Indigo',
    background: 'linear-gradient(145deg, #050814 0%, #0b1120 35%, #111827 100%)',
    backgroundGlow: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.26), rgba(5, 8, 20, 0))',
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceStrong: 'rgba(255, 255, 255, 0.14)',
    surfaceSoft: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(56, 189, 248, 0.18)',
    overlaySoft: 'rgba(56, 189, 248, 0.12)',
    accent: '#38BDF8',
    accentAlt: '#6366F1',
    accentSoft: 'rgba(99, 102, 241, 0.35)',
    text: '#F8FAFC',
    muted: 'rgba(241, 245, 249, 0.76)',
    divider: 'rgba(148, 163, 184, 0.24)',
    border: 'rgba(99, 102, 241, 0.4)',
  },
  urgent_red: {
    name: 'Crimson Pulse',
    background: 'linear-gradient(145deg, #18030a 0%, #24040f 40%, #320511 100%)',
    backgroundGlow: 'radial-gradient(circle at 80% 20%, rgba(248, 113, 113, 0.32), rgba(24, 3, 10, 0))',
    surface: 'rgba(255, 92, 92, 0.16)',
    surfaceStrong: 'rgba(255, 92, 92, 0.22)',
    surfaceSoft: 'rgba(255, 92, 92, 0.1)',
    overlay: 'rgba(248, 113, 113, 0.28)',
    overlaySoft: 'rgba(248, 113, 113, 0.16)',
    accent: '#F43F5E',
    accentAlt: '#FB7185',
    accentSoft: 'rgba(244, 63, 94, 0.38)',
    text: '#FEE2E2',
    muted: 'rgba(254, 226, 226, 0.72)',
    divider: 'rgba(251, 191, 185, 0.32)',
    border: 'rgba(248, 113, 113, 0.45)',
  },
  energy_orange: {
    name: 'Solar Burst',
    background: 'linear-gradient(160deg, #1a0b02 0%, #2b0d02 35%, #3b1606 100%)',
    backgroundGlow: 'radial-gradient(circle at 15% 15%, rgba(249, 115, 22, 0.3), rgba(26, 11, 2, 0))',
    surface: 'rgba(251, 146, 60, 0.18)',
    surfaceStrong: 'rgba(251, 146, 60, 0.24)',
    surfaceSoft: 'rgba(251, 146, 60, 0.12)',
    overlay: 'rgba(251, 146, 60, 0.26)',
    overlaySoft: 'rgba(249, 115, 22, 0.16)',
    accent: '#F97316',
    accentAlt: '#FACC15',
    accentSoft: 'rgba(250, 204, 21, 0.45)',
    text: '#FFEBD7',
    muted: 'rgba(255, 237, 213, 0.76)',
    divider: 'rgba(253, 186, 116, 0.32)',
    border: 'rgba(249, 115, 22, 0.5)',
  },
  gold_premium: {
    name: 'Imperial Alloy',
    background: 'linear-gradient(150deg, #130d03 0%, #1f1405 40%, #341f0b 100%)',
    backgroundGlow: 'radial-gradient(circle at 85% 25%, rgba(217, 119, 6, 0.3), rgba(19, 13, 3, 0))',
    surface: 'rgba(217, 119, 6, 0.16)',
    surfaceStrong: 'rgba(217, 119, 6, 0.22)',
    surfaceSoft: 'rgba(217, 119, 6, 0.1)',
    overlay: 'rgba(234, 179, 8, 0.32)',
    overlaySoft: 'rgba(202, 138, 4, 0.18)',
    accent: '#FBBF24',
    accentAlt: '#F59E0B',
    accentSoft: 'rgba(234, 179, 8, 0.45)',
    text: '#FEF3C7',
    muted: 'rgba(254, 243, 199, 0.76)',
    divider: 'rgba(245, 208, 54, 0.32)',
    border: 'rgba(234, 179, 8, 0.36)',
  },
  power_blue: {
    name: 'Azure Circuit',
    background: 'linear-gradient(150deg, #030916 0%, #07132a 35%, #0b1c3c 100%)',
    backgroundGlow: 'radial-gradient(circle at 20% 25%, rgba(59, 130, 246, 0.32), rgba(3, 9, 22, 0))',
    surface: 'rgba(59, 130, 246, 0.18)',
    surfaceStrong: 'rgba(37, 99, 235, 0.26)',
    surfaceSoft: 'rgba(59, 130, 246, 0.12)',
    overlay: 'rgba(96, 165, 250, 0.3)',
    overlaySoft: 'rgba(96, 165, 250, 0.18)',
    accent: '#60A5FA',
    accentAlt: '#38BDF8',
    accentSoft: 'rgba(96, 165, 250, 0.42)',
    text: '#E2E8F0',
    muted: 'rgba(226, 232, 240, 0.76)',
    divider: 'rgba(96, 165, 250, 0.34)',
    border: 'rgba(37, 99, 235, 0.38)',
  },
  passion_pink: {
    name: 'Neon Bloom',
    background: 'linear-gradient(150deg, #170213 0%, #24031d 40%, #380430 100%)',
    backgroundGlow: 'radial-gradient(circle at 75% 25%, rgba(244, 114, 182, 0.32), rgba(23, 2, 19, 0))',
    surface: 'rgba(244, 114, 182, 0.18)',
    surfaceStrong: 'rgba(236, 72, 153, 0.24)',
    surfaceSoft: 'rgba(244, 114, 182, 0.1)',
    overlay: 'rgba(236, 72, 153, 0.3)',
    overlaySoft: 'rgba(244, 114, 182, 0.18)',
    accent: '#F472B6',
    accentAlt: '#EC4899',
    accentSoft: 'rgba(236, 72, 153, 0.38)',
    text: '#FCE7F3',
    muted: 'rgba(252, 231, 243, 0.76)',
    divider: 'rgba(244, 114, 182, 0.34)',
    border: 'rgba(244, 114, 182, 0.42)',
  },
};

export const viewerTheme = {
  base: viewerPalettes.default,
  palettes: viewerPalettes,
  radii: {
    md: '0.875rem',
    lg: '1.25rem',
    full: '999px',
  },
  shadows: {
    card: '0 24px 48px rgba(5, 8, 20, 0.35)',
    soft: '0 12px 24px rgba(8, 11, 25, 0.25)',
    glow: '0 0 48px rgba(56, 189, 248, 0.28)',
  },
  typography: {
    heading: {
      letterSpacing: '-0.01em',
    },
    body: {
      letterSpacing: '0',
    },
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.trim().replace('#', '');
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return `rgba(56, 189, 248, ${alpha})`;
  }

  const value = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized;

  const int = parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createAccentPalette(accent: string): ViewerPalette {
  const base = viewerPalettes.default;
  return {
    name: `Custom ${accent}`,
    background: base.background,
    backgroundGlow: `radial-gradient(circle at 20% 20%, ${hexToRgba(accent, 0.35)}, rgba(5, 8, 20, 0))`,
    surface: base.surface,
    surfaceStrong: base.surfaceStrong,
    surfaceSoft: base.surfaceSoft,
    overlay: hexToRgba(accent, 0.28),
    overlaySoft: hexToRgba(accent, 0.16),
    accent,
    accentAlt: accent,
    accentSoft: hexToRgba(accent, 0.35),
    text: base.text,
    muted: base.muted,
    divider: hexToRgba(accent, 0.32),
    border: hexToRgba(accent, 0.36),
  };
}

export function resolveViewerPalette(themeKey?: TemplateThemeKey | string, accentColor?: string): ViewerPalette {
  if (themeKey && viewerPalettes[themeKey]) {
    return viewerPalettes[themeKey];
  }

  if (accentColor) {
    return createAccentPalette(accentColor);
  }

  return viewerPalettes.default;
}

export function resolveSectionColors(
  content?: Partial<{
    backgroundColor?: string;
    textColor?: string;
    themeKey?: TemplateThemeKey | string;
    accentColor?: string;
  }>,
) {
  const palette = resolveViewerPalette(content?.themeKey, content?.accentColor);

  return {
    palette,
    backgroundColor: content?.backgroundColor ?? palette.background,
    textColor: content?.textColor ?? palette.text,
  };
}

export function surfaceStyle(
  version: 'soft' | 'base' | 'strong' = 'base',
  palette: ViewerPalette = viewerPalettes.default,
) {
  const map = {
    soft: palette.surfaceSoft,
    base: palette.surface,
    strong: palette.surfaceStrong,
  } as const;

  return {
    backgroundColor: map[version],
    borderRadius: viewerTheme.radii.lg,
    boxShadow: viewerTheme.shadows.soft,
    border: `1px solid ${palette.border}`,
  };
}

export function dividerStyle(palette: ViewerPalette = viewerPalettes.default) {
  return {
    backgroundColor: palette.divider,
  };
}
