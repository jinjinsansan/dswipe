'use client';

import React from 'react';
import { StickyCTABlockContent } from '@/types/templates';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface StickyCTABlockProps {
  content: StickyCTABlockContent;
  withinEditor?: boolean;
}

export default function StickyCTABlock({ content, withinEditor }: StickyCTABlockProps) {
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
            className="relative overflow-hidden w-full border border-white/10 backdrop-blur-xl shadow-[0_18px_40px_-15px_rgba(0,0,0,0.45)] rounded-2xl"
            style={{
              backgroundImage: gradientBackground,
              borderTop: `3px solid ${accentColor}`,
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
                  <p className="text-lg font-semibold text-gray-300">
                    {content.subText}
                  </p>
                </div>
              )}

              <div className="flex-1 md:flex-none md:min-w-[300px]">
                <div
                  className="w-full py-4 px-8 rounded-lg text-xl font-bold text-center shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${glowAccent})`,
                    color: '#FFFFFF',
                  }}
                >
                  {content.buttonText}
                </div>
              </div>

              {content.subText && (
                <div className="md:hidden w-full text-center text-sm text-gray-400">
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
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50`}
      style={{ color: textColor }}
    >
      <div
        className="w-full px-0 pb-4"
        style={{ paddingTop: position === 'top' ? '1rem' : '1.75rem' }}
      >
        <div
          className="relative overflow-hidden w-full border-t border-white/15 bg-gray-900/90 backdrop-blur-xl shadow-[0_18px_40px_-15px_rgba(0,0,0,0.45)]"
          style={{
            backgroundImage: gradientBackground,
            borderTop: `3px solid ${accentColor}`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at top right, ${glowAccent}1a, transparent 55%)`,
            }}
          />
          <div className="relative z-[1] flex items-center justify-between gap-4 flex-wrap px-5 py-4">
          {/* サブテキスト */}
          {content.subText && (
            <div className="hidden md:block">
              <p className="text-lg font-semibold text-gray-300">
                {content.subText}
              </p>
            </div>
          )}

          {/* CTAボタン */}
          <button
            className="flex-1 md:flex-none md:min-w-[300px] py-4 px-8 rounded-xl text-xl font-bold transition-transform hover:scale-105 shadow-2xl animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${glowAccent})`,
              color: '#FFFFFF',
            }}
          >
            {content.buttonText}
          </button>

          {/* モバイル用サブテキスト */}
          {content.subText && (
            <div className="md:hidden w-full text-center text-sm text-gray-400">
              {content.subText}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
