import { Section, SurfaceCard, GradientHeading } from "@/components/ui";
import type { FeaturesBlockContent } from "@/types/templates";
import { COLOR_THEMES, ColorThemeKey } from "@/lib/templates";

interface FeatureAuroraBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function FeatureAuroraBlock({ content, isEditing, onEdit }: FeatureAuroraBlockProps) {
  const {
    themeKey,
    tagline,
    title,
    highlightText,
    features = [],
    backgroundColor,
    textColor,
    accentColor,
  } = content;

  const resolvedTheme: ColorThemeKey = (themeKey as ColorThemeKey) ?? "power_blue";
  const theme = COLOR_THEMES[resolvedTheme] ?? COLOR_THEMES.power_blue;
  const surface = backgroundColor ?? "rgba(15, 23, 42, 0.82)";
  const bodyColor = textColor ?? "#E5E7EB";
  const accent = accentColor ?? theme.accent;
  const secondary = theme.secondary ?? theme.primary;

  const headingToneMap: Record<ColorThemeKey, Parameters<typeof GradientHeading>[0]["tone"]> = {
    urgent_red: "magenta",
    energy_orange: "magenta",
    gold_premium: "gold",
    power_blue: "aqua",
    passion_pink: "magenta",
  } as const;

  const headingTone = headingToneMap[resolvedTheme] ?? "primary";

  return (
    <Section tone="none" padding="default" className="overflow-hidden" style={{ backgroundColor: surface, color: bodyColor }}>
      <div className="absolute inset-x-[-20%] top-[-40%] h-80 blur-[120px]" style={{ background: `radial-gradient(120% 120% at 50% 20%, ${secondary}26 0%, rgba(8,11,25,0) 70%)` }} />
      <div className="relative space-y-9 sm:space-y-12" style={{ color: bodyColor }}>
        <div className="max-w-3xl space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={tagline ?? ""}
                onChange={(e) => onEdit?.("tagline", e.target.value)}
                placeholder="タグライン"
                className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                style={{ color: bodyColor }}
              />
              <textarea
                value={title ?? ""}
                onChange={(e) => onEdit?.("title", e.target.value)}
                placeholder="セクションタイトル"
                rows={2}
                className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                style={{ color: bodyColor }}
              />
              <input
                value={highlightText ?? ""}
                onChange={(e) => onEdit?.("highlightText", e.target.value)}
                placeholder="ハイライトテキスト"
                className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                style={{ color: bodyColor }}
              />
            </div>
          ) : (
            <>
              {tagline && (
                <span
                  className="inline-flex items-center rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.4em]"
                  style={{ backgroundColor: `${accent}18`, color: `${accent}D0`, borderColor: `${accent}33` }}
                >
                  {tagline}
                </span>
              )}
              <GradientHeading tone={headingTone}>{title || "AIとクリエイティブが融合する4つのコア"}</GradientHeading>
              {highlightText && (
                <p className="text-sm uppercase tracking-[0.35em]" style={{ color: `${accent}CC` }}>{highlightText}</p>
              )}
            </>
          )}
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <SurfaceCard
              key={index}
              variant="glass"
              glow
              className="h-full p-5 sm:p-6"
              style={{ backgroundColor: surface, borderColor: `${accent}1a` }}
            >
              <div className="space-y-3.5 sm:space-y-4">
                {isEditing ? (
                  <>
                    <input
                      value={feature.icon ?? ""}
                      onChange={(e) => onEdit?.(`features.${index}.icon`, e.target.value)}
                      placeholder="アイコン / 絵文字"
                      className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                      style={{ color: bodyColor }}
                    />
                    <input
                      value={feature.title ?? ""}
                      onChange={(e) => onEdit?.(`features.${index}.title`, e.target.value)}
                      placeholder="特徴タイトル"
                      className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                      style={{ color: bodyColor }}
                    />
                    <textarea
                      value={feature.description ?? ""}
                      onChange={(e) => onEdit?.(`features.${index}.description`, e.target.value)}
                      placeholder="詳細説明"
                      rows={3}
                      className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                      style={{ color: bodyColor }}
                    />
                  </>
                ) : (
                  <>
                    {feature.icon && (
                      <div
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-soft"
                        style={{ backgroundColor: `${accent}1f`, color: accent }}
                      >
                        {feature.icon}
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold" style={{ color: `${bodyColor}E6` }}>
                        {feature.title || '機能タイトル'}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: `${bodyColor}CC` }}>
                        {feature.description || '詳細説明を入力してください。'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </Section>
  );
}
