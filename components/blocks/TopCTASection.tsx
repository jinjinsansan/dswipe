import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CTABlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';

interface TopCTASectionProps {
  content: CTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

export default function TopCTASection({ content, isEditing, onEdit, productId, onProductClick }: TopCTASectionProps) {
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
      'inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent shadow-sm';

    if (onProductClick) {
      return (
        <button
          type="button"
          onClick={() => onProductClick(productId)}
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
        href={content?.buttonUrl ?? '#'}
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
      'inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent border';

    return (
      <Link
        href={content?.secondaryButtonUrl ?? '#'}
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
    <section className="relative w-full overflow-hidden py-20" style={backgroundStyle}>
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
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={content?.buttonUrl ?? ''}
                onChange={(e) => onEdit?.('buttonUrl', e.target.value)}
                placeholder="一次ボタンURL"
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
                placeholder="二次ボタンURL"
              />
            </div>
          </div>
        ) : null}

        <div
          className="relative w-full overflow-hidden rounded-[32px] border border-white/10 p-8 sm:p-12"
          style={{ backgroundColor: surfaceColor }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, transparent 20%, ${withAlpha(accentColor, 0.22, accentColor)} 45%, transparent 80%)`,
            }}
          />

          <div className="relative flex flex-col items-center gap-6 sm:gap-8">
            {eyebrow ? (
              <span
                className="text-xs font-semibold uppercase tracking-[0.45em]"
                style={{ color: accentColor }}
              >
                {eyebrow}
              </span>
            ) : null}

            <h2 className="text-4xl font-bold sm:text-5xl" style={{ color: textColor }}>
              {title}
            </h2>
            <p
              className="max-w-2xl text-base sm:text-lg"
              style={{ color: textColor, opacity: 0.82 }}
            >
              {subtitle}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryAction />
              <SecondaryAction />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
