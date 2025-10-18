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
      padding="condensed"
      className="transform origin-top scale-[0.9] pt-10 pb-9 sm:scale-[0.95] sm:pb-12 md:pb-14 lg:origin-center lg:scale-100 lg:py-section"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="space-y-8 sm:space-y-10">
        {title && (
          <h2
            className="text-2xl font-bold text-center sm:text-4xl"
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

        <div className={`grid grid-cols-1 ${gridCols} gap-4 sm:gap-6`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="h-full rounded-lg p-4 text-center shadow-sm sm:p-5"
              style={{ backgroundColor: accentColor + '08', borderTop: `3px solid ${accentColor}` }}
            >
              {feature.icon && (
                <div
                  className="mb-3 text-3xl sm:mb-4 sm:text-5xl"
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
                className="text-base font-semibold sm:text-xl"
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
                className="mt-2 text-sm leading-relaxed sm:text-base"
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
