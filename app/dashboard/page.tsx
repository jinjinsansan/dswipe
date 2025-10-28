'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { lpApi, pointsApi, productApi, authApi, announcementApi, mediaApi, noteApi } from '@/lib/api';
import { TEMPLATE_LIBRARY } from '@/lib/templates';
import { BlockType } from '@/types/templates';
import DSwipeLogo from '@/components/DSwipeLogo';
import { getCategoryLabel } from '@/lib/noteCategories';
import {
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import DashboardMobileNav from '@/components/dashboard/DashboardMobileNav';
import type { DashboardAnnouncement, NoteMetrics } from '@/types';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  CurrencyYenIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();
  const pathname = usePathname();
  const [lps, setLps] = useState<any[]>([]);
  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const navGroups = groupDashboardNavLinks(navLinks);
  const [products, setProducts] = useState<any[]>([]);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardType, setDashboardType] = useState<'seller' | 'buyer' | 'settings'>('seller');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState<string>(user?.bio ?? '');
  const [profileSnsUrl, setProfileSnsUrl] = useState<string>(user?.sns_url ?? '');
  const [profileLineUrl, setProfileLineUrl] = useState<string>(user?.line_url ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState<string>(user?.profile_image_url ?? '');
  const [noteMetrics, setNoteMetrics] = useState<NoteMetrics | null>(null);
  const [profileUpdateError, setProfileUpdateError] = useState<string>('');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<boolean>(false);
  const [isSavingProfileInfo, setIsSavingProfileInfo] = useState<boolean>(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState<boolean>(false);
  const [profilePageUrl, setProfilePageUrl] = useState<string>('');
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const [profileLinkCopied, setProfileLinkCopied] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState<boolean>(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<DashboardAnnouncement | null>(null);
  const formattedCreatedAt = formatAccountDate(user?.created_at);
  const formattedLastLogin = formatAccountDate(user?.last_login_at ?? null, true);
  const continuityDays = user?.created_at
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
      )
    : null;
  const continuityLabel = continuityDays !== null ? `${continuityDays}日` : '記録なし';

  const fallbackNoteMetrics: NoteMetrics = {
    total_notes: 0,
    published_notes: 0,
    draft_notes: 0,
    paid_notes: 0,
    free_notes: 0,
    total_sales_count: 0,
    total_sales_points: 0,
    monthly_sales_count: 0,
    monthly_sales_points: 0,
    recent_published_count: 0,
    average_paid_price: 0,
    latest_published_at: null,
    top_categories: [],
    top_note: null,
  };

  const noteSummary = noteMetrics ?? fallbackNoteMetrics;
  const latestNotePublishedLabel = noteSummary.latest_published_at
    ? formatAccountDate(noteSummary.latest_published_at, true)
    : '未公開';
  const monthlyNoteSalesLabel = `${noteSummary.monthly_sales_points.toLocaleString()}P / ${noteSummary.monthly_sales_count}件`;
  const totalNoteSalesLabel = `${noteSummary.total_sales_points.toLocaleString()}P`;
  const averagePaidPriceLabel = noteSummary.average_paid_price > 0
    ? `${noteSummary.average_paid_price.toLocaleString()}P`
    : '—';
  const topNote = noteSummary.top_note ?? null;
  const resolvedTopCategories = noteSummary.top_categories.map((category) => getCategoryLabel(category));

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, isInitialized]);

  useEffect(() => {
    setProfileBio(user?.bio ?? '');
    setProfileSnsUrl(user?.sns_url ?? '');
    setProfileLineUrl(user?.line_url ?? '');
    setProfileImageUrl(user?.profile_image_url ?? '');
    setNewUsername(user?.username ?? '');
    setProfileLinkCopied(false);

    if (typeof window !== 'undefined' && user?.username) {
      setProfilePageUrl(`${window.location.origin}/u/${user.username}`);
    } else {
      setProfilePageUrl('');
    }
  }, [user]);

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const response = await announcementApi.list({ limit: 6 });
      const payload = response.data as { data?: DashboardAnnouncement[] } | DashboardAnnouncement[] | undefined;
      const rows = Array.isArray((payload as any)?.data)
        ? ((payload as any).data as DashboardAnnouncement[])
        : Array.isArray(payload)
        ? (payload as DashboardAnnouncement[])
        : [];
      setAnnouncements(rows);
      setAnnouncementsError(null);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncementsError('お知らせの取得に失敗しました');
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const announcementPromise = loadAnnouncements();
      const [meResponse, lpsResponse, pointsResponse, productsResponse, noteMetricsResponse] = await Promise.all([
        authApi.getMe(),
        lpApi.list(),
        pointsApi.getBalance(),
        productApi.list(),
        noteApi.getMetrics(),
      ]);

      if (meResponse?.data) {
        useAuthStore.getState().setUser(meResponse.data);
        localStorage.setItem('user', JSON.stringify(meResponse.data));
      }

      const lpsData = Array.isArray(lpsResponse.data?.data) 
        ? lpsResponse.data.data 
        : Array.isArray(lpsResponse.data) 
        ? lpsResponse.data 
        : [];

      type HeroMedia = { type: 'image' | 'video'; url: string };
      const heroMediaMap = new Map<string, HeroMedia>();

      const normalizeContent = (raw: unknown): Record<string, any> => {
        if (!raw) return {};
        let parsed = raw;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (error) {
            console.warn('Failed to parse content_data JSON for hero preview:', error);
            return {};
          }
        }
        if (parsed && typeof parsed === 'object' && 'content' in (parsed as Record<string, any>)) {
          const inner = (parsed as Record<string, any>).content;
          if (inner && typeof inner === 'object') {
            return inner as Record<string, any>;
          }
        }
        return (parsed && typeof parsed === 'object') ? (parsed as Record<string, any>) : {};
      };

      const pickFirstString = (candidates: unknown[]): string | null => {
        for (const candidate of candidates) {
          if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate;
          }
        }
        return null;
      };

      const extractMediaFromContent = (content: Record<string, any>, step?: any): HeroMedia | null => {
        const imageUrl = pickFirstString([
          content?.imageUrl,
          content?.image_url,
          content?.heroImage,
          content?.hero_image,
          content?.primaryImageUrl,
          content?.primary_image_url,
          content?.backgroundImageUrl,
          content?.background_image_url,
          content?.backgroundImage,
          content?.media?.imageUrl,
          content?.media?.image_url,
          content?.visual?.imageUrl,
          content?.visual?.image_url,
          step?.image_url,
          step?.imageUrl,
        ]);

        if (imageUrl) {
          return { type: 'image', url: imageUrl };
        }

        const videoUrl = pickFirstString([
          content?.backgroundVideoUrl,
          content?.background_video_url,
          content?.videoUrl,
          content?.video_url,
          content?.media?.videoUrl,
          content?.media?.video_url,
          content?.visual?.videoUrl,
          content?.visual?.video_url,
          step?.backgroundVideoUrl,
          step?.background_video_url,
          step?.videoUrl,
          step?.video_url,
        ]);

        if (videoUrl) {
          return { type: 'video', url: videoUrl };
        }

        return null;
      };

      const getTemplateMediaFallback = (blockType: BlockType): HeroMedia | null => {
        // Check both 'id' (unique template identifier) and 'templateId' (component type)
        const template = TEMPLATE_LIBRARY.find((item) => item.id === blockType || item.templateId === blockType);
        if (!template) return null;

        const templateContent = normalizeContent(template.defaultContent);
        return extractMediaFromContent(templateContent);
      };

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

      const extractMediaFromStep = (step: any, title: string, accent?: string | null): HeroMedia => {
        if (!step) {
          return createPlaceholderThumbnail(title, accent);
        }

        // SIMPLE APPROACH: Direct access to content_data
        const contentData = step?.content_data;
        
        // Check 1: content_data.backgroundVideoUrl (most common for hero blocks)
        if (contentData?.backgroundVideoUrl && typeof contentData.backgroundVideoUrl === 'string') {
          return { type: 'video', url: contentData.backgroundVideoUrl };
        }

        // Check 2: content_data.backgroundImageUrl (for image-based heroes)
        if (contentData?.backgroundImageUrl && typeof contentData.backgroundImageUrl === 'string') {
          return { type: 'image', url: contentData.backgroundImageUrl };
        }

        // Check 3: step.video_url (direct DB field)
        if (step.video_url && typeof step.video_url === 'string') {
          return { type: 'video', url: step.video_url };
        }

        // Check 4: step.image_url (direct DB field, but skip placeholder)
        if (step.image_url && typeof step.image_url === 'string' && step.image_url !== '/placeholder.jpg') {
          return { type: 'image', url: step.image_url };
        }

        // Check 5: Fallback to template default media by ID
        const blockType = step?.block_type;
        if (blockType) {
          const template = TEMPLATE_LIBRARY.find((item) => item.id === blockType || item.templateId === blockType);
          if (template?.defaultContent) {
            const defaultContent = template.defaultContent as any;
            if (defaultContent.backgroundVideoUrl) {
              return { type: 'video', url: defaultContent.backgroundVideoUrl };
            }
            if (defaultContent.backgroundImageUrl) {
              return { type: 'image', url: defaultContent.backgroundImageUrl };
            }
          }
        }

        // Last resort: placeholder
        return createPlaceholderThumbnail(title, accent);
      };

      await Promise.all(
        lpsData.map(async (lpItem) => {
          try {
            const detailResponse = await lpApi.get(lpItem.id);
            const steps = Array.isArray(detailResponse.data?.steps) ? detailResponse.data.steps : [];
            const heroStep = [...steps].find((step: any) => {
              const type = step?.block_type || step?.content_data?.block_type;
              return typeof type === 'string' && type.includes('hero');
            }) || steps.find((step: any) => step?.block_type === 'image-aurora-1') || steps[0];

            const media = extractMediaFromStep(heroStep, lpItem.title, lpItem.custom_theme_hex);
            heroMediaMap.set(lpItem.id, media);
          } catch (detailError) {
            console.error('Failed to fetch LP detail for hero image:', detailError);
            heroMediaMap.set(lpItem.id, createPlaceholderThumbnail(lpItem.title, lpItem.custom_theme_hex));
          }
        })
      );
      
      const productsData = Array.isArray(productsResponse.data?.data)
        ? productsResponse.data.data
        : Array.isArray(productsResponse.data)
        ? productsResponse.data
        : [];

      const productLinkedLpIds = new Set(
        productsData
          .map((product: any) => product?.lp_id)
          .filter((lpId: unknown): lpId is string => typeof lpId === 'string' && lpId.trim().length > 0)
      );
      
      const enrichedLps = lpsData.map((lpItem: any) => {
        const heroMedia = heroMediaMap.get(lpItem.id) ?? createPlaceholderThumbnail(lpItem.title, lpItem.custom_theme_hex);
        const normalizedStatus = typeof lpItem.status === 'string' ? lpItem.status.toLowerCase() : '';
        const isPublished = normalizedStatus === 'published';
        const hasProductDirect = typeof lpItem.product_id === 'string' && lpItem.product_id.trim().length > 0;
        const hasProduct = hasProductDirect || productLinkedLpIds.has(lpItem.id);
        const statusLabel = normalizedStatus === 'published'
          ? '公開中'
          : normalizedStatus === 'archived'
          ? 'アーカイブ'
          : '下書き';
        const statusVariant = normalizedStatus === 'published'
          ? 'published'
          : normalizedStatus === 'archived'
          ? 'archived'
          : 'draft';
        return {
          ...lpItem,
          heroMedia,
          heroImage: heroMedia?.type === 'image' ? heroMedia.url : lpItem.image_url || null,
          heroVideo: heroMedia?.type === 'video' ? heroMedia.url : null,
          isPublished,
          hasProduct,
          statusLabel,
          statusVariant,
        };
      });

      setLps(enrichedLps);
      setProducts(productsData);
      setNoteMetrics(noteMetricsResponse.data ?? null);
      setPointBalance(pointsResponse.data.point_balance);
      
      await announcementPromise;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setNoteMetrics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuyerData = async () => {
    try {
      // 全てのトランザクションを取得
      const allTransactions = await pointsApi.getTransactions({ limit: 50 });

      // transaction_typeに関係なく、product_purchase関連を全て表示
      const purchaseTransactions = allTransactions.data?.data?.filter(
        (tx: any) => tx.transaction_type === 'product_purchase'
      ) || [];
      
      setPurchaseHistory(purchaseTransactions);

      // 人気商品を取得（エラーでも続行）
      try {
        const popularResponse = await productApi.getPublic({ sort: 'popular', limit: 5 });
        setPopularProducts(popularResponse.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch popular products:', error);
        setPopularProducts([]);
      }

      // 新着商品を取得（エラーでも続行）
      try {
        const latestResponse = await productApi.getPublic({ sort: 'latest', limit: 5 });
        setLatestProducts(latestResponse.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch latest products:', error);
        setLatestProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch buyer data:', error);
    }
  };

  useEffect(() => {
    if (dashboardType === 'buyer' && isAuthenticated) {
      fetchBuyerData();
    }
  }, [dashboardType, isAuthenticated]);



  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUpdateSuccess(false);

    // バリデーション
    if (!newUsername.trim()) {
      setUsernameError('ユーザー名を入力してください');
      return;
    }

    const trimmedUsername = newUsername.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setUsernameError('ユーザー名は3-20文字で入力してください');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setUsernameError('ユーザー名は英数字とアンダースコアのみ使用できます');
      return;
    }

    if (trimmedUsername === user?.username) {
      setUsernameError('現在のユーザー名と同じです');
      return;
    }

    try {
      const response = await authApi.updateProfile({ username: trimmedUsername });
      
      // 更新されたユーザー情報をストアに保存
      const updatedUser = response.data;
      useAuthStore.getState().setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUpdateSuccess(true);
      setNewUsername(updatedUser?.username ?? trimmedUsername);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      setUsernameError(error.response?.data?.detail || 'ユーザー名の更新に失敗しました');
    }
  };

  const handleProfileInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateError('');
    setProfileUpdateSuccess(false);

    const sanitizedBio = profileBio.trim();
    const sanitizedSnsUrl = profileSnsUrl.trim();
    const sanitizedLineUrl = profileLineUrl.trim();
    const sanitizedImageUrl = profileImageUrl.trim();

    const payload = {
      bio: sanitizedBio ? sanitizedBio : null,
      sns_url: sanitizedSnsUrl ? sanitizedSnsUrl : null,
      line_url: sanitizedLineUrl ? sanitizedLineUrl : null,
      profile_image_url: sanitizedImageUrl ? sanitizedImageUrl : null,
    } as const;

    setIsSavingProfileInfo(true);
    try {
      const response = await authApi.updateProfile(payload);
      const updatedUser = response.data;
      useAuthStore.getState().setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileUpdateSuccess(true);
      setTimeout(() => setProfileUpdateSuccess(false), 3000);
    } catch (error: any) {
      setProfileUpdateError(error.response?.data?.detail || 'プロフィールの更新に失敗しました');
    } finally {
      setIsSavingProfileInfo(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileUpdateError('');
    setIsUploadingProfileImage(true);
    try {
      const response = await mediaApi.upload(file, { optimize: true, max_width: 512, max_height: 512 });
      const imageUrl = response.data?.url;
      if (imageUrl) {
        setProfileImageUrl(imageUrl);
      }
    } catch (error: any) {
      setProfileUpdateError(error.response?.data?.detail || '画像のアップロードに失敗しました');
    } finally {
      setIsUploadingProfileImage(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImageUrl('');
  };

  const handleCopyProfileLink = () => {
    if (!profilePageUrl || typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(profilePageUrl);
    setProfileLinkCopied(true);
    setTimeout(() => setProfileLinkCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteLP = async (lpId: string) => {
    if (!confirm('本当にこのLPを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await lpApi.delete(lpId);
      await fetchData();
      alert('LPを削除しました');
    } catch (error: any) {
      console.error('Failed to delete LP:', error);
      alert(error.response?.data?.detail || 'LPの削除に失敗しました');
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
    } catch (error: any) {
      console.error('Failed to duplicate LP:', error);
      alert(error.response?.data?.detail || 'LPの複製に失敗しました');
    } finally {
      setDuplicatingId(null);
    }
  };

  const totalPointsUsed = Math.abs(purchaseHistory.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0));
  const averagePointsUsed = purchaseHistory.length ? Math.round(totalPointsUsed / purchaseHistory.length) : 0;
  const lastPurchaseDateLabel = purchaseHistory.length
    ? new Date(purchaseHistory[0].created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '未購入';

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col sm:flex-row">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="hidden sm:flex w-52 bg-white/90 backdrop-blur-sm flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 h-20 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="large" showFullName={true} textColor="text-slate-900" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="flex flex-col gap-4">
            {navGroups.map((group) => {
              const meta = getDashboardNavGroupMeta(group.key);
              return (
                <div key={group.key} className="space-y-1.5">
                  <p className={`px-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.headingClass}`}>
                    {meta.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((link) => {
                      const isActive = isDashboardLinkActive(pathname, link.href);
                      const linkProps = link.external
                        ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
                        : { href: link.href };
                      const styles = getDashboardNavClasses(link, { variant: 'desktop', active: isActive });

                      return (
                        <Link
                          key={link.href}
                          {...linkProps}
                          className={`flex items-center justify-between gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${styles.container}`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className={`flex h-5 w-5 items-center justify-center ${styles.icon}`}>
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </span>
                          {link.badge ? (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 text-sm font-semibold truncate">{user?.username}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 px-3 sm:px-6 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full">
            {/* Left: Logo (Mobile) + Title (Desktop) */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Logo */}
              <Link href="/dashboard" className="sm:hidden">
                <DSwipeLogo size="small" showFullName={true} textColor="text-slate-900" />
              </Link>
              
              {/* Desktop Title */}
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0 truncate">ダッシュボード</h1>
                <p className="text-slate-500 text-xs">ようこそ、{user?.username}さん</p>
              </div>
            </div>
            
            {/* Right: Actions & User Info */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Point Balance */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded border border-slate-200">
                <span className="text-slate-500 text-xs font-medium">ポイント残高</span>
                <span className="text-slate-900 text-sm font-semibold">{pointBalance.toLocaleString()} P</span>
              </div>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm">
                  {user?.profile_image_url ? (
                    <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </div>
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="text-right">
                <div className="text-slate-900 text-xs font-semibold">{pointBalance.toLocaleString()}P</div>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sm:hidden border-b border-slate-200 bg-white/80">
          <DashboardMobileNav navGroups={navGroups} pathname={pathname} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-6">

          {/* Dashboard Type Tabs */}
          <div className="mb-6">
            <div className="flex gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setDashboardType('seller')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  dashboardType === 'seller'
                    ? 'text-slate-900 border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="mr-1 inline-flex h-4 w-4 items-center justify-center align-middle">
                  <BuildingStorefrontIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                販売者画面
              </button>
              <button
                onClick={() => setDashboardType('buyer')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  dashboardType === 'buyer'
                    ? 'text-slate-900 border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="mr-1 inline-flex h-4 w-4 items-center justify-center align-middle">
                  <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                購入者画面
              </button>
              <button
                onClick={() => setDashboardType('settings')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  dashboardType === 'settings'
                    ? 'text-slate-900 border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="mr-1 inline-flex h-4 w-4 items-center justify-center align-middle">
                  <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                設定
              </button>
            </div>
          </div>

          {/* Seller Dashboard */}
          {dashboardType === 'seller' && (
            <>
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
                {lps.map((lp: any) => {
                  const heroMedia = lp.heroMedia as { type: 'image' | 'video'; url: string } | undefined;
                  const statusBadgeClass = lp.statusVariant === 'published'
                    ? 'bg-green-500 text-white'
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
                        <img
                          src={heroMedia.url}
                          alt={lp.title}
                          className="w-full h-full object-cover"
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
                        {!lp.hasProduct && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] sm:text-[10px] rounded-full font-semibold">
                            商品未登録
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
                      {lp.isPublished && lp.slug && (
                        <div className="border-t border-slate-200 pt-1.5">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={`${window.location.origin}/view/${lp.slug}`}
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
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">NOTE概要</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{noteSummary.total_notes}本のNOTE</div>
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
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">NOTE売上</div>
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
                商品連携済み: {lps.filter((lp) => lp.hasProduct).length}本
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">NOTE公開トレンド</div>
                  <div className="text-slate-900 text-xs sm:text-sm font-semibold truncate">{latestNotePublishedLabel}</div>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium">
                直近30日: {noteSummary.recent_published_count}本公開
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                有料NOTE平均価格: {averagePaidPriceLabel}
              </p>
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                有料NOTE: {noteSummary.paid_notes}本 / 無料: {noteSummary.free_notes}本
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <TagIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-slate-500 text-[10px] sm:text-xs font-medium">人気NOTEとカテゴリ</div>
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
                  販売: {topNote.purchase_count}件 / {topNote.points_earned.toLocaleString()}P
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
            </>
          )}

          {/* Buyer Dashboard */}
          {dashboardType === 'buyer' && (
            <>
              <div className="mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-wider text-slate-300/80">現在のポイント残高</p>
                      <p className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900">
                        {pointBalance.toLocaleString()} <span className="text-base text-slate-500 font-normal">P</span>
                      </p>
                      <p className="mt-2 text-xs sm:text-sm text-slate-500">
                        残高はリアルタイムで更新されます。購入履歴は下の一覧で確認できます。
                      </p>
                    </div>
                    <Link
                      href="/points/purchase"
                      className="inline-flex items-center justify-center rounded-xl border border-blue-500 bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                    >
                      ポイントを購入する
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">購入履歴</h2>
                      <span className="text-xs text-slate-500">{purchaseHistory.length}件</span>
                    </div>
                    {purchaseHistory.length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-100 py-12 text-center">
                        <h3 className="text-base font-medium text-slate-900 mb-2">購入履歴がまだありません</h3>
                        <p className="text-sm text-slate-500">
                          購入が完了すると、ここに明細が表示されます。
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {purchaseHistory.map((transaction: any) => (
                          <div key={transaction.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{transaction.description}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(transaction.created_at).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-rose-500">
                              -{Math.abs(transaction.amount || 0).toLocaleString()} P
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">人気の公開LP</h2>
                      <span className="text-xs text-slate-400">直近のトレンド</span>
                    </div>
                    {popularProducts.length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-100 py-10 text-center text-sm text-slate-500">
                        現在人気の公開LPはありません
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {popularProducts.map((product: any) => (
                          <div
                            key={product.id}
                            className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300"
                          >
                            <Link href={`/u/${product.seller_username}`} className="flex items-center gap-3 mb-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                                {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                                @{product.seller_username}
                              </span>
                            </Link>
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{product.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="font-semibold text-blue-600">{product.price_in_points?.toLocaleString()} P</span>
                              <span className="text-slate-600">成約 {product.total_sales} 件</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">新着の公開LP</h2>
                      <span className="text-xs text-slate-400">最新アップデート</span>
                    </div>
                    {latestProducts.length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-100 py-10 text-center text-sm text-slate-500">
                        現在新着の公開LPはありません
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {latestProducts.map((product: any) => (
                          <div
                            key={product.id}
                            className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300"
                          >
                            <Link href={`/u/${product.seller_username}`} className="flex items-center gap-3 mb-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                                {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
                                @{product.seller_username}
                              </span>
                            </Link>
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{product.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="font-semibold text-blue-600">{product.price_in_points?.toLocaleString()} P</span>
                              <span className="text-emerald-600">NEW</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">ポイント利用サマリー</p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-slate-600">
                        <dt className="text-slate-500">累計使用ポイント</dt>
                        <dd className="font-semibold text-slate-900">{totalPointsUsed.toLocaleString()} P</dd>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <dt className="text-slate-500">平均購入ポイント</dt>
                        <dd className="font-semibold text-slate-900">{averagePointsUsed.toLocaleString()} P</dd>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <dt className="text-slate-500">直近の購入</dt>
                        <dd className="font-semibold text-slate-900">{lastPurchaseDateLabel}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">購入に関するメモ</h3>
                    <ul className="space-y-3 text-xs text-slate-500">
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                        <span>1ポイント = 1円としてご利用いただけます。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                        <span>購入後のポイントに有効期限はありません。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                        <span>大口購入をご希望の場合はサポートまでお問い合わせください。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                        <span>決済サービスとの連携は現在準備中です。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">購入状況のサマリー</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">総購入回数</span>
                        <span className="font-semibold text-slate-900">{purchaseHistory.length}回</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">総使用ポイント</span>
                        <span className="font-semibold text-slate-900">{totalPointsUsed.toLocaleString()} P</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">購入商品数</span>
                        <span className="font-semibold text-slate-900">{purchaseHistory.length}個</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Dashboard */}
          {dashboardType === 'settings' && (
            <>
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">アカウント設定</h2>

                {/* Current User Info */}
                <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">現在の情報</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">メールアドレス</label>
                      <div className="text-white font-medium">{user?.email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">ユーザー名</label>
                      <div className="text-white font-medium">{user?.username}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">ポイント残高</label>
                      <div className="text-white font-medium">{pointBalance.toLocaleString()} P</div>
                    </div>
                    {profilePageUrl && (
                      <div>
                        <label className="text-sm text-slate-400">プロフィールページ</label>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                          <input
                            value={profilePageUrl}
                            readOnly
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm truncate"
                          />
                          <button
                            type="button"
                            onClick={handleCopyProfileLink}
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                          >
                            {profileLinkCopied ? 'コピー済み' : 'リンクをコピー'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Update Form */}
                <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">プロフィール更新</h3>
                  
                  <form onSubmit={handleUsernameChange} className="space-y-4">
                    <div>
                      <label htmlFor="newUsername" className="block text-sm font-medium text-slate-300 mb-2">
                        新しいユーザー名
                      </label>
                      <input
                        id="newUsername"
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="新しいユーザー名を入力"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        3-20文字、英数字とアンダースコア（_）のみ使用可能
                      </p>
                    </div>

                    {usernameError && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {usernameError}
                      </div>
                    )}

                    {updateSuccess && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                        <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                        ユーザー名を更新しました
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      更新する
                    </button>
                  </form>
                </div>

                <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">公開プロフィール設定</h3>

                  <form onSubmit={handleProfileInfoSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="profileBio" className="block text-sm font-medium text-slate-300 mb-2">
                        自己紹介
                      </label>
                      <textarea
                        id="profileBio"
                        value={profileBio}
                        maxLength={600}
                        onChange={(e) => {
                          setProfileBio(e.target.value);
                          setProfileUpdateError('');
                        }}
                        placeholder="あなたやビジネスの紹介を入力してください"
                        className="w-full min-h-[100px] px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                      <div className="mt-1 text-xs text-slate-500 text-right">{profileBio.length}/600</div>
                    </div>

                    <div>
                      <label htmlFor="profileSnsUrl" className="block text-sm font-medium text-slate-300 mb-2">
                        SNSリンク
                      </label>
                      <input
                        id="profileSnsUrl"
                        type="url"
                        value={profileSnsUrl}
                        onChange={(e) => {
                          setProfileSnsUrl(e.target.value);
                          setProfileUpdateError('');
                        }}
                        placeholder="https://"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">例: X（旧Twitter）やInstagramなどのプロフィールURL</p>
                    </div>

                    <div>
                      <label htmlFor="profileLineUrl" className="block text-sm font-medium text-slate-300 mb-2">
                        公式LINEリンク
                      </label>
                      <input
                        id="profileLineUrl"
                        type="url"
                        value={profileLineUrl}
                        onChange={(e) => {
                          setProfileLineUrl(e.target.value);
                          setProfileUpdateError('');
                        }}
                        placeholder="https://"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">例: https://lin.ee/ から始まるリンク</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">プロフィール画像</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-white text-xl">
                          {profileImageUrl ? (
                            <img src={profileImageUrl} alt="プロフィール画像プレビュー" className="w-full h-full object-cover" />
                          ) : (
                            user?.username?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${isUploadingProfileImage ? 'bg-slate-700 text-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                              <input
                                ref={profileImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageUpload}
                                className="hidden"
                              />
                              {isUploadingProfileImage ? 'アップロード中…' : '画像を選択'}
                            </label>
                            {profileImageUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveProfileImage}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50"
                              >
                                画像をクリア
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={profileImageUrl}
                            onChange={(e) => {
                              setProfileImageUrl(e.target.value);
                              setProfileUpdateError('');
                            }}
                            placeholder="カスタム画像URLを入力することもできます"
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {profileUpdateError && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                        {profileUpdateError}
                      </div>
                    )}

                    {profileUpdateSuccess && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm">
                        <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                        公開プロフィールを更新しました
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingProfileInfo}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isSavingProfileInfo
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isSavingProfileInfo ? '更新中…' : '保存する'}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

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
      </main>

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
    </div>
  );
}
