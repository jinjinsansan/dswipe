import { TestimonialsBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { useMemo } from 'react';

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
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';

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
    <section className="relative w-full py-16 sm:py-20" style={{ backgroundColor, color: textColor }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
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
          <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: textColor }}>
            {title}
          </h2>
          <p
            className="mt-3 text-base sm:text-lg"
            style={{ color: withAlpha(textColor, 0.72, textColor) }}
          >
            {subtitle}
          </p>
        </div>

        <div className={`grid gap-4 ${columnsClass}`}>
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="flex h-full flex-row gap-4 rounded-2xl border p-5 shadow-sm sm:flex-col sm:p-6"
              style={{
                borderColor: withAlpha(accentColor, 0.2, accentColor),
                backgroundColor: withAlpha(accentColor, 0.06, '#FFFFFF'),
              }}
            >
              <div
                className="flex-1 text-sm leading-relaxed sm:text-base"
                style={{ color: withAlpha(textColor, 0.82, textColor) }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateTestimonial(index, 'quote')}
              >
                {item.quote}
              </div>

              <div className="flex w-36 flex-col gap-1 border-l border-white/40 pl-4 sm:w-full sm:border-l-0 sm:border-t sm:pl-0 sm:pt-4">
                <span
                  className="text-sm font-semibold"
                  style={{ color: accentColor }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateTestimonial(index, 'name')}
                >
                  {item.name}
                </span>
                <span
                  className="text-xs uppercase tracking-wide"
                  style={{ color: withAlpha(textColor, 0.6, textColor) }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateTestimonial(index, 'role')}
                >
                  {item.role ?? ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
