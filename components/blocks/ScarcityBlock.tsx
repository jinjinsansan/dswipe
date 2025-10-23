'use client';

import React from 'react';
import { ExclamationTriangleIcon, FireIcon } from '@heroicons/react/24/outline';
import { ScarcityBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface ScarcityBlockProps {
  content: ScarcityBlockContent;
}

export default function ScarcityBlock({ content }: ScarcityBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "urgent_red";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.urgent_red;
  
  const backgroundColor = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accentColor = content.accentColor || theme.accent;
  const primaryColor = theme.primary;

  const percentage = content.totalCount && content.remainingCount
    ? ((content.totalCount - content.remainingCount) / content.totalCount) * 100
    : 0;

  const blurOverlayStyle = {
    background: `radial-gradient(140% 140% at 50% 120%, ${primaryColor}22 0%, rgba(8,11,25,0) 70%)`,
  } as const;

  const gradientToneMap: Record<ColorThemeKey, Parameters<typeof GradientHeading>[0]["tone"]> = {
    urgent_red: "crimson",
    energy_orange: "magenta",
    gold_premium: "gold",
    power_blue: "aqua",
    passion_pink: "magenta",
  } as const;

  const headingTone = gradientToneMap[resolvedThemeKey] ?? "crimson";

  return (
    <Section
      tone="none"
      padding="condensed"
      className="transform origin-center pt-9 pb-8 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:scale-[0.98] xl:scale-100 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Background blur effects */}
      <div className="absolute inset-0 opacity-80 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] bottom-[-40%] h-[160%] blur-[160px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-4xl mx-auto space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          {content.title && (
            <GradientHeading 
              as="h2" 
              tone={headingTone}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            >
              {content.title}
            </GradientHeading>
          )}
        </div>

        {/* Scarcity Card */}
        <SurfaceCard
          variant="glass"
          glow
          className="px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14"
        >
          <GlowHighlight
            className="top-[-30%] h-3/4 opacity-60"
            intensity="strong"
            style={{ background: `linear-gradient(135deg, ${accentColor}30, ${primaryColor}20)` }}
          />

          <div className="relative space-y-6 sm:space-y-8">
            {/* Message */}
            {content.message && (
              <p 
                className="text-lg sm:text-xl md:text-2xl text-center font-medium"
                style={{ color: `${textColor}CC` }}
              >
                {content.message}
              </p>
            )}

            {/* Remaining Count Display */}
            {content.remainingCount !== undefined && (
              <div className="text-center space-y-4 sm:space-y-5 md:space-y-6">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-full border-2"
                    style={{
                      backgroundColor: `${primaryColor}1a`,
                      borderColor: `${primaryColor}50`,
                    }}
                  >
                    <FireIcon 
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 animate-pulse" 
                      style={{ color: accentColor }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-base sm:text-lg md:text-xl font-bold"
                      style={{ color: accentColor }}
                    >
                      残りわずか
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span 
                      className="text-xl sm:text-2xl md:text-3xl font-medium"
                      style={{ color: `${textColor}CC` }}
                    >
                      残り
                    </span>
                    <span 
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tabular-nums"
                      style={{ color: accentColor }}
                    >
                      {content.remainingCount}
                    </span>
                    <span 
                      className="text-xl sm:text-2xl md:text-3xl font-medium"
                      style={{ color: `${textColor}CC` }}
                    >
                      名
                    </span>
                  </div>
                  
                  {content.totalCount && (
                    <p 
                      className="text-base sm:text-lg md:text-xl"
                      style={{ color: `${textColor}99` }}
                    >
                      / 全{content.totalCount}名
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-2xl mx-auto">
                  <div 
                    className="relative w-full rounded-full h-6 sm:h-8 md:h-10 overflow-hidden shadow-inner"
                    style={{ backgroundColor: `${textColor}15` }}
                  >
                    <div
                      className="h-full transition-all duration-1000 flex items-center justify-center relative"
                      style={{ 
                        backgroundImage: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                        width: `${percentage}%`,
                      }}
                    >
                      <div 
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage: `linear-gradient(90deg, transparent 0%, ${textColor}40 50%, transparent 100%)`,
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                      {percentage > 15 && (
                        <span className="relative font-bold text-xs sm:text-sm md:text-base text-white z-10">
                          {Math.round(percentage)}% 埋まっています
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Messages */}
            <div className="space-y-3 sm:space-y-4 text-center">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full border animate-pulse"
                style={{
                  backgroundColor: `${primaryColor}1a`,
                  borderColor: `${primaryColor}40`,
                }}
              >
                <ExclamationTriangleIcon 
                  className="h-6 w-6 sm:h-7 sm:w-7" 
                  style={{ color: accentColor }}
                  aria-hidden="true"
                />
                <span 
                  className="text-base sm:text-lg md:text-xl font-semibold"
                  style={{ color: accentColor }}
                >
                  定員に達し次第、予告なく募集終了
                </span>
                <ExclamationTriangleIcon 
                  className="h-6 w-6 sm:h-7 sm:w-7" 
                  style={{ color: accentColor }}
                  aria-hidden="true"
                />
              </div>
              
              <p 
                className="text-sm sm:text-base md:text-lg"
                style={{ color: `${textColor}B3` }}
              >
                次回募集は未定です。今すぐご参加ください。
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Section>
  );
}
