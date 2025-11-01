import Link from 'next/link';
import type { CSSProperties } from 'react';
import { HeroBlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';

interface TopHeroImageBlockProps {
  content: HeroBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80';

export default function TopHeroImageBlock({
  content,
  isEditing,
  onEdit,
  productId,
  onProductClick,
  ctaIds,
  onCtaClick,
}: TopHeroImageBlockProps) {
  const tagline = content?.tagline ?? 'NEXT LAUNCH';
  const highlightText = content?.highlightText ?? '最新プロジェクトの裏側を公開';
  const title = content?.title ?? 'ブランド世界観を崩さずに、成果を生む制作体制へ。';
  const subtitle = content?.subtitle ?? 'テンプレートとAI支援で、最短5分のスピードローンチ。デザインと実装のストレスから解放されます。';
  const primaryText = content?.buttonText ?? '無料で始める';
  const secondaryText = content?.secondaryButtonText ?? '';
  const backgroundImageUrl = content?.backgroundImageUrl && content.backgroundImageUrl.trim() !== ''
    ? content.backgroundImageUrl
    : FALLBACK_IMAGE;
  const textColor = content?.textColor ?? '#FFFFFF';
  const accentColor = content?.accentColor ?? '#38BDF8';
  const buttonColor = content?.buttonColor ?? accentColor;
  const secondaryButtonColor = content?.secondaryButtonColor ?? withAlpha(textColor, 0.35, textColor);
  const overlayBase = content?.overlayColor ?? content?.backgroundColor ?? '#0B1120';
  const primaryCtaId = ctaIds?.[0];
  const secondaryCtaId = ctaIds?.[1];

  const overlayStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${withAlpha(accentColor, 0.35, accentColor)}, ${withAlpha(overlayBase, 0.85, overlayBase)})`,
  };

  const primaryButtonStyle: CSSProperties = {
    backgroundColor: buttonColor,
    color: getContrastColor(buttonColor),
    border: `1px solid ${buttonColor}`,
  };

  const secondaryStrokeColor = secondaryButtonColor;
  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: withAlpha(secondaryStrokeColor, 0.12, secondaryStrokeColor),
    color: secondaryStrokeColor,
    border: `1px solid ${withAlpha(secondaryStrokeColor, 0.6, secondaryStrokeColor)}`,
  };

  const handleEdit = (field: keyof HeroBlockContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onEdit?.(field as string, e.target.value);
  };

  return (
    <section
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ color: textColor, backgroundColor: overlayBase }}
    >
      {backgroundImageUrl ? (
        <div className="absolute inset-0">
          <img
            key={backgroundImageUrl}
            src={backgroundImageUrl}
            alt={content?.backgroundImageUrl ? 'Hero background' : 'Hero background placeholder'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32">
        {isEditing ? (
          <div className="mb-6 grid w-full gap-3 rounded-xl bg-white/10 p-4 text-left text-sm text-slate-900">
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={tagline}
              onChange={handleEdit('tagline')}
              placeholder="タグライン"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={highlightText}
              onChange={handleEdit('highlightText')}
              placeholder="ハイライトテキスト"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={title}
              onChange={handleEdit('title')}
              placeholder="メイン見出し"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={subtitle}
              onChange={handleEdit('subtitle')}
              placeholder="サブコピー"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={primaryText}
              onChange={handleEdit('buttonText')}
              placeholder="一次ボタンテキスト"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={content?.buttonUrl ?? ''}
              onChange={handleEdit('buttonUrl')}
              placeholder="一次ボタンURL"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={secondaryText}
              onChange={handleEdit('secondaryButtonText')}
              placeholder="二次ボタンテキスト"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={content?.secondaryButtonUrl ?? ''}
              onChange={handleEdit('secondaryButtonUrl')}
              placeholder="二次ボタンURL"
            />
            <input
              className="w-full rounded-md border border-white/30 bg-white/50 px-3 py-2"
              value={content?.backgroundImageUrl ?? ''}
              onChange={handleEdit('backgroundImageUrl')}
              placeholder="背景画像URL"
            />
          </div>
        ) : null}

        <div className="space-y-6">
          {tagline ? (
            <div
              className="inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
              style={{
                color: accentColor,
                borderColor: withAlpha(accentColor, 0.4, accentColor),
                backgroundColor: withAlpha(accentColor, 0.12, accentColor),
              }}
            >
              {tagline}
            </div>
          ) : null}

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl" style={{ color: textColor }}>
            {title}
          </h1>

          {highlightText ? (
            <div
              className="text-lg font-medium tracking-widest sm:text-xl"
              style={{ color: accentColor }}
            >
              {highlightText}
            </div>
          ) : null}

          {subtitle ? (
            <p
              className="mx-auto max-w-3xl text-base sm:text-lg"
              style={{ color: withAlpha(textColor, 0.85, textColor) }}
            >
              {subtitle}
            </p>
          ) : null}

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryText ? (
              onProductClick && productId ? (
                <button
                  type="button"
                  onClick={() => {
                    onCtaClick?.(primaryCtaId, 'primary');
                    onProductClick(productId);
                  }}
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
                  style={primaryButtonStyle}
                >
                  {primaryText}
                </button>
              ) : (
                <Link
                  href={content?.buttonUrl ?? '#'}
                  onClick={() => onCtaClick?.(primaryCtaId, 'primary')}
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
                  style={primaryButtonStyle}
                >
                  {primaryText}
                </Link>
              )
            ) : null}

            {secondaryText ? (
              <Link
                href={content?.secondaryButtonUrl ?? '#'}
                onClick={() => onCtaClick?.(secondaryCtaId, 'secondary')}
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                style={secondaryButtonStyle}
              >
                {secondaryText}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
