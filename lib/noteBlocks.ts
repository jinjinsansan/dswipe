import type { NoteBlock, NoteBlockType, NoteAccessLevel } from '@/types';

const BLOCK_TYPE_LABELS: Record<NoteBlockType, string> = {
  paragraph: 'テキスト',
  heading: '見出し',
  quote: '引用',
  image: '画像',
  divider: '区切り線',
  list: 'リスト',
};

export const NOTE_BLOCK_TYPE_OPTIONS = (Object.keys(BLOCK_TYPE_LABELS) as NoteBlockType[]).map((type) => ({
  value: type,
  label: BLOCK_TYPE_LABELS[type],
}));

export const createBlockId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `block_${Math.random().toString(16).slice(2, 10)}`;
};

const normalizeAccess = (access: NoteAccessLevel | string | undefined): NoteAccessLevel => {
  return access === 'paid' ? 'paid' : 'public';
};

export const createEmptyBlock = (type: NoteBlockType): NoteBlock => {
  const base: NoteBlock = {
    id: createBlockId(),
    type,
    access: 'public',
    data: {},
  };

  switch (type) {
    case 'paragraph':
      base.data = { text: '' };
      break;
    case 'heading':
      base.data = { text: '', level: 'h2' };
      break;
    case 'quote':
      base.data = { text: '', cite: '' };
      break;
    case 'image':
      base.data = { url: '', caption: '' };
      break;
    case 'list':
      base.data = { items: [] };
      break;
    case 'divider':
    default:
      base.data = {};
      break;
  }

  return base;
};

export const normalizeBlock = (block: NoteBlock): NoteBlock => {
  const normalized: NoteBlock = {
    id: block.id ?? createBlockId(),
    type: (block.type ?? 'paragraph') as NoteBlockType,
    access: normalizeAccess(block.access),
    data: {},
  };

  const data = (block.data ?? {}) as Record<string, unknown>;

  switch (normalized.type) {
    case 'heading': {
      const level = data.level === 'h2' || data.level === 'h3' ? data.level : 'h2';
      const fontKey = typeof data.fontKey === 'string' ? data.fontKey : undefined;
      const color = typeof data.color === 'string' && data.color ? data.color : undefined;
      normalized.data = {
        text: typeof data.text === 'string' ? data.text : '',
        level,
        ...(fontKey ? { fontKey } : {}),
        ...(color ? { color } : {}),
      };
      break;
    }
    case 'quote': {
      const fontKey = typeof data.fontKey === 'string' ? data.fontKey : undefined;
      const color = typeof data.color === 'string' && data.color ? data.color : undefined;
      normalized.data = {
        text: typeof data.text === 'string' ? data.text : '',
        cite: typeof data.cite === 'string' ? data.cite : '',
        ...(fontKey ? { fontKey } : {}),
        ...(color ? { color } : {}),
      };
      break;
    }
    case 'image': {
      normalized.data = {
        url: typeof data.url === 'string' ? data.url : '',
        caption: typeof data.caption === 'string' ? data.caption : '',
      };
      break;
    }
    case 'list': {
      const items = Array.isArray(data.items)
        ? data.items.filter((item): item is string => typeof item === 'string')
        : typeof data.text === 'string'
          ? data.text.split('\n').map((item) => item.trim()).filter(Boolean)
          : [];
      const fontKey = typeof data.fontKey === 'string' ? data.fontKey : undefined;
      const color = typeof data.color === 'string' && data.color ? data.color : undefined;
      normalized.data = {
        items,
        ...(fontKey ? { fontKey } : {}),
        ...(color ? { color } : {}),
      };
      break;
    }
    case 'divider': {
      normalized.data = {};
      break;
    }
    case 'paragraph':
    default: {
      const fontKey = typeof data.fontKey === 'string' ? data.fontKey : undefined;
      const color = typeof data.color === 'string' && data.color ? data.color : undefined;
      normalized.data = {
        text: typeof data.text === 'string' ? data.text : '',
        ...(fontKey ? { fontKey } : {}),
        ...(color ? { color } : {}),
      };
      normalized.type = normalized.type === 'paragraph' || !normalized.type ? 'paragraph' : normalized.type;
      break;
    }
  }

  return normalized;
};

export const duplicateBlock = (block: NoteBlock): NoteBlock => ({
  id: createBlockId(),
  type: block.type,
  access: block.access,
  data: JSON.parse(JSON.stringify(block.data ?? {})),
});

export const isPaidBlock = (block: NoteBlock): boolean => block.access === 'paid';
