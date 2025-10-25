import { InlineCTABlockContent } from '@/types/templates';
import { GlowButton } from '@/components/ui/GlowButton';

interface TopInlineCTABlockProps {
  content: InlineCTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

export default function TopInlineCTABlock({ content, isEditing, onEdit, productId, onProductClick }: TopInlineCTABlockProps) {
  const eyebrow = content?.eyebrow ?? '限定プログラム';
  const title = content?.title ?? '今すぐAIローンチを体験する';
  const subtitle = content?.subtitle ?? 'アカウント作成から公開までを最短5分で完了。初月の成果創出まで伴走します。';
  const buttonText = content?.buttonText ?? '無料で始める';
  const buttonUrl = content?.buttonUrl ?? '/register';

  return (
    <section
      className="relative w-full bg-white py-12 text-slate-900"
      style={{ backgroundColor: content?.backgroundColor, color: content?.textColor }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white/90 px-6 py-10 text-center shadow-sm sm:px-10">
        {isEditing ? (
          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={eyebrow}
              onChange={(e) => onEdit?.('eyebrow', e.target.value)}
              placeholder="ラベル"
            />
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
              value={buttonText}
              onChange={(e) => onEdit?.('buttonText', e.target.value)}
              placeholder="ボタンテキスト"
            />
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={buttonUrl}
              onChange={(e) => onEdit?.('buttonUrl', e.target.value)}
              placeholder="ボタンURL"
            />
          </div>
        ) : null}

        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">{eyebrow}</span>
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base" style={{ color: content?.textColor ? `${content.textColor}cc` : undefined }}>
          {subtitle}
        </p>

        <div className="mt-2 flex justify-center">
          {onProductClick ? (
            <GlowButton onClick={() => onProductClick(productId)} className="px-8 py-3 text-base">
              {buttonText}
            </GlowButton>
          ) : (
            <GlowButton href={buttonUrl} className="px-8 py-3 text-base">
              {buttonText}
            </GlowButton>
          )}
        </div>
      </div>
    </section>
  );
}
