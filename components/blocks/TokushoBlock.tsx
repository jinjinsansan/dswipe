import React, { useState } from 'react';
import { TokushoBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
import { getBackgroundOverlayStyle, getBlockBackgroundStyle, shouldRenderBackgroundOverlay } from '@/lib/blockBackground';
import {
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyYenIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  TruckIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface TokushoBlockProps {
  content: TokushoBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

// アイコン名からHeroIconsコンポーネントへのマッピング
const iconMap: Record<string, any> = {
  'building': BuildingOfficeIcon,
  'user': UserIcon,
  'map': MapPinIcon,
  'phone': PhoneIcon,
  'email': EnvelopeIcon,
  'yen': CurrencyYenIcon,
  'card': CreditCardIcon,
  'banknotes': BanknotesIcon,
  'clock': ClockIcon,
  'truck': TruckIcon,
  'refresh': ArrowPathIcon,
  'document': DocumentTextIcon,
};

export default function TokushoBlock({ content, isEditing, onEdit }: TokushoBlockProps) {
  const {
    title = '特定商取引法に基づく表記',
    subtitle = 'Legal Information',
    items = [],
    backgroundColor = '#F9FAFB',
    textColor = '#111827',
    cardBackgroundColor = '#FFFFFF',
    borderColor = '#E5E7EB',
  } = content;

  // 表示する項目のみフィルタリング
  const visibleItems = items.filter(item => item.show);

  // アコーディオンの開閉状態（初期状態: 全て閉じる）
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // アイコン名からコンポーネントを取得
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || DocumentTextIcon;
  };

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const backgroundStyle = getBlockBackgroundStyle(content, backgroundColor);
  const showOverlay = shouldRenderBackgroundOverlay(content);
  const overlayStyle = showOverlay ? getBackgroundOverlayStyle(content) : undefined;

  return (
    <section
      className="relative w-full py-section-sm sm:py-section"
      style={{
        ...backgroundStyle,
        color: textColor,
      }}
    >
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6">
        {/* ヘッダー */}
        <div className="responsive-stack items-center text-center">
          {subtitle && (
            <span
              className="font-semibold typo-eyebrow"
              style={{ color: textColor }}
            >
              {subtitle}
            </span>
          )}
          <h2
            className="typo-headline text-pretty font-bold"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        </div>

        {/* アコーディオンリスト */}
        <div
          className="flex flex-col overflow-hidden rounded-card border backdrop-blur"
          style={{
            borderColor: withAlpha(textColor, 0.16, textColor),
            backgroundColor: withAlpha(textColor, 0.05, cardBackgroundColor),
          }}
        >
          {visibleItems.map((item, index) => {
            const IconComponent = getIconComponent(item.icon);
            const isOpen = openIndex === index;
            
            return (
              <div
                key={index}
                className="border-b last:border-b-0"
                style={{ borderColor: withAlpha(textColor, 0.12, borderColor) }}
              >
                {/* アコーディオンヘッダー */}
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-black/5"
                  style={{ color: textColor }}
                  type="button"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <IconComponent
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: textColor, opacity: 0.6 }}
                    />
                    <span className="font-semibold typo-eyebrow text-pretty opacity-90">
                      {item.label}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: textColor, opacity: 0.6 }}
                  />
                </button>

                {/* アコーディオン内容 */}
                {isOpen && (
                  <div
                    className="whitespace-pre-wrap px-5 pb-5 pt-2 typo-body text-pretty"
                    style={{ color: withAlpha(textColor, 0.78, textColor) }}
                  >
                    {item.value}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* フッター注釈 */}
        <div className="text-center">
          <p
            className="typo-caption opacity-60"
            style={{ color: textColor }}
          >
            ※ この表記は特定商取引法に基づき義務付けられています
          </p>
        </div>
      </div>
    </section>
  );
}
