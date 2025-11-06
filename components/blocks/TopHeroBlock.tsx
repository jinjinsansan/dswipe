import AutoPlayVideo from '@/components/AutoPlayVideo';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { HeroBlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';
import { resolveButtonUrl } from '@/lib/url';

const FALLBACK_VIDEO = 'https://storage.googleapis.com/d-swipe-assets/videos/launch-loop.mp4';

interface TopHeroBlockProps {
  content: HeroBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
  onFieldFocus?: (field: string) => void;
  withinEditor?: boolean;
  primaryLinkLock?: {
    type: 'product' | 'salon';
    label: string;
  };
}

export default function TopHeroBlock({ content, isEditing, onEdit, productId, onProductClick, ctaIds, onCtaClick, onFieldFocus, withinEditor, primaryLinkLock }: TopHeroBlockProps) {
  const tagline = content?.tagline ?? 'NEXT LAUNCH';
  const highlightText = content?.highlightText ?? '５分でLP公開';
  const title = content?.title ?? '情報には鮮度がある。';
  const subtitle = content?.subtitle ?? 'スワイプ型LP作成プラットフォームで、今すぐデジタルコンテンツを販売';
  const primaryText = content?.buttonText ?? '無料で始める';
  const secondaryText = content?.secondaryButtonText ?? 'ログイン';
  const videoUrl = content?.backgroundVideoUrl ?? FALLBACK_VIDEO;
  const textColor = content?.textColor ?? '#FFFFFF';
  const accentColor = content?.accentColor ?? '#38BDF8';
  const buttonColor = content?.buttonColor ?? '#38BDF8';
  const secondaryButtonColor = content?.secondaryButtonColor ?? withAlpha(textColor, 0.35, textColor);
  const overlayBase = content?.overlayColor ?? content?.backgroundColor ?? '#0B1120';
  const primaryCtaId = ctaIds?.[0];
  const secondaryCtaId = ctaIds?.[1];
  const isLocked = Boolean(primaryLinkLock) && withinEditor;
  const lockMessage = primaryLinkLock?.type === 'salon' ? 'オンラインサロンに紐づけされています' : '商品に紐づけされています';

  const createFieldFocusHandler = <T extends HTMLElement>(field: string, fallback?: () => void) => {
    return (event: React.MouseEvent<T>) => {
      if (onFieldFocus) {
        event.preventDefault();
        event.stopPropagation();
        onFieldFocus(field);
        return;
      }

      fallback?.();
    };
  };

  const overlayStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${withAlpha(accentColor, 0.45, accentColor)}, ${withAlpha(overlayBase, 0.88, overlayBase)})`,
  };

  const primaryButtonStyle: CSSProperties = {
    backgroundColor: isLocked ? withAlpha('#64748b', 0.2, '#64748b') : buttonColor,
    color: isLocked ? '#475569' : getContrastColor(buttonColor),
    border: `1px solid ${isLocked ? withAlpha('#64748b', 0.4, '#64748b') : buttonColor}`,
    cursor: isLocked ? 'not-allowed' : undefined,
    boxShadow: isLocked ? undefined : `0 20px 45px -18px ${withAlpha(buttonColor, 0.4, buttonColor)}`,
  };
  const resolvedPrimaryUrl = withinEditor ? content?.buttonUrl ?? '#' : resolveButtonUrl(content?.buttonUrl);
  const resolvedSecondaryUrl = withinEditor ? content?.secondaryButtonUrl ?? '#' : resolveButtonUrl(content?.secondaryButtonUrl);

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
      <div className="absolute inset-0">
        {videoUrl ? (
          <AutoPlayVideo
            className="absolute inset-0 h-full w-full object-cover"
            src={videoUrl}
          />
        ) : null}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center">
        {isEditing ? (
          <div className="mb-6 grid w-full gap-3 rounded-xl bg-black/30 p-4 text-left">
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={tagline}
              onChange={handleEdit('tagline')}
              placeholder="タグライン"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={highlightText}
              onChange={handleEdit('highlightText')}
              placeholder="ハイライトテキスト"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={title}
              onChange={handleEdit('title')}
              placeholder="メイン見出し"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={subtitle}
              onChange={handleEdit('subtitle')}
              placeholder="サブコピー"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={primaryText}
              onChange={handleEdit('buttonText')}
              placeholder="一次ボタンテキスト"
            />
            <input
              className={`w-full rounded-md border px-3 py-2 text-sm ${isLocked ? 'border-white/20 bg-black/30 text-white/60 cursor-not-allowed' : 'border-white/20 bg-black/40'}`}
              value={content?.buttonUrl ?? ''}
              onChange={isLocked ? undefined : handleEdit('buttonUrl')}
              placeholder="http://"
              readOnly={isLocked}
              aria-disabled={isLocked}
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={secondaryText}
              onChange={handleEdit('secondaryButtonText')}
              placeholder="二次ボタンテキスト"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={content?.secondaryButtonUrl ?? ''}
              onChange={handleEdit('secondaryButtonUrl')}
              placeholder="http://"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={videoUrl}
              onChange={handleEdit('backgroundVideoUrl')}
              placeholder="背景動画URL"
            />
          </div>
        ) : null}

        <div className="responsive-stack items-center">
          <div
            className="inline-flex items-center justify-center rounded-full border px-4 py-1 font-semibold typo-eyebrow"
            style={{
              color: accentColor,
              borderColor: withAlpha(accentColor, 0.4, accentColor),
              backgroundColor: withAlpha(accentColor, 0.12, accentColor),
            }}
            onClick={createFieldFocusHandler<HTMLDivElement>('hero.tagline')}
          >
            {tagline}
          </div>

          <h1
            className="typo-display text-balance font-bold"
            style={{ color: textColor }}
            onClick={createFieldFocusHandler<HTMLHeadingElement>('hero.title')}
          >
            {title}
          </h1>

          <div
            className="typo-highlight font-medium text-pretty"
            style={{ color: accentColor }}
            onClick={createFieldFocusHandler<HTMLDivElement>('hero.highlightText')}
          >
            {highlightText}
          </div>

          <p
            className="mx-auto max-w-3xl typo-body-lg text-pretty"
            style={{ color: withAlpha(textColor, 0.85, textColor) }}
            onClick={createFieldFocusHandler<HTMLParagraphElement>('hero.subtitle')}
          >
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryText ? (
              isLocked ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition"
                  style={primaryButtonStyle}
                  disabled
                >
                  {primaryText}
                </button>
              ) : onProductClick && productId ? (
                <button
                  type="button"
                  onClick={createFieldFocusHandler<HTMLButtonElement>('hero.buttonText', () => {
                    onCtaClick?.(primaryCtaId, 'primary');
                    onProductClick?.(productId);
                  })}
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
                  style={primaryButtonStyle}
                >
                  {primaryText}
                </button>
              ) : (
                <Link
                  href={resolvedPrimaryUrl}
                  onClick={createFieldFocusHandler<HTMLAnchorElement>('hero.buttonText', () => {
                    onCtaClick?.(primaryCtaId, 'primary');
                  })}
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
                  style={primaryButtonStyle}
                >
                  {primaryText}
                </Link>
              )
            ) : null}

            {secondaryText ? (
              <Link
                href={resolvedSecondaryUrl}
                onClick={createFieldFocusHandler<HTMLAnchorElement>('hero.secondaryButtonText', () => {
                  onCtaClick?.(secondaryCtaId, 'secondary');
                })}
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                style={secondaryButtonStyle}
              >
                {secondaryText}
              </Link>
            ) : null}
          </div>
          {isLocked && (
            <p className="mt-2 text-xs text-slate-500">
              {lockMessage}
              {primaryLinkLock?.label ? `（${primaryLinkLock.label}）` : ''}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
