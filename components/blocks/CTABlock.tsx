import React from 'react';
import Link from 'next/link';
import type { CTABlockContent } from '@/types/templates';
import { COLOR_THEMES, ColorThemeKey } from '@/lib/templates';

interface CTABlockProps {
  content: CTABlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
  productId?: string;
  fullWidth?: boolean;
  onProductClick?: (productId?: string) => void;
}

export default function CTABlock({ content, isEditing, onEdit, productId, fullWidth, onProductClick }: CTABlockProps) {
  const themeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? 'urgent_red';
  const theme = COLOR_THEMES[themeKey] ?? COLOR_THEMES.urgent_red;
  const background = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accent = content.accentColor || theme.accent;
  const buttonColor = content.buttonColor || theme.primary;
  const secondaryColor = theme.secondary ?? theme.primary;
  const outerPaddingClass = fullWidth ? 'pt-3 pb-0 px-0 sm:pt-4 sm:pb-0 md:pt-5 md:pb-0' : 'py-3 px-3 sm:py-4 sm:px-6 md:py-5 md:px-8';
  const innerContainerClass = fullWidth
    ? 'w-full mx-auto px-3 md:px-8 lg:px-12 xl:px-16 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-center xl:justify-between gap-3 md:gap-8 lg:gap-10 max-w-[min(1100px,90vw)]'
    : 'max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-6';
  const buttonWrapperClass = fullWidth
    ? 'flex-shrink-0 w-full md:w-auto flex items-center justify-center md:justify-center xl:justify-end'
    : 'flex-shrink-0 flex items-center justify-start sm:justify-end w-full sm:w-auto';
  const buttonBaseClass = 'inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 font-semibold shadow-lg transition-transform hover:scale-[1.03]';
  const buttonClass = fullWidth
    ? `${buttonBaseClass} text-xs sm:text-sm md:text-base rounded`
    : `${buttonBaseClass} text-base rounded w-full sm:w-auto`;
  const buttonStyle = {
    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
    color: '#FFFFFF',
    boxShadow: `0 16px 36px -26px ${buttonColor}73`,
  } as const;

  const renderButton = () => {
    const label = content.buttonText || '今すぐ始める';

    if (productId) {
      if (onProductClick) {
        return (
          <button
            type="button"
            className={buttonClass}
            style={buttonStyle}
            onClick={() => onProductClick(productId)}
          >
            {label}
          </button>
        );
      }

      return (
        <Link
          href={`/points/purchase?product_id=${productId}`}
          className={buttonClass}
          style={buttonStyle}
        >
          {label}
        </Link>
      );
    }

    if (content.buttonUrl && content.buttonUrl.trim().length > 0) {
      const isExternal = /^https?:/i.test(content.buttonUrl.trim());
      return (
        <Link
          href={content.buttonUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className={buttonClass}
          style={buttonStyle}
        >
          {label}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={`${buttonClass} opacity-70 cursor-not-allowed`}
        style={buttonStyle}
        disabled
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={outerPaddingClass}
      style={{
        background,
        color: textColor,
        backgroundImage: `radial-gradient(circle at top right, ${accent}14, transparent 45%)`,
        borderRadius: fullWidth ? '0px' : undefined,
      }}
    >
      <div className={innerContainerClass}>
        {isEditing ? (
          <>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold mb-6 bg-transparent border-2 border-dashed px-4 py-2 rounded"
              style={{ borderColor: textColor, color: textColor }}
              placeholder="CTAタイトルを入力"
            />
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              className="w-full text-xl mb-8 bg-transparent border-2 border-dashed px-4 py-2 rounded"
              style={{ borderColor: textColor, color: textColor }}
              placeholder="サブタイトル（オプション）"
            />
            <input
              type="text"
              value={content.buttonText}
              onChange={(e) => onEdit?.('buttonText', e.target.value)}
              className="w-full text-lg bg-transparent border-2 border-dashed px-4 py-2 rounded"
              style={{ borderColor: textColor, color: textColor }}
              placeholder="ボタンテキスト"
            />
          </>
        ) : (
          <>
            <div
              className="flex-1 w-full text-center md:text-left md:pr-6"
              style={fullWidth ? { maxWidth: 'min(560px, 80vw)', marginInline: 'auto' } : undefined}
            >
              <h2 className={`font-bold ${fullWidth ? 'text-lg sm:text-2xl md:text-3xl lg:text-[1.8rem]' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'} mb-1`}>
                {content.title || 'さあ、始めましょう'}
              </h2>
              {content.subtitle && (
                <p
                  className={`text-xs sm:text-sm md:text-base ${fullWidth ? 'mt-1 md:mt-0' : 'mt-1'}`}
                  style={{ color: `${textColor}CC` }}
                >
                  {content.subtitle}
                </p>
              )}
            </div>
            <div className={buttonWrapperClass}>
              {renderButton()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
