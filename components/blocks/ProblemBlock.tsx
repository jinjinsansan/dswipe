'use client';

import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { ProblemBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface ProblemBlockProps {
  content: ProblemBlockContent;
}

export default function ProblemBlock({ content }: ProblemBlockProps) {
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
      className="transform origin-center pt-4 pb-7 sm:pt-9 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:scale-[0.98] xl:scale-100 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Background blur effects */}
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] top-[-30%] h-[120%] blur-[140px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6 sm:space-y-9 md:space-y-12">
        {/* Header */}
        <div className="text-center space-y-2.5 sm:space-y-4">
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
              className="text-sm sm:text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: `${textColor}CC` }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 md:gap-6">
          {content.problems.map((problem, index) => (
            <SurfaceCard
              key={index}
              variant="glass"
              className="p-4 sm:p-6 md:p-7 hover:scale-[1.02] transition-transform duration-300"
              style={{
                backgroundColor: `${textColor}05`,
                borderColor: `${primaryColor}26`,
              }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div 
                  className="flex-shrink-0 rounded-full p-1.5 sm:p-2.5 md:p-3"
                  style={{
                    backgroundColor: `${primaryColor}1a`,
                    borderWidth: '1px',
                    borderColor: `${primaryColor}33`,
                  }}
                >
                  <XCircleIcon 
                    className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8" 
                    style={{ color: primaryColor }}
                    aria-hidden="true"
                  />
                </div>
                <p 
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{ color: `${textColor}E6` }}
                >
                  {problem}
                </p>
              </div>
            </SurfaceCard>
          ))}
        </div>

        {/* Bottom Message */}
        <SurfaceCard
          variant="glass"
          glow
          className="px-5 py-5 sm:px-8 sm:py-8 md:px-10 md:py-10"
          style={{
            backgroundColor: `${primaryColor}0d`,
            borderColor: `${accentColor}33`,
          }}
        >
          <GlowHighlight
            className="top-[-20%] h-2/3 opacity-50"
            intensity="soft"
            style={{ background: `linear-gradient(135deg, ${accentColor}20, ${primaryColor}10)` }}
          />
          <div className="relative text-center space-y-3 sm:space-y-4">
            <p 
              className="text-xl sm:text-2xl md:text-3xl font-semibold"
              style={{ color: accentColor }}
            >
              もし1つでも当てはまるなら...
            </p>
            <p 
              className="text-base sm:text-lg md:text-xl"
              style={{ color: `${textColor}CC` }}
            >
              このページを最後まで読んでください
            </p>
          </div>
        </SurfaceCard>
      </div>
    </Section>
  );
}
