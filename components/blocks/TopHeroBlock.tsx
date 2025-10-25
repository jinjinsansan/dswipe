import Link from 'next/link';
import { HeroBlockContent } from '@/types/templates';
import { GlowButton } from '@/components/ui/GlowButton';

interface TopHeroBlockProps {
  content: HeroBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

const FALLBACK_VIDEO = '/videos/pixta.mp4';

export default function TopHeroBlock({
  content,
  isEditing,
  onEdit,
  productId,
  onProductClick,
}: TopHeroBlockProps) {
  const tagline = content?.tagline ?? 'NEXT LAUNCH';
  const highlightText = content?.highlightText ?? '５分でLP公開';
  const title = content?.title ?? '情報には鮮度がある。';
  const subtitle = content?.subtitle ?? 'スワイプ型LP作成プラットフォームで、今すぐ情報商材を販売';
  const primaryText = content?.buttonText ?? '無料で始める';
  const secondaryText = content?.secondaryButtonText ?? 'ログイン';
  const videoUrl = content?.backgroundVideoUrl ?? FALLBACK_VIDEO;

  const handleEdit = (field: keyof HeroBlockContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onEdit?.(field as string, e.target.value);
  };

  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            src={videoUrl}
          />
        ) : null}
      </div>
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center">
        {isEditing ? (
          <div className="mb-6 grid w-full gap-3 rounded-xl bg-black/30 p-4 text-left">
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={tagline}
              onChange={handleEdit('tagline')}
              placeholder="タグライン"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={highlightText}
              onChange={handleEdit('highlightText')}
              placeholder="ハイライトテキスト"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={title}
              onChange={handleEdit('title')}
              placeholder="メイン見出し"
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={subtitle}
              onChange={handleEdit('subtitle')}
              placeholder="サブコピー"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={primaryText}
              onChange={handleEdit('buttonText')}
              placeholder="一次ボタンテキスト"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={content?.buttonUrl ?? ''}
              onChange={handleEdit('buttonUrl')}
              placeholder="一次ボタンURL"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={secondaryText}
              onChange={handleEdit('secondaryButtonText')}
              placeholder="二次ボタンテキスト"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={content?.secondaryButtonUrl ?? ''}
              onChange={handleEdit('secondaryButtonUrl')}
              placeholder="二次ボタンURL"
            />
            <input
              className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm"
              value={videoUrl}
              onChange={handleEdit('backgroundVideoUrl')}
              placeholder="背景動画URL"
            />
          </div>
        ) : null}

        <div className="space-y-6 text-white">
          <div className="inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            {tagline}
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <div className="text-lg font-medium tracking-widest text-cyan-300 sm:text-xl">
            {highlightText}
          </div>

          <p className="mx-auto max-w-3xl text-base text-white/85 sm:text-lg">
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryText ? (
              onProductClick ? (
                <GlowButton
                  onClick={() => onProductClick(productId)}
                  className="px-8 py-3 text-base"
                >
                  {primaryText}
                </GlowButton>
              ) : (
                <GlowButton href={content?.buttonUrl ?? '#'} className="px-8 py-3 text-base">
                  {primaryText}
                </GlowButton>
              )
            ) : null}

            {secondaryText ? (
              <GlowButton
                href={content?.secondaryButtonUrl ?? '#'}
                variant="secondary"
                className="px-8 py-3 text-base"
              >
                {secondaryText}
              </GlowButton>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
