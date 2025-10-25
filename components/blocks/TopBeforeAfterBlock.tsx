import { BeforeAfterBlockContent } from '@/types/templates';
import { withAlpha, mixWith } from '@/lib/color';

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

  const backgroundColor = content?.backgroundColor ?? '#0F172A';
  const textColor = content?.textColor ?? '#F8FAFC';
  const accentColor = content?.accentColor ?? '#38BDF8';
  const beforeAccent = mixWith(accentColor, '#F87171', 0.35);
  const afterAccent = accentColor;

  return (
    <section
      className="relative w-full py-16 sm:py-20"
      style={{
        backgroundColor,
        color: textColor,
        backgroundImage: `radial-gradient(circle at 20% 20%, ${withAlpha(accentColor, 0.18, accentColor)}, transparent 55%), radial-gradient(circle at 80% 30%, ${withAlpha(accentColor, 0.12, accentColor)}, transparent 60%)`,
      }}
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
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: textColor }}>
            {title}
          </h2>
        </div>

        <div
          className="grid grid-cols-1 gap-6 rounded-3xl border p-6 sm:grid-cols-2 sm:p-10"
          style={{
            borderColor: withAlpha(textColor, 0.14, textColor),
            backgroundColor: withAlpha(textColor, 0.06, textColor),
          }}
        >
          <div
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              backgroundColor: withAlpha(textColor, 0.08, textColor),
              color: textColor,
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.4em]"
              style={{ color: beforeAccent }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('before', { ...before, label: event.currentTarget.textContent ?? '' })}
            >
              {before.label}
            </span>
            <p
              className="text-sm leading-relaxed"
              style={{ color: withAlpha(textColor, 0.85, textColor) }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('before', { ...before, description: event.currentTarget.textContent ?? '' })}
            >
              {before.description}
            </p>
          </div>

          <div
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.4em]"
              style={{ color: afterAccent }}
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
