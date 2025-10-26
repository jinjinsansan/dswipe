import Link from 'next/link';
import { MediaSpotlightBlockContent } from '@/types/templates';
import { getContrastColor, withAlpha } from '@/lib/color';

interface TopMediaSpotlightBlockProps {
  content: MediaSpotlightBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  onProductClick?: (productId?: string) => void;
  ctaIds?: string[];
  onCtaClick?: (ctaId?: string, variant?: string) => void;
}

export default function TopMediaSpotlightBlock({
  content,
  isEditing,
  onEdit,
  productId,
  onProductClick,
  ctaIds,
  onCtaClick,
}: TopMediaSpotlightBlockProps) {
  const tagline = content?.tagline ?? '制作事例ハイライト';
  const title = content?.title ?? '制作の裏側に迫る、最新プロジェクトレポート';
  const subtitle = content?.subtitle ?? '実際のプロジェクトで得られた成果や導入効果を、具体的な数値とともにご紹介します。';
  const caption = content?.caption ?? '撮影：チームメンバー / 2024年最新プロジェクト';
  const imageUrl = content?.imageUrl;
  const imageAlt = content?.imageAlt ?? 'プロジェクトイメージ';
  const buttonText = content?.buttonText ?? '';
  const primaryCtaId = ctaIds?.[0];

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

  const renderButton = () => {
    if (!buttonText) return null;

    const commonClasses =
      'inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

    if (onProductClick) {
      return (
        <button
          type="button"
          onClick={() => {
            onCtaClick?.(primaryCtaId, 'primary');
            onProductClick(productId);
          }}
          className={commonClasses}
          style={{
            backgroundColor: buttonColor,
            color: buttonTextColor,
            border: `1px solid ${buttonColor}`,
            outlineColor: withAlpha(buttonColor, 0.5, buttonColor),
          }}
        >
          {buttonText}
        </button>
      );
    }

    return (
      <Link
        href={content?.buttonUrl ?? '#'}
        onClick={() => onCtaClick?.(primaryCtaId, 'primary')}
        className={commonClasses}
        style={{
          backgroundColor: buttonColor,
          color: buttonTextColor,
          border: `1px solid ${buttonColor}`,
          outlineColor: withAlpha(buttonColor, 0.5, buttonColor),
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
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        {/* ヘッダー */}
        <div className="text-center">
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
            className="text-3xl font-bold sm:text-4xl mt-3"
            style={{ color: textColor }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTextBlur('title')}
          >
            {title}
          </h2>
          <p
            className="mt-3 text-base leading-relaxed sm:text-lg"
            style={{ color: withAlpha(textColor, 0.72, textColor) }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTextBlur('subtitle')}
          >
            {subtitle}
          </p>
        </div>

        {/* 画像カード */}
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{
            borderColor: withAlpha(accentColor, 0.2, accentColor),
            backgroundColor: withAlpha(accentColor, 0.06, '#FFFFFF'),
          }}
        >
          {/* 画像 */}
          <div className="w-full overflow-hidden rounded-xl mb-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-auto max-h-[600px] object-contain bg-black/5"
              />
            ) : (
              <div
                className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-transparent via-white/10 to-white/20 text-sm font-medium rounded-xl"
                style={{ color: withAlpha(textColor, 0.5, textColor) }}
              >
                画像を設定してください
              </div>
            )}
          </div>

          {/* キャプション */}
          {caption && (
            <div
              className="text-xs uppercase tracking-[0.2em] mb-4 text-center"
              style={{ color: withAlpha(textColor, 0.6, textColor) }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleCaptionBlur}
            >
              {caption}
            </div>
          )}

          {/* ボタン */}
          {buttonText && (
            <div className="flex justify-center">
              {renderButton()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
