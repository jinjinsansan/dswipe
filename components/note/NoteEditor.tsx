'use client';

import { useMemo } from 'react';
import type { NoteBlock, NoteBlockType } from '@/types';
import {
  NOTE_BLOCK_TYPE_OPTIONS,
  createEmptyBlock,
  duplicateBlock,
  normalizeBlock,
  isPaidBlock,
} from '@/lib/noteBlocks';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  SquaresPlusIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

type NoteEditorProps = {
  value: NoteBlock[];
  onChange: (blocks: NoteBlock[]) => void;
  disabled?: boolean;
};

const getListTextareaValue = (block: NoteBlock): string => {
  if (block.type !== 'list') return '';
  const items = Array.isArray(block.data?.items) ? block.data.items : [];
  return items.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean).join('\n');
};

const toListItems = (value: string): string[] =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export function NoteEditor({ value, onChange, disabled }: NoteEditorProps) {
  const blocks = useMemo(() => value.map((block) => normalizeBlock(block)), [value]);

  const emitChange = (next: NoteBlock[]) => {
    const normalized = next.map((block) => normalizeBlock(block));
    onChange(normalized);
  };

  const handleAdd = (type: NoteBlockType) => {
    if (disabled) return;
    emitChange([...blocks, createEmptyBlock(type)]);
  };

  const handleDuplicate = (index: number) => {
    if (disabled) return;
    const draft = [...blocks];
    draft.splice(index + 1, 0, duplicateBlock(blocks[index]));
    emitChange(draft);
  };

  const handleDelete = (index: number) => {
    if (disabled) return;
    const draft = blocks.filter((_, i) => i !== index);
    emitChange(draft.length ? draft : [createEmptyBlock('paragraph')]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    const draft = [...blocks];
    const [current] = draft.splice(index, 1);
    draft.splice(target, 0, current);
    emitChange(draft);
  };

  const handleTypeChange = (index: number, type: NoteBlockType) => {
    if (disabled) return;
    const next = [...blocks];
    const original = next[index];
    const replaced = createEmptyBlock(type);
    replaced.id = original.id;
    replaced.access = original.access;
    next[index] = replaced;
    emitChange(next);
  };

  const handleAccessToggle = (index: number) => {
    if (disabled) return;
    const next = [...blocks];
    const block = next[index];
    next[index] = {
      ...block,
      access: isPaidBlock(block) ? 'public' : 'paid',
    };
    emitChange(next);
  };

  const handleDataChange = (index: number, data: Record<string, unknown>) => {
    const next = [...blocks];
    next[index] = normalizeBlock({ ...next[index], data });
    emitChange(next);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const isPaid = isPaidBlock(block);
        return (
          <div
            key={block.id ?? index}
            className={`rounded-2xl border bg-white shadow-sm transition ${
              isPaid ? 'border-amber-400/60 ring-1 ring-amber-300/50' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={block.type}
                  onChange={(event) => handleTypeChange(index, event.target.value as NoteBlockType)}
                  disabled={disabled}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  {NOTE_BLOCK_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAccessToggle(index)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isPaid
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {isPaid ? (
                    <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <LockOpenIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isPaid ? '有料ブロック' : '無料ブロック'}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={disabled || index === 0}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={disabled || index === blocks.length - 1}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(index)}
                  disabled={disabled}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  disabled={disabled || blocks.length === 1}
                  className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-4 py-5">
              {block.type === 'paragraph' && (
                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="本文を入力"
                  value={typeof block.data?.text === 'string' ? block.data.text : ''}
                  onChange={(event) => handleDataChange(index, { text: event.target.value })}
                  disabled={disabled}
                />
              )}

              {block.type === 'heading' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="見出しを入力"
                    value={typeof block.data?.text === 'string' ? block.data.text : ''}
                    onChange={(event) => handleDataChange(index, { text: event.target.value, level: block.data?.level ?? 'h2' })}
                    disabled={disabled}
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>サイズ:</span>
                    <div className="flex items-center gap-1">
                      {(['h2', 'h3'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleDataChange(index, { text: block.data?.text ?? '', level })}
                          disabled={disabled}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            block.data?.level === level
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          {level === 'h2' ? '大' : '中'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'quote' && (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm italic text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="引用文を入力"
                    value={typeof block.data?.text === 'string' ? block.data.text : ''}
                    onChange={(event) => handleDataChange(index, { text: event.target.value, cite: block.data?.cite ?? '' })}
                    disabled={disabled}
                  />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="引用元 (任意)"
                    value={typeof block.data?.cite === 'string' ? block.data.cite : ''}
                    onChange={(event) => handleDataChange(index, { text: block.data?.text ?? '', cite: event.target.value })}
                    disabled={disabled}
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="画像URL"
                    value={typeof block.data?.url === 'string' ? block.data.url : ''}
                    onChange={(event) => handleDataChange(index, { url: event.target.value, caption: block.data?.caption ?? '' })}
                    disabled={disabled}
                  />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="キャプション (任意)"
                    value={typeof block.data?.caption === 'string' ? block.data.caption : ''}
                    onChange={(event) => handleDataChange(index, { url: block.data?.url ?? '', caption: event.target.value })}
                    disabled={disabled}
                  />
                  {typeof block.data?.url === 'string' && block.data.url ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={block.data.url}
                        alt={typeof block.data?.caption === 'string' ? block.data.caption : ''}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {block.type === 'list' && (
                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder={`リスト項目を1行ずつ入力\n例:\n・メリット1\n・メリット2`}
                  value={getListTextareaValue(block)}
                  onChange={(event) => handleDataChange(index, { items: toListItems(event.target.value) })}
                  disabled={disabled}
                />
              )}

              {block.type === 'divider' && (
                <div className="py-4">
                  <div className="mx-auto h-px w-full max-w-md bg-slate-200" />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">ブロックを追加</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {NOTE_BLOCK_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleAdd(option.value)}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SquaresPlusIcon className="h-4 w-4" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default NoteEditor;
