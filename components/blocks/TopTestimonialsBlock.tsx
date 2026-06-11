import { TestimonialsBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';
import { StarIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

const AVATAR_GRADIENT = 'linear-gradient(135deg, #f59e0b, #ef4444)';

interface TopTestimonialsBlockProps {
  content: TestimonialsBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopTestimonialsBlock({ content, isEditing, onEdit }: TopTestimonialsBlockProps) {
  const title = content?.title ?? 'お客様の声';
  const subtitle = content?.subtitle ?? '導入企業や受講生のリアルな成果をご紹介します。';
  const testimonials = useMemo(() => (
    Array.isArray(content?.testimonials) && content.testimonials.length > 0
      ? content.testimonials
      : [
          {
            quote: 'AIがコピー案を提案してくれるので、初稿制作が一気に楽になりました。初月から前年度比180%の売上です。',
            name: 'オンライン講座運営 / 佐藤様',
            role: '年間売上1.2億円',
          },
          {
            quote: 'ランディングページ制作の外注費を70%削減。自社メンバーだけで週1ペースのローンチが回せています。',
            name: 'マーケティング会社 / 山田様',
            role: 'チーム3名で運用',
          },
        ]
  ), [content?.testimonials]);

  const columnsClass = useMemo(() => {
    const count = testimonials.length;
    if (count <= 1) {
      return 'grid-cols-1 max-w-xl mx-auto';
    }
    if (count === 2) {
      return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    }
    if (count === 3) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [testimonials.length]);

  const backgroundColor = content?.backgroundColor ?? '#FFFFFF';
  const textColor = content?.textColor ?? '#0B1F3A';
  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  const updateTestimonial = (index: number, field: 'quote' | 'name' | 'role') =>
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = [...testimonials];
      next[index] = {
        ...next[index],
        [field]: event.currentTarget.textContent ?? '',
      };
      onEdit?.('testimonials', next);
    };

  return (
    <section className="relative w-full py-section-sm sm:py-section" style={{
      ...backgroundStyle,
      color: textColor,
    }}>
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
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

        {/* mock: editor.css .sc-testi — 装飾引用符＋星＋セミボールド引用＋アバター著者行 */}
        <div className="responsive-stack items-center text-center">
          <h2
            className="typo-headline text-pretty font-extrabold"
            style={{ color: textColor, letterSpacing: '-0.02em' }}
          >
            {title}
          </h2>
          <p
            className="typo-body text-pretty"
            style={{ color: withAlpha(textColor, 0.72, textColor), lineHeight: 1.7 }}
          >
            {subtitle}
          </p>
        </div>

        <div className={`grid gap-4 ${columnsClass}`}>
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="flex h-full flex-col gap-3 rounded-[16px] p-5 sm:p-6"
              style={{
                border: `1px solid ${withAlpha(textColor, 0.12, textColor)}`,
                backgroundColor: withAlpha(textColor, 0.06, '#FFFFFF'),
              }}
            >
              <div
                aria-hidden="true"
                className="font-extrabold"
                style={{ fontSize: 44, lineHeight: 0.6, color: 'rgba(125, 211, 252, 0.45)' }}
              >
                &ldquo;
              </div>
              <div className="flex gap-0.5" style={{ color: '#FBBF24' }} aria-hidden="true">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <StarIcon key={starIndex} className="h-4 w-4" />
                ))}
              </div>
              <div
                role="blockquote"
                className="flex-1 typo-body-lg text-pretty font-semibold"
                style={{ color: withAlpha(textColor, 0.92, textColor), lineHeight: 1.6, letterSpacing: '-0.01em' }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateTestimonial(index, 'quote')}
              >
                {item.quote}
              </div>

              <div className="mt-1 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
                  style={{ background: AVATAR_GRADIENT, color: '#FFFFFF' }}
                >
                  {(item.name || '・').slice(0, 1)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span
                    className="typo-body text-pretty font-bold"
                    style={{ color: textColor }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updateTestimonial(index, 'name')}
                  >
                    {item.name}
                  </span>
                  <span
                    className="typo-caption"
                    style={{ color: withAlpha(textColor, 0.7, textColor) }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={updateTestimonial(index, 'role')}
                  >
                    {item.role ?? ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
