import React from 'react';
import { PricingBlockContent } from '@/types/templates';

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

  const gridCols = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-1';

  return (
    <section
      className="px-4 md:px-8"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 ${gridCols} gap-4 md:gap-6 lg:gap-8`}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className="rounded-2xl p-8 transition-all shadow-lg"
              style={{
                backgroundColor: plan.highlighted ? accentColor : '#FFFFFF',
                color: plan.highlighted ? '#FFFFFF' : textColor,
                borderWidth: '1px',
                borderColor: plan.highlighted ? accentColor : '#E5E7EB',
                transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* プラン名 */}
              <h3
                className="text-2xl font-bold mb-2"
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
              <div className="mb-6">
                <span
                  className="text-5xl font-bold"
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
                  <span className="text-lg ml-2" style={{ opacity: 0.7 }}>
                    / {plan.period}
                  </span>
                )}
              </div>

              {/* 機能リスト */}
              <ul className="space-y-3 mb-8">
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
                className="w-full py-3 px-6 rounded-lg font-semibold transition-colors"
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
    </section>
  );
}
