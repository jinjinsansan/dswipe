import { GuaranteeBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';

interface TopGuaranteeBlockProps {
  content: GuaranteeBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopGuaranteeBlock({ content, isEditing, onEdit }: TopGuaranteeBlockProps) {
  const title = content?.title ?? '30日間 全額返金保証';
  const subtitle = content?.subtitle ?? 'リスクゼロで体験いただくために、安心の保証制度を用意しています。';
  const guaranteeDetails = content?.guaranteeDetails ?? '条件は一切ありません。実際に使ってみてご満足いただけなければ、メール一本で全額返金いたします。';
  const badgeText = content?.badgeText ?? 'Risk Free';
  const bulletPoints = Array.isArray(content?.bulletPoints) && content.bulletPoints.length > 0
    ? content.bulletPoints
    : [
        '専任サポートが導入〜初回ローンチまで伴走',
        '再現性の高いAIプロンプトテンプレート付き',
        '返金サポート専用窓口を24時間以内に対応',
      ];

  const updateBullet = (index: number) => (event: React.FocusEvent<HTMLDivElement>) => {
    const next = [...bulletPoints];
    next[index] = event.currentTarget.textContent ?? '';
    onEdit?.('bulletPoints', next);
  };

  const backgroundColor = content?.backgroundColor ?? '#020617';
  const textColor = content?.textColor ?? '#F8FAFC';
  const accentColor = content?.accentColor ?? '#34D399';

  return (
    <section
      className="relative w-full py-16 sm:py-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-white/10 p-4 text-sm text-slate-100">
            <input
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={badgeText}
              onChange={(e) => onEdit?.('badgeText', e.target.value)}
              placeholder="バッジテキスト"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              placeholder="タイトル"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={subtitle}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              placeholder="サブタイトル"
            />
            <textarea
              className="min-h-[100px] w-full rounded-md border border-white/20 bg-white/10 px-3 py-2"
              value={guaranteeDetails}
              onChange={(e) => onEdit?.('guaranteeDetails', e.target.value)}
              placeholder="保証詳細"
            />
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em]"
            style={{
              borderColor: withAlpha(accentColor, 0.6, accentColor),
              backgroundColor: withAlpha(accentColor, 0.12, accentColor),
              color: withAlpha(accentColor, 0.9, accentColor),
            }}
          >
            {badgeText}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: textColor }}>{title}</h2>
          <p
            className="max-w-2xl text-base sm:text-lg"
            style={{ color: withAlpha(textColor, 0.75, textColor) }}
          >
            {subtitle}
          </p>
        </div>

        <div
          className="rounded-3xl border p-6 backdrop-blur"
          style={{
            borderColor: withAlpha(textColor, 0.12, textColor),
            backgroundColor: withAlpha(textColor, 0.08, textColor),
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: withAlpha(textColor, 0.85, textColor) }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(event) => onEdit?.('guaranteeDetails', event.currentTarget.textContent ?? '')}
          >
            {guaranteeDetails}
          </p>

          <ul className="mt-6 flex flex-col gap-3 text-sm" style={{ color: withAlpha(textColor, 0.85, textColor) }}>
            {bulletPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: accentColor,
                    color: '#0F172A',
                  }}
                >
                  ✓
                </span>
                <div
                  className="flex-1"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateBullet(index)}
                >
                  {point}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
