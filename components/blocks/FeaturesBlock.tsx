import React from 'react';
import { FeaturesBlockContent } from '@/types/templates';
import { Section } from '@/components/ui';

interface FeaturesBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function FeaturesBlock({ content, isEditing, onEdit }: FeaturesBlockProps) {
  const { 
    title, 
    features, 
    columns = 3, 
    backgroundColor = '#FFFFFF', 
    textColor = '#111827', 
    accentColor = '#3B82F6',
    titleColor,
    descriptionColor,
    iconColor,
  } = content;

  const gridCols = 
    columns === 2 ? 'md:grid-cols-2' : 
    columns === 3 ? 'md:grid-cols-3' : 
    columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <Section
      tone="none"
      padding="compact"
      className="pt-2 pb-16 sm:pt-5 sm:pb-20 md:pt-6 md:pb-20 lg:pt-9 lg:pb-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="space-y-4 sm:space-y-6">
        {title && (
          <h2
            className="text-base font-bold text-center sm:text-2xl"
            style={{ color: textColor }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              if (isEditing && onEdit) {
                onEdit('title', e.currentTarget.textContent);
              }
            }}
          >
            {title}
          </h2>
        )}

        <div className={`grid grid-cols-1 ${gridCols} gap-2 sm:gap-3`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="h-full rounded-lg p-2 text-center shadow-sm sm:p-2.5"
              style={{ backgroundColor: accentColor + '08', borderTop: `3px solid ${accentColor}` }}
            >
              {feature.icon && (
                <div
                  className="mb-1.5 text-xl sm:mb-2.5 sm:text-3xl"
                  style={{ color: iconColor || accentColor }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isEditing && onEdit) {
                      const newFeatures = [...features];
                      newFeatures[index].icon = e.currentTarget.textContent || '';
                      onEdit('features', newFeatures);
                    }
                  }}
                >
                  {feature.icon}
                </div>
              )}

              <h3
                className="text-sm font-semibold sm:text-base"
                style={{ color: titleColor || textColor }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditing && onEdit) {
                    const newFeatures = [...features];
                    newFeatures[index].title = e.currentTarget.textContent || '';
                    onEdit('features', newFeatures);
                  }
                }}
              >
                {feature.title}
              </h3>

              <p
                className="mt-1 text-[0.75rem] leading-relaxed sm:text-xs"
                style={{ color: descriptionColor || textColor, opacity: 0.8 }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditing && onEdit) {
                    const newFeatures = [...features];
                    newFeatures[index].description = e.currentTarget.textContent || '';
                    onEdit('features', newFeatures);
                  }
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
