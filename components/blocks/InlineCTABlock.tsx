'use client';

import React from 'react';
import Link from 'next/link';
import { InlineCTABlockContent } from '@/types/templates';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface InlineCTABlockProps {
  content: InlineCTABlockContent;
  withinEditor?: boolean;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

const resolveTheme = (key?: string) => {
  const typedKey = (key as ColorThemeKey) ?? 'power_blue';
  return COLOR_THEMES[typedKey] ?? COLOR_THEMES.power_blue;
};

export default function InlineCTABlock({ content, withinEditor, productId, onProductClick }: InlineCTABlockProps) {
  const theme = resolveTheme(content.themeKey);
  const background = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accent = content.accentColor || theme.accent;
  const buttonColor = content.buttonColor || theme.primary;
  const descriptionColor = content.descriptionColor || `${textColor}CC`;

  const commonButtonStyle = {
    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${accent})`,
    color: '#FFFFFF',
    boxShadow: `0 20px 36px -20px ${buttonColor}73`,
  } as const;

  const renderButton = () => {
    const label = content.buttonText || '今すぐ申し込む';

    if (withinEditor) {
      return (
        <div className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold" style={commonButtonStyle}>
          {label}
        </div>
      );
    }

    if (onProductClick) {
      return (
        <button
          type="button"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg transition-transform hover:scale-[1.03]"
          style={commonButtonStyle}
          onClick={() => onProductClick(productId)}
        >
          {label}
        </button>
      );
    }

    if (content.buttonUrl && content.buttonUrl.trim().length > 0) {
      const isExternal = /^https?:/i.test(content.buttonUrl.trim());
      return (
        <Link
          href={content.buttonUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg transition-transform hover:scale-[1.03]"
          style={commonButtonStyle}
        >
          {label}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold opacity-70 cursor-not-allowed"
        style={commonButtonStyle}
        disabled
      >
        {label}
      </button>
    );
  };

  return (
    <section
      className="relative w-full px-4 sm:px-6 lg:px-10 py-10 sm:py-12 lg:py-16"
      style={{
        background,
        color: textColor,
        backgroundImage: `radial-gradient(circle at top right, ${accent}1f, transparent 50%)`,
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
        {content.subText && (
          <span className="text-xs sm:text-sm uppercase tracking-[0.35em] font-semibold" style={{ color: accent }}>
            {content.subText}
          </span>
        )}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
            {content.title || '次のスワイプが、成果への扉を開きます'}
          </h2>
          {content.subtitle && (
            <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto" style={{ color: descriptionColor }}>
              {content.subtitle}
            </p>
          )}
        </div>
        <div className="mt-4">{renderButton()}</div>
      </div>
    </section>
  );
}

