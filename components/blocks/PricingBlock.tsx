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
      padding="condensed"
      className="transform origin-top scale-[0.85] pt-9 pb-8 sm:scale-[0.92] sm:pb-11 md:pb-13 lg:origin-center lg:scale-[0.97] lg:py-section xl:scale-100"
      style={{ backgroundColor, color: textColor, fontFamily: fontStack }}
    >
      <div className="space-y-7 sm:space-y-8" style={{ paddingInline: 0 }}>
        <div className={`grid grid-cols-1 ${gridCols} gap-2.5 md:gap-5 lg:gap-6`}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className="rounded-2xl p-3.5 transition-all shadow-lg sm:p-5 md:p-7"
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
                className="text-xl font-bold mb-2 sm:text-2xl"
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
                  className="text-sm mb-4"
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
              <div className="mb-5">
                <span
                  className="text-4xl font-bold sm:text-5xl"
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
                  <span className="ml-2 text-base sm:text-lg" style={{ opacity: 0.7 }}>
                    / {plan.period}
                  </span>
                )}
              </div>

              {/* 機能リスト */}
              <ul className="mb-6 space-y-2.5 sm:space-y-3 sm:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
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
                className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors sm:px-6 sm:py-3 sm:text-base"
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
