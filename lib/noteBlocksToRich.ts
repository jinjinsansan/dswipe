/* classic(ブロック型)記事 → note型(Tiptapリッチ)への一方向コンバータ(Phase11)
   NoteRenderer のブロック描画仕様と NoteRichEditor のノード定義(access属性付き)に対応。 */

import type { NoteBlock, NoteRichContent } from '@/types';

type TiptapNode = Record<string, unknown>;

const textNode = (text: string, marks?: Array<Record<string, unknown>>): TiptapNode => ({
  type: 'text',
  text,
  ...(marks && marks.length > 0 ? { marks } : {}),
});

const paragraphNode = (access: string, text?: string, marks?: Array<Record<string, unknown>>): TiptapNode => ({
  type: 'paragraph',
  attrs: { access },
  content: text && text.length > 0 ? [textNode(text, marks)] : [],
});

export function noteBlocksToRichContent(blocks: NoteBlock[]): NoteRichContent {
  const content: TiptapNode[] = [];

  for (const block of blocks) {
    const access = block.access === 'paid' ? 'paid' : 'public';
    const data = (block.data ?? {}) as Record<string, unknown>;
    const text = typeof data.text === 'string' ? data.text : '';

    switch (block.type) {
      case 'heading': {
        const level = data.level === 'h3' ? 3 : 2;
        content.push({
          type: 'heading',
          attrs: { access, level },
          content: text ? [textNode(text)] : [],
        });
        break;
      }
      case 'quote': {
        const cite = typeof data.cite === 'string' ? data.cite : '';
        const inner: TiptapNode[] = [paragraphNode(access, text)];
        if (cite) {
          inner.push(paragraphNode(access, `— ${cite}`));
        }
        content.push({ type: 'blockquote', attrs: { access }, content: inner });
        break;
      }
      case 'image': {
        const url = typeof data.url === 'string' ? data.url.trim() : '';
        const caption = typeof data.caption === 'string' ? data.caption : '';
        if (url) {
          content.push({ type: 'image', attrs: { src: url, alt: caption, access } });
          if (caption) {
            content.push(paragraphNode(access, caption));
          }
        }
        break;
      }
      case 'list': {
        const items = Array.isArray(data.items)
          ? (data.items as unknown[]).filter((item): item is string => typeof item === 'string' && item.length > 0)
          : [];
        if (items.length > 0) {
          content.push({
            type: 'bulletList',
            attrs: { access },
            content: items.map((item) => ({
              type: 'listItem',
              attrs: { access },
              content: [paragraphNode(access, item)],
            })),
          });
        }
        break;
      }
      case 'divider':
        content.push({ type: 'horizontalRule' });
        break;
      case 'spacer':
        content.push(paragraphNode(access));
        break;
      case 'link': {
        const url = typeof data.url === 'string' ? data.url.trim() : '';
        const title = typeof data.title === 'string' && data.title ? data.title : url;
        if (url) {
          content.push(
            paragraphNode(access, title, [
              { type: 'link', attrs: { href: url, target: '_blank', rel: 'noopener noreferrer nofollow' } },
            ]),
          );
        }
        break;
      }
      case 'paragraph':
      default: {
        // 段落内改行はhardBreakに分解
        const segments = text.split('\n');
        if (segments.length <= 1) {
          content.push(paragraphNode(access, text));
        } else {
          const inner: TiptapNode[] = [];
          segments.forEach((segment, index) => {
            if (segment.length > 0) inner.push(textNode(segment));
            if (index < segments.length - 1) inner.push({ type: 'hardBreak' });
          });
          content.push({ type: 'paragraph', attrs: { access }, content: inner });
        }
        break;
      }
    }
  }

  if (content.length === 0) {
    content.push(paragraphNode('public'));
  }

  return { type: 'doc', content } as NoteRichContent;
}
