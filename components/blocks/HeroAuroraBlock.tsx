import Image from "next/image";
import { GradientHeading, GlowButton, GlowHighlight, Section, SurfaceCard } from "@/components/ui";
import type { HeroBlockContent } from "@/types/templates";
import { cn } from "@/lib/utils";
import { COLOR_THEMES, ColorThemeKey } from "@/lib/templates";

interface HeroAuroraBlockProps {
  content: HeroBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function HeroAuroraBlock({ content, isEditing, onEdit }: HeroAuroraBlockProps) {
  const {
    themeKey,
    tagline,
    title,
    subtitle,
    highlightText,
    imageUrl,
    buttonText,
    buttonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    stats = [],
    backgroundColor,
    textColor,
    buttonColor,
    accentColor,
  } = content;

  const resolvedThemeKey: ColorThemeKey = (themeKey as ColorThemeKey) ?? "power_blue";
  const theme = COLOR_THEMES[resolvedThemeKey] ?? COLOR_THEMES.power_blue;

  const surfaceColor = backgroundColor ?? "rgba(11, 17, 32, 0.96)";
  const bodyTextColor = textColor ?? "#E2E8F0";
  const primaryButtonColor = buttonColor ?? theme.primary;
  const accent = accentColor ?? theme.accent;
  const secondaryTone = theme.secondary ?? theme.primary;

  const gradientToneMap: Record<ColorThemeKey, Parameters<typeof GradientHeading>[0]["tone"]> = {
    urgent_red: "magenta",
    energy_orange: "magenta",
    gold_premium: "gold",
    power_blue: "aqua",
    passion_pink: "magenta",
  } as const;

  const headingTone = gradientToneMap[resolvedThemeKey] ?? "primary";

  const primaryButtonStyle = {
    backgroundImage: `linear-gradient(135deg, ${secondaryTone}, ${primaryButtonColor})`,
    boxShadow: `0 28px 60px -30px ${primaryButtonColor}80`,
  } as const;

  const highlightStyle = {
    color: `${accent}CC`,
  } as const;

  const pillStyle = {
    backgroundColor: `${accent}1f`,
    color: `${accent}CC`,
    borderColor: `${accent}33`,
  } as const;

  const statsValueStyle = {
    color: accent,
  } as const;

  const blurOverlayStyle = {
    background: `radial-gradient(140% 140% at 50% 120%, ${secondaryTone}22 0%, rgba(8,11,25,0) 70%)`,
  } as const;

  const topOverlayStyle = {
    background: `linear-gradient(180deg, rgba(8,11,25,0.7), rgba(8,11,25,0))`,
  } as const;

  const renderInput = (field: string, value: string, placeholder: string, type: "input" | "textarea" = "input") => {
    if (!isEditing) return null;

    const commonClass = "w-full bg-surface-alt-soft border border-glass-faint rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]";
    const commonStyle = { color: `${bodyTextColor}E6` };

    if (type === "textarea") {
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onEdit?.(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={commonClass}
          style={commonStyle}
        />
      );
    }

    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onEdit?.(field, e.target.value)}
        placeholder={placeholder}
        className={commonClass}
        style={commonStyle}
      />
    );
  };

  return (
    <Section
      tone="none"
      padding="extended"
      className="overflow-visible md:overflow-hidden"
      style={{
        backgroundColor: surfaceColor,
        color: bodyTextColor,
        minHeight: '100%',
      }}
    >
      <div className="absolute inset-0 opacity-95 pointer-events-none" style={blurOverlayStyle}>
        <div className="absolute inset-x-[-20%] bottom-[-40%] h-[160%] blur-[160px]" style={blurOverlayStyle} />
        <div className="absolute inset-x-0 top-0 h-32" style={topOverlayStyle} />
      </div>
      <div
        className="relative grid items-start md:items-center gap-10 md:gap-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        style={{
          minHeight: 'min(72vh, 680px)',
          maxWidth: 'min(1080px, 94vw)',
          marginInline: 'auto',
        }}
      >
        <div
          className="space-y-6"
          style={{ color: bodyTextColor, maxWidth: 'min(700px, 92vw)' }}
        >
          {isEditing ? (
            <div className="space-y-3">
              {renderInput("tagline", tagline ?? "", "タグライン (例: NEXT WAVE)")}
              {renderInput("title", title ?? "", "メイン見出し")}
              {renderInput("subtitle", subtitle ?? "", "サブコピー", "textarea")}
            </div>
          ) : (
            <div className="space-y-4">
              {tagline && (
                <span
                  className="inline-flex items-center rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.3em]"
                  style={pillStyle}
                >
                  {tagline}
                </span>
              )}
              <GradientHeading tone={headingTone} as="h1" className="text-4xl leading-tight md:text-5xl lg:text-6xl">
                {title || "AIが導く、高速ランディングページ体験"}
              </GradientHeading>
              {highlightText && !isEditing && (
                <p className="text-sm uppercase tracking-[0.4em]" style={highlightStyle}>{highlightText}</p>
              )}
              <p className="max-w-xl text-base md:text-lg" style={{ color: `${bodyTextColor}CC` }}>
                {subtitle || "ブランドとコンバージョンを両立するプレミアムデザインを、AIの力で最短24時間で構築。"}
              </p>
            </div>
          )}

          {isEditing && renderInput("highlightText", highlightText ?? "", "ハイライトテキスト (例: AI LAUNCH)")}

          <div className="flex flex-wrap items-center gap-3">
            {isEditing ? (
              <>
                {renderInput("buttonText", buttonText ?? "", "一次ボタン文言")}
                {renderInput("buttonUrl", buttonUrl ?? "", "一次ボタンURL")}
                {renderInput("secondaryButtonText", secondaryButtonText ?? "", "二次ボタン文言")}
                {renderInput("secondaryButtonUrl", secondaryButtonUrl ?? "", "二次ボタンURL")}
              </>
            ) : (
              <>
                {buttonText && (
                  <GlowButton
                    href={buttonUrl || "#"}
                    style={primaryButtonStyle}
                  >
                    {buttonText}
                  </GlowButton>
                )}
                {secondaryButtonText && (
                  <GlowButton
                    href={secondaryButtonUrl || "#"}
                    variant="secondary"
                    className="hover:text-white"
                    style={{ 
                      boxShadow: `0 20px 40px -30px ${accent}80`,
                      borderColor: `${bodyTextColor}33`,
                      borderWidth: '1px',
                      backgroundColor: `${bodyTextColor}08`,
                      color: `${bodyTextColor}D9`
                    }}
                  >
                    {secondaryButtonText}
                  </GlowButton>
                )}
              </>
            )}
          </div>

          {!isEditing && stats.length > 0 && (
            <div className="mt-6 grid gap-6 text-sm sm:grid-cols-3" style={{ color: `${bodyTextColor}CC` }}>
              {stats.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-lg font-semibold" style={statsValueStyle}>{item.value}</div>
                  <div className="text-xs uppercase tracking-[0.4em]" style={{ color: `${bodyTextColor}99` }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <SurfaceCard
            variant="glass"
            glow
            className={cn(
              "relative overflow-hidden px-6 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12",
              "after:absolute after:inset-x-[-30%] after:top-[-40%] after:h-[70%] after:opacity-60 after:blur-3xl"
            )}
            style={{ backgroundColor: surfaceColor }}
          >
            <GlowHighlight
              className="top-[-20%] h-2/3 opacity-70"
              intensity="strong"
              style={{ background: `linear-gradient(135deg, ${accent}20, ${primaryButtonColor}10)` }}
            />
            <div className="relative flex flex-col items-center gap-6">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{ ...pillStyle, borderColor: `${accent}26` }}
              >
                {highlightText || "AI Launch Accelerator"}
              </span>
              <div 
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-glass-soft shadow-glow"
                style={{ backgroundColor: `${accent}40` }}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Product preview"
                    width={480}
                    height={320}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-gradient-aqua" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.45em]" style={{ color: `${bodyTextColor}80` }}>
                <span>Launch</span>
                <span className="h-px w-8" style={{ backgroundColor: `${bodyTextColor}40` }} />
                <span>in 24h</span>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </Section>
  );
}
