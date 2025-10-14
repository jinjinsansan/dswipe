'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockRenderer from './blocks/BlockRenderer';
import { BlockType, BlockContent } from '@/types/templates';

interface Block {
  id: string;
  blockType: BlockType;
  content: BlockContent;
  order: number;
}

interface DraggableBlockEditorProps {
  blocks: Block[];
  onUpdateBlock: (blockId: string, field: string, value: any) => void;
  onDeleteBlock: (blockId: string) => void;
  onReorderBlocks: (blocks: Block[]) => void;
  isEditing: boolean;
  onSelectBlock?: (blockId: string) => void;
  selectedBlockId?: string;
}

// ドラッグ可能なブロックアイテム
function SortableBlock({
  block,
  isEditing,
  isSelected,
  onUpdateBlock,
  onDeleteBlock,
  onSelect,
}: {
  block: Block;
  isEditing: boolean;
  isSelected: boolean;
  onUpdateBlock: (field: string, value: any) => void;
  onDeleteBlock: () => void;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group mb-4 ${
        isEditing ? 'cursor-move' : ''
      } ${isDragging ? 'z-50' : ''}`}
    >
      {/* ドラッグハンドル & コントロール（編集モード時のみ） */}
      {isEditing && (
        <div className="absolute -left-16 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* ドラッグハンドル */}
          <button
            {...attributes}
            {...listeners}
            className="w-12 h-12 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            title="ドラッグして並び替え"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          {/* 削除 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('このブロックを削除しますか？')) {
                onDeleteBlock();
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
      <div
        onClick={() => isEditing && onSelect()}
        className={`relative ${
          isEditing
            ? `border-2 rounded-lg overflow-hidden ${
                isSelected
                  ? 'border-blue-500 ring-4 ring-blue-500/20'
                  : 'border-dashed border-gray-600 hover:border-blue-400'
              }`
            : ''
        }`}
      >
        {isEditing && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm z-10 pointer-events-none">
            {block.blockType}
          </div>
        )}
        
        <BlockRenderer
          blockType={block.blockType}
          content={block.content}
          isEditing={isEditing}
          onEdit={onUpdateBlock}
        />
      </div>
    </div>
  );
}

export default function DraggableBlockEditor({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  isEditing,
  onSelectBlock,
  selectedBlockId,
}: DraggableBlockEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動してからドラッグ開始（クリックとの区別）
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id);
      const newIndex = sortedBlocks.findIndex((b) => b.id === over.id);

      const reorderedBlocks = arrayMove(sortedBlocks, oldIndex, newIndex);
      
      // orderを再計算
      const updatedBlocks = reorderedBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));

      onReorderBlocks(updatedBlocks);
    }
  };

  if (sortedBlocks.length === 0) {
    return (
      <div className="text-center py-16 px-8 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-white font-semibold text-xl mb-2">ブロックがありません</h3>
        <p className="text-gray-400">
          「+ ブロック追加」ボタンからテンプレートを追加してください
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedBlocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {sortedBlocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              isEditing={isEditing}
              isSelected={selectedBlockId === block.id}
              onUpdateBlock={(field, value) => onUpdateBlock(block.id, field, value)}
              onDeleteBlock={() => onDeleteBlock(block.id)}
              onSelect={() => onSelectBlock?.(block.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
