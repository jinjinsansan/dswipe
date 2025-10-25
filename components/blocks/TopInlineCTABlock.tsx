import Link from 'next/link';
import type { CSSProperties } from 'react';
import { InlineCTABlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';

interface TopInlineCTABlockProps {
  content: InlineCTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

export default function TopInlineCTABlock({ content, isEditing, onEdit, productId, onProductClick }: TopInlineCTABlockProps) {
  const eyebrow = content?.eyebrow ?? '限定プログラム';
  const title = content?.title ?? '今すぐAIローンチを体験する';
  const subtitle = content?.subtitle ?? 'アカウント作成から公開までを最短5分で完了。初月の成果創出まで伴走します。';
  const buttonText = content?.buttonText ?? '無料で始める';
  const buttonUrl = content?.buttonUrl ?? '/register';
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';
  const buttonColor = content?.buttonColor ?? accentColor;

  const primaryButtonStyle: CSSProperties = {
    backgroundColor: buttonColor,
    color: getContrastColor(buttonColor),
    border: `1px solid ${buttonColor}`,
    outlineColor: withAlpha(accentColor, 0.5, accentColor),
  };

  return (
    <section
      className="relative w-full py-12"
      style={{ backgroundColor: content?.backgroundColor ?? '#FFFFFF', color: textColor }}
    >
      <div
        className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl border px-6 py-10 text-center shadow-sm sm:px-10"
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
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={buttonUrl}
              onChange={(e) => onEdit?.('buttonUrl', e.target.value)}
              placeholder="ボタンURL"
            />
          </div>
        ) : null}

        <span
          className="text-xs font-semibold uppercase tracking-[0.35em]"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </span>
        <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: textColor }}>{title}</h2>
        <p
          className="text-sm leading-relaxed sm:text-base"
          style={{ color: withAlpha(textColor, 0.75, textColor) }}
        >
          {subtitle}
        </p>

        <div className="mt-2 flex justify-center">
          {onProductClick ? (
            <button
              type="button"
              onClick={() => onProductClick(productId)}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={primaryButtonStyle}
            >
              {buttonText}
            </button>
          ) : (
            <Link
              href={buttonUrl}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={primaryButtonStyle}
            >
              {buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
