'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { BlockContent } from '@/types/templates';

interface PropertyPanelProps {
  block: {
    id: string;
    blockType: string;
    content: BlockContent;
  } | null;
  onUpdateContent: (field: string, value: any) => void;
  onClose: () => void;
}

export default function PropertyPanel({ block, onUpdateContent, onClose }: PropertyPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  if (!block) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
        <div className="text-4xl mb-4">🎨</div>
        <h3 className="text-white font-semibold mb-2">プロパティパネル</h3>
        <p className="text-gray-400 text-sm">
          ブロックを選択すると、プロパティを編集できます
        </p>
      </div>
    );
  }

  const content = block.content;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-white font-semibold">プロパティ</h3>
          <p className="text-gray-400 text-sm">{block.blockType}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* プロパティ */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* 背景色 */}
        {content.backgroundColor !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              背景色
            </label>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white flex items-center justify-between hover:border-gray-600"
              >
                <span>{content.backgroundColor || '#FFFFFF'}</span>
                <div
                  className="w-8 h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: content.backgroundColor || '#FFFFFF' }}
                />
              </button>
              
              {showColorPicker === 'bg' && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-gray-900 p-3 rounded-lg shadow-2xl border border-gray-700">
                  <HexColorPicker
                    color={content.backgroundColor || '#FFFFFF'}
                    onChange={(color) => onUpdateContent('backgroundColor', color)}
                  />
                  <button
                    onClick={() => setShowColorPicker(null)}
                    className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    完了
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* テキスト色 */}
        {content.textColor !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              テキスト色
            </label>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white flex items-center justify-between hover:border-gray-600"
              >
                <span>{content.textColor || '#000000'}</span>
                <div
                  className="w-8 h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: content.textColor || '#000000' }}
                />
              </button>
              
              {showColorPicker === 'text' && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-gray-900 p-3 rounded-lg shadow-2xl border border-gray-700">
                  <HexColorPicker
                    color={content.textColor || '#000000'}
                    onChange={(color) => onUpdateContent('textColor', color)}
                  />
                  <button
                    onClick={() => setShowColorPicker(null)}
                    className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    完了
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ボタン色（CTAブロック等） */}
        {('buttonColor' in content) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ボタン色
            </label>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === 'button' ? null : 'button')}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white flex items-center justify-between hover:border-gray-600"
              >
                <span>{(content as any).buttonColor || '#3B82F6'}</span>
                <div
                  className="w-8 h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: (content as any).buttonColor || '#3B82F6' }}
                />
              </button>
              
              {showColorPicker === 'button' && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-gray-900 p-3 rounded-lg shadow-2xl border border-gray-700">
                  <HexColorPicker
                    color={(content as any).buttonColor || '#3B82F6'}
                    onChange={(color) => onUpdateContent('buttonColor', color)}
                  />
                  <button
                    onClick={() => setShowColorPicker(null)}
                    className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    完了
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* パディング */}
        {content.padding !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              パディング
            </label>
            <input
              type="text"
              value={content.padding || ''}
              onChange={(e) => onUpdateContent('padding', e.target.value)}
              placeholder="例: 16px または 1rem"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* 配置（ヒーローブロック等） */}
        {('alignment' in content) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              配置
            </label>
            <select
              value={(content as any).alignment || 'center'}
              onChange={(e) => onUpdateContent('alignment', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">左寄せ</option>
              <option value="center">中央</option>
              <option value="right">右寄せ</option>
            </select>
          </div>
        )}

        {/* カラム数（Features, Pricing等） */}
        {('columns' in content) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              カラム数
            </label>
            <select
              value={(content as any).columns || 3}
              onChange={(e) => onUpdateContent('columns', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="2">2カラム</option>
              <option value="3">3カラム</option>
              <option value="4">4カラム</option>
            </select>
          </div>
        )}

        {/* レイアウト（Testimonial, FAQ等） */}
        {('layout' in content) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              レイアウト
            </label>
            <select
              value={(content as any).layout || 'card'}
              onChange={(e) => onUpdateContent('layout', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {block.blockType.includes('testimonial') && (
                <>
                  <option value="card">カード</option>
                  <option value="slider">スライダー</option>
                  <option value="grid">グリッド</option>
                </>
              )}
              {block.blockType.includes('faq') && (
                <>
                  <option value="accordion">アコーディオン</option>
                  <option value="grid">グリッド</option>
                </>
              )}
              {block.blockType.includes('gallery') && (
                <>
                  <option value="grid">グリッド</option>
                  <option value="masonry">マソンリー</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <p className="text-gray-400 text-xs text-center">
          💡 テキストをクリックすると直接編集できます
        </p>
      </div>
    </div>
  );
}
