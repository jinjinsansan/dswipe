import React from 'react';
import { FeaturesBlockContent } from '@/types/templates';

interface FeaturesBlockProps {
  content: FeaturesBlockContent;
  isEditing?: boolean;
  onEdit?: (field: string, value: any) => void;
}

export default function FeaturesBlock({ content, isEditing, onEdit }: FeaturesBlockProps) {
  const { title, features, columns = 3, backgroundColor = '#FFFFFF', textColor = '#111827' } = content;

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
            <div key={index} className="text-center">
              {/* アイコン */}
              {feature.icon && (
                <div className="text-6xl mb-4"
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
                className="text-gray-600 leading-relaxed"
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
