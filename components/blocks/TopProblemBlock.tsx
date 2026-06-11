import { XMarkIcon } from '@heroicons/react/24/outline';
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
  const textColor = content?.textColor ?? '#0B1F3A';
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

        {/* mock: editor.css .sc-problem — リード見出し＋×チップの行リスト */}
        <div className="responsive-stack items-center text-center">
          <h2
            className="typo-headline text-pretty font-extrabold"
            style={{ color: textColor, letterSpacing: '-0.02em', lineHeight: 1.4 }}
          >
            {title}
          </h2>
          <p
            className="typo-body text-pretty"
            style={{ color: withAlpha(textColor, 0.7, textColor), lineHeight: 1.7 }}
          >
            {subtitle}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:gap-4">
          {problems.map((problem, index) => (
            <div key={index} className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[8px]"
                style={{
                  backgroundColor: 'rgba(248, 113, 113, 0.18)',
                  color: '#F87171',
                }}
              >
                <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <div
                className="typo-body flex-1 text-left text-pretty"
                style={{ color: withAlpha(textColor, 0.88, textColor), lineHeight: 1.6 }}
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
