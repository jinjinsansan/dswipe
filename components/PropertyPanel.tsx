'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { BlockContent } from '@/types/templates';
import { mediaApi } from '@/lib/api';

interface PropertyPanelProps {
  block: {
    id: string;
    blockType: string;
    content: BlockContent;
  } | null;
  onUpdateContent: (field: string, value: any) => void;
  onClose: () => void;
  onGenerateAI?: (type: 'headline' | 'subtitle' | 'description' | 'cta', field: string) => void;
}

export default function PropertyPanel({ block, onUpdateContent, onClose, onGenerateAI }: PropertyPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      const imageUrl = response.data.url;
      onUpdateContent('imageUrl', imageUrl);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

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
        {/* AI生成セクション */}
        {onGenerateAI && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">🤖 AI生成</h4>
            <div className="space-y-2">
              {('title' in content) && (
                <button
                  onClick={() => onGenerateAI('headline', 'title')}
                  className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  ✨ タイトルを生成
                </button>
              )}
              {('subtitle' in content) && (
                <button
                  onClick={() => onGenerateAI('subtitle', 'subtitle')}
                  className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  ✨ サブタイトルを生成
                </button>
              )}
              {('text' in content) && (
                <button
                  onClick={() => onGenerateAI('description', 'text')}
                  className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  ✨ 説明文を生成
                </button>
              )}
              {('buttonText' in content) && (
                <button
                  onClick={() => onGenerateAI('cta', 'buttonText')}
                  className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  ✨ ボタン文言を生成
                </button>
              )}
            </div>
          </div>
        )}

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

        {/* 画像アップロード */}
        {('imageUrl' in content) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              画像
            </label>
            {(content as any).imageUrl ? (
              <div className="space-y-2">
                <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                  <img 
                    src={(content as any).imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium text-center cursor-pointer">
                    {isUploading ? '📤 アップロード中...' : '🔄 画像を変更'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => onUpdateContent('imageUrl', '')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️ 削除
                  </button>
                </div>
              </div>
            ) : (
              <label className="block w-full px-4 py-8 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer text-center">
                <div className="text-4xl mb-2">📸</div>
                <div className="text-gray-400 text-sm mb-1">
                  {isUploading ? 'アップロード中...' : 'クリックして画像をアップロード'}
                </div>
                <div className="text-gray-500 text-xs">
                  PNG, JPG, GIF (最大5MB)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
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
