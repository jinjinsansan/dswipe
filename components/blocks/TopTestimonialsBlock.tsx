import { TestimonialsBlockContent } from '@/types/templates';

interface TopTestimonialsBlockProps {
  content: TestimonialsBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function TopTestimonialsBlock({ content, isEditing, onEdit }: TopTestimonialsBlockProps) {
  const title = content?.title ?? 'お客様の声';
  const subtitle = content?.subtitle ?? '導入企業や受講生のリアルな成果をご紹介します。';
  const testimonials = Array.isArray(content?.testimonials) && content.testimonials.length > 0
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
      ];

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
    <section
      className="relative w-full bg-white py-16 text-slate-900 sm:py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
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
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg" style={{ color: content?.textColor ? `${content.textColor}cc` : undefined }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {testimonials.map((item, index) => (
            <div key={index} className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div
                className="text-base leading-relaxed text-slate-700"
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={updateTestimonial(index, 'quote')}
              >
                {item.quote}
              </div>

              <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
                <span
                  className="text-sm font-semibold text-slate-900"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={updateTestimonial(index, 'name')}
                >
                  {item.name}
                </span>
                <span
                  className="text-xs uppercase tracking-wide text-slate-500"
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
