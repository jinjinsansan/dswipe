'use client';

import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import type { NoteBlock, NoteEditorType, NoteRichContent } from '@/types';
import { getFontStack } from '@/lib/fonts';
import { useTranslations } from 'next-intl';

interface NoteRendererProps {
  editorType: NoteEditorType;
  blocks: NoteBlock[];
  richContent?: NoteRichContent | null;
  showPaidSeparator?: boolean;
}

export function NoteRenderer({ editorType, blocks, richContent, showPaidSeparator = false }: NoteRendererProps) {
  const t = useTranslations('noteRenderer');
  if (editorType === 'note') {
    return (
      <RichContentRenderer
        content={richContent}
        showPaidSeparator={showPaidSeparator}
        paidLabel={t('paidAreaLabel')}
      />
    );
  }
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
          <figure className="space-y-2 border-l-4 border-slate-200 pl-4">
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
                className="w-full object-cover"
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

        if (!items.length) {
          return null;
        }

        return (
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700" style={textStyle}>
            {items.map((item, index) => (
              <li key={`${index}-${item.slice(0, 16)}`}>{item}</li>
            ))}
          </ul>
        );
      }
      case 'divider':
        return <div className="h-px w-full bg-slate-200" />;
      case 'spacer': {
        const size = typeof (data as { size?: unknown }).size === 'string' ? (data as { size?: string }).size : 'md';
        const heightClass =
          size === 'sm' ? 'h-6' : size === 'lg' ? 'h-16' : 'h-10';
        return <div aria-hidden className={`w-full ${heightClass}`} />;
      }
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
              <span className="text-sm font-semibold text-slate-900 line-clamp-2">{ogTitle || url || t('linkFallback')}</span>
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

    const isSimpleBlock = block.type === 'divider' || block.type === 'spacer';

    return (
      <div
        key={key}
        className={`note-block w-full ${isSimpleBlock ? 'py-2' : 'space-y-2'}`}
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
                <span className="text-sm font-bold text-amber-900">{t('paidAreaLabel')}</span>
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

interface RichContentRendererProps {
  content?: NoteRichContent | null;
  showPaidSeparator: boolean;
  paidLabel: string;
}

type RichNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

const isPaidAccess = (node?: { attrs?: Record<string, unknown> }): boolean => {
  const access = typeof node?.attrs?.access === 'string' ? node?.attrs?.access : 'public';
  return access === 'paid';
};

const renderMarks = (node: RichNode, key: string | number): ReactNode => {
  const base = node.text ?? '';
  if (!node.marks || node.marks.length === 0) {
    return base;
  }

  return node.marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'link': {
        const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
        if (!href) {
          return acc;
        }
        const target = typeof mark.attrs?.target === 'string' ? mark.attrs.target : '_blank';
        const rel = typeof mark.attrs?.rel === 'string' ? mark.attrs.rel : 'noopener noreferrer';
        return (
          <a
            key={`${key}-link-${href}`}
            href={href}
            target={target}
            rel={rel}
            className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            {acc}
          </a>
        );
      }
      case 'bold':
        return <strong key={`${key}-bold`}>{acc}</strong>;
      case 'italic':
        return <em key={`${key}-italic`}>{acc}</em>;
      case 'code':
        return <code key={`${key}-code`} className="rounded bg-slate-100 px-1 py-0.5 text-sm">{acc}</code>;
      default:
        return acc;
    }
  }, base);
};

const renderRichChildren = (nodes: RichNode[] | undefined): ReactNode => {
  if (!nodes || nodes.length === 0) {
    return null;
  }
  return nodes.map((child, index) => renderRichNode(child, `${child.type}-${index}`));
};

const renderRichNode = (node: RichNode, key: string | number): ReactNode => {
  const paid = isPaidAccess(node);
  const baseClass = paid ? 'rich-paid-node' : '';
  const mergeClassNames = (...classes: (string | undefined)[]) => {
    return [baseClass, ...classes.filter(Boolean)]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;
  };

  switch (node.type) {
    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
      const HeadingTag = (`h${Math.min(Math.max(level, 2), 4)}` as 'h2' | 'h3' | 'h4');
      return (
        <HeadingTag key={key} className={mergeClassNames(`${HeadingTag === 'h2' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-semibold text-slate-900`)}>
          {renderRichChildren(node.content)}
        </HeadingTag>
      );
    }
    case 'paragraph': {
      if (!node.content || node.content.length === 0) {
        return <p key={key} className={mergeClassNames('text-base leading-relaxed text-slate-700')}>&nbsp;</p>;
      }
      return (
        <p key={key} className={mergeClassNames('whitespace-pre-wrap text-base leading-relaxed text-slate-700')}>
          {node.content.map((child, index) =>
            child.type === 'text'
              ? <span key={`${key}-text-${index}`}>{renderMarks(child, `${key}-text-${index}`)}</span>
              : renderRichNode(child, `${key}-nested-${index}`)
          )}
        </p>
      );
    }
    case 'blockquote':
      return (
        <blockquote key={key} className={mergeClassNames('space-y-2 border-l-4 border-slate-200 pl-4')}>
          {renderRichChildren(node.content)}
        </blockquote>
      );
    case 'bulletList':
      return (
        <ul key={key} className={mergeClassNames('list-disc space-y-1 pl-6 text-sm text-slate-700')}>
          {renderRichChildren(node.content)}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} className={mergeClassNames('list-decimal space-y-1 pl-6 text-sm text-slate-700')}>
          {renderRichChildren(node.content)}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key} className={mergeClassNames(undefined)}>
          {renderRichChildren(node.content)}
        </li>
      );
    case 'hardBreak':
      return <br key={key} />;
    case 'horizontalRule':
      return <hr key={key} className="my-8 border-t border-slate-200" />;
    case 'text':
      return <span key={key}>{renderMarks(node, key)}</span>;
    case 'image': {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      if (!src) {
        return null;
      }
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      return (
        <figure key={key} className={mergeClassNames('space-y-2')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full rounded-2xl object-cover" />
          {alt ? <figcaption className="text-center text-xs text-slate-500">{alt}</figcaption> : null}
        </figure>
      );
    }
    default:
      return <div key={key}>{renderRichChildren(node.content)}</div>;
  }
};

const hasPaidNodes = (node?: RichNode): boolean => {
  if (!node) return false;
  if (isPaidAccess(node)) return true;
  return (node.content ?? []).some((child) => hasPaidNodes(child));
};

function RichContentRenderer({ content, showPaidSeparator, paidLabel }: RichContentRendererProps) {
  const nodes = ((content?.content ?? []) as RichNode[]).filter(Boolean);
  const paidExists = nodes.some((node) => hasPaidNodes(node));
  const firstPaidIndex = paidExists ? nodes.findIndex((node) => hasPaidNodes(node)) : -1;

  return (
    <div className="note-content flex flex-col gap-8">
      {nodes.map((node, index) => {
        const nodeKey = `${node.type}-${index}`;
        const showMarker = paidExists && showPaidSeparator && index === firstPaidIndex;

        return (
          <Fragment key={nodeKey}>
            {showMarker ? (
              <div className="flex items-center justify-center py-6">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-amber-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 shadow-lg">
                      <LockClosedIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                      <span className="text-sm font-bold text-amber-900">{paidLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {renderRichNode(node, nodeKey)}
          </Fragment>
        );
      })}

      <style jsx global>{`
        .note-content .rich-paid-node {
          position: relative;
          background: linear-gradient(90deg, rgba(253, 230, 138, 0.18), rgba(253, 230, 138, 0.05));
          border-left: 4px solid #f59e0b;
          border-radius: 18px;
          padding: 1.3rem 1.4rem 1.3rem 1.55rem;
          margin-left: -1.55rem;
          margin-right: -1.55rem;
          box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.18);
        }

        .note-content .rich-paid-node + * {
          margin-top: 2rem;
        }

        @media (max-width: 640px) {
          .note-content .rich-paid-node {
            margin-left: -1.2rem;
            margin-right: -1.2rem;
            padding: 1.2rem 1.2rem 1.2rem 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}
