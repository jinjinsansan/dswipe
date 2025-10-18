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
      className="pt-4 pb-20 sm:pt-6 sm:pb-24 md:pt-7 md:pb-24 lg:pt-10 lg:pb-20"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="space-y-5 sm:space-y-7">
        {title && (
          <h2
            className="text-lg font-bold text-center sm:text-2xl"
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

        <div className={`grid grid-cols-1 ${gridCols} gap-2.5 sm:gap-3.5`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="h-full rounded-lg p-2.5 text-center shadow-sm sm:p-3"
              style={{ backgroundColor: accentColor + '08', borderTop: `3px solid ${accentColor}` }}
            >
              {feature.icon && (
                <div
                  className="mb-2 text-2xl sm:mb-3 sm:text-3xl"
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
                className="mt-1.5 text-[0.8rem] leading-relaxed sm:text-xs"
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
