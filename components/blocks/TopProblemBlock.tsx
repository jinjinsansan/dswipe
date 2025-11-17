import { ProblemBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

interface TopProblemBlockProps {
  content: ProblemBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopProblemBlock({ content, isEditing, onEdit }: TopProblemBlockProps) {
  const title = content?.title ?? 'こんなお悩みはありませんか？';
  const subtitle = content?.subtitle ?? '情報を届けたいのに、ローンチ準備が複雑すぎると諦めていませんか。';
  const problems = Array.isArray(content?.problems) && content.problems.length > 0
    ? content.problems
    : [
        '構成やコピーをゼロから考える時間がない',
        'デザイン調整とコーディングで徹夜続き',
      ];

  const updateProblem = (index: number) => (event: React.FocusEvent<HTMLDivElement>) => {
    const next = [...problems];
    next[index] = event.currentTarget.textContent ?? '';
    onEdit?.('problems', next);
  };

  const backgroundColor = content?.backgroundColor ?? '#FFFFFF';
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  return (
    <section
      className="relative w-full py-section-sm sm:py-section"
      style={{
        ...backgroundStyle,
        color: textColor,
      }}
    >
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
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
              placeholder="サブタイトル"
            />
          </div>
        ) : null}

        <div className="responsive-stack items-center text-center">
          <h2 className="typo-headline text-pretty font-bold" style={{ color: textColor }}>
            {title}
          </h2>
          <p
            className="typo-body text-pretty"
            style={{ color: withAlpha(textColor, 0.7, textColor) }}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-card border p-4 shadow-sm"
              style={{
                borderColor: withAlpha(textColor, 0.12, textColor),
                backgroundColor: withAlpha(accentColor, 0.05, '#FFFFFF'),
              }}
            >
              <span
                className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-semibold typo-body"
                style={{
                  backgroundColor: accentColor,
                  color: '#FFFFFF',
                }}
              >
                {index + 1}
              </span>
              <div
                className="typo-body text-pretty"
                style={{ color: withAlpha(textColor, 0.85, textColor) }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateProblem(index)}
              >
                {problem}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
