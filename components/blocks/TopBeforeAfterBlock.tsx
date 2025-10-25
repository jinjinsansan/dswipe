import { BeforeAfterBlockContent } from '@/types/templates';

interface TopBeforeAfterBlockProps {
  content: BeforeAfterBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopBeforeAfterBlock({ content, isEditing, onEdit }: TopBeforeAfterBlockProps) {
  const title = content?.title ?? '導入前と導入後の変化';
  const before = content?.before ?? {
    label: 'Before',
    description: '毎回ローンチごとに構成作りとデザインで徹夜。公開までに最低でも2週間はかかっていた。',
  };
  const after = content?.after ?? {
    label: 'After',
    description: 'AIが構成とコピーを自動生成。チーム3名で週1本のローンチを回せる体制に。',
  };

  return (
    <section
      className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 text-white sm:py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white/10 p-4 text-sm text-slate-100">
            <input
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              placeholder="タイトル"
            />
          </div>
        ) : null}

        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 rounded-3xl border border-white/15 bg-white/[0.06] p-6 sm:grid-cols-2 sm:p-10">
          <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.06] p-5">
            <span
              className="text-xs font-semibold uppercase tracking-[0.4em] text-pink-200"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('before', { ...before, label: event.currentTarget.textContent ?? '' })}
            >
              {before.label}
            </span>
            <p
              className="text-sm leading-relaxed text-slate-100"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('before', { ...before, description: event.currentTarget.textContent ?? '' })}
            >
              {before.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 text-slate-900">
            <span
              className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('after', { ...after, label: event.currentTarget.textContent ?? '' })}
            >
              {after.label}
            </span>
            <p
              className="text-sm leading-relaxed"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('after', { ...after, description: event.currentTarget.textContent ?? '' })}
            >
              {after.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
