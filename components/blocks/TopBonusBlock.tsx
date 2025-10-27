import { useMemo } from 'react';
import { BonusListBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';

interface TopBonusBlockProps {
  content: BonusListBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopBonusBlock({ content, isEditing, onEdit }: TopBonusBlockProps) {
  const title = content?.title ?? '今だけの参加特典';
  const subtitle = content?.subtitle ?? '成果までの距離を一気に縮める特典を期間限定でご提供します。';
  const totalValue = content?.totalValue ?? '合計109,800円相当';
  const bonuses = useMemo(() => (
    Array.isArray(content?.bonuses) && content.bonuses.length > 0
      ? content.bonuses
      : [
          {
            title: '特典1：即実践ローンチテンプレ集',
            description: '成功事例をベースにした構成・コピー例を30種収録。',
            value: '29,800円相当',
          },
          {
            title: '特典2：AIコピー生成クレジット',
            description: '月間300クレジットを無償提供。キャッチコピー量産が可能に。',
            value: '39,800円相当',
          },
        ]
  ), [content?.bonuses]);

  const columnsClass = useMemo(() => {
    const count = bonuses.length;
    if (count <= 1) {
      return 'grid-cols-1 max-w-xl mx-auto';
    }
    if (count === 2) {
      return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    }
    if (count === 3) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [bonuses.length]);

  const updateBonusField = (index: number, field: 'title' | 'description' | 'value') =>
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = [...bonuses];
      next[index] = {
        ...next[index],
        [field]: event.currentTarget.textContent ?? '',
      };
      onEdit?.('bonuses', next);
    };

  const backgroundColor = content?.backgroundColor ?? '#EEF2FF';
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';

  return (
    <section
      className="relative w-full py-16 sm:py-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white/70 p-4 text-sm text-slate-700">
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
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={totalValue}
              onChange={(e) => onEdit?.('totalValue', e.target.value)}
              placeholder="特典合計" 
            />
          </div>
        ) : null}

        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: textColor }}>{title}</h2>
          <p
            className="mt-3 text-base sm:text-lg"
            style={{ color: withAlpha(textColor, 0.72, textColor) }}
          >
            {subtitle}
          </p>
        </div>

        <div className={`grid gap-4 ${columnsClass}`}>
          {bonuses.map((bonus, index) => (
            <div
              key={index}
              className="flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-sm"
              style={{
                borderColor: withAlpha(accentColor, 0.2, accentColor),
                backgroundColor: withAlpha(accentColor, 0.08, '#FFFFFF'),
              }}
            >
              <div
                className="text-sm font-semibold"
                style={{ color: accentColor }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateBonusField(index, 'title')}
              >
                {bonus.title}
              </div>
              <div
                className="flex-1 text-sm leading-relaxed"
                style={{ color: withAlpha(textColor, 0.8, textColor) }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateBonusField(index, 'description')}
              >
                {bonus.description ?? ''}
              </div>
              <div
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: withAlpha(accentColor, 0.18, accentColor),
                  color: accentColor,
                }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateBonusField(index, 'value')}
              >
                {bonus.value ?? ''}
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl border px-6 py-4 text-center text-sm font-semibold"
          style={{
            borderColor: withAlpha(accentColor, 0.35, accentColor),
            backgroundColor: withAlpha(accentColor, 0.12, accentColor),
            color: accentColor,
          }}
        >
          {totalValue}
        </div>
      </div>
    </section>
  );
}
