import { useMemo } from 'react';
import { FlexibleBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';

interface TopFlexibleBlockProps {
  content: FlexibleBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: unknown) => void;
}

export default function TopFlexibleBlock({ content, isEditing, onEdit }: TopFlexibleBlockProps) {
  const topHeading = content?.topHeading ?? '見出し';
  const body = content?.body ?? '説明文';
  const bottomHeading = content?.bottomHeading ?? '見出し';
  const layout = content?.layout === 'left' ? 'left' : 'center';

  const backgroundColor = content?.backgroundColor ?? '#FFFFFF';
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';

  const displayTopHeading = topHeading?.trim() ?? '';
  const displayBody = body ?? '';
  const displayBottomHeading = bottomHeading?.trim() ?? '';

  const paragraphs = useMemo(() => {
    if (!displayBody) {
      return [] as string[];
    }
    return displayBody
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [displayBody]);

  const alignmentClasses = layout === 'left'
    ? 'items-start text-left'
    : 'items-center text-center';

  return (
    <section
      className="relative w-full py-section-sm sm:py-section"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6">
        {isEditing ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur text-sm text-slate-700 space-y-3">
            <div className="space-y-2">
              <label className="block font-medium text-slate-700">上部見出し</label>
              <input
                type="text"
                value={topHeading}
                onChange={(event) => onEdit?.('topHeading', event.target.value)}
                placeholder="見出し（空欄で非表示）"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-slate-700">説明文</label>
              <textarea
                value={body}
                onChange={(event) => onEdit?.('body', event.target.value)}
                placeholder="説明文（空欄で非表示）"
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-slate-700">下部見出し</label>
              <input
                type="text"
                value={bottomHeading}
                onChange={(event) => onEdit?.('bottomHeading', event.target.value)}
                placeholder="見出し（空欄で非表示）"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-slate-500">すべてのテキストは空欄にすると非表示になります。</p>
          </div>
        ) : null}

        <div className={`flex flex-col gap-6 ${alignmentClasses}`}>
          {displayTopHeading ? (
            <h2
              className="typo-headline text-pretty font-bold tracking-tight"
              style={{ color: withAlpha(textColor, 0.94, textColor) }}
            >
              {displayTopHeading}
            </h2>
          ) : null}

          {paragraphs.length > 0 ? (
            <div
              className="space-y-4 text-pretty"
              style={{ color: withAlpha(textColor, 0.78, textColor) }}
            >
              {paragraphs.map((paragraph, index) => (
                <p className="typo-body leading-relaxed" key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {displayBottomHeading ? (
            <h3
              className="typo-subheadline text-pretty font-semibold"
              style={{ color: accentColor }}
            >
              {displayBottomHeading}
            </h3>
          ) : null}
        </div>
      </div>
    </section>
  );
}
