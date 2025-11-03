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
      'inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold typo-body-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

    if (onProductClick && productId) {
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
      className="relative w-full py-section-sm sm:py-section"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        {/* ヘッダー */}
        <div className="responsive-stack items-center text-center">
          <span
            className="font-semibold typo-eyebrow"
            style={{ color: accentColor }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTextBlur('tagline')}
          >
            {tagline}
          </span>
          <h2
            className="typo-headline text-pretty font-bold"
            style={{ color: textColor }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTextBlur('title')}
          >
            {title}
          </h2>
          <p
            className="typo-body-lg text-pretty"
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
          className="rounded-card border p-6 shadow-sm"
          style={{
            borderColor: withAlpha(accentColor, 0.2, accentColor),
            backgroundColor: withAlpha(accentColor, 0.06, '#FFFFFF'),
          }}
        >
          {/* 画像 */}
          <div className="mb-6 w-full overflow-hidden rounded-card">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-auto w-full max-h-[600px] bg-black/5 object-contain"
              />
            ) : (
              <div
                className="flex h-64 w-full items-center justify-center rounded-card bg-gradient-to-br from-transparent via-white/10 to-white/20 font-medium typo-body"
                style={{ color: withAlpha(textColor, 0.5, textColor) }}
              >
                画像を設定してください
              </div>
            )}
          </div>

          {/* キャプション */}
          {caption && (
            <div
              className="mb-4 text-center typo-caption uppercase tracking-[0.35em]"
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
