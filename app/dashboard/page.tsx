'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { lpApi, productApi, authApi, announcementApi, noteApi } from '@/lib/api';
import { getCategoryLabel } from '@/lib/noteCategories';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { redirectToLogin } from '@/lib/navigation';
import type { DashboardAnnouncement, NoteMetrics, NoteSummary } from '@/types';
import { loadCache, saveCache } from '@/lib/cache';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyYenIcon,
  DocumentIcon,
  DocumentTextIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

type HeroMediaType = 'image' | 'video';

interface HeroMedia {
  type: HeroMediaType;
  url: string;
}

interface LpApiRecord {
  id: string;
  title: string;
  status?: string | null;
  slug?: string | null;
  visibility?: 'public' | 'limited' | 'private' | null;
  share_url?: string | null;
  share_token_rotated_at?: string | null;
  custom_theme_hex?: string | null;
  product_id?: string | null;
  salon_id?: string | null;
  image_url?: string | null;
  total_views?: number | null;
  total_cta_clicks?: number | null;
  [key: string]: unknown;
}

type LpStatusVariant = 'published' | 'archived' | 'draft';

interface DashboardLp extends LpApiRecord {
  heroMedia?: HeroMedia;
  heroImage?: string | null;
  heroVideo?: string | null;
  isPublished: boolean;
  hasPrimaryLink: boolean;
  statusLabel: string;
  statusVariant: LpStatusVariant;
  visibilityLabel: string;
}

interface LpStep extends Record<string, unknown> {
  block_type?: string | null;
  content_data?: Record<string, unknown>;
  image_url?: string | null;
  imageUrl?: string | null;
  video_url?: string | null;
  videoUrl?: string | null;
  background_video_url?: string | null;
  backgroundVideoUrl?: string | null;
}

interface PublicProductSummary {
  id: string;
  title: string;
  description?: string | null;
  seller_username?: string | null;
  price_in_points?: number | null;
  total_sales?: number | null;
  lp_id?: string | null;
  [key: string]: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const safeGet = (source: unknown, key: string): unknown =>
  isRecord(source) ? source[key] : undefined;

const asOptionalString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseLpList = (input: unknown): LpApiRecord[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter((item): item is LpApiRecord => {
    if (!isRecord(item)) {
      return false;
    }
    return typeof item.id === 'string' && typeof item.title === 'string';
  });
};

const parsePublicProducts = (input: unknown): PublicProductSummary[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter((item): item is PublicProductSummary => {
    if (!isRecord(item)) {
      return false;
    }
    return typeof item.id === 'string' && typeof item.title === 'string';
  });
};
const parseLpSteps = (input: unknown): LpStep[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const steps: LpStep[] = [];
  for (const item of input) {
    if (!isRecord(item)) {
      continue;
    }

    const normalized: LpStep = {
      ...(item as Record<string, unknown>),
      block_type: asOptionalString(item.block_type),
      content_data: isRecord(item.content_data) ? item.content_data : undefined,
      image_url: asOptionalString(item.image_url),
      imageUrl: asOptionalString(item.imageUrl),
      video_url: asOptionalString(item.video_url),
      videoUrl: asOptionalString(item.videoUrl),
      background_video_url: asOptionalString(item.background_video_url),
      backgroundVideoUrl: asOptionalString(item.backgroundVideoUrl),
      background_image_url: asOptionalString(item.background_image_url),
      backgroundImageUrl: asOptionalString(item.backgroundImageUrl),
      hero_image: asOptionalString(item.hero_image),
      heroImage: asOptionalString(item.heroImage),
      primary_image_url: asOptionalString(item.primary_image_url),
      primaryImageUrl: asOptionalString(item.primaryImageUrl),
      media: isRecord(item.media) ? item.media : undefined,
      visual: isRecord(item.visual) ? item.visual : undefined,
    };

    steps.push(normalized);
  }

  return steps;
};

const extractErrorDetail = (error: unknown, fallback: string): string => {
  const response = safeGet(error, 'response');
  const data = safeGet(response, 'data');
  const detail = safeGet(data, 'detail');
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }
  return fallback;
};

interface NoteCountSummary {
  total: number;
  published: number;
  draft: number;
  paid: number;
  free: number;
  latestPublishedIso: string | null;
}

const deriveNoteCounts = (notes: NoteSummary[]): NoteCountSummary => {
  const total = notes.length;
  const published = notes.filter((note) => note.status === 'published').length;
  const draft = notes.filter((note) => note.status === 'draft').length;
  const paid = notes.filter((note) => note.is_paid).length;
  const free = total - paid;
  const latestPublished = notes
    .map((note) => (note.published_at ? new Date(note.published_at) : null))
    .filter((value): value is Date => value instanceof Date && !Number.isNaN(value.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const latestPublishedIso = latestPublished ? latestPublished.toISOString() : null;
  return {
    total,
    published,
    draft,
    paid,
    free,
    latestPublishedIso,
  };
};

const FALLBACK_NOTE_METRICS: NoteMetrics = {
  total_notes: 0,
  published_notes: 0,
  draft_notes: 0,
  paid_notes: 0,
  free_notes: 0,
  total_sales_count: 0,
  total_sales_points: 0,
  total_sales_amount_jpy: 0,
  monthly_sales_count: 0,
  monthly_sales_points: 0,
  monthly_sales_amount_jpy: 0,
  recent_published_count: 0,
  average_paid_price: 0,
  latest_published_at: null,
  top_categories: [],
  top_note: null,
};

const DASHBOARD_CACHE_KEY = 'dashboard-home';
const DASHBOARD_CACHE_TTL = 120_000; // 2 minutes

interface DashboardCacheSnapshot {
  lps: DashboardLp[];
  noteMetrics: NoteMetrics | null;
  announcements: DashboardAnnouncement[];
}

const formatAnnouncementDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatAccountDate = (value?: string | null, includeTime = false) => {
  if (!value) return '記録なし';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '記録なし';
  const options: Intl.DateTimeFormatOptions = includeTime
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('ja-JP', options).format(date);
};

const formatYenCompact = (amount: number) => `${new Intl.NumberFormat('ja-JP').format(amount)}円`;
const formatPointsCompact = (points: number) => `${new Intl.NumberFormat('ja-JP').format(points)}P`;
const composeSalesLabel = (yenAmount: number, pointAmount: number) => {
  const parts: string[] = [];
  if (yenAmount > 0) {
    parts.push(formatYenCompact(yenAmount));
  }
  if (pointAmount > 0) {
    parts.push(formatPointsCompact(pointAmount));
  }
  if (parts.length === 0) {
    return '—';
  }
  return parts.join(' / ');
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [lps, setLps] = useState<DashboardLp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [noteMetrics, setNoteMetrics] = useState<NoteMetrics | null>(null);
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState<boolean>(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<DashboardAnnouncement | null>(null);
  const didHydrateFromCacheRef = useRef(false);
  const heroMediaCacheRef = useRef<Map<string, HeroMedia>>(new Map());

  const hydrateFromCache = useCallback(() => {
    if (didHydrateFromCacheRef.current) return;
    const cached = loadCache<DashboardCacheSnapshot>(DASHBOARD_CACHE_KEY, DASHBOARD_CACHE_TTL);
    if (!cached) return;

    setLps(Array.isArray(cached.lps) ? cached.lps : []);
    setNoteMetrics(cached.noteMetrics ?? null);
    setAnnouncements(Array.isArray(cached.announcements) ? cached.announcements : []);
    setAnnouncementsLoading(false);
    setAnnouncementsError(null);
    setIsLoading(false);
    didHydrateFromCacheRef.current = true;
  }, []);
  const formattedCreatedAt = formatAccountDate(user?.created_at);
  const formattedLastLogin = formatAccountDate(user?.last_login_at ?? null, true);
  const continuityDays = user?.created_at
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
      )
    : null;
  const continuityLabel = continuityDays !== null ? `${continuityDays}日` : '記録なし';

  const loadAnnouncements = useCallback(async (): Promise<DashboardAnnouncement[]> => {
    setAnnouncementsLoading(true);
    try {
      const response = await announcementApi.list({ limit: 6 });
      const rawPayload = response.data as { data?: unknown } | unknown;
      let rows: DashboardAnnouncement[] = [];
      if (isRecord(rawPayload) && Array.isArray(rawPayload.data)) {
        rows = rawPayload.data as DashboardAnnouncement[];
      } else if (Array.isArray(rawPayload)) {
        rows = rawPayload as DashboardAnnouncement[];
      }
      setAnnouncements(rows);
      setAnnouncementsError(null);
      return rows;
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncementsError('お知らせの取得に失敗しました');
      setAnnouncements([]);
      return [];
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  const noteSummary = noteMetrics ?? FALLBACK_NOTE_METRICS;
  const latestNotePublishedLabel = noteSummary.latest_published_at
    ? formatAccountDate(noteSummary.latest_published_at, true)
    : '未公開';
  const totalNoteSalesLabel = composeSalesLabel(noteSummary.total_sales_amount_jpy, noteSummary.total_sales_points);
  const monthlyNoteSalesLabel = composeSalesLabel(noteSummary.monthly_sales_amount_jpy ?? 0, noteSummary.monthly_sales_points ?? 0);
  const averagePaidPriceLabel = noteSummary.average_paid_price > 0
    ? `${noteSummary.average_paid_price.toLocaleString()}P`
    : '—';
  const topNote = noteSummary.top_note ?? null;
  const resolvedTopCategories = noteSummary.top_categories.map((category) => getCategoryLabel(category));

  const fetchData = useCallback(async () => {
    try {
      const announcementPromise = loadAnnouncements();
      const [meResponse, lpsResponse, productsResponse] = await Promise.all([
        authApi.getMe(),
        lpApi.list(),
        productApi.list(),
      ]);

      if (meResponse?.data) {
        useAuthStore.getState().setUser(meResponse.data);
        localStorage.setItem('user', JSON.stringify(meResponse.data));
      }

      const lpPayload = lpsResponse?.data as { data?: unknown } | unknown;
      const lpsData = (() => {
        if (isRecord(lpPayload) && Array.isArray(lpPayload.data)) {
          return parseLpList(lpPayload.data);
        }
        if (Array.isArray(lpPayload)) {
          return parseLpList(lpPayload);
        }
        return [];
      })();

      const heroMediaMap = new Map<string, HeroMedia>(heroMediaCacheRef.current);

      const createPlaceholderThumbnail = (title: string, accentHex?: string | null): HeroMedia => {
        const safeTitle = (title || '').trim() || 'Launch Page';
        const initials = safeTitle.replace(/\s+/g, '').slice(0, 2).toUpperCase() || 'LP';
        const sanitizedAccent = (accentHex || '').trim();
        const accent = /^#([0-9A-Fa-f]{3}){1,2}$/.test(sanitizedAccent) ? sanitizedAccent : '#2563EB';
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.65" />
    </linearGradient>
  </defs>
  <rect width="600" height="360" fill="url(#grad)" rx="32" ry="32" />
  <text x="48" y="118" font-family="'Inter', 'Noto Sans JP', sans-serif" font-weight="600" font-size="40" fill="rgba(248, 250, 252, 0.92)">
    ${safeTitle.replace(/[<>]/g, '')}
  </text>
  <text x="48" y="204" font-family="'Inter', 'Noto Sans JP', sans-serif" font-weight="300" font-size="24" fill="rgba(248, 250, 252, 0.78)">
    Custom LP Preview
  </text>
  <circle cx="520" cy="86" r="52" fill="rgba(248, 250, 252, 0.2)" />
  <text x="520" y="100" text-anchor="middle" font-family="'Inter', 'Noto Sans JP', sans-serif" font-weight="700" font-size="34" fill="#0F172A">
    ${initials}
  </text>
</svg>`;

        return {
          type: 'image',
          url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
        };
      };

      const extractMediaFromStep = (step: LpStep | undefined, title: string, accent?: string | null): HeroMedia => {
        if (!step) {
          return createPlaceholderThumbnail(title, accent);
        }

        // SIMPLE APPROACH: Direct access to content_data
        const contentData = isRecord(step.content_data) ? step.content_data : undefined;

        // Check 1: content_data.backgroundVideoUrl (most common for hero blocks)
        const contentBackgroundVideo = safeGet(contentData, 'backgroundVideoUrl');
        if (typeof contentBackgroundVideo === 'string' && contentBackgroundVideo.trim()) {
          return { type: 'video', url: contentBackgroundVideo };
        }

        // Check 2: content_data.backgroundImageUrl (for image-based heroes)
        const contentBackgroundImage = safeGet(contentData, 'backgroundImageUrl');
        if (typeof contentBackgroundImage === 'string' && contentBackgroundImage.trim()) {
          return { type: 'image', url: contentBackgroundImage };
        }

        // Check 3: step.video_url (direct DB field)
        if (typeof step.video_url === 'string' && step.video_url.trim()) {
          return { type: 'video', url: step.video_url };
        }

        // Check 4: step.image_url (direct DB field, but skip placeholder)
        if (typeof step.image_url === 'string' && step.image_url.trim() && step.image_url !== '/placeholder.jpg') {
          return { type: 'image', url: step.image_url };
        }

        // Last resort: placeholder
        return createPlaceholderThumbnail(title, accent);
      };

      const resolveBlockType = (step: LpStep | undefined): string | null => {
        if (!step) {
          return null;
        }
        if (typeof step.block_type === 'string') {
          return step.block_type;
        }
        if (isRecord(step.content_data)) {
          const candidate = safeGet(step.content_data, 'block_type');
          if (typeof candidate === 'string') {
            return candidate;
          }
        }
        return null;
      };

      const productsPayload = productsResponse?.data as { data?: unknown } | unknown;
      const productsData = (() => {
        if (isRecord(productsPayload) && Array.isArray(productsPayload.data)) {
          return parsePublicProducts(productsPayload.data);
        }
        if (Array.isArray(productsPayload)) {
          return parsePublicProducts(productsPayload);
        }
        return [];
      })();

      const productLinkedLpIds = new Set<string>(
        productsData
          .map((product) => product.lp_id)
          .filter((lpId): lpId is string => typeof lpId === 'string' && lpId.trim().length > 0)
      );

      const placeholderLps: DashboardLp[] = lpsData.map((lpItem) => {
        const cachedMedia = heroMediaMap.get(lpItem.id);
        const heroMedia = cachedMedia ?? createPlaceholderThumbnail(lpItem.title, lpItem.custom_theme_hex);
        const normalizedStatus = typeof lpItem.status === 'string' ? lpItem.status.toLowerCase() : '';
        const isPublished = normalizedStatus === 'published';
        const rawVisibility = (lpItem.visibility as string | null) ?? null;
        const visibility = rawVisibility === 'public' || rawVisibility === 'limited' || rawVisibility === 'private'
          ? rawVisibility
          : 'private';
        const hasProductDirect = typeof lpItem.product_id === 'string' && lpItem.product_id.trim().length > 0;
        const hasProductViaCatalog = productLinkedLpIds.has(lpItem.id);
        const hasSalonLink = typeof lpItem.salon_id === 'string' && lpItem.salon_id.trim().length > 0;
        const hasPrimaryLink = hasProductDirect || hasProductViaCatalog || hasSalonLink;
        const statusLabel = (() => {
          if (normalizedStatus === 'published') {
            if (visibility === 'limited') {
              return '限定公開';
            }
            return '公開中';
          }
          if (normalizedStatus === 'archived') {
            return 'アーカイブ';
          }
          return '下書き';
        })();
        const statusVariant: LpStatusVariant = normalizedStatus === 'published'
          ? 'published'
          : normalizedStatus === 'archived'
          ? 'archived'
          : 'draft';
        const visibilityLabel = visibility === 'public'
          ? '公開'
          : visibility === 'limited'
          ? '限定公開'
          : '非公開';
        return {
          ...lpItem,
          heroMedia,
          heroImage: heroMedia?.type === 'image' ? heroMedia.url : lpItem.image_url || null,
          heroVideo: heroMedia?.type === 'video' ? heroMedia.url : null,
          isPublished,
          hasPrimaryLink,
          statusLabel,
          statusVariant,
          visibilityLabel,
          visibility,
        };
      });
      setLps(placeholderLps);
      let metrics: NoteMetrics | null = null;
      try {
        const metricsResponse = await noteApi.getMetrics();
        metrics = metricsResponse.data ?? null;
      } catch (metricsError) {
        console.error('Failed to fetch note metrics:', metricsError);
      }

      try {
        const notesResponse = await noteApi.list({ limit: 100, offset: 0 });
        const notesData: NoteSummary[] = Array.isArray(notesResponse.data?.data)
          ? (notesResponse.data.data as NoteSummary[])
          : [];

        const counts = deriveNoteCounts(notesData);
        if (metrics) {
          metrics = {
            ...metrics,
            total_notes: counts.total,
            published_notes: counts.published,
            draft_notes: counts.draft,
            paid_notes: counts.paid,
            free_notes: counts.free,
            latest_published_at: counts.latestPublishedIso ?? metrics.latest_published_at ?? null,
          };
        } else {
          metrics = {
            ...FALLBACK_NOTE_METRICS,
            total_notes: counts.total,
            published_notes: counts.published,
            draft_notes: counts.draft,
            paid_notes: counts.paid,
            free_notes: counts.free,
            latest_published_at: counts.latestPublishedIso,
          };
        }
      } catch (notesError) {
        console.error('Failed to fetch note overview list:', notesError);
      }

      setNoteMetrics(metrics);

      const announcementRows = await announcementPromise;

      const announcementList = Array.isArray(announcementRows) ? announcementRows : [];

      saveCache(DASHBOARD_CACHE_KEY, {
        lps: placeholderLps,
        noteMetrics: metrics,
        announcements: announcementList,
      });

      const pendingHeroTargets = lpsData.filter((lpItem) => !heroMediaCacheRef.current.has(lpItem.id));
      if (pendingHeroTargets.length > 0) {
        void (async () => {
          const heroUpdates = await Promise.all(
            pendingHeroTargets.map(async (lpItem) => {
              try {
                const detailResponse = await lpApi.get(lpItem.id);
                const steps = parseLpSteps(detailResponse.data?.steps);
                const heroStep =
                  steps.find((step) => {
                    const blockType = resolveBlockType(step);
                    return typeof blockType === 'string' && blockType.includes('hero');
                  }) ??
                  steps.find((step) => resolveBlockType(step) === 'image-aurora-1') ??
                  steps[0];

                const media = extractMediaFromStep(heroStep, lpItem.title, lpItem.custom_theme_hex);
                return { id: lpItem.id, media };
              } catch (detailError) {
                console.error('Failed to fetch LP detail for hero image:', detailError);
                return {
                  id: lpItem.id,
                  media: createPlaceholderThumbnail(lpItem.title, lpItem.custom_theme_hex),
                };
              }
            })
          );

          const updateMap = new Map<string, HeroMedia>();
          for (const update of heroUpdates) {
            if (!update) continue;
            heroMediaCacheRef.current.set(update.id, update.media);
            updateMap.set(update.id, update.media);
          }

          if (updateMap.size === 0) {
            return;
          }

          setLps((current) => {
            const next = current.map((lpItem) => {
              const media = updateMap.get(lpItem.id);
              if (!media) {
                return lpItem;
              }
              return {
                ...lpItem,
                heroMedia: media,
                heroImage: media.type === 'image' ? media.url : lpItem.heroImage,
                heroVideo: media.type === 'video' ? media.url : null,
              };
            });

            saveCache(DASHBOARD_CACHE_KEY, {
              lps: next,
              noteMetrics: metrics,
              announcements: announcementList,
            });

            return next;
          });
        })();
      }
      didHydrateFromCacheRef.current = true;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setNoteMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadAnnouncements]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      redirectToLogin(router);
      return;
    }

    hydrateFromCache();
    void fetchData();
  }, [fetchData, hydrateFromCache, isAuthenticated, isInitialized, router]);

  const handleDeleteLP = async (lpId: string) => {
    if (!confirm('本当にこのLPを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await lpApi.delete(lpId);
      await fetchData();
      alert('LPを削除しました');
    } catch (error: unknown) {
      console.error('Failed to delete LP:', error);
      alert(extractErrorDetail(error, 'LPの削除に失敗しました'));
    }
  };

  const handleDuplicateLP = async (lpId: string) => {
    try {
      setDuplicatingId(lpId);
      const response = await lpApi.duplicate(lpId);
      const duplicated = response.data;
      await fetchData();
      alert('LPを複製しました。新しいドラフトを開きます。');
      if (duplicated?.id) {
        router.push(`/lp/${duplicated.id}/edit`);
      }
    } catch (error: unknown) {
      console.error('Failed to duplicate LP:', error);
      alert(extractErrorDetail(error, 'LPの複製に失敗しました'));
    } finally {
      setDuplicatingId(null);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout pageTitle="ダッシュボード">
      <div className="p-3 sm:p-6">
              {/* Recently Edited LPs */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">最近編集したLP</h2>
              <Link
                href="/lp/create"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold self-start sm:self-auto"
              >
                + 新規LP作成
              </Link>
            </div>

            {lps.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-slate-500">
                  <DocumentIcon className="inline-block h-10 w-10" aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">LPがありません</h3>
                <p className="text-slate-500 text-sm font-medium mb-3 sm:mb-4">最初のLPを作成しましょう</p>
                <Link
                  href="/lp/create"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  新規LP作成
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {lps.map((lp) => {
                  const heroMedia = lp.heroMedia;
                  const statusBadgeClass = lp.statusVariant === 'published'
                    ? lp.visibility === 'limited'
                      ? 'bg-amber-500 text-white'
                      : 'bg-green-500 text-white'
                    : lp.statusVariant === 'archived'
                    ? 'bg-slate-500 text-white'
                    : 'bg-slate-400 text-white';

                  return (
                  <div
                    key={lp.id}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-blue-200 transition-all flex flex-col shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 sm:h-32 bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {heroMedia?.type === 'image' ? (
                        <Image
                          src={heroMedia.url}
                          alt={lp.title || 'LPサムネイル'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 20vw"
                          unoptimized
                        />
                      ) : heroMedia?.type === 'video' ? (
                        <video
                          src={heroMedia.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls={false}
                        />
                      ) : (
                        <DocumentIcon className="h-12 w-12 text-white/80" aria-hidden="true" />
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded-full font-semibold ${statusBadgeClass}`}>
                          {lp.statusLabel}
                        </span>
                        {!lp.hasPrimaryLink && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] sm:text-[10px] rounded-full font-semibold">
                            CTA未設定
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 flex-1 flex flex-col">
                      <h3 className="text-slate-900 font-semibold text-xs sm:text-sm mb-1 truncate">{lp.title}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500 mb-2 font-medium">
                        <span className="truncate">閲覧: {lp.total_views || 0}</span>
                        <span className="truncate">クリック: {lp.total_cta_clicks || 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        <Link
                          href={`/lp/${lp.id}/edit`}
                          className="px-1 sm:px-2 py-1 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 transition-colors text-center text-[10px] sm:text-xs font-semibold"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/lp/${lp.id}/analytics-simple`}
                          className="px-1 sm:px-2 py-1 bg-slate-200 text-slate-900 rounded hover:bg-slate-300 transition-colors text-center text-[10px] sm:text-xs font-semibold"
                        >
                          分析
                        </Link>
                        <button
                          onClick={() => handleDuplicateLP(lp.id)}
                          disabled={duplicatingId === lp.id}
                          className={`px-1 sm:px-2 py-1 bg-slate-200 text-slate-900 rounded transition-colors text-[10px] sm:text-xs font-semibold ${duplicatingId === lp.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-300'}`}
                        >
                          {duplicatingId === lp.id ? '複製中…' : '複製'}
                        </button>
                        <button
                          onClick={() => handleDeleteLP(lp.id)}
                          className="px-1 sm:px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-[10px] sm:text-xs font-semibold"
                        >
                          削除
                        </button>
                      </div>

                      {/* Public URL */}
                      {lp.isPublished && (
                        <div className="border-t border-slate-200 pt-1.5 space-y-1">
                          {lp.visibility === 'limited' ? (
                            lp.share_url ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={lp.share_url}
                                  readOnly
                                  className="flex-1 px-1 py-0.5 bg-white border border-amber-200 rounded text-amber-700 text-[8px] sm:text-[10px] min-w-0"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(lp.share_url || '');
                                    alert('限定URLをコピーしました');
                                  }}
                                  className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[8px] sm:text-[10px] hover:bg-amber-600 transition-colors whitespace-nowrap font-semibold"
                                >
                                  限定URL
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] sm:text-xs text-amber-600 font-medium">限定URLは保存後に生成されます。</p>
                            )
                          ) : (
                            lp.slug ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/view/${lp.slug}`}
                                  readOnly
                                  className="flex-1 px-1 py-0.5 bg-white border border-slate-300 rounded text-slate-500 text-[8px] sm:text-[10px] min-w-0"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/view/${lp.slug}`);
                                    alert('URLをコピーしました');
                                  }}
                                  className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[8px] sm:text-[10px] hover:bg-blue-700 transition-colors whitespace-nowrap font-semibold"
                                >
                                  コピー
                                </button>
                              </div>
                            ) : null
                          )}
                          <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium">{lp.visibilityLabel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Bottom Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">アカウントステータス</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{user?.username || 'ゲストユーザー'}</div>
                </div>
              </div>
              <div className="space-y-1 text-[10px] sm:text-xs text-slate-600 font-medium">
                <p className="flex justify-between gap-3"><span>直近ログイン</span><span className="text-slate-900">{formattedLastLogin}</span></p>
                <p className="flex justify-between gap-3"><span>登録日</span><span className="text-slate-900">{formattedCreatedAt}</span></p>
                <p className="flex justify-between gap-3"><span>利用継続</span><span className="text-slate-900">{continuityLabel}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">Swipeコラム概要</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{noteSummary.total_notes}本のSwipeコラム</div>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium">
                公開中: {noteSummary.published_notes}本
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                下書き: {noteSummary.draft_notes}本
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <CurrencyYenIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">Swipeコラム売上</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold">{totalNoteSalesLabel}</div>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium">
                累計販売数: {noteSummary.total_sales_count}件
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                今月: {monthlyNoteSalesLabel}
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <ArrowTrendingUpIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">LP概要</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{lps.length}本のLP</div>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium">
                公開中: {lps.filter((lp) => lp.isPublished).length}本
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                CTA連携済み: {lps.filter((lp) => lp.hasPrimaryLink).length}本
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">Swipeコラム公開トレンド</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{latestNotePublishedLabel}</div>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium">
                直近30日: {noteSummary.recent_published_count}本公開
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                有料Swipeコラム平均価格: {averagePaidPriceLabel}
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                有料Swipeコラム: {noteSummary.paid_notes}本 / 無料: {noteSummary.free_notes}本
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <TagIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">人気Swipeコラムとカテゴリ</div>
                  {topNote ? (
                    topNote.slug ? (
                      <Link
                        href={`/notes/${topNote.slug}`}
                        className="text-slate-900 text-xs sm:text-sm font-semibold truncate text-blue-600 hover:text-blue-700"
                      >
                        {topNote.title}
                      </Link>
                    ) : (
                      <p className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{topNote.title}</p>
                    )
                  ) : (
                    <p className="text-slate-500 text-[10px] sm:text-xs font-medium">まだ販売データがありません</p>
                  )}
                </div>
              </div>
              {topNote ? (
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium">
                  販売: {topNote.purchase_count}件
                  {topNote.points_earned > 0 ? ` / ${topNote.points_earned.toLocaleString()}P` : ''}
                  {topNote.amount_jpy && topNote.amount_jpy > 0 ? ` / ${formatYenCompact(topNote.amount_jpy)}` : ''}
                </p>
              ) : null}
              {resolvedTopCategories.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {resolvedTopCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                    >
                      #{category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">カテゴリデータがまだありません</p>
              )}
            </div>
          </div>
          <section className="mt-12">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ｄ－swipe Corporate News</p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900">Ｄ－swipe からのお知らせ</h2>
                  <p className="mt-1 text-sm text-slate-500">プロダクト更新情報やメンテナンス予定などをリアルタイムでお届けします。</p>
                </div>
                <button
                  type="button"
                  onClick={loadAnnouncements}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  最新情報に更新
                </button>
              </div>

              {announcementsError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {announcementsError}
                </div>
              )}

              {announcementsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="mt-3 h-4 w-64 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : announcements.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-10 text-center text-sm text-slate-500">
                  現在表示できるお知らせはありません。最新情報は順次こちらに掲載されます。
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <button
                      key={announcement.id}
                      type="button"
                      onClick={() => setActiveAnnouncement(announcement)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold tracking-wide text-slate-700">{formatAnnouncementDate(announcement.published_at)}</span>
                        {announcement.highlight && (
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                            重点トピック
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900 line-clamp-1">{announcement.title}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{announcement.summary}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-w-2xl w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Corporate Update</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{activeAnnouncement.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{formatAnnouncementDate(activeAnnouncement.published_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAnnouncement(null)}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {activeAnnouncement.body}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveAnnouncement(null)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
