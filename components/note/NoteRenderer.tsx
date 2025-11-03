'use client';

import type { CSSProperties, ReactNode } from 'react';
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

  const renderBlockContent = (block: NoteBlock, textStyle: CSSProperties): ReactNode => {
    const data = (block.data ?? {}) as Record<string, unknown>;

    switch (block.type) {
      case 'heading': {
        const level = data.level === 'h3' ? 'h3' : 'h2';
        const HeadingTag = level as 'h2' | 'h3';
        return (
          <HeadingTag
            className={`font-semibold text-slate-900 ${level === 'h2' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
            style={textStyle}
          >
            {typeof data.text === 'string' ? data.text : ''}
          </HeadingTag>
        );
      }
      case 'quote':
        return (
          <figure className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
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
          <figure className="space-y-2">
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
            className="list-inside space-y-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm"
            style={textStyle}
          >
            {items.map((item, index) => (
              <li key={`${index}-${item.slice(0, 16)}`} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null;
      }
      case 'divider':
        return <div className="h-px w-full bg-slate-200" />;
      case 'link': {
        const url = typeof data.url === 'string' ? data.url.trim() : '';
        const title = typeof data.title === 'string' ? data.title : '';
        const description = typeof data.description === 'string' ? data.description : '';
        const ogp = (data.ogp ?? {}) as Record<string, unknown>;
        const ogTitle = typeof ogp.title === 'string' && ogp.title ? ogp.title : title;
        const ogDescription = typeof ogp.description === 'string' ? ogp.description : description;
        const ogImage = typeof ogp.image === 'string' && ogp.image ? ogp.image : undefined;
        const ogSite = typeof ogp.site_name === 'string' ? ogp.site_name : undefined;
        const href = url || undefined;

        const card = (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30">
            {ogImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ogImage}
                alt={ogTitle || url}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-sm font-semibold text-slate-900 line-clamp-2">{ogTitle || url || 'リンク'}</span>
              {ogDescription ? (
                <span className="text-xs text-slate-600 line-clamp-2">{ogDescription}</span>
              ) : null}
              {ogSite || href ? (
                <span className="text-[11px] font-medium text-blue-600 line-clamp-1">
                  {ogSite ?? href}
                </span>
              ) : null}
            </div>
          </div>
        );

        if (href) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block">
              {card}
            </a>
          );
        }

        return card;
      }
      case 'paragraph':
      default:
        return (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700" style={textStyle}>
            {typeof data.text === 'string' ? data.text : ''}
          </p>
        );
    }
  };

  const renderBlock = (block: NoteBlock) => {
    const key = block.id ?? `${block.type}-${Math.random().toString(16).slice(2, 8)}`;
    const data = (block.data ?? {}) as Record<string, unknown>;
    const fontFamily = typeof data.fontKey === 'string' ? getFontStack(data.fontKey) : undefined;
    const textColor = typeof data.color === 'string' && data.color ? (data.color as string) : undefined;
    const textStyle = {
      ...(fontFamily ? { fontFamily } : {}),
      ...(textColor ? { color: textColor } : {}),
    } as CSSProperties;

    const content = renderBlockContent(block, textStyle);
    if (!content) {
      return null;
    }

    const isDivider = block.type === 'divider';

    return (
      <div
        key={key}
        className={`note-block w-full ${isDivider ? 'py-2' : 'space-y-2'}`}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="note-content flex flex-col gap-8">
      {freeBlocks.map(renderBlock)}

      {hasPaidContent && showPaidSeparator && (
        <div className="flex items-center justify-center py-6">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-amber-300"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 shadow-lg">
                <LockClosedIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                <span className="text-sm font-bold text-amber-900">ここから先は有料エリアです</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {paidBlocks.map(renderBlock)}
    </div>
  );
}

export default NoteRenderer;
