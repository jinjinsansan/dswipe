'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { noteAiApi } from '@/lib/api';
import type { NoteBlock } from '@/types';
import type {
  NoteAIContextPayload,
  NoteProofreadCorrection,
  NoteProofreadFocus,
  NoteProofreadResponse,
  NoteRewriteResponse,
  NoteRewriteCandidate,
  NoteRewriteMetrics,
  NoteRewriteFeedbackRating,
  NoteStructureResponse,
  NoteStructureSuggestionItem,
  NoteReviewResponse,
} from '@/types/api';
import type { AiActionMetadata, AiActionRecord, StructureInsertPayload } from '@/types/aiAssistant';

type NoteAiAssistantTab = 'rewrite' | 'proofread' | 'structure' | 'review';

type FeedbackPrompt = {
  blockId: string;
  candidateId: string;
  startedAt: number;
  complianceStatus: 'pass' | 'caution' | 'block' | null;
  experimentId?: string | null;
  variantId?: string | null;
};

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
  onInsertBlock?: (afterBlockId: string | null, payload: StructureInsertPayload, metadata: AiActionMetadata) => void;
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

const splitParagraphs = (text: string): string[] => text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);

const countSentences = (text: string): number => {
  const segments = text.split(/[。．.!?！？]+/).map((segment) => segment.trim()).filter((segment) => segment.length > 0);
  return Math.max(1, segments.length);
};

const bulletPattern = /^([-*•●・]|[0-9]+[.)、．])\s*/;

const countBullets = (text: string): number =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && bulletPattern.test(line)).length;

const estimateReadingTimeSeconds = (length: number): number => Math.max(15, Math.ceil((length / 420) * 60));

const SAFETY_GUIDE_STORAGE_KEY = 'note-ai-assistant-safety-dismissed-v1';

const FEEDBACK_RATING_OPTIONS: Array<{
  value: NoteRewriteFeedbackRating;
  label: string;
  description: string;
}> = [
  { value: 'positive', label: '良い', description: '満足できる品質だった' },
  { value: 'neutral', label: '普通', description: '一部修正が必要だった' },
  { value: 'negative', label: '改善が必要', description: 'そのままでは使えなかった' },
];

const ISSUE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'accuracy', label: '事実関係に誤りがある' },
  { value: 'tone', label: 'トーンが不適切' },
  { value: 'structure', label: '構成が不自然' },
  { value: 'compliance', label: '法令・ガイドライン面が不安' },
  { value: 'length', label: '長さ・ボリュームが不適切' },
];

const buildLocalMetrics = (text: string): NoteRewriteMetrics => ({
  paragraph_count: splitParagraphs(text).length || 1,
  sentence_count: countSentences(text),
  length: text.length,
  length_ratio: 1,
  bullet_count: countBullets(text),
  reading_time_seconds: estimateReadingTimeSeconds(text.length),
});

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
  const [selectedRewriteCandidateId, setSelectedRewriteCandidateId] = useState<string | null>(null);
  const [isRewritePreviewOpen, setIsRewritePreviewOpen] = useState(false);
  const [showSafetyGuide, setShowSafetyGuide] = useState(true);
  const [feedbackPrompt, setFeedbackPrompt] = useState<FeedbackPrompt | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<NoteRewriteFeedbackRating | null>(null);
  const [feedbackIssues, setFeedbackIssues] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(SAFETY_GUIDE_STORAGE_KEY);
    if (stored === 'true') {
      setShowSafetyGuide(false);
    }
  }, []);

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

  const handleDismissSafetyGuide = useCallback(() => {
    setShowSafetyGuide(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SAFETY_GUIDE_STORAGE_KEY, 'true');
    }
  }, []);

  const closeFeedbackPrompt = useCallback(() => {
    setFeedbackPrompt(null);
    setFeedbackRating(null);
    setFeedbackIssues([]);
    setFeedbackComment('');
    setFeedbackLoading(false);
  }, []);

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

  const rewriteCandidates = useMemo(() => rewriteResult?.candidates ?? [], [rewriteResult]);

  const selectedRewriteCandidate = useMemo<NoteRewriteCandidate | null>(() => {
    if (rewriteCandidates.length === 0) {
      return null;
    }
    if (selectedRewriteCandidateId) {
      const found = rewriteCandidates.find((candidate) => candidate.id === selectedRewriteCandidateId);
      if (found) {
        return found;
      }
    }
    return rewriteCandidates[0];
  }, [rewriteCandidates, selectedRewriteCandidateId]);

  const originalRewriteMetrics = useMemo<NoteRewriteMetrics | null>(
    () => (rewriteResult ? buildLocalMetrics(rewriteResult.original_text) : null),
    [rewriteResult],
  );

  const rewriteDiffSegments = useMemo<DiffSegment[]>(
    () =>
      rewriteResult && selectedRewriteCandidate
        ? diffLines(rewriteResult.original_text ?? '', selectedRewriteCandidate.revised_text ?? '')
        : [],
    [rewriteResult, selectedRewriteCandidate],
  );


  const handleRewrite = useCallback(async () => {
    if (!selectedRewriteBlock) {
      setErrorMessage('リライト対象のブロックを選択してください。');
      return;
    }
    setRewriteLoading(true);
    clearActionMessage();
    setErrorMessage(null);
    try {
      setRewriteResult(null);
      setSelectedRewriteCandidateId(null);
      const response = await noteAiApi.rewrite({
        context: contextPayload,
        target_block_id: selectedRewriteBlock.id ?? '',
        instructions: rewriteInstructions || undefined,
        style_hint: styleHint || undefined,
      });
      const data = response.data;
      setRewriteResult(data);
      const recommendedId = data.recommended_candidate_id || data.candidates?.[0]?.id || null;
      setSelectedRewriteCandidateId(recommendedId);
      if (recommendedId) {
        setIsRewritePreviewOpen(true);
      }
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'AIリライトに失敗しました。'));
    } finally {
      setRewriteLoading(false);
    }
  }, [contextPayload, selectedRewriteBlock, rewriteInstructions, styleHint, clearActionMessage]);

  const handleApplyRewrite = useCallback(
    (candidate?: NoteRewriteCandidate | null) => {
      closeFeedbackPrompt();
      if (!rewriteResult) {
        return;
      }
      const targetCandidate = candidate ?? selectedRewriteCandidate;
      if (!targetCandidate) {
        showActionMessage('適用する候補を選択してください。');
        return;
      }

      const compliance = targetCandidate.compliance;
      if (compliance && compliance.allow_application === false) {
        showActionMessage('コンプライアンス上の理由でこの候補は適用できません。');
        return;
      }

      const blockId = rewriteResult.block_id;
      const blockIndex = blocks.findIndex((block) => (block.id ?? '') === blockId);
      const blockLabel =
        selectedRewriteBlock && blockIndex >= 0
          ? formatBlockLabel(selectedRewriteBlock, blockIndex)
          : '選択ブロック';

      onApplyText(blockId, targetCandidate.revised_text, {
        type: 'rewrite',
        label: `リライト: ${blockLabel}（${targetCandidate.title}）`,
        targetBlockIds: [blockId],
        reasoning: targetCandidate.reasoning ?? rewriteResult.evaluation_notes ?? null,
        lengthRatio: targetCandidate.metrics.length_ratio,
      });

      const unchanged = targetCandidate.revised_text.trim() === rewriteResult.original_text.trim();
      const complianceSuffix =
        compliance && compliance.status === 'caution' ? '（コンプライアンス注意あり）' : '';
      showActionMessage(
        unchanged
          ? '提案に変更点がなかったため原文を維持しました。'
          : `「${targetCandidate.title}」のリライト案をブロックへ適用しました。${complianceSuffix}`,
      );

      const defaultIssues = compliance?.status === 'caution' ? ['compliance'] : [];
      setFeedbackPrompt({
        blockId,
        candidateId: targetCandidate.id,
        startedAt: Date.now(),
        complianceStatus: compliance?.status ?? null,
        experimentId: rewriteResult.experiment?.experiment_id ?? null,
        variantId: rewriteResult.experiment?.variant_id ?? null,
      });
      setFeedbackRating(null);
      setFeedbackIssues(defaultIssues);
      setFeedbackComment('');
      setFeedbackLoading(false);
    },
    [
      rewriteResult,
      selectedRewriteCandidate,
      onApplyText,
      showActionMessage,
      blocks,
      selectedRewriteBlock,
      closeFeedbackPrompt,
    ],
  );

  const toggleFeedbackIssue = useCallback((value: string) => {
    setFeedbackIssues((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const handleFeedbackCommentChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackComment(event.target.value);
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    if (!feedbackPrompt) {
      return;
    }
    if (!feedbackRating) {
      showActionMessage('評価を選択してください。');
      return;
    }
    setFeedbackLoading(true);
    try {
      const durationSeconds = Math.max(0, Math.round((Date.now() - feedbackPrompt.startedAt) / 1000));
      await noteAiApi.rewriteFeedback({
        block_id: feedbackPrompt.blockId,
        candidate_id: feedbackPrompt.candidateId,
        rating: feedbackRating,
        issues: feedbackIssues,
        comment: feedbackComment.trim() || undefined,
        applied: true,
        duration_seconds: durationSeconds || undefined,
        experiment_id: feedbackPrompt.experimentId || undefined,
        variant_id: feedbackPrompt.variantId || undefined,
      });
      closeFeedbackPrompt();
      showActionMessage('フィードバックを記録しました。ご協力ありがとうございます。');
    } catch (error) {
      setFeedbackLoading(false);
      setErrorMessage(resolveErrorMessage(error, 'フィードバックの送信に失敗しました。'));
    }
  }, [
    feedbackPrompt,
    feedbackRating,
    feedbackIssues,
    feedbackComment,
    closeFeedbackPrompt,
    showActionMessage,
  ]);

  const handleSkipFeedback = useCallback(() => {
    closeFeedbackPrompt();
  }, [closeFeedbackPrompt]);

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
    (afterBlockId: string | null, suggestion: NoteStructureSuggestionItem) => {
      if (!onInsertBlock) {
        showActionMessage('構成提案を挿入できる状態ではありません。');
        return;
      }

      const suggestedText = suggestion.suggested_text?.replace(/\r\n/g, '\n').trim();
      if (!suggestedText) {
        showActionMessage('この提案には挿入可能なテキストが含まれていません。');
        return;
      }

      const payload: StructureInsertPayload = {
        text: suggestedText,
        suggestedBlockType: suggestion.suggested_block_type,
      };
      const label = suggestion.title?.trim();
      onInsertBlock(afterBlockId, payload, {
        type: 'structure',
        label: label ? `構成案: ${label}` : '構成案を挿入',
        reasoning: suggestion.description ?? null,
      });
      showActionMessage(label ? `「${label}」の構成提案を挿入しました。` : '構成提案を挿入しました。');
    },
    [onInsertBlock, showActionMessage],
  );

  const closeRewritePreview = useCallback(() => {
    setIsRewritePreviewOpen(false);
  }, []);

  const applyRewriteFromPreview = useCallback(
    (candidate?: NoteRewriteCandidate | null) => {
      handleApplyRewrite(candidate);
      closeRewritePreview();
    },
    [handleApplyRewrite, closeRewritePreview],
  );

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
          <p className="text-[11px] text-slate-400">
            生成後はコンプライアンス表示を確認し、必要に応じて修正してから適用してください。
          </p>

          {rewriteResult ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">元の文章</p>
                <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">{rewriteResult.original_text}</p>
              </div>

              {rewriteResult.quality ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        品質スコア: {rewriteResult.quality.global_score} / 100
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          rewriteResult.quality.ready_for_release
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rewriteResult.quality.ready_for_release ? 'リリース推奨' : '要確認'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">評価バージョン: {rewriteResult.quality.scoring_version}</span>
                  </div>
                  {rewriteResult.quality.summary ? (
                    <p className="mt-1 whitespace-pre-wrap text-slate-600">{rewriteResult.quality.summary}</p>
                  ) : null}
                  {rewriteResult.quality.alerts.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
                      {rewriteResult.quality.alerts.map((alert, index) => (
                        <li key={`quality-alert-${index}`}>{alert}</li>
                      ))}
                    </ul>
                  ) : null}
                  {rewriteResult.quality.thresholds ? (
                    <div className="mt-3 grid gap-2 text-[11px] text-slate-500 sm:grid-cols-3">
                      {Object.entries(rewriteResult.quality.thresholds).map(([key, value]) => {
                        const labelMap: Record<string, string> = {
                          score_minimum: 'スコア閾値を満たす',
                          compliance_pass: 'コンプライアンス通過',
                          no_alerts: '重大警告なし',
                        };
                        const label = labelMap[key] ?? key;
                        return (
                          <div
                            key={key}
                            className={`rounded-xl border px-3 py-2 ${
                              value
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  {rewriteResult.experiment ? (
                    <p className="mt-2 text-[11px] text-slate-400">
                      実験バリアント: {rewriteResult.experiment.variant_id}（{rewriteResult.experiment.experiment_id}）
                    </p>
                  ) : null}
                </div>
              ) : null}

              {rewriteResult.evaluation_notes ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  {rewriteResult.evaluation_notes}
                </div>
              ) : null}

              {rewriteCandidates.length > 0 ? (
                <div className="space-y-3">
                  {rewriteCandidates.map((candidate) => (
                    <RewriteCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      originalMetrics={originalRewriteMetrics}
                      isSelected={selectedRewriteCandidate?.id === candidate.id}
                      isRecommended={rewriteResult.recommended_candidate_id === candidate.id}
                      onSelect={() => setSelectedRewriteCandidateId(candidate.id)}
                      onPreview={() => {
                        setSelectedRewriteCandidateId(candidate.id);
                        setIsRewritePreviewOpen(true);
                      }}
                      onCopy={() => copyToClipboard(candidate.revised_text)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">候補を生成できませんでした。</p>
              )}
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
                        ? (afterBlockId, _item) => handleInsertSuggestion(afterBlockId, suggestion)
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
          originalMetrics={originalRewriteMetrics}
          candidate={selectedRewriteCandidate}
          evaluationNotes={rewriteResult.evaluation_notes}
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

      {showSafetyGuide ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="font-semibold text-amber-900">AI出力の取り扱いガイド</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>公開前に必ず全文を確認し、事実・法令・社内ルールに適合しているか点検してください。</li>
                <li>「注意」「適用不可」のラベルが付いた候補は、そのまま使わず修正または再生成してください。</li>
                <li>固有名詞・金額・期間などの数値は最新情報と照合し、誤解を与える表現がないか確認してください。</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={handleDismissSafetyGuide}
              className="self-start rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              理解しました
            </button>
          </div>
        </div>
      ) : null}

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

      {feedbackPrompt ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xs text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">AIリライトの品質を評価してください</p>
            {feedbackPrompt.complianceStatus === 'caution' ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
                注意あり
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-slate-600">改善のヒントとして活用するため、1分以内の簡単なフィードバックにご協力ください。</p>

          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">全体評価</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEEDBACK_RATING_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setFeedbackRating(option.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      feedbackRating === option.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    disabled={feedbackLoading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {feedbackRating ? (
                <p className="mt-1 text-[11px] text-slate-500">
                  {FEEDBACK_RATING_OPTIONS.find((option) => option.value === feedbackRating)?.description}
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">気になった点（任意）</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ISSUE_OPTIONS.map((issue) => (
                  <button
                    type="button"
                    key={issue.value}
                    onClick={() => toggleFeedbackIssue(issue.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      feedbackIssues.includes(issue.value)
                        ? 'bg-amber-100 text-amber-700'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    disabled={feedbackLoading}
                  >
                    {issue.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400" htmlFor="rewrite-feedback-comment">
                任意のコメント
              </label>
              <textarea
                id="rewrite-feedback-comment"
                value={feedbackComment}
                onChange={handleFeedbackCommentChange}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="修正したポイントや気になった点があれば入力してください"
                disabled={feedbackLoading}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={handleSkipFeedback}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              disabled={feedbackLoading}
            >
              今は評価しない
            </button>
            <button
              type="button"
              onClick={handleSubmitFeedback}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                feedbackRating && !feedbackLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
              disabled={!feedbackRating || feedbackLoading}
            >
              {feedbackLoading ? '送信中…' : 'フィードバックを送信'}
            </button>
          </div>
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
  onInsert?: (afterBlockId: string | null, suggestion: NoteStructureSuggestionItem) => void;
  copyToClipboard: (text: string) => void;
}

function StructureSuggestionCard({ suggestion, onInsert, copyToClipboard }: StructureSuggestionCardProps) {
  const blockTypeLabelMap: Record<NonNullable<NoteStructureSuggestionItem['suggested_block_type']>, string> = {
    paragraph: '本文',
    heading: '見出し',
    list: 'リスト',
    quote: '引用',
  };
  const blockTypeLabel = suggestion.suggested_block_type ? blockTypeLabelMap[suggestion.suggested_block_type] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{suggestion.title}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">{suggestion.action.toUpperCase()}</span>
          {blockTypeLabel ? (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{blockTypeLabel}</span>
          ) : null}
        </div>
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
                  onClick={() => onInsert(suggestion.block_id ?? null, suggestion)}
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

interface RewriteCandidateCardProps {
  candidate: NoteRewriteCandidate;
  originalMetrics: NoteRewriteMetrics | null;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onCopy: () => void;
}

function RewriteCandidateCard({
  candidate,
  originalMetrics,
  isSelected,
  isRecommended,
  onSelect,
  onPreview,
  onCopy,
}: RewriteCandidateCardProps) {
  const metrics = candidate.metrics;
  const compliance = candidate.compliance;
  const complianceStatus = compliance?.status ?? 'pass';
  const canApply = compliance?.allow_application !== false;
  const complianceBadgeClass =
    complianceStatus === 'block'
      ? 'bg-red-100 text-red-700'
      : complianceStatus === 'caution'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';
  const complianceLabel =
    complianceStatus === 'block' ? '適用不可（要修正）' : complianceStatus === 'caution' ? '注意（要確認）' : '適用可能';

  const complianceMessage =
    complianceStatus === 'block'
      ? 'コンプライアンスに抵触する可能性があるため適用できません。'
      : complianceStatus === 'caution'
        ? '適用前に法令・ガイドラインへの適合をご確認ください。'
        : 'この候補はコンプライアンスチェックを通過しています。';
  const lengthRatioLabel = `${Math.min(metrics.length_ratio, 9.99).toFixed(2)}×`;
  const paragraphLabel = `${originalMetrics?.paragraph_count ?? '–'} → ${metrics.paragraph_count}`;
  const lengthLabel = `${originalMetrics?.length ?? '–'} → ${metrics.length}`;
  const bulletLabel = `${originalMetrics?.bullet_count ?? 0} → ${metrics.bullet_count}`;
  const readingSeconds = metrics.reading_time_seconds;
  const readingLabel =
    readingSeconds >= 60
      ? `${Math.max(1, Math.round(readingSeconds / 60))}分程度`
      : `${readingSeconds}秒程度`;

  const wrapperClass = `rounded-2xl border px-4 py-3 shadow-sm transition ${
    isSelected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'
  }`;

  return (
    <div className={wrapperClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{candidate.title}</p>
            {isRecommended ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                推奨
              </span>
            ) : null}
            {isSelected ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                選択中
              </span>
            ) : null}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${complianceBadgeClass}`}>
              {complianceLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">スコア {candidate.score} / 100 ・ トーン {candidate.tone_applied ?? '指定なし'}</p>
          <p
            className={`mt-1 text-[11px] ${
              complianceStatus === 'block' ? 'text-red-600' : complianceStatus === 'caution' ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {complianceMessage}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            コピー
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
          >
            差分を確認
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">段落数 {paragraphLabel}</div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">文字数 {lengthLabel}</div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">長さ {lengthRatioLabel}</div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">箇条書き {bulletLabel}</div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">読了 {readingLabel}</div>
        <button
          type="button"
          onClick={onSelect}
          disabled={!canApply}
          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
            canApply
              ? 'border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'border border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          {canApply ? 'この候補を選択' : '適用不可'}
        </button>
      </div>

      {candidate.reasoning ? (
        <p className="mt-3 whitespace-pre-wrap text-xs text-slate-600">{candidate.reasoning}</p>
      ) : null}

      {candidate.strengths.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <p className="font-semibold text-emerald-800">強み</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {candidate.strengths.map((item, index) => (
              <li key={`card-strength-${candidate.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {candidate.warnings.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <p className="font-semibold text-red-800">注意点</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {candidate.warnings.map((item, index) => (
              <li key={`card-warning-${candidate.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">リライト案</p>
        <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-800">
          {candidate.revised_text}
        </p>
      </div>
    </div>
  );
}

interface RewritePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (candidate?: NoteRewriteCandidate | null) => void;
  diffSegments: DiffSegment[];
  originalMetrics: NoteRewriteMetrics | null;
  candidate: NoteRewriteCandidate | null;
  evaluationNotes?: string | null;
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

function RewritePreviewModal({ isOpen, onClose, onApply, diffSegments, originalMetrics, candidate, evaluationNotes }: RewritePreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  if (!candidate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
          <p className="text-sm text-slate-600">表示できる候補がありません。もう一度リライトを実行してください。</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const originalLines = buildDiffLines(diffSegments, ['equal', 'removed']);
  const revisedLines = buildDiffLines(diffSegments, ['equal', 'added']);

  const compliance = candidate.compliance;
  const complianceStatus = compliance?.status ?? 'pass';
  const canApply = compliance?.allow_application !== false;
  const complianceBadgeClass =
    complianceStatus === 'block'
      ? 'bg-red-100 text-red-700'
      : complianceStatus === 'caution'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';
  const complianceLabel =
    complianceStatus === 'block' ? '適用不可' : complianceStatus === 'caution' ? '要確認' : '適用可能';
  const complianceMessage =
    complianceStatus === 'block'
      ? 'コンプライアンスに抵触する可能性があるため適用できません。'
      : complianceStatus === 'caution'
        ? '適用前に法令・ガイドラインへの適合をご確認ください。'
        : 'この候補はコンプライアンスチェックを通過しています。';

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

  const metrics = candidate.metrics;
  const paragraphLabel = `${originalMetrics?.paragraph_count ?? '–'} → ${metrics.paragraph_count}`;
  const lengthLabel = `${originalMetrics?.length ?? '–'} → ${metrics.length}`;
  const ratioLabel = `${Math.min(metrics.length_ratio, 9.99).toFixed(2)}×`;
  const bulletLabel = `${originalMetrics?.bullet_count ?? 0} → ${metrics.bullet_count}`;
  const readingSeconds = metrics.reading_time_seconds;
  const readingLabel =
    readingSeconds >= 60
      ? `${Math.max(1, Math.round(readingSeconds / 60))}分程度`
      : `${readingSeconds}秒程度`;
  const toneLabel = candidate.tone_applied ?? '指定なし';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">リライト差分プレビュー</p>
            <p className="text-xs text-slate-500">候補: {candidate.title}（スコア {candidate.score} / 100）</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${complianceBadgeClass}`}>{complianceLabel}</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              閉じる
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:grid-cols-3 lg:grid-cols-6">
            <div>段落数：{paragraphLabel}</div>
            <div>文字数：{lengthLabel}</div>
            <div>長さ比率：{ratioLabel}</div>
            <div>箇条書き項目：{bulletLabel}</div>
            <div>読了目安：{readingLabel}</div>
            <div>適用トーン：{toneLabel}</div>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-xs ${
              complianceStatus === 'block'
                ? 'border-red-200 bg-red-50 text-red-700'
                : complianceStatus === 'caution'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <p className="font-semibold">コンプライアンス評価</p>
            <p className="mt-1 whitespace-pre-wrap">{complianceMessage}</p>
            {compliance?.reasons && compliance.reasons.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {compliance.reasons.map((reason, index) => (
                  <li key={`compliance-reason-${index}`}>{reason}</li>
                ))}
              </ul>
            ) : null}
            {compliance?.categories && compliance.categories.length > 0 ? (
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] opacity-70">
                カテゴリ: {compliance.categories.join(', ')}
              </p>
            ) : null}
          </div>

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

          {candidate.reasoning ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">AIの説明</p>
              <p className="mt-1 whitespace-pre-wrap">{candidate.reasoning}</p>
            </div>
          ) : null}

          {candidate.strengths.length > 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              <p className="font-semibold text-emerald-800">強み</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {candidate.strengths.map((item, index) => (
                  <li key={`strength-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {candidate.warnings.length > 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              <p className="font-semibold text-red-800">注意点</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {candidate.warnings.map((item, index) => (
                  <li key={`warning-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {evaluationNotes ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              {evaluationNotes}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <div className={`text-xs ${complianceStatus === 'block' ? 'text-red-600' : complianceStatus === 'caution' ? 'text-amber-600' : 'text-slate-500'}`}>
            {complianceStatus === 'block'
              ? 'コンプライアンスに抵触するためこの候補は適用できません。内容を修正してください。'
              : complianceStatus === 'caution'
                ? '適用後は必ず法令・ガイドラインの観点で内容を再確認してください。'
                : `適用すると候補「${candidate.title}」に置き換わります。履歴から元に戻すことも可能です。`}
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
              onClick={() => onApply(candidate)}
              disabled={!canApply}
              className={`rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition ${
                canApply
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {canApply ? 'この候補を適用' : '適用できません'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
