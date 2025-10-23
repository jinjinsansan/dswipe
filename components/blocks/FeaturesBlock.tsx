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
      className="pt-2 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {title && (
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center"
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

        <div className={`grid grid-cols-1 ${gridCols} gap-4 sm:gap-5 md:gap-6`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="h-full rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 text-center shadow-md hover:shadow-lg transition-shadow"
              style={{ backgroundColor: accentColor + '08', borderTop: `3px solid ${accentColor}` }}
            >
              {feature.icon && (
                <div
                  className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl"
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
                className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3"
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
                className="text-sm sm:text-base leading-relaxed"
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
