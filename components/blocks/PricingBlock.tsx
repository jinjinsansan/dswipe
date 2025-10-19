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
      className="pt-0 pb-0 -mt-8 sm:mt-0 sm:pt-5 sm:pb-20 md:pt-6 md:pb-20 lg:pt-9 lg:pb-20"
      style={{ backgroundColor, color: textColor, fontFamily: fontStack }}
    >
      <div className="space-y-0.5 sm:space-y-6" style={{ paddingInline: 0 }}>
        <div className={`grid grid-cols-1 ${gridCols} gap-0.5 md:gap-3 lg:gap-4`}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className="rounded-lg p-1.5 transition-all shadow-lg sm:p-3 md:p-5"
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
                className="text-xs font-bold mb-0 sm:text-lg"
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
                  className="text-[0.55rem] mb-0"
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
              <div className="mb-0.5">
                <span
                  className="text-[1.3rem] font-bold sm:text-[1.9rem]"
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
                  <span className="ml-1 text-[0.65rem] sm:text-sm" style={{ opacity: 0.7 }}>
                    / {plan.period}
                  </span>
                )}
              </div>

              {/* 機能リスト */}
              <ul className="mb-0.5 space-y-0 sm:space-y-2 sm:mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1"
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
                className="w-full rounded-lg px-3 py-1.5 text-[0.65rem] font-semibold transition-colors sm:px-4.5 sm:py-2 sm:text-sm"
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
