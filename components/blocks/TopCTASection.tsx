import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CTABlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';
import { resolveButtonUrl } from '@/lib/url';

interface TopCTASectionProps {
  content: CTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
  withinEditor?: boolean;
  primaryLinkLock?: {
    type: 'product' | 'salon';
    label: string;
  };
}

export default function TopCTASection({ content, isEditing, onEdit, productId, onProductClick, ctaIds, onCtaClick, withinEditor, primaryLinkLock }: TopCTASectionProps) {
  const textColor = content?.textColor ?? '#ECFEFF';
  const accentColor = content?.accentColor ?? '#38BDF8';
  const buttonColor = content?.buttonColor ?? accentColor;
  const secondaryColor = content?.secondaryButtonColor ?? accentColor;
  const surfaceColor = content?.surfaceColor ?? '#10233F';
  const eyebrow = content?.eyebrow ?? 'Launch Ready';
  const title = content?.title ?? '今すぐ始めよう';
  const subtitle = content?.subtitle ?? '情報には鮮度がある。５分でLPを公開して、今すぐ販売を開始。';
  const primaryText = content?.buttonText ?? '無料で始める';
  const secondaryText = content?.secondaryButtonText ?? '';
  const primaryCtaId = ctaIds?.[0];
  const secondaryCtaId = ctaIds?.[1];
  const isLocked = Boolean(primaryLinkLock) && withinEditor;
  const lockMessage = primaryLinkLock?.type === 'salon' ? 'オンラインサロンに紐づけされています' : '商品に紐づけされています';
  const resolvedPrimaryUrl = withinEditor ? content?.buttonUrl ?? '#' : resolveButtonUrl(content?.buttonUrl);
  const resolvedSecondaryUrl = withinEditor ? content?.secondaryButtonUrl ?? '#' : resolveButtonUrl(content?.secondaryButtonUrl);

  const backgroundStyle: CSSProperties = {
    backgroundColor: content?.backgroundColor ?? '#07182F',
    color: textColor,
  };

  if (content?.backgroundGradient) {
    backgroundStyle.backgroundImage = content.backgroundGradient;
  }

  const primaryTextColor = getContrastColor(buttonColor, '#F8FAFC', '#0F172A');
  const secondaryTextColor = secondaryColor;

  const PrimaryAction = () => {
    if (!primaryText) return null;

    const commonClasses =
      'inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold typo-body-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent shadow-sm';

    if (isLocked) {
      return (
        <button
          type="button"
          className={commonClasses}
          style={{
            backgroundColor: withAlpha('#64748b', 0.2, '#64748b'),
            color: '#475569',
            border: '1px solid rgba(100,116,139,0.4)',
            cursor: 'not-allowed',
          }}
          disabled
        >
          {primaryText}
        </button>
      );
    }

    if (onProductClick && productId) {
      return (
        <button
          type="button"
          onClick={() => {
            onCtaClick?.(primaryCtaId, 'primary');
            onProductClick(productId);
          }}
          className={commonClasses}
          style={{
            backgroundColor: buttonColor,
            color: primaryTextColor,
            border: `1px solid ${buttonColor}`,
          }}
        >
          {primaryText}
        </button>
      );
    }

    return (
      <Link
        href={resolvedPrimaryUrl}
        onClick={() => onCtaClick?.(primaryCtaId, 'primary')}
        className={commonClasses}
        style={{
          backgroundColor: buttonColor,
          color: primaryTextColor,
          border: `1px solid ${buttonColor}`,
        }}
      >
        {primaryText}
      </Link>
    );
  };

  const SecondaryAction = () => {
    if (!secondaryText) return null;

    const classes =
      'inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold typo-body-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent border';

    return (
      <Link
        href={resolvedSecondaryUrl}
        onClick={() => onCtaClick?.(secondaryCtaId, 'secondary')}
        className={classes}
        style={{
          color: secondaryTextColor,
          borderColor: secondaryColor,
          backgroundColor: 'transparent',
        }}
      >
        {secondaryText}
      </Link>
    );
  };

  return (
    <section className="relative w-full overflow-hidden py-section-sm sm:py-section" style={backgroundStyle}>
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${withAlpha(accentColor, 0.35, accentColor)} 0%, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-12 h-56 w-56 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${withAlpha(accentColor, 0.28, accentColor)} 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
        {isEditing ? (
          <div className="w-full rounded-xl bg-white/70 p-4 text-left text-sm text-slate-700">
            <div className="grid gap-3">
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={eyebrow}
                onChange={(e) => onEdit?.('eyebrow', e.target.value)}
                placeholder="ラベル"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={title}
                onChange={(e) => onEdit?.('title', e.target.value)}
                placeholder="タイトル"
              />
              <textarea
                className="min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2"
                value={subtitle}
                onChange={(e) => onEdit?.('subtitle', e.target.value)}
                placeholder="サブコピー"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={primaryText}
                onChange={(e) => onEdit?.('buttonText', e.target.value)}
                placeholder="一次ボタンテキスト"
              />
              <input
                className={`w-full rounded-md border px-3 py-2 bg-white ${isLocked ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed' : 'border-slate-200'}`}
                value={content?.buttonUrl ?? ''}
                onChange={isLocked ? undefined : ((e) => onEdit?.('buttonUrl', e.target.value))}
                placeholder="http://"
                readOnly={isLocked}
                aria-disabled={isLocked}
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={secondaryText}
                onChange={(e) => onEdit?.('secondaryButtonText', e.target.value)}
                placeholder="二次ボタンテキスト"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={content?.secondaryButtonUrl ?? ''}
                onChange={(e) => onEdit?.('secondaryButtonUrl', e.target.value)}
                placeholder="http://"
              />
            </div>
          </div>
        ) : null}

        <div
          className="relative w-full overflow-hidden rounded-card border border-white/10 p-8 sm:p-12"
          style={{ backgroundColor: surfaceColor }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, transparent 20%, ${withAlpha(accentColor, 0.22, accentColor)} 45%, transparent 80%)`,
            }}
          />

          <div className="relative responsive-stack items-center sm:gap-8">
            {eyebrow ? (
              <span
                className="font-semibold typo-eyebrow"
                style={{ color: accentColor }}
              >
                {eyebrow}
              </span>
            ) : null}

            <h2 className="typo-headline text-pretty font-bold" style={{ color: textColor }}>
              {title}
            </h2>
            <p
              className="max-w-2xl typo-body-lg text-pretty"
              style={{ color: textColor, opacity: 0.82 }}
            >
              {subtitle}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryAction />
              <SecondaryAction />
            </div>
          </div>
            {isLocked && (
              <p className="mt-2 text-xs text-cyan-100">
                {lockMessage}
                {primaryLinkLock?.label ? `（${primaryLinkLock.label}）` : ''}
              </p>
            )}
        </div>
      </div>
    </section>
  );
}
