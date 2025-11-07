'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  PhotoIcon,
} from '@heroicons/react/24/outline';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { mediaApi } from '@/lib/api';
import { DEFAULT_FONT_KEY, FONT_OPTIONS, getFontStack } from '@/lib/fonts';

const TEXT_COLOR_OPTIONS: Array<{ value: string; key: string }> = [
  { value: '#0f172a', key: 'dark' },
  { value: '#1e293b', key: 'slate' },
  { value: '#334155', key: 'midnight' },
  { value: '#0369a1', key: 'sky' },
  { value: '#2563eb', key: 'blue' },
  { value: '#9333ea', key: 'purple' },
  { value: '#dc2626', key: 'red' },
  { value: '#047857', key: 'emerald' },
  { value: '#d97706', key: 'amber' },
  { value: '#475569', key: 'gray' },
];

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

const SPACER_SIZE_OPTIONS = [
  { value: 'sm', key: 'small' },
  { value: 'md', key: 'medium' },
  { value: 'lg', key: 'large' },
];

export function NoteEditor({ value, onChange, disabled }: NoteEditorProps) {
  const t = useTranslations('noteEditor');
  const blocks = useMemo(() => value.map((block) => normalizeBlock(block)), [value]);
  const [mediaTargetIndex, setMediaTargetIndex] = useState<number | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleDataChange = (index: number, partialData: Record<string, unknown>) => {
    const next = [...blocks];
    const existingData = { ...(next[index].data ?? {}) };
    next[index] = normalizeBlock({ ...next[index], data: { ...existingData, ...partialData } });
    emitChange(next);
  };

  const openFilePicker = (index: number) => {
    if (disabled) return;
    const block = blocks[index];
    const key = (block.id ?? `block-${index}`).toString();
    const input = fileInputRefs.current[key];
    if (input) {
      input.value = '';
      input.click();
    }
  };

  const handleBlockFileUpload = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;
    const block = blocks[index];
    const key = (block.id ?? `block-${index}`).toString();
    setUploadingBlockId(key);
    try {
      const response = await mediaApi.upload(file, { optimize: true, max_width: 1920, max_height: 1080 });
      const imageUrl: string | undefined = response.data?.url;
      if (!imageUrl) {
        throw new Error(t('errors.uploadMissingUrl'));
      }
      const caption = typeof block.data?.caption === 'string' ? block.data.caption : '';
      handleDataChange(index, { url: imageUrl, caption });
    } catch (error) {
      console.error(t('errors.imageUploadFailed'), error);
      alert(t('alerts.imageUploadFailed'));
    } finally {
      setUploadingBlockId(null);
      event.target.value = '';
    }
  };

  const openMediaLibrary = (index: number) => {
    if (disabled) return;
    setMediaTargetIndex(index);
    setIsMediaLibraryOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetIndex === null) return;
    const block = blocks[mediaTargetIndex];
    const caption = typeof block.data?.caption === 'string' ? block.data.caption : '';
    handleDataChange(mediaTargetIndex, { url, caption });
    setIsMediaLibraryOpen(false);
    setMediaTargetIndex(null);
  };

  const closeMediaLibrary = () => {
    setIsMediaLibraryOpen(false);
    setMediaTargetIndex(null);
  };

  const renderTextStyleControls = (block: NoteBlock, index: number) => {
    const data = block.data as Record<string, unknown> | undefined;
    const currentFontKey = typeof data?.fontKey === 'string' ? data.fontKey : DEFAULT_FONT_KEY;
    const currentColor = typeof data?.color === 'string' && data.color ? (data.color as string) : '#0f172a';

    return (
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-600">{t('fields.font')}</span>
            <select
              value={currentFontKey}
              onChange={(event) => handleDataChange(index, { fontKey: event.target.value })}
              disabled={disabled}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {t(`fonts.${option.key}`)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => handleDataChange(index, { fontKey: DEFAULT_FONT_KEY, color: '#0f172a' })}
            disabled={disabled}
            className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 transition hover:border-slate-300 ${
              disabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {t('buttons.reset')}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-600">{t('fields.textColor')}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {TEXT_COLOR_OPTIONS.map((option) => {
              const isActive = option.value.toLowerCase() === currentColor.toLowerCase();
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDataChange(index, { color: option.value })}
                  disabled={disabled}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    isActive ? 'border-blue-500 ring-2 ring-blue-300/50' : 'border-slate-200 hover:border-slate-400'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  style={{ backgroundColor: option.value }}
                  title={t(`textColors.${option.key}`)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const blockKey = (block.id ?? `block-${index}`).toString();
        const isPaid = isPaidBlock(block);
        return (
          <div
            key={blockKey}
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
                      {t(`blockTypes.${option.value}`)}
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
                  {isPaid ? t('blockMeta.paid') : t('blockMeta.free')}
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
                  placeholder={t('placeholders.paragraph')}
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
                    placeholder={t('placeholders.heading')}
                    value={typeof block.data?.text === 'string' ? block.data.text : ''}
                    onChange={(event) => handleDataChange(index, { text: event.target.value, level: block.data?.level ?? 'h2' })}
                    disabled={disabled}
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{t('fields.headingSize')}</span>
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
                          {t(`headingSizes.${level}`)}
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
                    placeholder={t('placeholders.quote')}
                    value={typeof block.data?.text === 'string' ? block.data.text : ''}
                    onChange={(event) => handleDataChange(index, { text: event.target.value, cite: block.data?.cite ?? '' })}
                    disabled={disabled}
                  />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={t('placeholders.quoteCite')}
                    value={typeof block.data?.cite === 'string' ? block.data.cite : ''}
                    onChange={(event) => handleDataChange(index, { text: block.data?.text ?? '', cite: event.target.value })}
                    disabled={disabled}
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openFilePicker(index)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                      {t('buttons.uploadImage')}
                    </button>
                    <button
                      type="button"
                      onClick={() => openMediaLibrary(index)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t('buttons.chooseFromMedia')}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={(element) => {
                        fileInputRefs.current[blockKey] = element;
                      }}
                      onChange={(event) => handleBlockFileUpload(index, event)}
                      className="hidden"
                    />
                  </div>
                  {uploadingBlockId === blockKey ? (
                    <p className="text-xs font-semibold text-blue-600">{t('status.uploading')}</p>
                  ) : null}
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={t('placeholders.imageUrl')}
                    value={typeof block.data?.url === 'string' ? block.data.url : ''}
                    onChange={(event) => handleDataChange(index, { url: event.target.value, caption: block.data?.caption ?? '' })}
                    disabled={disabled}
                  />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={t('placeholders.imageCaption')}
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
                  placeholder={t('placeholders.listItems')}
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

              {block.type === 'link' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={t('placeholders.linkTitle')}
                    value={typeof block.data?.title === 'string' ? block.data.title : ''}
                    onChange={(event) => handleDataChange(index, { title: event.target.value })}
                    disabled={disabled}
                  />
                  <input
                    type="url"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="https://example.com"
                    value={typeof block.data?.url === 'string' ? block.data.url : ''}
                    onChange={(event) => handleDataChange(index, { url: event.target.value })}
                    disabled={disabled}
                  />
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder={t('placeholders.linkDescription')}
                    value={typeof block.data?.description === 'string' ? block.data.description : ''}
                    onChange={(event) => handleDataChange(index, { description: event.target.value })}
                    disabled={disabled}
                  />
                </div>
              )}

              {block.type === 'spacer' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {t('fields.spacerHeight')}
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={typeof block.data?.size === 'string' ? block.data.size : 'md'}
                    onChange={(event) => handleDataChange(index, { size: event.target.value })}
                    disabled={disabled}
                  >
                    {SPACER_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(`spacerSizes.${option.key}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(['paragraph', 'heading', 'quote', 'list'] as NoteBlockType[]).includes(block.type) ? (
                renderTextStyleControls(block, index)
              ) : null}
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t('actions.addBlock')}</p>
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
              {t(`blockTypes.${option.value}`)}
            </button>
          ))}
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={closeMediaLibrary}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
export default NoteEditor;
