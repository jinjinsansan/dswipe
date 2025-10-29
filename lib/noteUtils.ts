import type { NoteBlock } from '@/types';

/**
 * NOTEブロックから総文字数を計算
 */
export function calculateBlocksTextLength(blocks: NoteBlock[]): number {
  let totalLength = 0;

  blocks.forEach((block) => {
    const data = block.data as Record<string, unknown> | undefined;

    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'quote':
        if (typeof data?.text === 'string') {
          totalLength += data.text.length;
        }
        break;
      case 'list':
        if (Array.isArray(data?.items)) {
          data.items.forEach((item) => {
            if (typeof item === 'string') {
              totalLength += item.length;
            }
          });
        }
        break;
      case 'image':
        // 画像は文字数に含めない（またはキャプション分のみ）
        if (typeof data?.caption === 'string') {
          totalLength += data.caption.length;
        }
        break;
      default:
        break;
    }
  });

  return totalLength;
}

/**
 * 有料ブロックのプレビュー数を取得（最初の1-2ブロック）
 */
export function getPaidBlocksPreview(paidBlocks: NoteBlock[], maxBlocks: number = 2): NoteBlock[] {
  return paidBlocks.slice(0, maxBlocks);
}
