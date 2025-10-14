'use client';

import React from 'react';
import BlockRenderer from './blocks/BlockRenderer';
import { BlockType, BlockContent } from '@/types/templates';

interface BlockEditorProps {
  blocks: {
    id: string;
    blockType: BlockType;
    content: BlockContent;
    order: number;
  }[];
  onUpdateBlock: (blockId: string, field: string, value: any) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  isEditing: boolean;
}

export default function BlockEditor({ 
  blocks, 
  onUpdateBlock, 
  onDeleteBlock, 
  onMoveBlock,
  isEditing 
}: BlockEditorProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedBlocks.map((block, index) => (
        <div key={block.id} className="relative group">
          {/* ブロックコントロール（編集モード時のみ表示） */}
          {isEditing && (
            <div className="absolute -left-16 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {/* 上に移動 */}
              <button
                onClick={() => onMoveBlock(block.id, 'up')}
                disabled={index === 0}
                className="w-12 h-12 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                title="上に移動"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {/* 下に移動 */}
              <button
                onClick={() => onMoveBlock(block.id, 'down')}
                disabled={index === sortedBlocks.length - 1}
                className="w-12 h-12 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                title="下に移動"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 削除 */}
              <button
                onClick={() => {
                  if (confirm('このブロックを削除しますか？')) {
                    onDeleteBlock(block.id);
                  }
                }}
                className="w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg flex items-center justify-center"
                title="削除"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {/* ブロック本体 */}
          <div className={`relative ${isEditing ? 'border-2 border-dashed border-blue-500/50 rounded-lg overflow-hidden' : ''}`}>
            {isEditing && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm z-10">
                {block.blockType}
              </div>
            )}
            
            <BlockRenderer
              blockType={block.blockType}
              content={block.content}
              isEditing={isEditing}
              onEdit={(field, value) => onUpdateBlock(block.id, field, value)}
            />
          </div>
        </div>
      ))}

      {sortedBlocks.length === 0 && (
        <div className="text-center py-16 px-8 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-white font-semibold text-xl mb-2">ブロックがありません</h3>
          <p className="text-gray-400">
            「+ ブロック追加」ボタンからテンプレートを追加してください
          </p>
        </div>
      )}
    </div>
  );
}
