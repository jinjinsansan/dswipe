import type { CSSProperties } from 'react';
import type { BaseBlockContent } from '@/types/templates';

type BackgroundStyleMode = 'auto' | 'none' | 'color' | 'image';

const resolveMode = (content?: BaseBlockContent): BackgroundStyleMode => {
  if (!content) return 'auto';
  if (content.backgroundStyle) return content.backgroundStyle;
  if (content.backgroundImageUrl) return 'image';
  if (content.backgroundColor) return 'color';
  return 'auto';
};

const resolveFallbackColor = (content?: BaseBlockContent, fallbackColor?: string) => {
  if (content?.backgroundColor) return content.backgroundColor;
  if (fallbackColor) return fallbackColor;
  return undefined;
};

export const getBlockBackgroundStyle = (
  content?: BaseBlockContent,
  fallbackColor?: string,
): CSSProperties => {
  const style: CSSProperties = {};
  const mode = resolveMode(content);
  const backgroundColor = resolveFallbackColor(content, fallbackColor);

  if (mode === 'none') {
    style.backgroundColor = 'transparent';
    return style;
  }

  if (mode === 'image' && content?.backgroundImageUrl) {
    style.backgroundImage = `url(${content.backgroundImageUrl})`;
    const modeSetting = content.backgroundImageMode ?? 'cover';
    if (modeSetting === 'repeat') {
      style.backgroundRepeat = 'repeat';
      style.backgroundSize = 'auto';
    } else {
      style.backgroundRepeat = 'no-repeat';
      style.backgroundSize = modeSetting === 'contain' ? 'contain' : 'cover';
    }
    style.backgroundPosition = content.backgroundImagePosition ?? 'center';
    style.backgroundColor = backgroundColor ?? '#FFFFFF';
    return style;
  }

  if (mode === 'color') {
    style.backgroundColor = backgroundColor ?? '#FFFFFF';
    return style;
  }

  if (mode === 'auto') {
    if (backgroundColor) {
      style.backgroundColor = backgroundColor;
    }
  }

  return style;
};

export const shouldRenderBackgroundOverlay = (content?: BaseBlockContent) => {
  if (!content) return false;
  if (!content.backgroundImageUrl) return false;
  const mode = resolveMode(content);
  if (mode !== 'image') return false;
  const opacity = content.backgroundImageOverlayOpacity ?? 0;
  return opacity > 0;
};

export const getBackgroundOverlayStyle = (content?: BaseBlockContent): CSSProperties => {
  if (!content) return { opacity: 0 };
  const opacity = Math.min(Math.max(content.backgroundImageOverlayOpacity ?? 0, 0), 1);
  const overlayColor = content.backgroundImageOverlayColor ?? '#0F172A';
  return {
    backgroundColor: overlayColor,
    opacity,
  };
};
