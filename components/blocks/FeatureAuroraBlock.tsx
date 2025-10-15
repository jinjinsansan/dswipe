import { Section, SurfaceCard, GradientHeading } from "@/components/ui";
import type { FeaturesBlockContent } from "@/types/templates";

interface FeatureAuroraBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function FeatureAuroraBlock({ content, isEditing, onEdit }: FeatureAuroraBlockProps) {
  const {
    tagline,
    title,
    highlightText,
    features = [],
  } = content;

  return (
    <Section tone="alt" padding="default" className="overflow-hidden">
      <div className="absolute inset-x-[-20%] top-[-40%] h-80 bg-gradient-primary/40 blur-[120px]" />
      <div className="relative space-y-12">
        <div className="max-w-3xl space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={tagline ?? ""}
                onChange={(e) => onEdit?.("tagline", e.target.value)}
                placeholder="タグライン"
                className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm text-blue-100/90 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
              />
              <textarea
                value={title ?? ""}
                onChange={(e) => onEdit?.("title", e.target.value)}
                placeholder="セクションタイトル"
                rows={2}
                className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-base text-blue-100/90 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
              />
              <input
                value={highlightText ?? ""}
                onChange={(e) => onEdit?.("highlightText", e.target.value)}
                placeholder="ハイライトテキスト"
                className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm text-blue-100/90 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
              />
            </div>
          ) : (
            <>
              {tagline && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.4em] text-blue-200/90">
                  {tagline}
                </span>
              )}
              <GradientHeading>{title || "AIとクリエイティブが融合する4つのコア"}</GradientHeading>
              {highlightText && (
                <p className="text-sm uppercase tracking-[0.35em] text-blue-200/80">{highlightText}</p>
              )}
            </>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <SurfaceCard key={index} variant="glass" glow className="h-full p-6">
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <input
                      value={feature.icon ?? ""}
                      onChange={(e) => onEdit?.(`features.${index}.icon`, e.target.value)}
                      placeholder="アイコン / 絵文字"
                      className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm text-blue-100/90 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                    />
                    <input
                      value={feature.title ?? ""}
                      onChange={(e) => onEdit?.(`features.${index}.title`, e.target.value)}
                      placeholder="特徴タイトル"
                      className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-base text-blue-100/90 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                    />
                    <textarea
                      value={feature.description ?? ""}
                      onChange={(e) => onEdit?.(`features.${index}.description`, e.target.value)}
                      placeholder="詳細説明"
                      rows={3}
                      className="w-full rounded-lg border border-glass-faint bg-surface-alt-soft px-3 py-2 text-sm text-blue-100/85 focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,0.5)]"
                    />
                  </>
                ) : (
                  <>
                    {feature.icon && (
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl shadow-soft">
                        {feature.icon}
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white/90">
                        {feature.title || '機能タイトル'}
                      </h3>
                      <p className="text-sm leading-relaxed text-blue-100/85">
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
