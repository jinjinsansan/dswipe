'use client';

import React, { useState } from 'react';
import { TEMPLATE_LIBRARY, TEMPLATE_CATEGORIES, getTemplatesByCategory } from '@/lib/templates';
import { TemplateBlock } from '@/types/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: TemplateBlock) => void;
  onClose: () => void;
}

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('header');

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">テンプレートを選択</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* カテゴリタブ */}
        <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* テンプレートグリッド */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all p-4 text-left group"
              >
                {/* サムネイル（プレースホルダー） */}
                <div className="bg-gray-700 rounded-lg mb-4 h-48 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <span className="text-6xl">{getCategoryIcon(template.category)}</span>
                </div>

                {/* テンプレート情報 */}
                <h3 className="text-white font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>

                {/* カテゴリバッジ */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {getCategoryName(template.category)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-gray-400 text-sm text-center">
            テンプレートを選択すると、LP編集エリアに追加されます
          </p>
        </div>
      </div>
    </div>
  );
}

// ヘルパー関数
function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    header: '🎯',
    content: '📝',
    conversion: '🚀',
    'social-proof': '⭐',
    media: '🎬',
    form: '📋',
  };
  return icons[category] || '📄';
}

function getCategoryName(category: string): string {
  const names: { [key: string]: string } = {
    header: 'ヒーロー',
    content: 'コンテンツ',
    conversion: 'コンバージョン',
    'social-proof': '社会的証明',
    media: 'メディア',
    form: 'フォーム',
  };
  return names[category] || category;
}
