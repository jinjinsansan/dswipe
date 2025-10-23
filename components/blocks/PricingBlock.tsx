import React from 'react';
import { PricingBlockContent } from '@/types/templates';
import { getFontStack } from '@/lib/fonts';
import { Section } from '@/components/ui';

interface PricingBlockProps {
  content: PricingBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function PricingBlock({ content, isEditing, onEdit }: PricingBlockProps) {
  const { 
    plans, 
    columns = 3, 
    backgroundColor = '#FFFFFF', 
    textColor = '#111827', 
    accentColor = '#3B82F6',
    titleColor,
    descriptionColor,
  } = content;
  
  const fontStack = getFontStack((content as any).fontFamily);

  const gridCols = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-1';

  return (
    <Section
      tone="none"
      padding="compact"
      className="pt-2 pb-0 mt-0 sm:mt-0 sm:pt-5 sm:pb-20 md:pt-6 md:pb-20 lg:pt-9 lg:pb-20"
      style={{ backgroundColor, color: textColor, fontFamily: fontStack }}
    >
      <div className="space-y-0.5 sm:space-y-6" style={{ paddingInline: 0 }}>
        <div className={`grid grid-cols-1 ${gridCols} gap-3 sm:gap-4 md:gap-5 lg:gap-6`}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className="rounded-lg sm:rounded-xl p-5 sm:p-6 md:p-8 transition-all shadow-lg"
              style={{
                backgroundColor: plan.highlighted ? accentColor : '#FFFFFF',
                color: plan.highlighted ? '#FFFFFF' : textColor,
                borderWidth: '1px',
                borderColor: plan.highlighted ? accentColor : '#E5E7EB',
                transform: 'scale(1)',
              }}
            >
              {/* プラン名 */}
              <h3
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3"
                style={{ color: titleColor || (plan.highlighted ? '#FFFFFF' : textColor) }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditing && onEdit) {
                    const newPlans = [...plans];
                    newPlans[index].name = e.currentTarget.textContent || '';
                    onEdit('plans', newPlans);
                  }
                }}
              >
                {plan.name}
              </h3>

              {/* 説明 */}
              {plan.description && (
                <p
                  className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4"
                  style={{ color: descriptionColor || (plan.highlighted ? '#FFFFFF' : textColor), opacity: 0.8 }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newPlans = [...plans];
                      newPlans[index].description = e.currentTarget.textContent || '';
                      onEdit('plans', newPlans);
                    }
                  }}
                >
                  {plan.description}
                </p>
              )}

              {/* 価格 */}
              <div className="mb-4 sm:mb-5">
                <span
                  className="text-3xl sm:text-4xl md:text-5xl font-bold"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newPlans = [...plans];
                      newPlans[index].price = e.currentTarget.textContent || '';
                      onEdit('plans', newPlans);
                    }
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-2 text-sm sm:text-base md:text-lg" style={{ opacity: 0.7 }}>
                    / {plan.period}
                  </span>
                )}
              </div>

              {/* 機能リスト */}
              <ul className="mb-5 sm:mb-6 md:mb-8 space-y-2 sm:space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: accentColor }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className="text-sm sm:text-base md:text-lg"
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        if (isEditing && onEdit) {
                          const newPlans = [...plans];
                          newPlans[index].features[featureIndex] = e.currentTarget.textContent || '';
                          onEdit('plans', newPlans);
                        }
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* ボタン */}
              <button
                className="w-full rounded-lg sm:rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base md:text-lg font-semibold transition-colors"
                style={{
                  backgroundColor: plan.highlighted ? '#FFFFFF' : accentColor,
                  color: plan.highlighted ? accentColor : '#FFFFFF',
                }}
                onClick={() => {
                  if (plan.buttonUrl) {
                    window.location.href = plan.buttonUrl;
                  }
                }}
              >
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newPlans = [...plans];
                      newPlans[index].buttonText = e.currentTarget.textContent || '';
                      onEdit('plans', newPlans);
                    }
                  }}
                >
                  {plan.buttonText || '選択する'}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
