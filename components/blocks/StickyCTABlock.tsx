'use client';

import React from 'react';
import { StickyCTABlockContent } from '@/types/templates';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface StickyCTABlockProps {
  content: StickyCTABlockContent;
  withinEditor?: boolean;
  productId?: string;
  onProductClick?: (productId: string) => void;
}

export default function StickyCTABlock({ content, withinEditor, productId, onProductClick }: StickyCTABlockProps) {
  const position = content.position || 'bottom';
  const themeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? 'power_blue';
  const theme = COLOR_THEMES[themeKey] ?? COLOR_THEMES.power_blue;
  const baseColor = content.backgroundColor || theme.background;
  const accentColor = content.buttonColor || theme.primary;
  const glowAccent = content.accentColor || theme.accent;
  const textColor = content.textColor || theme.text;
  const gradientBackground = `linear-gradient(135deg, ${glowAccent}19, ${baseColor})`;

  if (withinEditor) {
    return (
      <div className="relative w-full pointer-events-none" style={{ color: textColor }}>
        <div className="w-full px-0 pb-4">
          <div
            className="relative overflow-hidden w-full backdrop-blur-xl shadow-[0_18px_40px_-15px_rgba(0,0,0,0.45)]"
            style={{
              backgroundImage: gradientBackground,
              borderTop: `3px solid ${accentColor}`,
              borderLeft: `1px solid ${textColor}1A`,
              borderRight: `1px solid ${textColor}1A`,
              borderBottom: `1px solid ${textColor}1A`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at top right, ${glowAccent}1a, transparent 55%)`,
              }}
            />
            <div className="relative z-[1] flex items-center justify-between gap-4 flex-wrap px-5 py-4">
              {content.subText && (
                <div className="hidden md:block text-left">
                  <p className="text-lg font-semibold" style={{ color: content.descriptionColor || textColor }}>
                    {content.subText}
                  </p>
                </div>
              )}

              <div className="flex-1 md:flex-none md:min-w-[300px]">
                <div
                  className="w-full py-4 px-8 text-xl font-bold text-center shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${glowAccent})`,
                    color: '#FFFFFF',
                  }}
                >
                  {content.buttonText}
                </div>
              </div>

              {content.subText && (
                <div className="md:hidden w-full text-center text-sm" style={{ color: content.descriptionColor || textColor }}>
                  {content.subText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full px-0"
      style={{ color: textColor }}
    >
      <div
        className="relative overflow-hidden w-full backdrop-blur-xl shadow-[0_18px_40px_-15px_rgba(0,0,0,0.45)]"
        style={{
          backgroundImage: gradientBackground,
          backgroundColor: content.backgroundColor || '#111827',
          borderTop: `3px solid ${accentColor}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at top right, ${glowAccent}1a, transparent 55%)`,
          }}
        />
        <div className="relative z-[1] px-4 sm:px-5 py-3 sm:py-4">
          <div className="max-w-[min(1100px,95vw)] mx-auto flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-5">
            {content.subText && (
              <p
                className="w-full text-sm sm:text-base md:text-lg font-semibold text-center md:text-left"
                style={{ color: content.descriptionColor || textColor }}
              >
                {content.subText}
              </p>
            )}

            <button
              type="button"
              className="w-full md:w-auto min-w-[200px] py-3 sm:py-3.5 px-6 sm:px-8 text-base sm:text-lg font-bold transition-transform hover:scale-105 shadow-2xl rounded-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${glowAccent})`,
                color: '#FFFFFF',
              }}
              onClick={() => {
                if (productId && onProductClick) {
                  onProductClick(productId);
                }
              }}
            >
              {content.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
