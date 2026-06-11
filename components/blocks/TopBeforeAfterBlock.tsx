import { BeforeAfterBlockContent } from '@/types/templates';
import { withAlpha, mixWith } from '@/lib/color';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';

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

  const backgroundColor = content?.backgroundColor ?? '#0B1F3A';
  const textColor = content?.textColor ?? '#F8FAFC';
  const accentColor = content?.accentColor ?? '#22D3EE';
  const beforeAccent = mixWith(accentColor, '#F87171', 0.35);
  const afterAccent = accentColor;
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;
  const gradientLayer = `radial-gradient(circle at 20% 20%, ${withAlpha(accentColor, 0.18, accentColor)}, transparent 55%), radial-gradient(circle at 80% 30%, ${withAlpha(accentColor, 0.12, accentColor)}, transparent 60%)`;

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
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: gradientLayer }} />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
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

        {/* mock: Block Library .sc-compare — Before=ニュートラル面 / After=シアンティント面 */}
        <div className="responsive-stack items-center text-center">
          <h2
            className="typo-headline text-pretty font-extrabold"
            style={{ color: textColor, letterSpacing: '-0.02em' }}
          >
            {title}
          </h2>
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div
            className="responsive-stack rounded-[12px] p-5 sm:p-6"
            style={{
              backgroundColor: withAlpha(textColor, 0.06, textColor),
              border: `1px solid ${withAlpha(textColor, 0.1, textColor)}`,
              color: textColor,
            }}
          >
            <span
              className="font-extrabold typo-eyebrow"
              style={{ color: withAlpha(beforeAccent, 0.85, beforeAccent) }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('before', { ...before, label: event.currentTarget.textContent ?? '' })}
            >
              {before.label}
            </span>
            <p
              className="typo-body text-pretty"
              style={{ color: withAlpha(textColor, 0.78, textColor), lineHeight: 1.6 }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('before', { ...before, description: event.currentTarget.textContent ?? '' })}
            >
              {before.description}
            </p>
          </div>

          <div
            className="responsive-stack rounded-[12px] p-5 sm:p-6"
            style={{
              backgroundColor: withAlpha(afterAccent, 0.14, afterAccent),
              border: `1px solid ${withAlpha(afterAccent, 0.3, afterAccent)}`,
              color: textColor,
            }}
          >
            <span
              className="font-extrabold typo-eyebrow"
              style={{ color: afterAccent }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(event) => onEdit?.('after', { ...after, label: event.currentTarget.textContent ?? '' })}
            >
              {after.label}
            </span>
            <p
              className="typo-body text-pretty"
              style={{ color: withAlpha(textColor, 0.92, textColor), lineHeight: 1.6 }}
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
