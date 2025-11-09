import type { NoteBlock, NoteBlockType } from './index';

export type AiActionKind = 'rewrite' | 'proofread' | 'structure';

export interface AiActionMetadata {
  type: AiActionKind;
  label: string;
  targetBlockIds?: string[];
  reasoning?: string | null;
  lengthRatio?: number;
}

export interface AiActionRecord extends AiActionMetadata {
  id: string;
  timestamp: number;
  beforeBlocks: NoteBlock[];
  afterBlocks: NoteBlock[];
}

export interface StructureInsertPayload {
  text: string;
  suggestedBlockType?: NoteBlockType;
}
