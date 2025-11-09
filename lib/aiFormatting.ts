import type { NoteBlock, NoteBlockType } from '@/types';
import type { StructureInsertPayload } from '@/types/aiAssistant';
import { createEmptyBlock, normalizeBlock } from './noteBlocks';

const BULLET_PATTERN = /^([-*•●・]|[0-9]+[\.)、．]|[0-9]+\))\s*/;

const normalizeLineBreaks = (text: string): string => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const collapseBlankLines = (text: string): string => text.replace(/\n{3,}/g, '\n\n');

const trimLines = (text: string): string => {
  return normalizeLineBreaks(text)
    .split('\n')
    .map((line) => line.replace(/\s+$/u, ''))
    .join('\n')
    .trim();
};

export interface SanitizedBlockContent {
  text?: string;
  items?: string[];
}

export const sanitizeContentForBlockType = (blockType: NoteBlockType, rawText: string): SanitizedBlockContent => {
  const normalized = normalizeLineBreaks(rawText || '').replace(/\t/g, ' ');

  switch (blockType) {
    case 'heading': {
      const lines = normalized
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const heading = (lines[0] || normalized).replace(/\s+/g, ' ').trim();
      const limited = heading.slice(0, 80);
      return { text: limited };
    }
    case 'list': {
      let items = normalized
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.replace(BULLET_PATTERN, '').trim())
        .filter((line) => line.length > 0);

      if (items.length === 0) {
        const fallback = normalized.trim();
        if (fallback) {
          items = fallback.split(/\s*[,、]\s*/).filter((item) => item.length > 0);
          if (items.length === 0) {
            items = [fallback];
          }
        }
      }

      return { items };
    }
    case 'quote':
    case 'paragraph':
    default: {
      const trimmed = collapseBlankLines(trimLines(normalized));
      return { text: trimmed };
    }
  }
};

const inferBlockTypeFromText = (text: string): NoteBlockType => {
  const normalized = normalizeLineBreaks(text);
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return 'paragraph';
  }

  if (lines.every((line) => BULLET_PATTERN.test(line))) {
    return 'list';
  }

  const firstLine = lines[0];
  if (/^#{1,3}\s+/.test(firstLine)) {
    return 'heading';
  }

  const headingCandidate = firstLine.replace(/\s+/g, ' ');
  if (lines.length === 1 && headingCandidate.length <= 36 && !/[。！？!?]$/.test(headingCandidate)) {
    return 'heading';
  }

  return 'paragraph';
};

const createBlockWithContent = (type: NoteBlockType, content: string): NoteBlock | null => {
  const block = createEmptyBlock(type);
  const sanitized = sanitizeContentForBlockType(type, content);

  if (type === 'list') {
    const items = sanitized.items ?? [];
    if (items.length === 0) {
      return createBlockWithContent('paragraph', content);
    }
    block.data = { ...(block.data ?? {}), items };
    return normalizeBlock(block);
  }

  const textValue = sanitized.text ?? '';
  const fallback = content.trim();
  const finalText = textValue || fallback;
  if (!finalText) {
    return null;
  }
  block.data = { ...(block.data ?? {}), text: finalText };
  return normalizeBlock(block);
};

export const buildBlocksFromSuggestion = (payload: StructureInsertPayload): NoteBlock[] => {
  const normalizedText = normalizeLineBreaks(payload.text || '').trim();
  if (!normalizedText) {
    return [];
  }

  const hint = payload.suggestedBlockType ?? null;

  if (hint && hint !== 'paragraph' && hint !== 'heading' && hint !== 'list' && hint !== 'quote') {
    return buildBlocksFromSuggestion({ text: normalizedText });
  }

  const createWithFallback = (type: NoteBlockType, segment: string): NoteBlock | null => {
    const block = createBlockWithContent(type, segment);
    if (block) {
      return block;
    }
    if (type !== 'paragraph') {
      return createBlockWithContent('paragraph', segment);
    }
    return null;
  };

  if (hint) {
    const block = createWithFallback(hint, normalizedText);
    return block ? [block] : [];
  }

  const segments = normalizedText
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const blocks: NoteBlock[] = [];
  const sourceSegments = segments.length > 0 ? segments : [normalizedText];

  sourceSegments.forEach((segment) => {
    const inferred = inferBlockTypeFromText(segment);
    const block = createWithFallback(inferred, segment);
    if (block) {
      blocks.push(block);
    }
  });

  return blocks;
};

export const normalizeAiText = normalizeLineBreaks;
