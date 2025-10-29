'use client';

import type { CSSProperties } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import type { NoteBlock } from '@/types';
import { getFontStack } from '@/lib/fonts';

interface NoteRendererProps {
  blocks: NoteBlock[];
  showPaidSeparator?: boolean;
}

export function NoteRenderer({ blocks, showPaidSeparator = false }: NoteRendererProps) {
  // 無料エリアと有料エリアを分ける
  const freeBlocks = blocks.filter(block => block.access !== 'paid');
  const paidBlocks = blocks.filter(block => block.access === 'paid');
  const hasPaidContent = paidBlocks.length > 0;

  const renderBlock = (block: NoteBlock) => {
        const key = block.id ?? `${block.type}-${Math.random().toString(16).slice(2, 8)}`;
        const data = (block.data ?? {}) as Record<string, unknown>;
        const fontFamily = typeof data.fontKey === 'string' ? getFontStack(data.fontKey) : undefined;
        const textColor = typeof data.color === 'string' && data.color ? (data.color as string) : undefined;
        const textStyle = {
          ...(fontFamily ? { fontFamily } : {}),
          ...(textColor ? { color: textColor } : {}),
        } as CSSProperties;

        switch (block.type) {
          case 'heading': {
            const level = data.level === 'h3' ? 'h3' : 'h2';
            const HeadingTag = level as 'h2' | 'h3';
            return (
              <HeadingTag
                key={key}
                className={`font-semibold text-slate-900 ${level === 'h2' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
                style={textStyle}
              >
                {typeof data.text === 'string' ? data.text : ''}
              </HeadingTag>
            );
          }
          case 'quote':
            return (
              <figure key={key} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <blockquote className="text-base italic leading-relaxed text-slate-700" style={textStyle}>
                  {typeof data.text === 'string' ? data.text : ''}
                </blockquote>
                {typeof data.cite === 'string' && data.cite ? (
                  <figcaption className="text-right text-sm font-medium text-slate-500">— {data.cite}</figcaption>
                ) : null}
              </figure>
            );
          case 'image':
            return (
              <figure key={key} className="space-y-2">
                {typeof data.url === 'string' && data.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.url}
                    alt={typeof data.caption === 'string' ? data.caption : ''}
                    className="w-full rounded-3xl border border-slate-200 object-cover"
                  />
                ) : null}
                {typeof data.caption === 'string' && data.caption ? (
                  <figcaption className="text-center text-xs text-slate-500">{data.caption}</figcaption>
                ) : null}
              </figure>
            );
          case 'list': {
            const items = Array.isArray((data as { items?: unknown }).items)
              ? ((data as { items?: unknown[] }).items ?? []).filter((item): item is string => typeof item === 'string' && item.length > 0)
              : [];

            return items.length ? (
              <ul
                key={key}
                className="list-inside space-y-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm"
                style={textStyle}
              >
                {items.map((item, index) => (
                  <li key={`${key}-${index}`} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null;
          }
          case 'divider':
            return <div key={key} className="h-px w-full bg-slate-200" />;
          case 'paragraph':
          default:
            return (
              <p
                key={key}
                className="whitespace-pre-wrap text-base leading-relaxed text-slate-700"
                style={textStyle}
              >
                {typeof data.text === 'string' ? data.text : ''}
              </p>
            );
        }
  };

  return (
    <div className="space-y-8">
      {/* 無料エリア */}
      {freeBlocks.map((block) => renderBlock(block))}

      {/* 有料エリア区切り（有料コンテンツがある場合のみ表示） */}
      {hasPaidContent && showPaidSeparator && (
        <div className="my-10 flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            {/* 区切り線 */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-amber-300"></div>
            </div>
            {/* ラベル */}
            <div className="relative flex justify-center">
              <div className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 shadow-lg">
                <LockClosedIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                <span className="text-sm font-bold text-amber-900">ここから先は有料エリアです</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 有料エリア */}
      {paidBlocks.map((block) => renderBlock(block))}
    </div>
  );
}

export default NoteRenderer;
