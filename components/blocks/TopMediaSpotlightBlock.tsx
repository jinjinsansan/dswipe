import Link from 'next/link';
import { MediaSpotlightBlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';

interface TopMediaSpotlightBlockProps {
  content: MediaSpotlightBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
}

export default function TopMediaSpotlightBlock({
  content,
  isEditing,
  onEdit,
  productId,
  onProductClick,
}: TopMediaSpotlightBlockProps) {
  const tagline = content?.tagline ?? '制作事例ハイライト';
  const title = content?.title ?? '制作の裏側に迫る、最新プロジェクトレポート';
  const subtitle = content?.subtitle ?? '実際のプロジェクトで得られた成果や導入効果を、具体的な数値とともにご紹介します。';
  const caption = content?.caption ?? '撮影：チームメンバー / 2024年最新プロジェクト';
  const imageUrl = content?.imageUrl;
  const imageAlt = content?.imageAlt ?? 'プロジェクトイメージ';
  const buttonText = content?.buttonText ?? '';

  const backgroundColor = content?.backgroundColor ?? '#F8FAFC';
  const textColor = content?.textColor ?? '#0F172A';
  const accentColor = content?.accentColor ?? '#2563EB';
  const buttonColor = content?.buttonColor ?? accentColor;
  const buttonTextColor = getContrastColor(buttonColor, '#F8FAFC', '#0F172A');

  const handleTextBlur = (field: keyof MediaSpotlightBlockContent) =>
    (event: React.FocusEvent<HTMLDivElement>) => {
      onEdit?.(field as string, event.currentTarget.textContent ?? '');
    };

  const handleCaptionBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    onEdit?.('caption', event.currentTarget.textContent ?? '');
  };

  const mediaCardBackground = withAlpha(accentColor, 0.12, accentColor);
  const mediaCardBorder = withAlpha(accentColor, 0.35, accentColor);

  const renderButton = () => {
    if (!buttonText) return null;

    const commonClasses =
      'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

    if (onProductClick) {
      return (
        <button
          type="button"
          onClick={() => onProductClick(productId)}
          className={commonClasses}
          style={{
            backgroundColor: buttonColor,
            color: buttonTextColor,
            outlineColor: withAlpha(buttonColor, 0.45, buttonColor),
          }}
        >
          {buttonText}
        </button>
      );
    }

    return (
      <Link
        href={content?.buttonUrl ?? '#'}
        className={commonClasses}
        style={{
          backgroundColor: buttonColor,
          color: buttonTextColor,
          outlineColor: withAlpha(buttonColor, 0.45, buttonColor),
        }}
      >
        {buttonText}
      </Link>
    );
  };

  return (
    <section
      className="relative w-full py-16 sm:py-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:gap-12">
        <div
          className="w-full overflow-hidden rounded-3xl border shadow-sm"
          style={{ borderColor: mediaCardBorder, backgroundColor: mediaCardBackground }}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[5/3] lg:aspect-square">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-transparent via-white/10 to-white/20 text-sm font-medium"
                style={{ color: withAlpha(textColor, 0.7, textColor) }}
              >
                画像を設定してください
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span
              className="text-xs font-semibold uppercase tracking-[0.35em]"
              style={{ color: accentColor }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleTextBlur('tagline')}
            >
              {tagline}
            </span>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: textColor }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleTextBlur('title')}
            >
              {title}
            </h2>
            <p
              className="text-base leading-relaxed sm:text-lg"
              style={{ color: withAlpha(textColor, 0.78, textColor) }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleTextBlur('subtitle')}
            >
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {renderButton()}
            {caption ? (
              <div
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: withAlpha(textColor, 0.6, textColor) }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleCaptionBlur}
              >
                {caption}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
