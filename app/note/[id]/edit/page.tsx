'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChartBarIcon, ShareIcon, CurrencyYenIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NoteEditor from '@/components/note/NoteEditor';
import NoteAiAssistant from '@/components/note/NoteAiAssistant';
import { mediaApi, noteApi, salonApi } from '@/lib/api';
import { createEmptyBlock, normalizeBlock, isPaidBlock } from '@/lib/noteBlocks';
import { buildBlocksFromSuggestion, sanitizeContentForBlockType, normalizeAiText } from '@/lib/aiFormatting';
import type { AiActionMetadata, AiActionRecord, StructureInsertPayload } from '@/types/aiAssistant';
import type {
  NoteBlock,
  NoteBlockType,
  NoteDetail,
  NoteVisibility,
  OfficialShareConfig,
  Salon,
  SalonListResult,
  NoteEditorType,
  NoteRichContent,
} from '@/types';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';

const NoteRichEditor = dynamic(() => import('@/components/note/NoteRichEditor'), {
  loading: () => <PageLoader />,
  ssr: false,
});

const MediaLibraryModal = dynamic(() => import('@/components/MediaLibraryModal'), {
  loading: () => null,
  ssr: false,
});

const MIN_TITLE_LENGTH = 3;
const MAX_CATEGORIES = 5;
const MAX_AI_HISTORY = 20;

const INITIAL_RICH_CONTENT: NoteRichContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { access: 'public' },
      content: [],
    },
  ],
};

const generateActionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ai_action_${Math.random().toString(16).slice(2, 10)}`;
};

const cloneBlock = (block: NoteBlock): NoteBlock => JSON.parse(JSON.stringify(block)) as NoteBlock;

const NOTE_VISIBILITY_OPTIONS: Array<{
  value: NoteVisibility;
  label: string;
  description: string;
}> = [
  {
    value: 'public',
    label: '公開',
    description: 'マーケットに掲載され、誰でも閲覧できます',
  },
  {
    value: 'limited',
    label: '限定公開',
    description: 'URLを知っている人のみ閲覧できます（認証不要）',
  },
  {
    value: 'private',
    label: '非公開',
    description: '作者のみ閲覧できる状態です',
  },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
};

interface NoteShareStats {
  total_shares: number;
  total_reward_points: number;
  verified_shares: number;
  suspicious_shares: number;
}

export default function NoteEditPage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const router = useRouter();
  const locale = useLocale();
  const createT = useTranslations('noteCreate');
  const { isAuthenticated, isInitialized, token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [pricePoints, setPricePoints] = useState('');
  const [priceJpy, setPriceJpy] = useState('');
  const [allowPointPurchase, setAllowPointPurchase] = useState(true);
  const [allowJpyPurchase, setAllowJpyPurchase] = useState(false);
  const [taxRate, setTaxRate] = useState('10');
  const [taxInclusive, setTaxInclusive] = useState(true);
  const [blocks, setBlocks] = useState<NoteBlock[]>(() => [createEmptyBlock('paragraph')]);
  const [editorType, setEditorType] = useState<NoteEditorType>('classic');
  const [richContent, setRichContent] = useState<NoteRichContent>(INITIAL_RICH_CONTENT);
  const [aiHistory, setAiHistory] = useState<AiActionRecord[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [slug, setSlug] = useState('');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [allowShareUnlock, setAllowShareUnlock] = useState(false);
  const [shareStats, setShareStats] = useState<NoteShareStats | null>(null);
  const [officialShareConfig, setOfficialShareConfig] = useState<OfficialShareConfig | null>(null);
  const [officialShareInput, setOfficialShareInput] = useState('');
  const [officialShareLoading, setOfficialShareLoading] = useState(false);
  const [officialShareError, setOfficialShareError] = useState<string | null>(null);
  const [officialShareMessage, setOfficialShareMessage] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCoverMediaOpen, setIsCoverMediaOpen] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [salonOptions, setSalonOptions] = useState<Salon[]>([]);
  const [selectedSalonIds, setSelectedSalonIds] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<NoteVisibility>('private');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareTokenRotatedAt, setShareTokenRotatedAt] = useState<string | null>(null);
  const [shareActionLoading, setShareActionLoading] = useState(false);
  const [shareActionError, setShareActionError] = useState<string | null>(null);
  const [shareActionMessage, setShareActionMessage] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const isNoteEditor = editorType === 'note';

  useEffect(() => {
    const loadSalons = async () => {
      try {
        const response = await salonApi.list();
        const payload = response.data as SalonListResult;
        setSalonOptions(payload?.data ?? []);
      } catch (error) {
        console.warn('Failed to load salon list', error);
      }
    };

    loadSalons();
  }, []);

  useEffect(() => {
    if (visibility !== 'limited') {
      setShareActionError(null);
      setShareActionMessage(null);
    }
  }, [visibility]);

  const extractErrorDetail = (err: unknown): string | undefined => {
    if (typeof err === 'object' && err) {
      const maybeResponse = (err as { response?: { data?: { detail?: unknown } } }).response;
      const detail = maybeResponse?.data?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
    return undefined;
  };

  const fetchShareStats = useCallback(async () => {
    if (!noteId || !token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/notes/${noteId}/share-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShareStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error);
    }
  }, [noteId, token]);

  const loadOfficialShareConfig = useCallback(async () => {
    if (!noteId || !token) return;
    setOfficialShareLoading(true);
    setOfficialShareError(null);
    setOfficialShareMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/notes/${noteId}/official-share`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: OfficialShareConfig = await response.json();
        setOfficialShareConfig(data);
        setOfficialShareInput(data.tweet_url ?? data.tweet_id ?? '');
      }
    } catch (error) {
      console.error('Failed to load official share config:', error);
      setOfficialShareError('公式ポスト設定の取得に失敗しました。');
    } finally {
      setOfficialShareLoading(false);
    }
  }, [noteId, token]);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId || !isInitialized) return;
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await noteApi.get(noteId);
        const detail: NoteDetail = response.data;
        setTitle(detail.title ?? '');
        setCoverImageUrl(detail.cover_image_url ?? '');
        setExcerpt(detail.excerpt ?? '');
        setIsPaid(Boolean(detail.is_paid));
        setPricePoints(detail.price_points ? String(detail.price_points) : '');
        setPriceJpy(detail.price_jpy ? String(detail.price_jpy) : '');
        setAllowPointPurchase(detail.allow_point_purchase ?? true);
        setAllowJpyPurchase(detail.allow_jpy_purchase ?? false);
        setTaxRate(
          detail.tax_rate !== null && detail.tax_rate !== undefined
            ? String(detail.tax_rate)
            : ''
        );
        setTaxInclusive(detail.tax_inclusive ?? true);
        setCategories(Array.isArray(detail.categories) ? detail.categories : []);
        setAllowShareUnlock(Boolean(detail.allow_share_unlock));
        setBlocks(
          (detail.content_blocks && detail.content_blocks.length
            ? detail.content_blocks
            : [createEmptyBlock('paragraph')]
          ).map((block) => normalizeBlock(block))
        );
        setEditorType(detail.editor_type ?? 'classic');
        setRichContent((detail.editor_type ?? 'classic') === 'note'
          ? (detail.rich_content as NoteRichContent | null) ?? INITIAL_RICH_CONTENT
          : INITIAL_RICH_CONTENT);
        setStatus(detail.status ?? 'draft');
        setSlug(detail.slug ?? '');
        setPublishedAt(detail.published_at ?? null);
        setOfficialShareConfig({
          note_id: detail.id,
          tweet_id: detail.official_share_tweet_id ?? undefined,
          tweet_url: detail.official_share_tweet_url ?? undefined,
          author_x_user_id: detail.official_share_x_user_id ?? undefined,
          author_x_username: detail.official_share_x_username ?? undefined,
          configured_at: detail.official_share_set_at ?? undefined,
        });
        setOfficialShareInput(detail.official_share_tweet_url ?? detail.official_share_tweet_id ?? '');
        setSelectedSalonIds(Array.isArray(detail.salon_access_ids) ? detail.salon_access_ids : []);
        setVisibility(detail.visibility ?? 'private');
        setRequiresLogin(Boolean(detail.requires_login && detail.visibility === 'public'));
        setShareUrl(detail.share_url ?? null);
        setShareTokenRotatedAt(detail.share_token_rotated_at ?? null);
        setShareActionError(null);
        setShareActionMessage(null);
        if (detail.allow_share_unlock) {
          loadOfficialShareConfig();
        } else {
          setOfficialShareError(null);
          setOfficialShareMessage(null);
        }

        fetchShareStats();
      } catch (err: unknown) {
        const detail = extractErrorDetail(err);
        setErrorMessage(typeof detail === 'string' ? detail : 'Swipeコラムが見つかりませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, isInitialized, loadOfficialShareConfig, fetchShareStats]);

  const handleOfficialShareSave = useCallback(async () => {
    if (!noteId || !token) return;
    const value = officialShareInput.trim();
    if (!value) {
      setOfficialShareError('ツイートURLまたはIDを入力してください。');
      return;
    }

    setOfficialShareLoading(true);
    setOfficialShareError(null);
    setOfficialShareMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const payload = value.startsWith('http') ? { tweet_url: value } : { tweet_id: value };
      const response = await fetch(`${apiUrl}/notes/${noteId}/official-share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setOfficialShareConfig(data as OfficialShareConfig);
        setOfficialShareInput((data as OfficialShareConfig).tweet_url ?? (data as OfficialShareConfig).tweet_id ?? '');
        setOfficialShareMessage('公式ポストを設定しました。');
      } else {
        const detail = data?.detail;
        setOfficialShareError(typeof detail === 'string' ? detail : '公式ポストの設定に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to set official share config:', error);
      setOfficialShareError('公式ポストの設定に失敗しました。');
    } finally {
      setOfficialShareLoading(false);
    }
  }, [noteId, token, officialShareInput]);

  const handleOfficialShareClear = useCallback(async () => {
    if (!noteId || !token) return;
    setOfficialShareLoading(true);
    setOfficialShareError(null);
    setOfficialShareMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/notes/${noteId}/official-share`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOfficialShareConfig({ note_id: noteId });
        setOfficialShareInput('');
        setOfficialShareMessage('公式ポスト設定を解除しました。');
      } else {
        setOfficialShareError('公式ポスト設定の解除に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to clear official share config:', error);
      setOfficialShareError('公式ポスト設定の解除に失敗しました。');
    } finally {
      setOfficialShareLoading(false);
    }
  }, [noteId, token]);

  useEffect(() => {
    if (!allowShareUnlock) return;
    loadOfficialShareConfig();
  }, [allowShareUnlock, loadOfficialShareConfig]);

  const handleCoverMediaSelect = (url: string) => {
    setCoverImageUrl(url);
    setIsCoverMediaOpen(false);
  };

  const openCoverFilePicker = () => {
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
      coverFileInputRef.current.click();
    }
  };

  const handleCoverFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsCoverUploading(true);
    try {
      const response = await mediaApi.upload(file, { optimize: true, max_width: 1920, max_height: 1080 });
      const url: string | undefined = response.data?.url;
      if (!url) {
        throw new Error('アップロード結果にURLが含まれていません');
      }
      setCoverImageUrl(url);
    } catch (uploadError) {
      console.error('カバー画像のアップロードに失敗しました', uploadError);
      alert('カバー画像のアップロードに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsCoverUploading(false);
      event.target.value = '';
    }
  };

  const toggleCategory = (value: string) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        return prev.filter((category) => category !== value);
      }
      if (prev.length >= MAX_CATEGORIES) {
        alert(`カテゴリは最大${MAX_CATEGORIES}件まで選択できます`);
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleBlocksChange = useCallback((next: NoteBlock[]) => {
    setBlocks(next.map((block) => normalizeBlock(block)));
  }, []);

  const applyAiTextToBlock = useCallback(
    (blockId: string, text: string, metadata: AiActionMetadata) => {
      const normalizedText = normalizeAiText(text);
      let historyEntry: AiActionRecord | null = null;

      setBlocks((prev) => {
        const index = prev.findIndex((block) => (block.id ?? '') === blockId);
        if (index === -1) {
          return prev;
        }

        const targetBlock = prev[index];
        const blockType = (targetBlock.type ?? 'paragraph') as NoteBlockType;
        const sanitized = sanitizeContentForBlockType(blockType, normalizedText);
        const data = { ...(targetBlock.data ?? {}) } as Record<string, unknown>;

        if (blockType === 'list') {
          const items = sanitized.items ?? [];
          if (items.length === 0) {
            return prev;
          }
          data.items = items;
        } else {
          const sanitizedText = (sanitized.text ?? '').trim();
          if (!sanitizedText) {
            return prev;
          }
          data.text = sanitizedText;
        }

        const updatedBlock = normalizeBlock({ ...targetBlock, data });
        const beforeSnapshot = cloneBlock(targetBlock);
        const afterSnapshot = cloneBlock(updatedBlock);

        historyEntry = {
          id: generateActionId(),
          timestamp: Date.now(),
          type: metadata.type,
          label: metadata.label,
          targetBlockIds: metadata.targetBlockIds ?? [blockId],
          reasoning: metadata.reasoning,
          lengthRatio: metadata.lengthRatio,
          beforeBlocks: [beforeSnapshot],
          afterBlocks: [afterSnapshot],
        };

        const next = [...prev];
        next[index] = updatedBlock;
        return next;
      });

      if (historyEntry) {
        setAiHistory((prevHistory) => {
          const nextHistory = [...prevHistory, historyEntry as AiActionRecord];
          return nextHistory.length > MAX_AI_HISTORY ? nextHistory.slice(-MAX_AI_HISTORY) : nextHistory;
        });
      }
    },
    [],
  );

  const insertAiSuggestion = useCallback(
    (afterBlockId: string | null, payload: StructureInsertPayload, metadata: AiActionMetadata) => {
      const blocksToInsert = buildBlocksFromSuggestion(payload);
      if (blocksToInsert.length === 0) {
        return;
      }

      let historyEntry: AiActionRecord | null = null;
      const insertedSnapshots: NoteBlock[] = [];

      setBlocks((prev) => {
        const next = [...prev];
        let insertIndex = next.length;

        if (afterBlockId) {
          const currentIndex = next.findIndex((block) => (block.id ?? '') === afterBlockId);
          insertIndex = currentIndex >= 0 ? currentIndex + 1 : next.length;
        }

        blocksToInsert.forEach((block) => {
          const normalizedBlock = normalizeBlock(block);
          next.splice(insertIndex, 0, normalizedBlock);
          insertIndex += 1;
          insertedSnapshots.push(cloneBlock(normalizedBlock));
        });

        historyEntry = {
          id: generateActionId(),
          timestamp: Date.now(),
          type: metadata.type,
          label: metadata.label,
          targetBlockIds: metadata.targetBlockIds ?? insertedSnapshots.map((block) => block.id ?? ''),
          reasoning: metadata.reasoning,
          lengthRatio: metadata.lengthRatio,
          beforeBlocks: [],
          afterBlocks: insertedSnapshots.map((block) => cloneBlock(block)),
        };

        return next;
      });

      if (historyEntry) {
        setAiHistory((prevHistory) => {
          const nextHistory = [...prevHistory, historyEntry as AiActionRecord];
          return nextHistory.length > MAX_AI_HISTORY ? nextHistory.slice(-MAX_AI_HISTORY) : nextHistory;
        });
      }
    },
    [],
  );

  const undoAiAction = useCallback(
    (entryId?: string): AiActionRecord | null => {
      let undoneEntry: AiActionRecord | null = null;

      setAiHistory((prevHistory) => {
        if (prevHistory.length === 0) {
          return prevHistory;
        }

        const nextHistory = [...prevHistory];
        const index = entryId ? nextHistory.findIndex((entry) => entry.id === entryId) : nextHistory.length - 1;
        if (index < 0) {
          return prevHistory;
        }

        const entry = nextHistory[index];
        undoneEntry = entry;

        setBlocks((currentBlocks) => {
          let nextBlocks = [...currentBlocks];

          if (entry.type === 'structure') {
            const removeIds = new Set((entry.targetBlockIds ?? entry.afterBlocks.map((block) => block.id ?? '')).filter(Boolean));
            nextBlocks = nextBlocks.filter((block) => !removeIds.has(block.id ?? ''));
          } else {
            entry.beforeBlocks.forEach((before) => {
              if (!before.id) {
                return;
              }
              const blockIndex = nextBlocks.findIndex((block) => (block.id ?? '') === before.id);
              if (blockIndex >= 0) {
                nextBlocks[blockIndex] = cloneBlock(before);
              }
            });
          }

          return nextBlocks;
        });

        nextHistory.splice(index, 1);
        return nextHistory;
      });

      return undoneEntry;
    },
    [],
  );

  const paidBlockExists = useMemo(() => {
    if (editorType === 'note') {
      try {
        return JSON.stringify(richContent).includes('"access":"paid"');
      } catch {
        return false;
      }
    }
    return blocks.some((block) => isPaidBlock(block));
  }, [blocks, editorType, richContent]);
  const effectivePaid = isPaid || paidBlockExists;

  const derivedOfficialTweetUrl = useMemo(() => {
    if (!officialShareConfig) return null;
    if (officialShareConfig.tweet_url) return officialShareConfig.tweet_url;
    if (officialShareConfig.tweet_id) {
      if (officialShareConfig.author_x_username) {
        return `https://x.com/${officialShareConfig.author_x_username}/status/${officialShareConfig.tweet_id}`;
      }
      return `https://x.com/i/web/status/${officialShareConfig.tweet_id}`;
    }
    return null;
  }, [officialShareConfig]);

  const handlePaidToggle = (checked: boolean) => {
    setIsPaid(checked);
    if (!checked) {
      if (editorType === 'classic') {
        setBlocks((prev) => prev.map((block) => normalizeBlock({ ...block, access: 'public' })));
      } else {
        setRichContent((prev) => {
          try {
            const snapshot = JSON.parse(JSON.stringify(prev ?? INITIAL_RICH_CONTENT));
            const visit = (node: any) => {
              if (!node || typeof node !== 'object') return;
              if (node.attrs && typeof node.attrs === 'object') {
                node.attrs.access = 'public';
              }
              if (Array.isArray(node.content)) {
                node.content.forEach(visit);
              }
            };
            visit(snapshot);
            return snapshot;
          } catch {
            return INITIAL_RICH_CONTENT;
          }
        });
      }
      setPricePoints('');
      setPriceJpy('');
      setAllowPointPurchase(true);
      setAllowJpyPurchase(false);
    }
  };

  const handlePriceChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPricePoints(value);
  };

  const handlePriceJpyChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPriceJpy(value);
  };

  const handleTaxRateChange = (value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    setTaxRate(value);
  };

  const handleAllowPointPurchaseChange = (checked: boolean) => {
    if (!checked && (allowJpyPurchase === false || !allowJpyPurchase) && (isPaid || paidBlockExists)) {
      alert('少なくとも1つの決済方法を有効にしてください');
      return;
    }
    setAllowPointPurchase(checked);
    if (!checked) {
      setPricePoints('');
    }
  };

  const handleAllowJpyPurchaseChange = (checked: boolean) => {
    if (!checked && !allowPointPurchase && (isPaid || paidBlockExists)) {
      alert('少なくとも1つの決済方法を有効にしてください');
      return;
    }
    setAllowJpyPurchase(checked);
    if (!checked) {
      setPriceJpy('');
    }
  };

  const toggleSalonAccess = useCallback((salonId: string) => {
    setSelectedSalonIds((prev) =>
      prev.includes(salonId)
        ? prev.filter((id) => id !== salonId)
        : [...prev, salonId]
    );
  }, []);

  const handleVisibilityChange = (value: NoteVisibility) => {
    setVisibility(value);
    if (value !== 'public') {
      setRequiresLogin(false);
    }
  };

  const richContentHasBody = useCallback((doc: NoteRichContent | null | undefined): boolean => {
    if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) {
      return false;
    }

    const visit = (nodes: any[]): boolean => {
      for (const node of nodes) {
        if (!node) continue;
        if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) {
          return true;
        }
        if (node.type === 'image' && typeof node.attrs?.src === 'string' && node.attrs.src.trim().length > 0) {
          return true;
        }
        if (Array.isArray(node.content) && visit(node.content)) {
          return true;
        }
      }
      return false;
    };

    return visit(doc.content as any[]);
  }, []);

  const validate = () => {
    if (!title || title.trim().length < MIN_TITLE_LENGTH) {
      return 'タイトルを3文字以上で入力してください';
    }

    if (editorType === 'classic') {
      const hasContent = blocks.some((block) => {
        if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
          return Boolean(block.data?.text && String(block.data.text).trim().length > 0);
        }
        if (block.type === 'list') {
          return Array.isArray(block.data?.items) && block.data.items.length > 0;
        }
        if (block.type === 'image') {
          return Boolean(block.data?.url && String(block.data.url).trim().length > 0);
        }
        return true;
      });

      if (!hasContent) {
        return '本文を入力してください';
      }
    } else {
      if (!richContentHasBody(richContent)) {
        return '本文を入力してください';
      }
    }

    if (effectivePaid) {
      if (!allowPointPurchase && !allowJpyPurchase) {
        return '有料記事は少なくとも1つの決済方法を有効にしてください';
      }

      if (allowPointPurchase) {
        const priceValue = Number(pricePoints);
        if (!Number.isFinite(priceValue) || priceValue <= 0) {
          return 'ポイント決済の価格を1ポイント以上で設定してください';
        }
      }

      if (allowJpyPurchase) {
        const priceValueJpy = Number(priceJpy);
        if (!Number.isFinite(priceValueJpy) || priceValueJpy <= 0) {
          return '日本円決済の価格を1円以上で設定してください';
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (saving) return;
    setErrorMessage(null);
    setInfo(null);

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!noteId) {
      setErrorMessage('SwipeコラムIDが見つかりません');
      return;
    }

    try {
      setSaving(true);
      const normalizedBlocks = editorType === 'classic'
        ? blocks.map((block) => normalizeBlock(block))
        : undefined;
      const parsedPoints = Number(pricePoints);
      const parsedJpy = Number(priceJpy);
      const normalizedTaxRate = taxRate.trim();
      const parsedTaxRate = normalizedTaxRate === '' ? null : Number(normalizedTaxRate);
      const pricePointsValue =
        effectivePaid && allowPointPurchase && Number.isFinite(parsedPoints) ? parsedPoints : 0;
      const priceJpyValue =
        effectivePaid && allowJpyPurchase && Number.isFinite(parsedJpy) ? parsedJpy : null;
      const taxRateValue =
        parsedTaxRate === null || Number.isNaN(parsedTaxRate)
          ? null
          : parsedTaxRate;
      const payload = {
        title: title.trim(),
        cover_image_url: coverImageUrl.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        ...(editorType === 'classic' && normalizedBlocks ? { content_blocks: normalizedBlocks } : {}),
        ...(editorType === 'note' ? { rich_content: richContent ?? INITIAL_RICH_CONTENT } : {}),
        editor_type: editorType,
        is_paid: effectivePaid,
        price_points: pricePointsValue,
        price_jpy: priceJpyValue,
        allow_point_purchase: effectivePaid ? allowPointPurchase : false,
        allow_jpy_purchase: effectivePaid ? allowJpyPurchase : false,
        tax_rate: effectivePaid ? taxRateValue : null,
        tax_inclusive: effectivePaid ? taxInclusive : true,
        categories,
        allow_share_unlock: allowShareUnlock,
        salon_ids: selectedSalonIds,
        visibility,
        requires_login: visibility === 'public' ? requiresLogin : false,
      };

      const response = await noteApi.update(noteId, payload);
      setInfo('下書きとして保存しました。最新情報に更新されました。');
      setStatus(response.data?.status ?? status);
      setPublishedAt(response.data?.published_at ?? publishedAt);
      setVisibility(response.data?.visibility ?? visibility);
      setRequiresLogin(Boolean(response.data?.requires_login && (response.data?.visibility ?? visibility) === 'public'));
      setShareUrl(response.data?.share_url ?? null);
      setShareTokenRotatedAt(response.data?.share_token_rotated_at ?? null);
    } catch (err: unknown) {
      const detail = extractErrorDetail(err);
      setErrorMessage(typeof detail === 'string' ? detail : 'Swipeコラムの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (action: 'publish' | 'unpublish') => {
    if (!noteId || actionLoading) return;
    setErrorMessage(null);
    setInfo(null);

    try {
      setActionLoading(true);
      if (action === 'publish') {
        const response = await noteApi.publish(noteId);
        const detail = response.data;
        setStatus(detail?.status ?? 'published');
        setPublishedAt(detail?.published_at ?? new Date().toISOString());
        setVisibility(detail?.visibility ?? visibility);
        setRequiresLogin(Boolean(detail?.requires_login && (detail?.visibility ?? visibility) === 'public'));
        setShareUrl(detail?.share_url ?? shareUrl);
        setShareTokenRotatedAt(detail?.share_token_rotated_at ?? shareTokenRotatedAt);
        const nextSlug = detail?.slug ?? slug;
        setSlug(nextSlug);
        setInfo('記事を公開しました');
        if (nextSlug) {
          const prefix = locale && locale !== 'ja' ? `/${locale}` : '';
          router.push(`${prefix}/notes/${nextSlug}`);
        } else if (detail?.share_url) {
          router.push(detail.share_url);
        }
      } else {
        const response = await noteApi.unpublish(noteId);
        const detail = response.data;
        setStatus(detail?.status ?? 'draft');
        setPublishedAt(detail?.published_at ?? null);
        setVisibility(detail?.visibility ?? visibility);
        setRequiresLogin(Boolean(detail?.requires_login && (detail?.visibility ?? visibility) === 'public'));
        setShareUrl(detail?.share_url ?? shareUrl);
        setShareTokenRotatedAt(detail?.share_token_rotated_at ?? shareTokenRotatedAt);
        setInfo('記事を下書きに戻しました');
      }
      setShareActionError(null);
      setShareActionMessage(null);
    } catch (err: unknown) {
      const detail = extractErrorDetail(err);
      setErrorMessage(
        typeof detail === 'string'
          ? detail
          : action === 'publish'
            ? '公開に失敗しました'
            : '非公開に失敗しました'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId || actionLoading) return;
    const confirmed = confirm('この記事を削除してもよろしいですか？この操作は取り消せません。');
    if (!confirmed) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      await noteApi.delete(noteId);
      router.push('/note');
    } catch (err: unknown) {
      const detail = extractErrorDetail(err);
      setErrorMessage(typeof detail === 'string' ? detail : '削除に失敗しました');
      setActionLoading(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    setShareActionError(null);
    setShareActionMessage(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareActionMessage('共有URLをコピーしました');
        return;
      }
    } catch (error) {
      console.error('Failed to copy share URL', error);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setShareActionMessage('共有URLをコピーしました');
    } catch (error) {
      console.error('Fallback copy failed', error);
      setShareActionError('クリップボードへのコピーに失敗しました');
    }
  };

  const handleRotateShareUrl = async () => {
    if (!noteId || shareActionLoading) return;
    setShareActionLoading(true);
    setShareActionError(null);
    setShareActionMessage(null);
    try {
      const response = await noteApi.rotateShareToken(noteId);
      const detail = response.data;
      setShareUrl(detail?.share_url ?? null);
      setShareTokenRotatedAt(detail?.share_token_rotated_at ?? null);
      setRequiresLogin(Boolean(detail?.requires_login && (detail?.visibility ?? visibility) === 'public'));
      setShareActionMessage('共有URLを再発行しました');
    } catch (err: unknown) {
      const detail = extractErrorDetail(err);
      setShareActionError(typeof detail === 'string' ? detail : '共有URLの再発行に失敗しました');
    } finally {
      setShareActionLoading(false);
    }
  };

  if (!isInitialized || loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const subtitle =
    status === 'published' ? '公開中のSwipeコラムを編集しています' : '下書きのSwipeコラムを編集しています';

  return (
    <DashboardLayout pageTitle="Swipeコラム編集" pageSubtitle={subtitle}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {status === 'published' ? '公開中' : '下書き'}
            </span>
            {publishedAt ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                最終公開: {formatDateTime(publishedAt) ?? '---'}
              </span>
            ) : null}
          </div>
          <div className="text-xs text-slate-500">
            {status === 'published'
              ? '公開中の記事です。変更後は再度公開状態で保存してください。'
              : '現在は下書きです。公開ボタンから公開できます。'}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        ) : null}
        {info ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</div>
        ) : null}

        <div
          className="mb-6 bg-white/95 px-2 py-3 backdrop-blur md:rounded-3xl md:border md:border-slate-200 md:px-4 md:shadow-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/note"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
              >
                ノート一覧へ戻る
              </Link>
              {!isNoteEditor && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || actionLoading}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? '保存中...' : '下書きを保存'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
                削除
              </button>
              {status !== 'published' ? (
                <button
                  type="button"
                  onClick={() => handlePublishToggle('publish')}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? '処理中...' : '公開する'}
                </button>
              ) : (
                <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                  公開中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* シェア統計セクション */}
        {shareStats && shareStats.total_shares > 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:rounded-3xl md:border md:border-blue-200 md:p-6 md:shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <h3 className="text-base font-semibold text-blue-900">シェア統計</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShareIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">総シェア数</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-600">{shareStats.total_shares}回</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <CurrencyYenIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">獲得ポイント</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{shareStats.total_reward_points}P</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">検証済み</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{shareStats.verified_shares}件</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">不正疑い</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-600">{shareStats.suspicious_shares}件</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white p-4 sm:p-6 md:rounded-3xl md:border md:border-slate-200 md:shadow-sm md:p-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="記事タイトル"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={saving || actionLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">概要</label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="記事の要約"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={saving || actionLoading}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">カバー画像</label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openCoverFilePicker}
                    disabled={saving || actionLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    画像をアップロード
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCoverMediaOpen(true)}
                    disabled={saving || actionLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    メディアから選択
                  </button>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileSelect}
                  />
                </div>
                {isCoverUploading ? (
                  <p className="mt-2 text-xs font-semibold text-blue-600">アップロード中...</p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">{createT('helpers.coverImage')}</p>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder={createT('placeholders.coverImageUrl')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={saving || actionLoading}
                />
                {coverImageUrl.trim() ? (
                  <div className="mt-3 space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <img src={coverImageUrl} alt="cover preview" className="h-40 w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      disabled={saving || actionLoading}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      カバー画像を削除
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-600">公開状況</p>
                <p className="mt-1">
                  {status === 'published'
                    ? 'この記事は公開中です。変更を反映するには再度公開状態で保存してください。'
                    : '現在は下書きです。公開するとマーケットに表示されます。'}
                </p>
              </div>
            </div>

            <div className="bg-white px-0 py-4 md:rounded-2xl md:border md:border-slate-200 md:px-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">カテゴリーを選択</p>
                  <p className="text-xs text-slate-500">最大{MAX_CATEGORIES}件まで選択できます。マーケットでの露出を高めるためにも設定がおすすめです。</p>
                </div>
                {categories.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                    <span>選択中:</span>
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600"
                      >
                        #{NOTE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {NOTE_CATEGORY_OPTIONS.map((option) => {
                  const isActive = categories.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleCategory(option.value)}
                      disabled={saving || actionLoading}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } ${(saving || actionLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white px-0 py-4 md:rounded-2xl md:border md:border-slate-200 md:px-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">公開範囲を選択</p>
                  <p className="text-xs text-slate-500">限定公開を選ぶと、保存後に共有URLが自動発行されます。</p>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-500 sm:items-end">
                  <span>現在の公開範囲: <strong className="text-slate-700">{visibility === 'public' ? '公開' : visibility === 'limited' ? '限定公開' : '非公開'}</strong></span>
                  {visibility === 'limited' && shareTokenRotatedAt ? (
                    <span>最終更新: {formatDateTime(shareTokenRotatedAt) ?? '---'}</span>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {NOTE_VISIBILITY_OPTIONS.map((option) => {
                  const isChecked = visibility === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-3 text-sm transition ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="note-visibility"
                          value={option.value}
                          checked={isChecked}
                          onChange={() => handleVisibilityChange(option.value)}
                          disabled={saving || actionLoading}
                          className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </label>
                  );
                })}
              </div>

              {visibility === 'public' ? (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">{createT('labels.requiresLoginTitle')}</p>
                      <p className="mt-1 text-xs text-blue-700/80">{createT('labels.requiresLoginDescription')}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        checked={requiresLogin}
                        onChange={(event) => setRequiresLogin(event.target.checked)}
                        disabled={saving || actionLoading}
                      />
                      {createT('labels.requiresLoginToggle')}
                    </label>
                  </div>
                </div>
              ) : null}

              {visibility === 'limited' ? (
                <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">限定公開URL</p>
                  {shareUrl ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="w-full flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCopyShareUrl}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={shareActionLoading || !shareUrl}
                        >
                          <ShareIcon className={`h-4 w-4 ${shareActionLoading ? 'animate-pulse' : ''}`} aria-hidden="true" />
                          コピー
                        </button>
                        <button
                          type="button"
                          onClick={handleRotateShareUrl}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={shareActionLoading || !shareUrl}
                        >
                          <ArrowPathIcon className={`h-4 w-4 ${shareActionLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                          再発行
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-blue-900">保存後に共有URLが表示されます。</p>
                  )}
                  {shareActionMessage ? (
                    <p className="mt-2 text-xs font-semibold text-blue-900">{shareActionMessage}</p>
                  ) : null}
                  {shareActionError ? (
                    <p className="mt-2 text-xs font-semibold text-red-600">{shareActionError}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="bg-slate-50 px-0 py-4 md:rounded-2xl md:border md:border-slate-200 md:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">有料記事として販売する</p>
                  <p className="text-xs text-slate-500">有料ブロックがある場合は自動的に有料記事になります。</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={isPaid}
                    onChange={(event) => handlePaidToggle(event.target.checked)}
                    disabled={saving || actionLoading}
                  />
                  有料設定を手動でオンにする
                </label>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="bg-white px-0 py-4 md:rounded-2xl md:border md:border-slate-200 md:px-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">ポイント決済</p>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={allowPointPurchase}
                        onChange={(event) => handleAllowPointPurchaseChange(event.target.checked)}
                        disabled={saving || actionLoading || !effectivePaid}
                      />
                      有効化
                    </label>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pricePoints}
                    onChange={(event) => handlePriceChange(event.target.value)}
                    placeholder="例: 1200"
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    disabled={saving || actionLoading || !effectivePaid || !allowPointPurchase}
                  />
                  <p className="mt-2 text-xs text-slate-500">購入者のポイント残高から差し引かれます。</p>
                </div>
                <div className="bg-white px-0 py-4 md:rounded-2xl md:border md:border-slate-200 md:px-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">日本円決済</p>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={allowJpyPurchase}
                        onChange={(event) => handleAllowJpyPurchaseChange(event.target.checked)}
                        disabled={saving || actionLoading || !effectivePaid}
                      />
                      有効化
                    </label>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceJpy}
                    onChange={(event) => handlePriceJpyChange(event.target.value)}
                    placeholder="例: 14800"
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                    disabled={saving || actionLoading || !effectivePaid || !allowJpyPurchase}
                  />
                  <p className="mt-2 text-xs text-slate-500">決済プロバイダー(one.lat)経由で課金されます。</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">消費税率 (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={taxRate}
                    onChange={(event) => handleTaxRateChange(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    disabled={
                      saving ||
                      actionLoading ||
                      !effectivePaid ||
                      (!allowPointPurchase && !allowJpyPurchase)
                    }
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={taxInclusive}
                      onChange={(event) => setTaxInclusive(event.target.checked)}
                      disabled={
                        saving ||
                        actionLoading ||
                        !effectivePaid ||
                        (!allowPointPurchase && !allowJpyPurchase)
                      }
                    />
                    税込表示として扱う
                  </label>
                </div>
                <div className="sm:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs text-slate-600">
                  <p>
                    {effectivePaid
                      ? paidBlockExists
                        ? '有料ブロックが含まれているため自動的に有料記事扱いになります。選択した決済方法で販売されます。'
                        : '有料設定がオンです。公開前に決済方法と価格を確認してください。'
                      : 'すべてのブロックが無料公開されます。'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white px-0 py-4 md:rounded-2xl md:border md:border-slate-200 md:px-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">サロン会員は無料閲覧</p>
                  <p className="text-xs text-slate-500">選択したオンラインサロンの会員はポイント消費なしで記事を閲覧できます。</p>
                </div>
              </div>
              {salonOptions.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  まだオンラインサロンが登録されていません。サロンメニューから新規作成すると会員向けに無料公開できます。
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {salonOptions.map((salon) => {
                    const isActive = selectedSalonIds.includes(salon.id);
                    return (
                      <button
                        key={salon.id}
                        type="button"
                        onClick={() => toggleSalonAccess(salon.id)}
                        disabled={saving || actionLoading}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${(saving || actionLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {salon.title ?? '無題のサロン'}
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
                          {salon.member_count?.toLocaleString() ?? 0}名
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {effectivePaid && (
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Xシェアで無料解放を許可</p>
                    <p className="text-xs text-blue-700">
                      読者がXでシェアすることで、ポイント支払いなしで記事を読めるようにします。
                      シェアされるたびにあなたにポイント報酬が付与されます。
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-900">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      checked={allowShareUnlock}
                      onChange={(event) => setAllowShareUnlock(event.target.checked)}
                      disabled={saving || actionLoading}
                    />
                    許可する
                  </label>
                </div>
                {allowShareUnlock && (
                  <>
                    <div className="mt-3 rounded-xl border border-blue-300 bg-white/80 px-3 py-2 text-xs text-blue-800">
                      <p className="font-semibold">💡 ヒント</p>
                      <p className="mt-1">シェア解放を許可すると、拡散力が高まり多くの読者に届きやすくなります。</p>
                    </div>
                    <div className="mt-4 space-y-3 rounded-xl border border-blue-300 bg-white/90 px-4 py-4 text-xs text-blue-900">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                            公式ポストURLまたはツイートID
                          </label>
                          <input
                            type="text"
                            value={officialShareInput}
                            onChange={(event) => setOfficialShareInput(event.target.value)}
                            placeholder="https://x.com/... または 1234567890"
                            disabled={officialShareLoading}
                            className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 placeholder:text-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                          />
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                          <button
                            type="button"
                            onClick={handleOfficialShareSave}
                            disabled={officialShareLoading || !officialShareInput.trim()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {officialShareLoading ? '保存中...' : '公式ポストを設定'}
                          </button>
                          {officialShareConfig?.tweet_id ? (
                            <button
                              type="button"
                              onClick={handleOfficialShareClear}
                              disabled={officialShareLoading}
                              className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              解除する
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {officialShareLoading ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                          <span>設定情報を更新しています...</span>
                        </div>
                      ) : null}
                      {derivedOfficialTweetUrl ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                          <p className="font-semibold text-blue-900">現在の公式ポスト</p>
                          <div className="mt-1 overflow-hidden rounded-lg border border-blue-100 bg-white/70">
                            <a
                              href={derivedOfficialTweetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate px-3 py-2 text-blue-700 underline underline-offset-2 hover:text-blue-800"
                            >
                              {derivedOfficialTweetUrl}
                            </a>
                          </div>
                          {officialShareConfig?.tweet_text ? (
                            <p className="mt-1 line-clamp-3 text-blue-800/80">“{officialShareConfig.tweet_text}”</p>
                          ) : null}
                          {officialShareConfig?.configured_at ? (
                            <p className="mt-2 text-[10px] text-blue-600/70">
                              設定日時: {formatDateTime(officialShareConfig.configured_at) ?? '---'}
                            </p>
                          ) : null}
                          {officialShareConfig?.author_x_username ? (
                            <p className="text-[10px] text-blue-600/70">
                              投稿者: @{officialShareConfig.author_x_username}
                            </p>
                          ) : null}
                        </div>
                      ) : (!officialShareLoading ? (
                        <p className="text-blue-700">
                          公式ポストが未設定です。上記にURLまたはツイートIDを入力して設定してください。
                        </p>
                      ) : null)}
                      {officialShareMessage ? (
                        <p className="text-xs font-semibold text-emerald-600">{officialShareMessage}</p>
                      ) : null}
                      {officialShareError ? (
                        <p className="text-xs font-semibold text-red-600">{officialShareError}</p>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {editorType === 'classic' ? (
          <>
            <div className="bg-white p-4 sm:p-6 md:rounded-3xl md:border md:border-slate-200 md:shadow-sm md:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">本文ブロック</h2>
                  <p className="mt-1 text-xs text-slate-500">段落・見出し・画像などを自由に組み合わせて記事を構成できます。</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {blocks.length} ブロック
                </div>
              </div>
              <NoteEditor value={blocks} onChange={handleBlocksChange} disabled={saving || actionLoading} />
            </div>

            <NoteAiAssistant
              title={title}
              excerpt={excerpt}
              categories={categories}
              language={locale === 'en' ? 'en' : 'ja'}
              blocks={blocks}
              disabled={saving || actionLoading}
              onApplyText={applyAiTextToBlock}
              onInsertBlock={insertAiSuggestion}
              history={aiHistory}
              onUndoAction={undoAiAction}
            />
          </>
        ) : (
          <div className="bg-white p-4 sm:p-6 md:rounded-3xl md:border md:border-slate-200 md:shadow-sm md:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">NOTEスタイルエディタ</h2>
                <p className="mt-1 text-xs text-slate-500">段落単位で装飾や有料切り替えを行えます。</p>
              </div>
            </div>
            <NoteRichEditor
              value={richContent}
              onChange={setRichContent}
              disabled={saving || actionLoading}
              onSaveDraft={handleSave}
              isSavingDraft={saving}
              draftSaveDisabled={actionLoading}
              draftSaveLabel="下書きを保存"
              draftSavingLabel="保存中..."
            />
          </div>
        )}

      </div>

      <MediaLibraryModal
        isOpen={isCoverMediaOpen}
        onClose={() => setIsCoverMediaOpen(false)}
        onSelect={handleCoverMediaSelect}
      />
    </DashboardLayout>
  );
}
