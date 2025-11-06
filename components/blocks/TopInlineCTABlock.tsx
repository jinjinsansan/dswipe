import Link from 'next/link';
import type { CSSProperties } from 'react';
import { InlineCTABlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';
import { resolveButtonUrl } from '@/lib/url';

interface TopInlineCTABlockProps {
  content: InlineCTABlockContent;
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

export default function TopInlineCTABlock({ content, isEditing, onEdit, productId, onProductClick, ctaIds, onCtaClick, onFieldFocus, withinEditor, primaryLinkLock }: TopInlineCTABlockProps) {
  const eyebrow = content?.eyebrow ?? '限定プログラム';
  const title = content?.title ?? '今すぐAIローンチを体験する';
  const subtitle = content?.subtitle ?? 'アカウント作成から公開までを最短5分で完了。初月の成果創出まで伴走します。';
  const buttonText = content?.buttonText ?? '無料で始める';
  const buttonUrl = content?.buttonUrl ?? '';
  const resolvedButtonUrl = withinEditor ? (buttonUrl || '#') : resolveButtonUrl(buttonUrl);
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';
  const buttonColor = content?.buttonColor ?? accentColor;
  const primaryCtaId = ctaIds?.[0];
  const rawUseLinkedProduct = content?.useLinkedProduct;
  const defaultUseLinkedProduct = Boolean(primaryLinkLock || productId);
  const useLinkedProduct = typeof rawUseLinkedProduct === 'boolean' ? rawUseLinkedProduct : defaultUseLinkedProduct;
  const isLocked = Boolean(primaryLinkLock) && withinEditor && useLinkedProduct;
  const lockMessage = primaryLinkLock?.type === 'salon' ? 'オンラインサロンに紐づけされています' : '商品に紐づけされています';
  const shouldUseProductCTA = useLinkedProduct && onProductClick && productId;

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

  const primaryButtonStyle: CSSProperties = {
    backgroundColor: isLocked ? withAlpha('#64748b', 0.2, '#64748b') : buttonColor,
    color: isLocked ? '#475569' : getContrastColor(buttonColor),
    border: `1px solid ${isLocked ? withAlpha('#64748b', 0.4, '#64748b') : buttonColor}`,
    outlineColor: withAlpha(accentColor, 0.5, accentColor),
    cursor: isLocked ? 'not-allowed' : undefined,
  };

  return (
    <section
      className="relative w-full py-12"
      style={{ backgroundColor: content?.backgroundColor ?? '#FFFFFF', color: textColor }}
    >
      <div
        className="responsive-panel mx-auto w-full max-w-4xl rounded-card border text-center shadow-sm"
        style={{
          borderColor: withAlpha(accentColor, 0.25, accentColor),
          backgroundColor: withAlpha(accentColor, 0.06, accentColor),
        }}
      >
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
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
              value={buttonText}
              onChange={(e) => onEdit?.('buttonText', e.target.value)}
              placeholder="ボタンテキスト"
            />
            <input
              className={`w-full rounded-md border px-3 py-2 bg-white ${isLocked ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed' : 'border-slate-200'}`}
              value={buttonUrl}
              onChange={isLocked ? undefined : ((e) => onEdit?.('buttonUrl', e.target.value))}
              placeholder="https://"
              readOnly={isLocked}
              aria-disabled={isLocked}
            />
          </div>
        ) : null}

        <span
          className="font-semibold typo-eyebrow"
          style={{ color: accentColor }}
          onClick={createFieldFocusHandler<HTMLSpanElement>('inlineCTA.eyebrow')}
        >
          {eyebrow}
        </span>
        <h2
          className="typo-headline text-pretty font-bold"
          style={{ color: textColor }}
          onClick={createFieldFocusHandler<HTMLHeadingElement>('inlineCTA.title')}
        >
          {title}
        </h2>
        <p
          className="typo-body text-pretty"
          style={{ color: withAlpha(textColor, 0.75, textColor) }}
          onClick={createFieldFocusHandler<HTMLParagraphElement>('inlineCTA.subtitle')}
        >
          {subtitle}
        </p>

        <div className="mt-2 flex flex-col items-center justify-center gap-2">
          {isLocked ? (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold typo-body-lg transition"
              style={primaryButtonStyle}
              disabled
            >
              {buttonText}
            </button>
          ) : shouldUseProductCTA ? (
            <button
              type="button"
              onClick={createFieldFocusHandler<HTMLButtonElement>('inlineCTA.buttonText', () => {
                onCtaClick?.(primaryCtaId, 'primary');
                onProductClick?.(productId);
              })}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold typo-body-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={primaryButtonStyle}
            >
              {buttonText}
            </button>
          ) : (
            <Link
              href={resolvedButtonUrl}
              onClick={createFieldFocusHandler<HTMLAnchorElement>('inlineCTA.buttonText', () => {
                onCtaClick?.(primaryCtaId, 'primary');
              })}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold typo-body-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={primaryButtonStyle}
            >
              {buttonText}
            </Link>
          )}
          {isLocked && (
            <p className="text-xs text-slate-500">
              {lockMessage}
              {primaryLinkLock?.label ? `（${primaryLinkLock.label}）` : ''}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
