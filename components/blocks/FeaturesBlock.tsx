import React from 'react';
import { FeaturesBlockContent } from '@/types/templates';

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
    <section
      className="py-12 px-8"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* タイトル */}
        {title && (
          <h2
            className="text-4xl font-bold text-center mb-12"
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

        {/* 特徴グリッド */}
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg" style={{ backgroundColor: accentColor + '08', borderTop: `3px solid ${accentColor}` }}>
              {/* アイコン */}
              {feature.icon && (
                <div 
                  className="text-6xl mb-4"
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

              {/* タイトル */}
              <h3
                className="text-xl font-semibold mb-3"
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

              {/* 説明 */}
              <p
                className="leading-relaxed"
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
    </section>
  );
}
