'use client';

import React from 'react';
import { ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { GuaranteeBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface GuaranteeBlockProps {
  content: GuaranteeBlockContent;
}

export default function GuaranteeBlock({ content }: GuaranteeBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "power_blue";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.power_blue;
  
  const backgroundColor = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accentColor = content.accentColor || theme.accent;
  const primaryColor = theme.primary;

  const blurOverlayStyle = {
    background: `radial-gradient(140% 140% at 50% 120%, ${accentColor}20 0%, rgba(8,11,25,0) 70%)`,
  } as const;

  const gradientToneMap: Record<ColorThemeKey, Parameters<typeof GradientHeading>[0]["tone"]> = {
    urgent_red: "crimson",
    energy_orange: "magenta",
    gold_premium: "gold",
    power_blue: "aqua",
    passion_pink: "magenta",
  } as const;

  const headingTone = gradientToneMap[resolvedThemeKey] ?? "aqua";

  return (
    <Section
      tone="none"
      padding="condensed"
      className="transform origin-center pt-2 pb-8 sm:pt-9 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:scale-[0.98] xl:scale-100 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Background blur effects */}
      <div className="absolute inset-0 opacity-70 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] bottom-[-40%] h-[160%] blur-[160px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-4xl mx-auto">
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

          <div className="relative space-y-6 sm:space-y-8 md:space-y-10">
            {/* Shield Icon */}
            <div className="flex justify-center">
              <div 
                className="flex items-center justify-center rounded-full p-5 sm:p-6 md:p-8 shadow-2xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
                }}
              >
                <ShieldCheckIcon 
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Guarantee Type Badge */}
            {content.guaranteeType && (
              <div className="flex justify-center">
                <div 
                  className="inline-flex items-center px-5 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full border-2 shadow-lg"
                  style={{
                    backgroundColor: `${accentColor}1a`,
                    borderColor: `${accentColor}50`,
                  }}
                >
                  <span 
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={{ color: accentColor }}
                  >
                    {content.guaranteeType}
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
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

            {/* Subtitle */}
            {content.subtitle && (
              <p 
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-center max-w-2xl mx-auto"
                style={{ color: `${textColor}CC` }}
              >
                {content.subtitle}
              </p>
            )}

            {/* Description */}
            {content.description && (
              <p 
                className="text-sm sm:text-base md:text-lg lg:text-xl text-center leading-relaxed max-w-3xl mx-auto"
                style={{ color: `${textColor}B3` }}
              >
                {content.description}
              </p>
            )}

            {/* Features List (if any) */}
            {content.features && content.features.length > 0 && (
              <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                {content.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4 rounded-xl"
                    style={{
                      backgroundColor: `${textColor}08`,
                      borderWidth: '1px',
                      borderColor: `${accentColor}26`,
                    }}
                  >
                    <CheckCircleIcon 
                      className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0" 
                      style={{ color: accentColor }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm sm:text-base md:text-lg"
                      style={{ color: `${textColor}E6` }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Badge Text */}
            {content.badgeText && (
              <div className="flex justify-center">
                <div 
                  className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full shadow-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
                  }}
                >
                  <ShieldCheckIcon 
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white"
                    aria-hidden="true"
                  />
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">
                    {content.badgeText}
                  </span>
                </div>
              </div>
            )}

            {/* Risk-free message */}
            <div 
              className="text-center pt-4 sm:pt-6"
              style={{
                borderTopWidth: '1px',
                borderTopColor: `${accentColor}26`,
              }}
            >
              <p 
                className="text-lg sm:text-xl md:text-2xl font-semibold"
                style={{ color: accentColor }}
              >
                あなたにリスクは一切ありません
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </Section>
  );
}
