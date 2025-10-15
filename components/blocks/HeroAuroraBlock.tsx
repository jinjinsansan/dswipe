import Image from "next/image";
import { GradientHeading, GlowButton, GlowHighlight, Section, SurfaceCard } from "@/components/ui";
import type { HeroBlockContent } from "@/types/templates";
import { cn } from "@/lib/utils";

interface HeroAuroraBlockProps {
  content: HeroBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function HeroAuroraBlock({ content, isEditing, onEdit }: HeroAuroraBlockProps) {
  const {
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
  } = content;

  const renderInput = (field: string, value: string, placeholder: string, type: "input" | "textarea" = "input") => {
    if (!isEditing) return null;

    const commonClass = "w-full bg-surface-alt-soft border border-glass-faint text-white/90 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]";

    if (type === "textarea") {
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onEdit?.(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={commonClass}
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
      />
    );
  };

  return (
    <Section tone="tint" padding="extended" className="overflow-hidden">
      <div className="absolute inset-0 opacity-90">
        <div className="absolute inset-x-[-20%] bottom-[-40%] h-[160%] bg-gradient-aqua blur-[160px]" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
      </div>
      <div className="relative grid items-center gap-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-3">
              {renderInput("tagline", tagline ?? "", "タグライン (例: NEXT WAVE)")}
              {renderInput("title", title ?? "", "メイン見出し")}
              {renderInput("subtitle", subtitle ?? "", "サブコピー", "textarea")}
            </div>
          ) : (
            <div className="space-y-4">
              {tagline && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-blue-200/90">
                  {tagline}
                </span>
              )}
              <GradientHeading as="h1" className="text-4xl leading-tight md:text-5xl lg:text-6xl">
                {title || "AIが導く、高速ランディングページ体験"}
              </GradientHeading>
              {highlightText && !isEditing && (
                <p className="text-sm uppercase tracking-[0.4em] text-blue-200/80">{highlightText}</p>
              )}
              <p className="max-w-xl text-base text-blue-100/90 md:text-lg">
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
                  <GlowButton href={buttonUrl || "#"}>
                    {buttonText}
                  </GlowButton>
                )}
                {secondaryButtonText && (
                  <GlowButton href={secondaryButtonUrl || "#"} variant="secondary">
                    {secondaryButtonText}
                  </GlowButton>
                )}
              </>
            )}
          </div>

          {!isEditing && stats.length > 0 && (
            <div className="mt-6 grid gap-6 text-sm text-blue-100/80 sm:grid-cols-3">
              {stats.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-gradient-aqua text-lg font-semibold">{item.value}</div>
                  <div className="text-xs uppercase tracking-[0.4em] text-blue-200/70">{item.label}</div>
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
              "relative overflow-hidden px-8 pb-10 pt-12",
              "after:absolute after:inset-x-[-30%] after:top-[-40%] after:h-[70%] after:bg-gradient-primary after:opacity-60 after:blur-3xl",
            )}
          >
            <GlowHighlight className="top-[-20%] h-2/3 opacity-70" intensity="strong" />
            <div className="relative flex flex-col items-center gap-6">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100/80">
                {highlightText || "AI Launch Accelerator"}
              </span>
              <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-glass-soft bg-black/60 shadow-glow">
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
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-blue-100/60">
                <span>Launch</span>
                <span className="h-px w-8 bg-blue-100/30" />
                <span>in 24h</span>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </Section>
  );
}
