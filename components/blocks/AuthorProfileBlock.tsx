'use client';

import React from 'react';
import { UserCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { AuthorProfileBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface AuthorProfileBlockProps {
  content: AuthorProfileBlockContent;
}

export default function AuthorProfileBlock({ content }: AuthorProfileBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "gold_premium";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.gold_premium;
  
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
      className="transform origin-center pt-2 pb-8 sm:pt-9 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:scale-[0.98] xl:scale-100 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Background blur effects */}
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] top-[-30%] h-[130%] blur-[150px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <SurfaceCard
          variant="glass"
          glow
          className="px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14"
        >
          <GlowHighlight
            className="top-[-30%] h-3/4 opacity-50"
            intensity="strong"
            style={{ background: `linear-gradient(135deg, ${accentColor}30, ${primaryColor}20)` }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-start">
            {/* Profile Image */}
            <div className="md:col-span-1 flex justify-center md:justify-start">
              {content.imageUrl ? (
                <div 
                  className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2"
                  style={{ borderColor: `${accentColor}50` }}
                >
                  <img
                    src={content.imageUrl}
                    alt={content.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-full max-w-[280px] aspect-square rounded-2xl flex items-center justify-center shadow-2xl border-2"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
                    borderColor: `${accentColor}50`,
                  }}
                >
                  <UserCircleIcon 
                    className="h-24 w-24 sm:h-32 sm:w-32 text-white"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="md:col-span-2 space-y-5 sm:space-y-6 md:space-y-8">
              {/* Name & Title */}
              <div className="space-y-2 sm:space-y-3">
                {content.name && (
                  <GradientHeading 
                    as="h2" 
                    tone={headingTone}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  >
                    {content.name}
                  </GradientHeading>
                )}
                {content.title && (
                  <p 
                    className="text-lg sm:text-xl md:text-2xl font-medium"
                    style={{ color: accentColor }}
                  >
                    {content.title}
                  </p>
                )}
              </div>

              {/* Bio */}
              {content.bio && (
                <p 
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  style={{ color: `${textColor}CC` }}
                >
                  {content.bio}
                </p>
              )}

              {/* Achievements */}
              {content.achievements && content.achievements.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TrophyIcon 
                      className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9" 
                      style={{ color: accentColor }}
                      aria-hidden="true"
                    />
                    <h3 
                      className="text-xl sm:text-2xl md:text-3xl font-bold"
                      style={{ color: accentColor }}
                    >
                      実績
                    </h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {content.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl"
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
                          <TrophyIcon 
                            className="h-4 w-4 sm:h-5 sm:w-5" 
                            style={{ color: accentColor }}
                            aria-hidden="true"
                          />
                        </div>
                        <span 
                          className="text-sm sm:text-base md:text-lg"
                          style={{ color: `${textColor}E6` }}
                        >
                          {achievement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Logos */}
              {content.mediaLogos && content.mediaLogos.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 
                    className="text-base sm:text-lg md:text-xl font-semibold"
                    style={{ color: `${textColor}CC` }}
                  >
                    メディア掲載実績
                  </h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {content.mediaLogos.map((logo, index) => (
                      <div
                        key={index}
                        className="rounded-xl p-3 sm:p-4 h-14 sm:h-16 flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${textColor}10`,
                          borderWidth: '1px',
                          borderColor: `${accentColor}26`,
                        }}
                      >
                        <img
                          src={logo}
                          alt="Media logo"
                          className="h-full w-auto object-contain opacity-80"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Message */}
          <div 
            className="relative mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 text-center"
            style={{
              borderTopWidth: '1px',
              borderTopColor: `${accentColor}26`,
            }}
          >
            <p 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold"
              style={{ color: accentColor }}
            >
              この実績を持つ私が、あなたを成功に導きます
            </p>
          </div>
        </SurfaceCard>
      </div>
    </Section>
  );
}
