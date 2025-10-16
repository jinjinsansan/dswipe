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
}

export default function CTABlock({ content, isEditing, onEdit, productId, fullWidth }: CTABlockProps) {
  const themeKey: ColorThemeKey = (content.themeKey as ColorThemeKey) ?? 'urgent_red';
  const theme = COLOR_THEMES[themeKey] ?? COLOR_THEMES.urgent_red;
  const background = content.backgroundColor || theme.background;
  const textColor = content.textColor || theme.text;
  const accent = content.accentColor || theme.accent;
  const buttonColor = content.buttonColor || theme.primary;
  const secondaryColor = theme.secondary ?? theme.primary;

  return (
    <div
      className={fullWidth ? 'py-6 px-4 sm:py-8 sm:px-6 lg:px-10' : 'py-12 px-8'}
      style={{
        background,
        color: textColor,
        backgroundImage: `radial-gradient(circle at top right, ${accent}18, transparent 55%)`,
        borderRadius: fullWidth ? '0px' : undefined,
      }}
    >
      <div
        className={fullWidth ? 'w-full text-center' : 'max-w-4xl mx-auto text-center'}
        style={fullWidth ? { maxWidth: '100%' } : undefined}
      >
        {isEditing ? (
          <>
            <input
              type="text"
              value={content.title}
              onChange={(e) => onEdit?.('title', e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold mb-6 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="CTAタイトルを入力"
            />
            <input
              type="text"
              value={content.subtitle || ''}
              onChange={(e) => onEdit?.('subtitle', e.target.value)}
              className="w-full text-xl mb-8 bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="サブタイトル（オプション）"
            />
            <input
              type="text"
              value={content.buttonText}
              onChange={(e) => onEdit?.('buttonText', e.target.value)}
              className="w-full text-lg bg-transparent border-2 border-dashed border-gray-400 px-4 py-2 rounded"
              placeholder="ボタンテキスト"
            />
          </>
        ) : (
          <>
            <h2 className={fullWidth ? 'text-3xl md:text-4xl font-bold mb-4' : 'text-4xl md:text-5xl font-bold mb-6'}>
              {content.title || 'さあ、始めましょう'}
            </h2>
            {content.subtitle && (
              <p
                className={fullWidth ? 'text-base md:text-lg mb-5' : 'text-xl mb-8'}
                style={{ color: `${textColor}CC` }}
              >
                {content.subtitle}
              </p>
            )}
            <div className={fullWidth ? 'flex flex-col items-center justify-center gap-2 md:flex-row md:gap-3' : 'flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4'}>
              {productId ? (
                <Link
                  href={`/points/purchase?product_id=${productId}`}
                  className={
                    fullWidth
                      ? 'block w-full px-6 py-3 rounded-none font-bold text-base md:text-lg shadow-2xl hover:scale-[1.005] transition-transform'
                      : 'inline-flex px-12 py-4 rounded-lg font-semibold text-lg shadow-2xl hover:scale-[1.03] transition-transform'
                  }
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
                    color: '#FFFFFF',
                    boxShadow: `0 24px 60px -28px ${buttonColor}80`,
                  }}
                >
                  {content.buttonText || '今すぐ始める'}
                </Link>
              ) : (
                <button
                  className={
                    fullWidth
                      ? 'w-full px-6 py-3 rounded-none font-bold text-base md:text-lg shadow-2xl hover:scale-[1.005] transition-transform'
                      : 'px-12 py-4 rounded-lg font-semibold text-lg shadow-2xl hover:scale-[1.03] transition-transform'
                  }
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
                    color: '#FFFFFF',
                    boxShadow: `0 24px 60px -28px ${buttonColor}80`,
                  }}
                >
                  {content.buttonText || '今すぐ始める'}
                </button>
              )}

              {content.secondaryButtonText && (
                <Link
                  href={content.secondaryButtonUrl || '#'}
                  className={
                    fullWidth
                      ? 'w-full px-6 py-3 rounded-none font-semibold text-base md:text-lg transition-transform border'
                      : 'inline-flex px-12 py-4 rounded-lg font-semibold text-lg transition-transform border'
                  }
                  style={{
                    color: textColor,
                    borderColor: `${accent}66`,
                    backgroundColor: `${accent}12`,
                  }}
                >
                  {content.secondaryButtonText}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
