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
      className={fullWidth ? 'py-3 px-4 sm:py-4 sm:px-6 lg:px-7' : 'py-8 px-5'}
      style={{
        background,
        color: textColor,
        backgroundImage: `radial-gradient(circle at top right, ${accent}1a, transparent 50%)`,
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
            <h2 className={fullWidth ? 'text-xl md:text-2xl font-bold mb-2' : 'text-3xl md:text-4xl font-bold mb-4'}>
              {content.title || 'さあ、始めましょう'}
            </h2>
            {content.subtitle && (
              <p
                className={fullWidth ? 'text-xs md:text-sm mb-3' : 'text-base mb-4'}
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
                      ? 'block w-full px-4 py-2.5 rounded-none font-semibold text-xs md:text-sm shadow-lg hover:scale-[1.01] transition-transform'
                      : 'inline-flex px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:scale-[1.02] transition-transform'
                  }
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
                    color: '#FFFFFF',
                    boxShadow: `0 16px 40px -26px ${buttonColor}7a`,
                  }}
                >
                  {content.buttonText || '今すぐ始める'}
                </Link>
              ) : (
                <button
                  className={
                    fullWidth
                      ? 'w-full px-4 py-2.5 rounded-none font-semibold text-xs md:text-sm shadow-lg hover:scale-[1.01] transition-transform'
                      : 'px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:scale-[1.02] transition-transform'
                  }
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
                    color: '#FFFFFF',
                    boxShadow: `0 16px 40px -26px ${buttonColor}7a`,
                  }}
                >
                  {content.buttonText || '今すぐ始める'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
