export const viewerTheme = {
  colors: {
    background: '#050814',
    text: '#F8FAFC',
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceStrong: 'rgba(255, 255, 255, 0.14)',
    surfaceSoft: 'rgba(255, 255, 255, 0.06)',
    muted: 'rgba(248, 250, 252, 0.72)',
    accent: '#38BDF8',
    accentAlt: '#6366F1',
    positive: '#22C55E',
    warning: '#F97316',
    danger: '#F43F5E',
    divider: 'rgba(148, 163, 184, 0.24)',
  },
  radii: {
    md: '0.875rem',
    lg: '1.25rem',
  },
  shadows: {
    card: '0 24px 48px rgba(5, 8, 20, 0.35)',
    soft: '0 12px 24px rgba(8, 11, 25, 0.25)',
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

export function resolveSectionColors(content?: Partial<{ backgroundColor?: string; textColor?: string }>) {
  return {
    backgroundColor: content?.backgroundColor ?? viewerTheme.colors.background,
    textColor: content?.textColor ?? viewerTheme.colors.text,
  };
}

export function surfaceStyle(version: 'soft' | 'base' | 'strong' = 'base') {
  const map = {
    soft: viewerTheme.colors.surfaceSoft,
    base: viewerTheme.colors.surface,
    strong: viewerTheme.colors.surfaceStrong,
  } as const;

  return {
    backgroundColor: map[version],
    borderRadius: viewerTheme.radii.lg,
    boxShadow: viewerTheme.shadows.soft,
  };
}

export function dividerStyle() {
  return {
    backgroundColor: viewerTheme.colors.divider,
  };
}
