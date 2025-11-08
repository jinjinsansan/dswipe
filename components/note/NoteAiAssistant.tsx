'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { noteAiApi } from '@/lib/api';
import type { NoteBlock } from '@/types';
import type {
  NoteAIContextPayload,
  NoteProofreadCorrection,
  NoteProofreadFocus,
  NoteProofreadResponse,
  NoteRewriteResponse,
  NoteStructureResponse,
  NoteStructureSuggestionItem,
  NoteReviewResponse,
} from '@/types/api';
import type { AiActionMetadata, AiActionRecord } from '@/types/aiAssistant';

type NoteAiAssistantTab = 'rewrite' | 'proofread' | 'structure' | 'review';

interface NoteAiAssistantProps {
  title: string;
  excerpt?: string;
  categories: string[];
  language: 'ja' | 'en';
  blocks: NoteBlock[];
  disabled?: boolean;
  initialTone?: string;
  initialAudience?: string;
  onApplyText: (blockId: string, text: string, metadata: AiActionMetadata) => void;
  onInsertBlock?: (afterBlockId: string | null, text: string, metadata: AiActionMetadata) => void;
  history?: AiActionRecord[];
  onUndoAction?: (entryId?: string) => AiActionRecord | null;
}

const BLOCK_LABEL_MAP: Record<string, string> = {
  paragraph: '本文',
  heading: '見出し',
  quote: '引用',
  list: 'リスト',
  image: '画像',
  divider: '区切り',
  link: 'リンク',
  spacer: 'スペーサー',
};

type DiffSegmentType = 'equal' | 'added' | 'removed';

interface DiffSegment {
  type: DiffSegmentType;
  text: string;
}

interface RewriteStats {
  originalLines: number;
  revisedLines: number;
  originalLength: number;
  revisedLength: number;
  lengthRatio: number;
}

const extractBlockText = (block: NoteBlock): string => {
  const record = (block.data ?? {}) as Record<string, unknown>;

  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'quote': {
      const text = record.text;
      return typeof text === 'string' ? text : '';
    }
    case 'list': {
      const items = record.items;
      if (Array.isArray(items)) {
        return items
          .map((item) => (typeof item === 'string' ? item : String(item ?? '')).trim())
          .filter((item) => item.length > 0)
          .join('\n');
      }
      const text = record.text;
      return typeof text === 'string' ? text : '';
    }
    case 'link': {
      const title = record.title;
      if (typeof title === 'string') {
        return title;
      }
      const description = record.description;
      return typeof description === 'string' ? description : '';
    }
    default:
      return '';
  }
};

const combineSegment = (segments: DiffSegment[], type: DiffSegmentType, line: string) => {
  if (segments.length > 0 && segments[segments.length - 1].type === type) {
    segments[segments.length - 1].text = `${segments[segments.length - 1].text}\n${line}`;
  } else {
    segments.push({ type, text: line });
  }
};

const diffLines = (original: string, revised: string): DiffSegment[] => {
  const originalLines = original.split('\n');
  const revisedLines = revised.split('\n');
  const originalLength = originalLines.length;
  const revisedLength = revisedLines.length;

  const lcsMatrix: number[][] = Array.from({ length: originalLength + 1 }, () => Array(revisedLength + 1).fill(0));

  for (let i = originalLength - 1; i >= 0; i -= 1) {
    for (let j = revisedLength - 1; j >= 0; j -= 1) {
      if (originalLines[i] === revisedLines[j]) {
        lcsMatrix[i][j] = lcsMatrix[i + 1][j + 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i + 1][j], lcsMatrix[i][j + 1]);
      }
    }
  }

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < originalLength && j < revisedLength) {
    if (originalLines[i] === revisedLines[j]) {
      combineSegment(segments, 'equal', originalLines[i]);
      i += 1;
      j += 1;
    } else if (lcsMatrix[i + 1][j] >= lcsMatrix[i][j + 1]) {
      combineSegment(segments, 'removed', originalLines[i]);
      i += 1;
    } else {
      combineSegment(segments, 'added', revisedLines[j]);
      j += 1;
    }
  }

  while (i < originalLength) {
    combineSegment(segments, 'removed', originalLines[i]);
    i += 1;
  }

  while (j < revisedLength) {
    combineSegment(segments, 'added', revisedLines[j]);
    j += 1;
  }

  return segments;
};

const sanitizeData = (data: NoteBlock['data']): Record<string, unknown> => {
  try {
    return JSON.parse(JSON.stringify(data ?? {}));
  } catch (error) {
    console.warn('Failed to sanitize block data for AI context', error);
    return {};
  }
};

const buildContextPayload = (
  title: string,
  excerpt: string | undefined,
  categories: string[],
  language: 'ja' | 'en',
  tone: string,
  audience: string,
  blocks: NoteBlock[],
): NoteAIContextPayload => ({
  title,
  excerpt: excerpt || undefined,
  categories,
  tone: tone || undefined,
  audience: audience || undefined,
  language,
  blocks: blocks.map((block, index) => ({
    id: block.id ?? `block-${index}`,
    type: block.type,
    access: block.access,
    text: extractBlockText(block),
    data: sanitizeData(block.data),
  })),
});

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};

const formatBlockLabel = (block: NoteBlock, index: number): string => {
  const label = BLOCK_LABEL_MAP[block.type] ?? block.type;
  const text = extractBlockText(block).trim();
  const snippet = text ? (text.length > 30 ? `${text.slice(0, 30)}…` : text) : '';
  return `${index + 1}. ${label}${snippet ? `｜${snippet}` : ''}`;
};

const canRewriteBlock = (block: NoteBlock): boolean => {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'quote':
    case 'list':
      return true;
    default:
      return false;
  }
};

export default function NoteAiAssistant({
  title,
  excerpt,
  categories,
  language,
  blocks,
  disabled,
  initialTone,
  initialAudience,
  onApplyText,
  onInsertBlock,
  history,
  onUndoAction,
}: NoteAiAssistantProps) {
  const [activeTab, setActiveTab] = useState<NoteAiAssistantTab>('rewrite');
  const [tone, setTone] = useState(initialTone ?? '');
  const [audience, setAudience] = useState(initialAudience ?? '');

  const [rewriteTargetId, setRewriteTargetId] = useState<string | undefined>(() =>
    blocks.find((block) => canRewriteBlock(block))?.id,
  );
  const [rewriteInstructions, setRewriteInstructions] = useState('読みやすく、説得力のある文章に整えてください。');
  const [styleHint, setStyleHint] = useState('');
  const [rewriteResult, setRewriteResult] = useState<NoteRewriteResponse | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [isRewritePreviewOpen, setIsRewritePreviewOpen] = useState(false);

  const [proofreadFocus, setProofreadFocus] = useState<NoteProofreadFocus>('spelling');
  const [proofreadResult, setProofreadResult] = useState<NoteProofreadResponse | null>(null);
  const [proofreadLoading, setProofreadLoading] = useState(false);

  const [structureGoal, setStructureGoal] = useState('読者の理解とコンバージョン率を高める');
  const [structureResult, setStructureResult] = useState<NoteStructureResponse | null>(null);
  const [structureLoading, setStructureLoading] = useState(false);

  const [reviewResult, setReviewResult] = useState<NoteReviewResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const actionTimerRef = useRef<number | null>(null);

  const clearActionMessage = useCallback(() => {
    if (actionTimerRef.current) {
      window.clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }
    setActionMessage(null);
  }, []);

  const showActionMessage = useCallback(
    (message: string) => {
      clearActionMessage();
      setActionMessage(message);
      actionTimerRef.current = window.setTimeout(() => {
        setActionMessage(null);
        actionTimerRef.current = null;
      }, 4000);
    },
    [clearActionMessage],
  );

  useEffect(() => {
    return () => {
      if (actionTimerRef.current) {
        window.clearTimeout(actionTimerRef.current);
        actionTimerRef.current = null;
      }
    };
  }, []);

  const contextPayload = useMemo(
    () => buildContextPayload(title, excerpt, categories, language, tone, audience, blocks),
    [title, excerpt, categories, language, tone, audience, blocks],
  );

  const rewritableBlocks = useMemo(() => blocks.filter((block) => canRewriteBlock(block)), [blocks]);

  const selectedRewriteBlock = useMemo(
    () => rewritableBlocks.find((block) => (block.id ?? '') === (rewriteTargetId ?? '')),
    [rewritableBlocks, rewriteTargetId],
  );

  const rewriteDiffSegments = useMemo<DiffSegment[]>(
    () => (rewriteResult ? diffLines(rewriteResult.original_text ?? '', rewriteResult.revised_text ?? '') : []),
    [rewriteResult],
  );

  const rewriteStats = useMemo<RewriteStats | null>(() => {
    if (!rewriteResult) {
      return null;
    }
    const originalLines = rewriteResult.original_text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const revisedLines = rewriteResult.revised_text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const originalLength = rewriteResult.original_text.length;
    const revisedLength = rewriteResult.revised_text.length;
    const lengthRatio = originalLength === 0 ? 1 : revisedLength / originalLength;

    return {
      originalLines: originalLines.length,
      revisedLines: revisedLines.length,
      originalLength,
      revisedLength,
      lengthRatio,
    };
  }, [rewriteResult]);

  const handleRewrite = useCallback(async () => {
    if (!selectedRewriteBlock) {
      setErrorMessage('リライト対象のブロックを選択してください。');
      return;
    }
    setRewriteLoading(true);
    clearActionMessage();
    setErrorMessage(null);
    try {
      const response = await noteAiApi.rewrite({
        context: contextPayload,
        target_block_id: selectedRewriteBlock.id ?? '',
        instructions: rewriteInstructions || undefined,
        style_hint: styleHint || undefined,
      });
      setRewriteResult(response.data);
      setIsRewritePreviewOpen(true);
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'AIリライトに失敗しました。'));
    } finally {
      setRewriteLoading(false);
    }
  }, [contextPayload, selectedRewriteBlock, rewriteInstructions, styleHint, clearActionMessage]);

  const handleApplyRewrite = useCallback(() => {
    if (!rewriteResult) return;
    const blockId = rewriteResult.block_id;
    const blockIndex = blocks.findIndex((block) => (block.id ?? '') === blockId);
    const blockLabel =
      selectedRewriteBlock && blockIndex >= 0
        ? formatBlockLabel(selectedRewriteBlock, blockIndex)
        : '選択ブロック';

    onApplyText(blockId, rewriteResult.revised_text, {
      type: 'rewrite',
      label: `リライト: ${blockLabel}`,
      targetBlockIds: [blockId],
      reasoning: rewriteResult.reasoning ?? null,
      lengthRatio: rewriteStats?.lengthRatio,
    });
    const unchanged = rewriteResult.revised_text.trim() === rewriteResult.original_text.trim();
    showActionMessage(
      unchanged ? '提案に変更点がなかったため原文を維持しました。' : 'AIのリライト結果をブロックへ適用しました。',
    );
  }, [rewriteResult, onApplyText, showActionMessage, blocks, selectedRewriteBlock, rewriteStats]);

  const handleProofread = useCallback(async () => {
    setProofreadLoading(true);
    clearActionMessage();
    setErrorMessage(null);
    try {
      const response = await noteAiApi.proofread({
        context: contextPayload,
        focus: proofreadFocus,
      });
      setProofreadResult(response.data);
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, '校正に失敗しました。'));
    } finally {
      setProofreadLoading(false);
    }
  }, [contextPayload, proofreadFocus, clearActionMessage]);

  const handleApplyCorrection = useCallback(
    (correction: NoteProofreadCorrection) => {
      const snippet = correction.original.trim().slice(0, 12);
      const label = snippet
        ? `校正: ${snippet}${correction.original.trim().length > 12 ? '…' : ''}`
        : `校正: ${correction.block_id}`;

      onApplyText(correction.block_id, correction.suggestion, {
        type: 'proofread',
        label,
        targetBlockIds: [correction.block_id],
        reasoning: correction.explanation ?? null,
      });
      showActionMessage('校正の提案を適用しました。');
    },
    [onApplyText, showActionMessage],
  );

  const handleStructure = useCallback(async () => {
    setStructureLoading(true);
    clearActionMessage();
    setErrorMessage(null);
    try {
      const response = await noteAiApi.structure({
        context: contextPayload,
        desired_outcome: structureGoal || undefined,
      });
      setStructureResult(response.data);
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, '構成提案の生成に失敗しました。'));
    } finally {
      setStructureLoading(false);
    }
  }, [contextPayload, structureGoal, clearActionMessage]);

  const handleReview = useCallback(async () => {
    setReviewLoading(true);
    clearActionMessage();
    setErrorMessage(null);
    try {
      const response = await noteAiApi.review({ context: contextPayload });
      setReviewResult(response.data);
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'レビューに失敗しました。'));
    } finally {
      setReviewLoading(false);
    }
  }, [contextPayload, clearActionMessage]);

  const handleInsertSuggestion = useCallback(
    (afterBlockId: string | null, text: string, title?: string, description?: string) => {
      const content = text.replace(/\r\n/g, '\n').trim();
      if (!content) {
        showActionMessage('提案内容が空だったため挿入できませんでした。');
        return;
      }
      if (!onInsertBlock) {
        showActionMessage('構成提案を挿入できる状態ではありません。');
        return;
      }
      const label = title?.trim();
      onInsertBlock(afterBlockId, content, {
        type: 'structure',
        label: label ? `構成案: ${label}` : '構成案を挿入',
        reasoning: description ?? null,
      });
      showActionMessage(label ? `「${label}」の構成提案を挿入しました。` : '構成提案を挿入しました。');
    },
    [onInsertBlock, showActionMessage],
  );

  const closeRewritePreview = useCallback(() => {
    setIsRewritePreviewOpen(false);
  }, []);

  const applyRewriteFromPreview = useCallback(() => {
    handleApplyRewrite();
    closeRewritePreview();
  }, [handleApplyRewrite, closeRewritePreview]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.warn('Failed to copy to clipboard', error);
    }
  }, []);

  const handleUndoAction = useCallback(
    (entryId?: string) => {
      if (!onUndoAction) {
        return;
      }
      const undone = onUndoAction(entryId);
      if (undone) {
        showActionMessage(`「${undone.label}」を元に戻しました。`);
      }
    },
    [onUndoAction, showActionMessage],
  );

  const renderTabButton = (tab: NoteAiAssistantTab, label: string) => (
    <button
      type="button"
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  const renderHistorySection = () => {
    if (!history || history.length === 0) {
      return null;
    }

    const recentEntries = [...history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">AI操作履歴</p>
            <p className="text-[11px] text-slate-500">直近の提案適用を確認・取り消しできます。</p>
          </div>
          {onUndoAction ? (
            <button
              type="button"
              onClick={() => handleUndoAction()}
              className="text-xs font-semibold text-blue-600 underline"
            >
              最新を元に戻す
            </button>
          ) : null}
        </div>
        <ul className="mt-3 space-y-2 text-xs text-slate-600">
          {recentEntries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-slate-700">{entry.label}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(entry.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {onUndoAction ? (
                <button
                  type="button"
                  onClick={() => handleUndoAction(entry.id)}
                  className="shrink-0 text-xs font-semibold text-emerald-600 underline"
                >
                  元に戻す
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderRewriteTab = () => (
    <div className="space-y-5">
      {rewritableBlocks.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          リライト可能なテキストブロックがありません。
        </p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">対象ブロック</label>
            <select
              value={rewriteTargetId ?? ''}
              onChange={(event) => setRewriteTargetId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={disabled}
            >
              {rewritableBlocks.map((block, index) => (
                <option key={block.id ?? `block-${index}`} value={block.id ?? `block-${index}`}>
                  {formatBlockLabel(block, index)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">追加指示</label>
            <textarea
              value={rewriteInstructions}
              onChange={(event) => setRewriteInstructions(event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={disabled}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">トーンの希望（任意）</label>
            <input
              type="text"
              value={styleHint}
              onChange={(event) => setStyleHint(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="例：カジュアルで親しみやすく"
              disabled={disabled}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRewrite}
              disabled={disabled || rewriteLoading || !selectedRewriteBlock}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rewriteLoading ? '生成中…' : 'AIでリライト'}
            </button>
          </div>

          {rewriteResult ? (
            <div className="rounded-3xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">リライト候補</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold text-slate-500">元の文章</p>
                      <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-slate-700">
                        {rewriteResult.original_text}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-blue-500">提案された文章</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 underline"
                          onClick={() => copyToClipboard(rewriteResult.revised_text)}
                        >
                          コピー
                        </button>
                      </div>
                      <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-slate-700">
                        {rewriteResult.revised_text}
                      </p>
                    </div>
                  </div>
                </div>
                {rewriteStats ? (
                  <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">メトリクス</p>
                    <ul className="mt-2 space-y-1">
                      <li>段落数：{rewriteStats.originalLines} → {rewriteStats.revisedLines}</li>
                      <li>文字数：{rewriteStats.originalLength} → {rewriteStats.revisedLength}</li>
                      <li>長さ比率：{Math.min(rewriteStats.lengthRatio, 9.99).toFixed(2)}×</li>
                    </ul>
                  </div>
                ) : null}
              </div>

              {rewriteResult.reasoning ? (
                <p className="mt-3 text-xs text-slate-500">{rewriteResult.reasoning}</p>
              ) : null}
              {rewriteResult.alternatives && rewriteResult.alternatives.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">その他の案</p>
                  {rewriteResult.alternatives.map((alt, index) => (
                    <div key={`alternative-${index}`} className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-700">{alt}</span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 underline"
                          onClick={() => copyToClipboard(alt)}
                        >
                          コピー
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRewritePreviewOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  差分を確認する
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const renderProofreadTab = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">チェックの重点</label>
        <div className="flex gap-2">
          {(
            [
              { value: 'spelling', label: '誤字脱字' },
              { value: 'style', label: '文体・トーン' },
              { value: 'consistency', label: '用語統一' },
            ] satisfies Array<{ value: NoteProofreadFocus; label: string }>
          ).map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setProofreadFocus(option.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                proofreadFocus === option.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              disabled={disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleProofread}
          disabled={disabled || proofreadLoading}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {proofreadLoading ? '校正中…' : 'AIで校正する'}
        </button>
      </div>

      {proofreadResult ? (
        <div className="space-y-4">
          {proofreadResult.summary ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {proofreadResult.summary}
            </div>
          ) : null}
          {proofreadResult.corrections.length === 0 ? (
            <p className="text-sm text-slate-500">指摘はありませんでした。</p>
          ) : (
            <div className="space-y-3">
              {proofreadResult.corrections.map((correction, index) => (
                <div
                  key={`${correction.block_id}-${index}`}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700"
                >
                  <p className="text-xs font-semibold text-amber-700">対象ブロック: {correction.block_id}</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">修正前</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{correction.original}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500">提案</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 underline"
                          onClick={() => copyToClipboard(correction.suggestion)}
                        >
                          コピー
                        </button>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{correction.suggestion}</p>
                    </div>
                  </div>
                  {correction.explanation ? (
                    <p className="mt-2 text-xs text-slate-500">理由: {correction.explanation}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyCorrection(correction)}
                      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      ブロックに適用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const renderStructureTab = () => {
    const suggestions = structureResult?.suggestions ?? [];
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">目標（任意）</label>
          <input
            type="text"
            value={structureGoal}
            onChange={(event) => setStructureGoal(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="例：結論を早く伝え、アクションへ誘導"
            disabled={disabled}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleStructure}
            disabled={disabled || structureLoading}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {structureLoading ? '提案を生成中…' : '構成提案を生成'}
          </button>
        </div>

        {structureResult ? (
          <div className="space-y-4">
            {structureResult.outline && structureResult.outline.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">提案アウトライン</p>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-700">
                  {structureResult.outline.map((item, index) => (
                    <li key={`outline-${index}`}>{item}</li>
                  ))}
                </ol>
              </div>
            ) : null}
            {suggestions.length === 0 ? (
              <p className="text-sm text-slate-500">構成に関する指摘はありませんでした。</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <StructureSuggestionCard
                    key={`structure-${index}`}
                    suggestion={suggestion}
                    onInsert={
                      onInsertBlock
                        ? (afterBlockId, text) =>
                            handleInsertSuggestion(afterBlockId, text, suggestion.title, suggestion.description)
                        : undefined
                    }
                    copyToClipboard={copyToClipboard}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderReviewTab = () => (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleReview}
          disabled={disabled || reviewLoading}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reviewLoading ? 'レビュー中…' : '最終レビューを実行'}
        </button>
      </div>

      {reviewResult ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">スコア</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{reviewResult.score}</p>
            <p className="mt-2 text-sm text-slate-700">{reviewResult.summary}</p>
          </div>
          {reviewResult.issues.length > 0 ? (
            <div className="space-y-3">
              {reviewResult.issues.map((issue, index) => (
                <div
                  key={`issue-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    issue.severity === 'error'
                      ? 'border border-red-200 bg-red-50 text-red-700'
                      : issue.severity === 'warn'
                        ? 'border border-amber-200 bg-amber-50 text-amber-700'
                        : 'border border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    {issue.severity === 'error' ? '要修正' : issue.severity === 'warn' ? '注意' : '情報'}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{issue.message}</p>
                  {issue.block_id ? (
                    <p className="mt-1 text-xs">対象ブロック: {issue.block_id}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">重大な指摘はありませんでした。</p>
          )}
          {reviewResult.recommended_actions.length > 0 ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <p className="text-xs font-semibold text-blue-600">次のアクション候補</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {reviewResult.recommended_actions.map((action, index) => (
                  <li key={`action-${index}`}>{action}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      {rewriteResult ? (
        <RewritePreviewModal
          isOpen={isRewritePreviewOpen}
          onClose={closeRewritePreview}
          onApply={applyRewriteFromPreview}
          diffSegments={rewriteDiffSegments}
          stats={rewriteStats}
          result={rewriteResult}
        />
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AIアシスタント</h2>
          <p className="mt-1 text-xs text-slate-500">リライト・校正・構成提案・最終レビューをサポートします。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {renderTabButton('rewrite', 'リライト')}
          {renderTabButton('proofread', '誤字脱字')}
          {renderTabButton('structure', '構成提案')}
          {renderTabButton('review', '最終レビュー')}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">想定読者（任意）</label>
          <input
            type="text"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="例：副業で月5万円を目指す社会人"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">希望するトーン（任意）</label>
          <input
            type="text"
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="例：信頼感のある丁寧な語り口"
            disabled={disabled}
          />
        </div>
      </div>

      {renderHistorySection()}

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      ) : null}

      <div className="mt-6">
        {activeTab === 'rewrite' && renderRewriteTab()}
        {activeTab === 'proofread' && renderProofreadTab()}
        {activeTab === 'structure' && renderStructureTab()}
        {activeTab === 'review' && renderReviewTab()}
      </div>
      </div>
    </>
  );
}

interface StructureSuggestionCardProps {
  suggestion: NoteStructureSuggestionItem;
  onInsert?: (afterBlockId: string | null, text: string) => void;
  copyToClipboard: (text: string) => void;
}

function StructureSuggestionCard({ suggestion, onInsert, copyToClipboard }: StructureSuggestionCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{suggestion.title}</p>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">{suggestion.action.toUpperCase()}</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm">{suggestion.description}</p>
      {suggestion.suggested_text ? (
        <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">参考テキスト</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 underline"
                onClick={() => copyToClipboard(suggestion.suggested_text ?? '')}
              >
                コピー
              </button>
              {onInsert ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-emerald-600 underline"
                  onClick={() => onInsert(suggestion.block_id ?? null, suggestion.suggested_text ?? '')}
                >
                  挿入
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{suggestion.suggested_text}</p>
        </div>
      ) : null}
      {suggestion.block_id ? (
        <p className="mt-2 text-xs text-slate-500">関連ブロックID: {suggestion.block_id}</p>
      ) : null}
    </div>
  );
}

interface RewritePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  diffSegments: DiffSegment[];
  stats: RewriteStats | null;
  result: NoteRewriteResponse;
}

const buildDiffLines = (segments: DiffSegment[], allowed: DiffSegmentType[]): Array<{ type: DiffSegmentType; text: string }> => {
  const lines: Array<{ type: DiffSegmentType; text: string }> = [];
  segments.forEach((segment) => {
    if (!allowed.includes(segment.type)) {
      return;
    }
    segment.text.split('\n').forEach((line) => {
      lines.push({ type: segment.type, text: line });
    });
  });
  return lines;
};

function RewritePreviewModal({ isOpen, onClose, onApply, diffSegments, stats, result }: RewritePreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  const originalLines = buildDiffLines(diffSegments, ['equal', 'removed']);
  const revisedLines = buildDiffLines(diffSegments, ['equal', 'added']);

  const renderLine = (line: { type: DiffSegmentType; text: string }, index: number, variant: 'original' | 'revised') => {
    const isAdded = line.type === 'added';
    const isRemoved = line.type === 'removed';
    const baseClass = 'whitespace-pre-wrap font-mono text-xs leading-relaxed px-3 py-1.5 rounded-xl border';
    const addedClass = 'border-emerald-100 bg-emerald-50 text-emerald-700';
    const removedClass = 'border-red-100 bg-red-50 text-red-700';
    const neutralClass = variant === 'original' ? 'border-slate-200 bg-white text-slate-700' : 'border-blue-100 bg-white text-slate-700';

    const className = `${baseClass} ${isAdded ? addedClass : isRemoved ? removedClass : neutralClass}`;

    return (
      <div key={`${variant}-line-${index}`} className={className}>
        {line.text || ' '}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">リライト差分プレビュー</p>
            <p className="text-xs text-slate-500">適用前に変更内容を確認してください。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          {stats ? (
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:grid-cols-4">
              <div>段落数：{stats.originalLines} → {stats.revisedLines}</div>
              <div>文字数：{stats.originalLength} → {stats.revisedLength}</div>
              <div>長さ比率：{Math.min(stats.lengthRatio, 9.99).toFixed(2)}×</div>
              <div>提案トーン：{result.tone_applied ?? '指定なし'}</div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">元の文章</p>
              <div className="mt-2 space-y-1">
                {originalLines.length > 0 ? originalLines.map((line, index) => renderLine(line, index, 'original')) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">内容がありません。</div>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">提案された文章</p>
              <div className="mt-2 space-y-1">
                {revisedLines.length > 0 ? revisedLines.map((line, index) => renderLine(line, index, 'revised')) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">提案がありません。</div>
                )}
              </div>
            </div>
          </div>

          {result.reasoning ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">AIの説明</p>
              <p className="mt-1 whitespace-pre-wrap">{result.reasoning}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <div className="text-xs text-slate-500">
            適用すると対象ブロックが即座に更新されます。元に戻す場合はブロックの取り消し機能をご利用ください。
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              ブロックに適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
