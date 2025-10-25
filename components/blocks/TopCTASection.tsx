import { CTABlockContent } from '@/types/templates';
import { GlowButton } from '@/components/ui/GlowButton';

interface TopCTASectionProps {
  content: CTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

export default function TopCTASection({ content, isEditing, onEdit, productId, onProductClick }: TopCTASectionProps) {
  const title = content?.title ?? '今すぐ始めよう';
  const subtitle = content?.subtitle ?? '情報には鮮度がある。５分でLPを公開して、今すぐ販売を開始。';
  const primaryText = content?.buttonText ?? '無料で始める';
  const secondaryText = content?.secondaryButtonText ?? ''; 

  return (
    <section
      className="relative w-full bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 py-20"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 text-center">
        {isEditing ? (
          <div className="w-full rounded-xl bg-white/70 p-4 text-left text-sm text-slate-700">
            <div className="grid gap-3">
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
                placeholder="サブコピー"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={primaryText}
                onChange={(e) => onEdit?.('buttonText', e.target.value)}
                placeholder="一次ボタンテキスト"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={content?.buttonUrl ?? ''}
                onChange={(e) => onEdit?.('buttonUrl', e.target.value)}
                placeholder="一次ボタンURL"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={secondaryText}
                onChange={(e) => onEdit?.('secondaryButtonText', e.target.value)}
                placeholder="二次ボタンテキスト"
              />
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={content?.secondaryButtonUrl ?? ''}
                onChange={(e) => onEdit?.('secondaryButtonUrl', e.target.value)}
                placeholder="二次ボタンURL"
              />
            </div>
          </div>
        ) : null}

        <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">{title}</h2>
        <p className="max-w-2xl text-base text-slate-600 sm:text-lg">{subtitle}</p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {primaryText ? (
            onProductClick ? (
              <GlowButton onClick={() => onProductClick(productId)} className="px-8 py-3 text-base">
                {primaryText}
              </GlowButton>
            ) : (
              <GlowButton href={content?.buttonUrl ?? '#'} className="px-8 py-3 text-base">
                {primaryText}
              </GlowButton>
            )
          ) : null}

          {secondaryText ? (
            <GlowButton href={content?.secondaryButtonUrl ?? '#'} variant="secondary" className="px-8 py-3 text-base">
              {secondaryText}
            </GlowButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
