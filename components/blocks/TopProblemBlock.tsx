import { ProblemBlockContent } from '@/types/templates';

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
        '決済連携や会員エリアの仕組み化が難しい',
        '旬な情報を出したいのに公開までが遅い',
      ];

  const updateProblem = (index: number) => (event: React.FocusEvent<HTMLDivElement>) => {
    const next = [...problems];
    next[index] = event.currentTarget.textContent ?? '';
    onEdit?.('problems', next);
  };

  return (
    <section
      className="relative w-full bg-white py-16 text-slate-900 sm:py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
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

        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg" style={{ color: content?.textColor ? `${content.textColor}cc` : undefined }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {problems.map((problem, index) => (
            <div key={index} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div
                className="text-sm leading-relaxed text-slate-700"
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
