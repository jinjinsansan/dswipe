import React from 'react';
import { TokushoBlockContent } from '@/types/templates';
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
    <div
      className="h-screen w-full flex items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="max-w-6xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          {subtitle && (
            <p
              className="text-xs font-semibold tracking-wider uppercase mb-2 opacity-60"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        </div>

        {/* カードグリッド - コンパクト版 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[65vh] overflow-hidden">
          {visibleItems.map((item, index) => {
            const IconComponent = getIconComponent(item.icon);
            
            return (
              <div
                key={index}
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: borderColor,
                }}
              >
                {/* アイコンとラベル */}
                <div className="flex items-center gap-2 mb-1.5">
                  <IconComponent
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: textColor, opacity: 0.6 }}
                  />
                  <h3
                    className="text-xs font-bold uppercase tracking-wide opacity-60"
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </h3>
                </div>

                {/* 値 */}
                <p
                  className="text-sm font-medium leading-snug whitespace-pre-wrap line-clamp-3"
                  style={{ color: textColor }}
                >
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* フッター注釈 */}
        <div className="mt-4 text-center">
          <p
            className="text-xs opacity-50"
            style={{ color: textColor }}
          >
            ※ 特定商取引法に基づく表記
          </p>
        </div>
      </div>
    </div>
  );
}
