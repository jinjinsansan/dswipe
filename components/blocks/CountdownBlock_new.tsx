'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CountdownBlockContent } from '@/types/templates';
import { Section, SurfaceCard, GradientHeading, GlowHighlight } from '@/components/ui';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface CountdownBlockProps {
  content: CountdownBlockContent;
}

export default function CountdownBlock({ content }: CountdownBlockProps) {
  const resolvedThemeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? "urgent_red";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.urgent_red;
  
  const backgroundColor = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accentColor = content.accentColor || theme.accent;
  const primaryColor = theme.primary;
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(content.targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [content.targetDate]);

  const timeUnits = [
    { label: '日', value: timeLeft.days, show: content.showDays !== false },
    { label: '時間', value: timeLeft.hours, show: content.showHours !== false },
    { label: '分', value: timeLeft.minutes, show: content.showMinutes !== false },
    { label: '秒', value: timeLeft.seconds, show: content.showSeconds !== false },
  ];

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
      className="transform origin-top scale-[0.88] pt-9 pb-8 sm:scale-[0.94] sm:pb-11 md:pb-13 lg:origin-center lg:scale-[0.98] xl:scale-100 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Background blur effects */}
      <div className="absolute inset-0 opacity-80 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] bottom-[-40%] h-[160%] blur-[160px]" style={blurOverlayStyle} />
      </div>

      <div className="relative max-w-5xl mx-auto">
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

          <div className="relative text-center space-y-6 sm:space-y-8">
            {/* Icon & Title */}
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div 
                className="flex items-center justify-center rounded-full p-3 sm:p-4"
                style={{ 
                  backgroundColor: `${primaryColor}1f`,
                  borderWidth: '2px',
                  borderColor: `${primaryColor}33`,
                }}
              >
                <ClockIcon 
                  className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" 
                  style={{ color: accentColor }}
                  aria-hidden="true"
                />
              </div>
              
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

            {/* Urgency Text */}
            {content.urgencyText && (
              <p 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto leading-relaxed"
                style={{ color: `${textColor}E6` }}
              >
                {content.urgencyText}
              </p>
            )}

            {/* Countdown Timer */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
              {timeUnits.map((unit, index) => 
                unit.show ? (
                  <SurfaceCard
                    key={index}
                    variant="glass"
                    className="flex flex-col items-center justify-center px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-9 min-w-[70px] sm:min-w-[90px] md:min-w-[120px]"
                    style={{
                      backgroundColor: `${textColor}08`,
                      borderColor: `${accentColor}40`,
                    }}
                  >
                    <div 
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-1 sm:mb-2 tabular-nums"
                      style={{ color: accentColor }}
                    >
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div 
                      className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider"
                      style={{ color: `${textColor}B3` }}
                    >
                      {unit.label}
                    </div>
                  </SurfaceCard>
                ) : null
              )}
            </div>

            {/* Warning message */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full border"
              style={{
                backgroundColor: `${primaryColor}1a`,
                borderColor: `${primaryColor}40`,
              }}
            >
              <ExclamationTriangleIcon 
                className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" 
                style={{ color: accentColor }}
                aria-hidden="true"
              />
              <span 
                className="text-sm sm:text-base md:text-lg font-semibold"
                style={{ color: accentColor }}
              >
                締切間近です
              </span>
              <ExclamationTriangleIcon 
                className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" 
                style={{ color: accentColor }}
                aria-hidden="true"
              />
            </div>
          </div>
        </SurfaceCard>
      </div>
    </Section>
  );
}
