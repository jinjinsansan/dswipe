'use client';

import React from 'react';
import { TagIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { SpecialPriceBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowButton, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface SpecialPriceBlockProps {
  content: SpecialPriceBlockContent;
}

export default function SpecialPriceBlock({ content }: SpecialPriceBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "urgent_red";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.urgent_red;
  
  const backgroundColor = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accentColor = content.accentColor || theme.accent;
  const primaryColor = theme.primary;
  const secondaryColor = theme.secondary || theme.primary;

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

  const headingTone = gradientToneMap[resolvedThemeKey] ?? "gold";

  const buttonStyle = {
    backgroundImage: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`,
    boxShadow: `0 28px 60px -30px ${primaryColor}80`,
  } as const;

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
      <div className="absolute inset-0 opacity-70 pointer-events-none" style={blurOverlayStyle}>
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
          
          {content.subtitle && (
            <p 
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: `${textColor}CC` }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Price Card */}
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
            {/* Discount Badge */}
            {content.discountBadge && (
              <div className="flex justify-center">
                <div 
                  className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-3 rounded-full border shadow-lg"
                  style={{
                    backgroundColor: `${primaryColor}1a`,
                    borderColor: `${primaryColor}50`,
                  }}
                >
                  <TagIcon 
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" 
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <span 
                    className="text-lg sm:text-xl md:text-2xl font-bold"
                    style={{ color: accentColor }}
                  >
                    {content.discountBadge}
                  </span>
                </div>
              </div>
            )}

            {/* Price Display */}
            <div className="text-center space-y-3 sm:space-y-4">
              {/* Original Price */}
              {content.originalPrice && (
                <div>
                  <span 
                    className="text-base sm:text-lg md:text-xl line-through"
                    style={{ color: `${textColor}66` }}
                  >
                    通常価格: {content.originalPrice}
                  </span>
                </div>
              )}

              {/* Special Price */}
              <div className="flex flex-col items-center gap-2">
                <span 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
                  style={{ color: accentColor }}
                >
                  {content.specialPrice}
                </span>
                {content.period && (
                  <span 
                    className="text-sm sm:text-base md:text-lg"
                    style={{ color: `${textColor}99` }}
                  >
                    / {content.period}
                  </span>
                )}
              </div>

              {/* Savings Amount */}
              {content.originalPrice && content.specialPrice && (
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: `${accentColor}1a`,
                    borderColor: `${accentColor}33`,
                  }}
                >
                  <SparklesIcon 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <span 
                    className="text-base sm:text-lg md:text-xl font-semibold"
                    style={{ color: accentColor }}
                  >
                    {(parseInt(content.originalPrice.replace(/[^\d]/g, '')) - parseInt(content.specialPrice.replace(/[^\d]/g, ''))).toLocaleString()}円もお得
                  </span>
                </div>
              )}
            </div>

            {/* Features List */}
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
                    <div 
                      className="flex-shrink-0 rounded-full p-1"
                      style={{
                        backgroundColor: `${accentColor}1a`,
                      }}
                    >
                      <CheckIcon 
                        className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" 
                        style={{ color: accentColor }}
                        aria-hidden="true"
                      />
                    </div>
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

            {/* CTA Button */}
            {content.buttonText && (
              <div className="pt-4 sm:pt-6">
                <GlowButton
                  href="#"
                  className="w-full px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 text-base sm:text-lg md:text-xl font-semibold"
                  style={buttonStyle}
                >
                  {content.buttonText}
                </GlowButton>
              </div>
            )}

            {/* Notice */}
            <p 
              className="text-center text-xs sm:text-sm md:text-base"
              style={{ color: `${accentColor}CC` }}
            >
              ※ この特別価格は予告なく終了する可能性があります
            </p>
          </div>
        </SurfaceCard>
      </div>
    </Section>
  );
}
