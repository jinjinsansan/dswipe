'use client';

import React from 'react';
import { GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { BonusListBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface BonusListBlockProps {
  content: BonusListBlockContent;
}

export default function BonusListBlock({ content }: BonusListBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "urgent_red";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.urgent_red;
  
  const backgroundColor = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accentColor = content.accentColor || theme.accent;
  const primaryColor = theme.primary;

  const blurOverlayStyle = {
    background: `radial-gradient(140% 140% at 50% 120%, ${accentColor}18 0%, rgba(8,11,25,0) 70%)`,
  } as const;

  const gradientToneMap: Record<ColorThemeKey, Parameters<typeof GradientHeading>[0]["tone"]> = {
    urgent_red: "crimson",
    energy_orange: "magenta",
    gold_premium: "gold",
    power_blue: "aqua",
    passion_pink: "magenta",
  } as const;

  const headingTone = gradientToneMap[resolvedThemeKey] ?? "gold";

  return (
    <Section
      tone="none"
      padding="condensed"
      className="transform origin-top scale-[0.88] pt-9 pb-8 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:origin-center lg:scale-[0.98] xl:scale-100 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Background blur effects */}
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] top-[-30%] h-[140%] blur-[150px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-8 sm:space-y-10 md:space-y-12">
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
          
          {content.subtitle && (
            <p 
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: `${textColor}CC` }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Bonuses List */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {content.bonuses.map((bonus, index) => (
            <SurfaceCard
              key={index}
              variant="glass"
              className="p-5 sm:p-6 md:p-8 hover:scale-[1.01] transition-all duration-300"
              style={{
                backgroundColor: `${accentColor}0a`,
                borderColor: `${accentColor}33`,
              }}
            >
              <GlowHighlight
                className="top-[-15%] h-2/3 opacity-40"
                intensity="soft"
                style={{ background: `linear-gradient(135deg, ${accentColor}20, transparent)` }}
              />
              
              <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {/* Icon */}
                <div 
                  className="flex-shrink-0 flex items-center justify-center rounded-xl p-3 sm:p-4"
                  style={{
                    backgroundColor: `${accentColor}1a`,
                    borderWidth: '2px',
                    borderColor: `${accentColor}40`,
                  }}
                >
                  <GiftIcon 
                    className="h-7 w-7 sm:h-8 sm:w-8" 
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <h3 
                      className="text-lg sm:text-xl md:text-2xl font-semibold"
                      style={{ color: accentColor }}
                    >
                      {bonus.title}
                    </h3>
                    {bonus.value && (
                      <span 
                        className="inline-flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-sm sm:text-base font-bold whitespace-nowrap"
                        style={{ 
                          backgroundColor: accentColor,
                          color: backgroundColor,
                        }}
                      >
                        <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                        {bonus.value}
                      </span>
                    )}
                  </div>
                  {bonus.description && (
                    <p 
                      className="text-sm sm:text-base md:text-lg leading-relaxed"
                      style={{ color: `${textColor}B3` }}
                    >
                      {bonus.description}
                    </p>
                  )}
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        {/* Total Value */}
        {content.totalValue && (
          <SurfaceCard
            variant="glass"
            glow
            className="px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: `${accentColor}50`,
            }}
          >
            <GlowHighlight
              className="top-[-20%] h-2/3 opacity-70"
              intensity="strong"
              style={{ background: `linear-gradient(135deg, ${accentColor}40, ${primaryColor}20)` }}
            />
            <div className="relative text-center space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <SparklesIcon 
                  className="h-6 w-6 sm:h-7 sm:w-7" 
                  style={{ color: accentColor }}
                  aria-hidden="true"
                />
                <p 
                  className="text-xl sm:text-2xl md:text-3xl font-bold"
                  style={{ color: textColor }}
                >
                  特典総額
                </p>
                <SparklesIcon 
                  className="h-6 w-6 sm:h-7 sm:w-7" 
                  style={{ color: accentColor }}
                  aria-hidden="true"
                />
              </div>
              <p 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
                style={{ color: accentColor }}
              >
                {content.totalValue}
              </p>
              <p 
                className="text-base sm:text-lg md:text-xl font-semibold"
                style={{ color: `${textColor}E6` }}
              >
                これら全てが今なら無料で手に入ります
              </p>
            </div>
          </SurfaceCard>
        )}
      </div>
    </Section>
  );
}
