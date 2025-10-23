'use client';

import React from 'react';
import { ArrowRightIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { BeforeAfterBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface BeforeAfterBlockProps {
  content: BeforeAfterBlockContent;
}

export default function BeforeAfterBlock({ content }: BeforeAfterBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "urgent_red";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.urgent_red;
  
  const backgroundColor = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accentColor = content.accentColor || theme.accent;
  const primaryColor = theme.primary;

  const blurOverlayStyle = {
    background: `radial-gradient(140% 140% at 50% 120%, ${primaryColor}18 0%, rgba(8,11,25,0) 70%)`,
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
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] top-[-30%] h-[120%] blur-[140px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-8 sm:space-y-10 md:space-y-12">
        {/* Header */}
        {content.title && (
          <div className="text-center">
            <GradientHeading 
              as="h2" 
              tone={headingTone}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            >
              {content.title}
            </GradientHeading>
          </div>
        )}

        {/* Before & After Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Before Card */}
          <SurfaceCard
            variant="glass"
            className="p-6 sm:p-7 md:p-8 lg:p-10"
            style={{
              backgroundColor: `${textColor}05`,
              borderColor: `${primaryColor}40`,
            }}
          >
            <GlowHighlight
              className="top-[-20%] h-2/3 opacity-40"
              intensity="soft"
              style={{ background: `linear-gradient(135deg, ${primaryColor}15, transparent)` }}
            />
            
            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center justify-center rounded-full p-2"
                  style={{
                    backgroundColor: `${primaryColor}1a`,
                    borderWidth: '1px',
                    borderColor: `${primaryColor}33`,
                  }}
                >
                  <XCircleIcon 
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" 
                    style={{ color: primaryColor }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl sm:text-2xl md:text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {content.beforeTitle || '導入前'}
                </h3>
              </div>
              
              <p 
                className="text-sm sm:text-base md:text-lg leading-relaxed"
                style={{ color: `${textColor}CC` }}
              >
                {content.beforeText}
              </p>
            </div>
          </SurfaceCard>

          {/* After Card */}
          <SurfaceCard
            variant="glass"
            glow
            className="p-6 sm:p-7 md:p-8 lg:p-10"
            style={{
              backgroundColor: `${accentColor}0d`,
              borderColor: `${accentColor}40`,
            }}
          >
            <GlowHighlight
              className="top-[-20%] h-2/3 opacity-50"
              intensity="strong"
              style={{ background: `linear-gradient(135deg, ${accentColor}25, ${primaryColor}15)` }}
            />
            
            <div className="relative space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center justify-center rounded-full p-2"
                  style={{
                    backgroundColor: `${accentColor}1a`,
                    borderWidth: '1px',
                    borderColor: `${accentColor}40`,
                  }}
                >
                  <CheckCircleIcon 
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" 
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl sm:text-2xl md:text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  {content.afterTitle || '導入後'}
                </h3>
              </div>
              
              <p 
                className="text-sm sm:text-base md:text-lg leading-relaxed font-medium"
                style={{ color: `${textColor}E6` }}
              >
                {content.afterText}
              </p>
            </div>
          </SurfaceCard>
        </div>

        {/* Arrow indicator for mobile */}
        <div className="md:hidden flex justify-center">
          <div 
            className="flex items-center justify-center rounded-full p-3"
            style={{
              backgroundColor: `${accentColor}1a`,
              borderWidth: '2px',
              borderColor: `${accentColor}33`,
            }}
          >
            <ArrowRightIcon 
              className="h-6 w-6 rotate-90 md:rotate-0" 
              style={{ color: accentColor }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-3 sm:space-y-4">
          <p 
            className="text-xl sm:text-2xl md:text-3xl font-semibold"
            style={{ color: accentColor }}
          >
            あなたもこの変化を手に入れませんか？
          </p>
          <p 
            className="text-base sm:text-lg md:text-xl"
            style={{ color: `${textColor}B3` }}
          >
            実践者全員が同じ結果を得ています
          </p>
        </div>
      </div>
    </Section>
  );
}
