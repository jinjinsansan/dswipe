import React from 'react';
import { TokushoBlockContent } from '@/types/templates';
import { withAlpha } from '@/lib/color';
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

  // アイコン名からコンポーネントを取得
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || DocumentTextIcon;
  };

  return (
    <section
      className="relative w-full py-16 sm:py-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        {/* ヘッダー */}
        <div className="text-center">
          {subtitle && (
            <span
              className="text-xs font-semibold tracking-wider uppercase opacity-60"
              style={{ color: textColor }}
            >
              {subtitle}
            </span>
          )}
          <h2
            className="text-3xl font-bold sm:text-4xl mt-3"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleItems.map((item, index) => {
            const IconComponent = getIconComponent(item.icon);
            
            return (
              <div
                key={index}
                className="flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-sm"
                style={{
                  backgroundColor: withAlpha(textColor, 0.03, cardBackgroundColor),
                  borderColor: withAlpha(textColor, 0.12, borderColor),
                }}
              >
                {/* アイコンとラベル */}
                <div className="flex items-center gap-3">
                  <IconComponent
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: textColor, opacity: 0.7 }}
                  />
                  <h3
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: withAlpha(textColor, 0.7, textColor) }}
                  >
                    {item.label}
                  </h3>
                </div>

                {/* 値 */}
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: withAlpha(textColor, 0.85, textColor) }}
                >
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
