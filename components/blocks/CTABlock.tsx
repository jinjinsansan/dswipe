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
      className={fullWidth ? 'py-2 px-0 sm:py-2.5' : 'py-6 px-5'}
      style={{
        background,
        color: textColor,
        backgroundImage: `radial-gradient(circle at top right, ${accent}14, transparent 45%)`,
        borderRadius: fullWidth ? '0px' : undefined,
      }}
    >
      <div className={fullWidth ? 'w-full px-4 md:px-6 flex items-center justify-between gap-4' : 'max-w-4xl mx-auto text-center'}>
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
            {fullWidth ? (
              <>
                <div className="flex-1 text-left">
                  <h2 className="text-base md:text-lg font-bold mb-0.5">
                    {content.title || 'さあ、始めましょう'}
                  </h2>
                  {content.subtitle && (
                    <p
                      className="text-xs mb-0 text-white/80"
                      style={{ color: `${textColor}CC` }}
                    >
                      {content.subtitle}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  {content.title || 'さあ、始めましょう'}
                </h2>
                {content.subtitle && (
                  <p
                    className="text-base mb-3 text-white/80"
                    style={{ color: `${textColor}CC` }}
                  >
                    {content.subtitle}
                  </p>
                )}
              </>
            )}
            <div className={fullWidth ? 'flex-shrink-0' : 'flex flex-col items-center justify-center gap-2 md:flex-row md:gap-3'}>
              {productId ? (
                <Link
                  href={`/points/purchase?product_id=${productId}`}
                  className={
                    fullWidth
                      ? 'inline-flex items-center justify-center px-6 py-1.5 rounded font-semibold text-xs md:text-sm shadow-lg hover:opacity-90 transition-opacity'
                      : 'inline-flex items-center justify-center min-w-[220px] px-8 py-2.5 rounded-full font-semibold text-base shadow-lg hover:scale-[1.04] transition-transform'
                  }
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
                    color: '#FFFFFF',
                    boxShadow: `0 16px 36px -26px ${buttonColor}73`,
                  }}
                >
                  {content.buttonText || '今すぐ始める'}
                </Link>
              ) : (
                <button
                  className={
                    fullWidth
                      ? 'inline-flex items-center justify-center px-6 py-1.5 rounded font-semibold text-xs md:text-sm shadow-lg hover:opacity-90 transition-opacity'
                      : 'inline-flex items-center justify-center min-w-[220px] px-8 py-2.5 rounded-full font-semibold text-base shadow-lg hover:scale-[1.04] transition-transform'
                  }
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryColor})`,
                    color: '#FFFFFF',
                    boxShadow: `0 16px 36px -26px ${buttonColor}73`,
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
