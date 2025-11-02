'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  EyeSlashIcon,
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import AdminShell, { AdminPageTab } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getCategoryLabel } from '@/lib/noteCategories';
import { redirectToLogin } from '@/lib/navigation';
import type {
  AdminMarketplaceLP,
  AdminPointAnalytics,
  AdminPointAnalyticsBreakdown,
  AdminUserDetail,
  AdminUserSummary,
  AdminAnnouncement,
  ModerationEvent,
  MaintenanceMode,
  MaintenanceOverview,
  SystemStatusCheck,
  ShareOverviewStats,
  ShareTopCreator,
  ShareTopNote,
  ShareLogItem,
  ShareFraudAlert,
  ShareRewardSettings,
} from '@/types';
import NoteModerationCenter from '@/components/admin/note-moderation/NoteModerationCenter';
import SalonManagementCenter from '@/components/admin/salon-management/SalonManagementCenter';

type TabKey =
  | 'users'
  | 'moderation'
  | 'salons'
  | 'share-management'
  | 'marketplace'
  | 'analytics'
  | 'announcements'
  | 'logs';

const TABS: Array<AdminPageTab & { id: TabKey }> = [
  { id: 'users', label: 'ユーザー管理', icon: UserGroupIcon },
  { id: 'moderation', label: 'NOTEモデレーション', icon: DocumentMagnifyingGlassIcon },
  { id: 'salons', label: 'サロン管理', icon: AcademicCapIcon },
  { id: 'share-management', label: 'NOTEシェア管理', icon: ShareIcon },
  { id: 'marketplace', label: 'マーケット監視', icon: BuildingStorefrontIcon },
  { id: 'analytics', label: 'ポイント分析', icon: ChartBarIcon },
  { id: 'announcements', label: 'お知らせ管理', icon: MegaphoneIcon },
  { id: 'logs', label: 'モデレーションログ', icon: DocumentTextIcon },
];

const formatNumber = (value: number) => new Intl.NumberFormat('ja-JP').format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? '-';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatPoints = (value: number) => `${formatNumber(value)} P`;

type ApiErrorResponse = {
  detail?: string;
};

type AdminUserListApiResponse = {
  data?: AdminUserSummary[];
  total?: number;
};

type AdminUserDetailApiResponse = AdminUserDetail;

type AdminMarketplaceApiResponse = {
  data?: AdminMarketplaceLP[];
  total?: number;
};

type AdminPointAnalyticsApiResponse = AdminPointAnalytics | null;

type ModerationLogApiResponse = {
  data?: ModerationEvent[];
};

type AdminAnnouncementsApiResponse = {
  data?: AdminAnnouncement[];
  total?: number;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? fallback;
  }
  return fallback;
};

const defaultAnnouncementPublishedAt = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const MAINTENANCE_SCOPE_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'global', label: '全体' },
  { value: 'lp', label: 'ランディングページ' },
  { value: 'note', label: 'NOTE' },
  { value: 'salon', label: 'サロン' },
  { value: 'points', label: 'ポイント決済' },
  { value: 'products', label: 'プロダクト' },
  { value: 'ai', label: 'AI関連' },
  { value: 'payments', label: '決済基盤' },
];

const MAINTENANCE_STATUS_BADGE: Record<MaintenanceMode['status'], string> = {
  scheduled: 'bg-amber-100 text-amber-700',
  active: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

const MAINTENANCE_STATUS_LABELS: Record<MaintenanceMode['status'], string> = {
  scheduled: '予定',
  active: '実施中',
  completed: '完了',
  cancelled: '中止',
};

const SYSTEM_STATUS_BADGE: Record<SystemStatusCheck['status'], string> = {
  healthy: 'bg-emerald-100 text-emerald-700',
  degraded: 'bg-amber-100 text-amber-700',
  down: 'bg-red-100 text-red-700',
};

const getMaintenanceScopeLabel = (scope: string) => {
  const found = MAINTENANCE_SCOPE_OPTIONS.find((option) => option.value === scope);
  return found?.label ?? scope.toUpperCase();
};

const FRAUD_SEVERITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

export default function AdminPanelPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isAdmin } = useAuthStore();

  const [activeSection, setActiveSection] = useState<TabKey>('users');
  const [pageLoading, setPageLoading] = useState(true);

  const [userSummaries, setUserSummaries] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [grantAmount, setGrantAmount] = useState<number>(1000);
  const [grantDescription, setGrantDescription] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [noteActionLoading, setNoteActionLoading] = useState(false);
  const [noteActionTarget, setNoteActionTarget] = useState<string | null>(null);

  const [marketplaceItems, setMarketplaceItems] = useState<AdminMarketplaceLP[]>([]);
  const [marketSearch, setMarketSearch] = useState('');
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<AdminPointAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [logs, setLogs] = useState<ModerationEvent[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);

  const [maintenanceModes, setMaintenanceModes] = useState<MaintenanceMode[]>([]);
  const [maintenanceOverview, setMaintenanceOverview] = useState<MaintenanceOverview | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);
  const [maintenanceScopeFilter, setMaintenanceScopeFilter] = useState<string>('all');
  const [maintenanceStatusUpdating, setMaintenanceStatusUpdating] = useState<string | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    scope: 'global',
    title: '',
    message: '',
    planned_start: '',
    planned_end: '',
  });

  const [statusChecks, setStatusChecks] = useState<SystemStatusCheck[]>([]);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const [statusCheckError, setStatusCheckError] = useState<string | null>(null);
  const [statusCheckForm, setStatusCheckForm] = useState({
    component: 'API',
    status: 'healthy',
    response_time_ms: '',
    message: '',
  });

  const [shareOverview, setShareOverview] = useState<ShareOverviewStats | null>(null);
  const [shareTopCreators, setShareTopCreators] = useState<ShareTopCreator[]>([]);
  const [shareTopNotes, setShareTopNotes] = useState<ShareTopNote[]>([]);
  const [shareLogs, setShareLogs] = useState<ShareLogItem[]>([]);
  const [shareFraudAlerts, setShareFraudAlerts] = useState<ShareFraudAlert[]>([]);
  const [shareRewardSettings, setShareRewardSettings] = useState<ShareRewardSettings | null>(null);
  const [shareOverviewLoading, setShareOverviewLoading] = useState(false);
  const [shareLogLoading, setShareLogLoading] = useState(false);
  const [shareAlertsLoading, setShareAlertsLoading] = useState(false);
  const [shareRewardSaving, setShareRewardSaving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareFilters, setShareFilters] = useState({ suspiciousOnly: false });
  const suspiciousOnly = shareFilters.suspiciousOnly;
  const [shareRewardInput, setShareRewardInput] = useState('');
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementSummary, setAnnouncementSummary] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPublishedAt, setAnnouncementPublishedAt] = useState(defaultAnnouncementPublishedAt());
  const [announcementPublished, setAnnouncementPublished] = useState(true);
  const [announcementHighlight, setAnnouncementHighlight] = useState(false);

  const [usersError, setUsersError] = useState<string | null>(null);
  const [userActionError, setUserActionError] = useState<string | null>(null);

  const resetAnnouncementForm = () => {
    setEditingAnnouncementId(null);
    setAnnouncementTitle('');
    setAnnouncementSummary('');
    setAnnouncementBody('');
    setAnnouncementPublishedAt(defaultAnnouncementPublishedAt());
    setAnnouncementPublished(true);
    setAnnouncementHighlight(false);
    setAnnouncementsError(null);
  };


  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      redirectToLogin(router);
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    const load = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchMarketplace(),
          fetchAnalytics(),
          fetchLogs(),
          fetchAnnouncements(),
          fetchMaintenanceData(maintenanceScopeFilter),
          fetchStatusCheckData(),
        ]);
      } finally {
        setPageLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (activeSection === 'announcements') {
      fetchMaintenanceData(maintenanceScopeFilter);
    }
  }, [activeSection, maintenanceScopeFilter]);

  useEffect(() => {
    if (activeSection === 'announcements') {
      fetchStatusCheckData();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'share-management') {
      fetchShareDashboard();
      fetchShareLogs(suspiciousOnly);
      fetchShareAlerts();
    }
  }, [activeSection, suspiciousOnly]);

  const fetchUsers = async (search?: string) => {
    setUsersLoading(true);
    try {
      const response = await adminApi.listUsers({ search, limit: 100 });
      const payload = response.data as AdminUserListApiResponse;
      const summaries = Array.isArray(payload.data) ? payload.data : [];
      setUserSummaries(summaries);
      setUsersError(null);

      if (selectedUserId) {
        const matched = summaries.find((item) => item.id === selectedUserId);
        if (matched) {
          setSelectedUserDetail((prev) => (prev ? { ...prev, ...matched } : prev));
        }
      }
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザー情報の取得に失敗しました');
      console.error(error);
      setUsersError(message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setUserDetailLoading(true);
    try {
      const response = await adminApi.getUserDetail(userId);
      setSelectedUserDetail(response.data as AdminUserDetailApiResponse);
      setUserActionError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザー詳細の取得に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const fetchMarketplace = async (search?: string) => {
    setMarketLoading(true);
    try {
      const response = await adminApi.listMarketplaceLPs({ search, limit: 100 });
      const payload = response.data as AdminMarketplaceApiResponse;
      const items = Array.isArray(payload.data) ? payload.data : [];
      setMarketplaceItems(items);
      setMarketError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'マーケット情報の取得に失敗しました');
      console.error(error);
      setMarketError(message);
    } finally {
      setMarketLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await adminApi.getPointAnalytics({ limit_days: 120 });
      setAnalytics((response.data as AdminPointAnalyticsApiResponse) ?? null);
      setAnalyticsError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'ポイント分析の取得に失敗しました');
      console.error(error);
      setAnalyticsError(message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await adminApi.getModerationLogs({ limit: 100 });
      const payload = response.data as ModerationLogApiResponse;
      const rows = Array.isArray(payload.data) ? payload.data : [];
      setLogs(rows);
      setLogsError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'モデレーションログの取得に失敗しました');
      console.error(error);
      setLogsError(message);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchMaintenanceData = async (scopeFilter?: string) => {
    setMaintenanceLoading(true);
    setMaintenanceError(null);
    try {
      const params = scopeFilter && scopeFilter !== 'all' ? { scope: scopeFilter } : undefined;
      const [modesResponse, overviewResponse] = await Promise.all([
        adminApi.listMaintenanceModes(params),
        adminApi.getMaintenanceOverview(),
      ]);
      setMaintenanceModes(modesResponse.data?.data ?? []);
      setMaintenanceOverview(overviewResponse.data ?? null);
    } catch (error) {
      const message = getErrorMessage(error, 'メンテナンス情報の取得に失敗しました');
      console.error(error);
      setMaintenanceError(message);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const fetchStatusCheckData = async () => {
    setStatusCheckLoading(true);
    setStatusCheckError(null);
    try {
      const response = await adminApi.listSystemStatusChecks({ limit: 100 });
      setStatusChecks(response.data?.data ?? []);
    } catch (error) {
      const message = getErrorMessage(error, 'ステータスチェックの取得に失敗しました');
      console.error(error);
      setStatusCheckError(message);
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const fetchShareDashboard = async () => {
    setShareOverviewLoading(true);
    setShareError(null);
    try {
      const [overviewRes, topCreatorsRes, topNotesRes] = await Promise.all([
        adminApi.getShareOverviewStats(),
        adminApi.getShareTopCreators({ limit: 10 }),
        adminApi.getShareTopNotes({ limit: 10 }),
      ]);
      setShareOverview(overviewRes.data ?? null);
      setShareTopCreators(topCreatorsRes.data ?? []);
      setShareTopNotes(topNotesRes.data ?? []);

      try {
        const rewardRes = await adminApi.getShareRewardSettings();
        setShareRewardSettings(rewardRes.data ?? null);
        if (rewardRes.data?.points_per_share != null) {
          setShareRewardInput(String(rewardRes.data.points_per_share));
        }
      } catch (rewardError) {
        if (isAxiosError(rewardError) && rewardError.response?.status === 404) {
          setShareRewardSettings(null);
          setShareRewardInput('');
        } else {
          throw rewardError;
        }
      }
    } catch (error) {
      const message = getErrorMessage(error, 'シェア統計の取得に失敗しました');
      console.error(error);
      setShareError(message);
    } finally {
      setShareOverviewLoading(false);
    }
  };

  const fetchShareLogs = async (suspiciousOnly: boolean) => {
    setShareLogLoading(true);
    setShareError(null);
    try {
      const response = await adminApi.listShareLogs({ limit: 100, suspicious_only: suspiciousOnly });
      setShareLogs(response.data ?? []);
    } catch (error) {
      const message = getErrorMessage(error, 'シェアログの取得に失敗しました');
      console.error(error);
      setShareError(message);
    } finally {
      setShareLogLoading(false);
    }
  };

  const fetchShareAlerts = async () => {
    setShareAlertsLoading(true);
    setShareError(null);
    try {
      const response = await adminApi.getShareFraudAlerts({ resolved: false });
      setShareFraudAlerts(response.data ?? []);
    } catch (error) {
      const message = getErrorMessage(error, '不正アラートの取得に失敗しました');
      console.error(error);
      setShareError(message);
    } finally {
      setShareAlertsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const response = await adminApi.listAnnouncements({ limit: 50 });
      const payload = response.data as AdminAnnouncementsApiResponse;
      const rows = Array.isArray(payload.data) ? payload.data : [];
      setAnnouncements(rows);
      setAnnouncementsError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'お知らせの取得に失敗しました');
      console.error(error);
      setAnnouncementsError(message);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const populateAnnouncementForm = (item: AdminAnnouncement) => {
    setEditingAnnouncementId(item.id);
    setAnnouncementTitle(item.title);
    setAnnouncementSummary(item.summary);
    setAnnouncementBody(item.body);
    const publishedAt = new Date(item.published_at);
    if (!Number.isNaN(publishedAt.getTime())) {
      const local = new Date(publishedAt.getTime() - publishedAt.getTimezoneOffset() * 60000);
      setAnnouncementPublishedAt(local.toISOString().slice(0, 16));
    } else {
      setAnnouncementPublishedAt(defaultAnnouncementPublishedAt());
    }
    setAnnouncementPublished(item.is_published);
    setAnnouncementHighlight(item.highlight);
    setAnnouncementsError(null);
  };

  const handleAnnouncementSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!announcementTitle.trim() || !announcementSummary.trim() || !announcementBody.trim()) {
      setAnnouncementsError('タイトル・サマリー・本文は必須です');
      return;
    }
    setAnnouncementSaving(true);
    try {
      const payload = {
        title: announcementTitle.trim(),
        summary: announcementSummary.trim(),
        body: announcementBody,
        published_at: announcementPublishedAt ? new Date(announcementPublishedAt).toISOString() : undefined,
        is_published: announcementPublished,
        highlight: announcementHighlight,
      };
      if (editingAnnouncementId) {
        await adminApi.updateAnnouncement(editingAnnouncementId, payload);
      } else {
        await adminApi.createAnnouncement(payload);
      }
      await fetchAnnouncements();
      resetAnnouncementForm();
      setAnnouncementsError(null);
    } catch (error) {
      const message = getErrorMessage(error, editingAnnouncementId ? 'お知らせの更新に失敗しました' : 'お知らせの作成に失敗しました');
      console.error(error);
      setAnnouncementsError(message);
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleMaintenanceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!maintenanceForm.title.trim()) {
      setMaintenanceError('タイトルは必須です');
      return;
    }
    setMaintenanceLoading(true);
    try {
      await adminApi.createMaintenanceMode({
        scope: maintenanceForm.scope as MaintenanceMode['scope'],
        title: maintenanceForm.title.trim(),
        message: maintenanceForm.message.trim() ? maintenanceForm.message.trim() : undefined,
        planned_start: maintenanceForm.planned_start ? new Date(maintenanceForm.planned_start).toISOString() : undefined,
        planned_end: maintenanceForm.planned_end ? new Date(maintenanceForm.planned_end).toISOString() : undefined,
      });
      setMaintenanceForm({ scope: maintenanceForm.scope, title: '', message: '', planned_start: '', planned_end: '' });
      await fetchMaintenanceData(maintenanceScopeFilter);
    } catch (error) {
      const message = getErrorMessage(error, 'メンテナンスの登録に失敗しました');
      console.error(error);
      setMaintenanceError(message);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleMaintenanceStatusChange = async (mode: MaintenanceMode, newStatus: MaintenanceMode['status']) => {
    const reason = window.prompt('状態更新のメモがあれば入力してください（任意）') ?? undefined;
    setMaintenanceStatusUpdating(mode.id);
    try {
      await adminApi.updateMaintenanceModeStatus(mode.id, {
        status: newStatus,
        message: reason?.trim() ? reason.trim() : undefined,
      });
      await fetchMaintenanceData(maintenanceScopeFilter);
    } catch (error) {
      const message = getErrorMessage(error, 'メンテナンス状態の更新に失敗しました');
      console.error(error);
      setMaintenanceError(message);
    } finally {
      setMaintenanceStatusUpdating(null);
    }
  };

  const handleStatusCheckSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusCheckLoading(true);
    try {
      await adminApi.createSystemStatusCheck({
        component: statusCheckForm.component.trim() || 'API',
        status: statusCheckForm.status as SystemStatusCheck['status'],
        response_time_ms: statusCheckForm.response_time_ms ? Number(statusCheckForm.response_time_ms) : undefined,
        message: statusCheckForm.message.trim() ? statusCheckForm.message.trim() : undefined,
      });
      setStatusCheckForm({ component: statusCheckForm.component, status: statusCheckForm.status, response_time_ms: '', message: '' });
      await fetchStatusCheckData();
    } catch (error) {
      const message = getErrorMessage(error, 'ステータスチェックの登録に失敗しました');
      console.error(error);
      setStatusCheckError(message);
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const handleShareRewardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(shareRewardInput);
    if (Number.isNaN(parsed) || parsed < 0) {
      setShareError('報酬レートは0以上の数値で入力してください');
      return;
    }
    setShareRewardSaving(true);
    try {
      await adminApi.updateShareRewardSettings({ points_per_share: parsed });
      await fetchShareDashboard();
    } catch (error) {
      const message = getErrorMessage(error, '報酬レートの更新に失敗しました');
      console.error(error);
      setShareError(message);
    } finally {
      setShareRewardSaving(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      setShareAlertsLoading(true);
      await adminApi.resolveShareFraudAlert(alertId);
      await fetchShareAlerts();
    } catch (error) {
      const message = getErrorMessage(error, 'アラートの解決に失敗しました');
      console.error(error);
      setShareError(message);
    } finally {
      setShareAlertsLoading(false);
    }
  };

  const handleAnnouncementEdit = (item: AdminAnnouncement) => {
    populateAnnouncementForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnnouncementDelete = async (announcementId: string) => {
    const target = announcements.find((item) => item.id === announcementId);
    const confirmed = window.confirm(`${target?.title ?? 'お知らせ'}を削除しますか？`);
    if (!confirmed) return;
    setAnnouncementSaving(true);
    try {
      await adminApi.deleteAnnouncement(announcementId);
      if (editingAnnouncementId === announcementId) {
        resetAnnouncementForm();
      }
      await fetchAnnouncements();
    } catch (error) {
      const message = getErrorMessage(error, 'お知らせの削除に失敗しました');
      console.error(error);
      setAnnouncementsError(message);
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserDetail(userId);
  };

  const handleGrantPoints = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) return;
    if (grantAmount === 0) {
      alert('付与ポイント数を入力してください');
      return;
    }

    setUserActionLoading(true);
    try {
      await adminApi.grantPoints({
        user_id: selectedUserId,
        amount: grantAmount,
        description: grantDescription || undefined,
      });
      setUserActionError(null);
      await Promise.all([fetchUsers(userSearch), fetchUserDetail(selectedUserId)]);
      setGrantAmount(1000);
      setGrantDescription('');
    } catch (error) {
      const message = getErrorMessage(error, 'ポイント付与に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const getNoteTitle = (noteId: string) =>
    selectedUserDetail?.notes.find((note) => note.id === noteId)?.title ?? 'NOTE';

  const handleUnpublishNote = async (noteId: string) => {
    if (!selectedUserId) return;
    const title = getNoteTitle(noteId);
    const confirmed = window.confirm(`${title} を非公開にしますか？`);
    if (!confirmed) return;
    setNoteActionTarget(noteId);
    setNoteActionLoading(true);
    try {
      await adminApi.unpublishUserNote(selectedUserId, noteId, {});
      await Promise.all([
        fetchUserDetail(selectedUserId),
        fetchUsers(userSearch ? userSearch : undefined),
      ]);
      setUserActionError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'NOTEの非公開化に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setNoteActionLoading(false);
      setNoteActionTarget(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedUserId) return;
    const title = getNoteTitle(noteId);
    const confirmed = window.confirm(`${title} を削除しますか？この操作は取り消せません。`);
    if (!confirmed) return;
    setNoteActionTarget(noteId);
    setNoteActionLoading(true);
    try {
      await adminApi.deleteUserNote(selectedUserId, noteId, {});
      await Promise.all([
        fetchUserDetail(selectedUserId),
        fetchUsers(userSearch ? userSearch : undefined),
      ]);
      setUserActionError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'NOTEの削除に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setNoteActionLoading(false);
      setNoteActionTarget(null);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUserId) return;
    setUserActionLoading(true);
    try {
      await adminApi.blockUser(selectedUserId, { reason: blockReason || undefined });
      setUserActionError(null);
      await Promise.all([fetchUsers(userSearch), fetchUserDetail(selectedUserId)]);
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザーブロックに失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUserId) return;
    setUserActionLoading(true);
    try {
      await adminApi.unblockUser(selectedUserId);
      setUserActionError(null);
      setBlockReason('');
      await Promise.all([fetchUsers(userSearch), fetchUserDetail(selectedUserId)]);
    } catch (error) {
      const message = getErrorMessage(error, 'ブロック解除に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId || !selectedUserDetail) return;
    const confirmed = window.confirm(`${selectedUserDetail.username} を削除しますか？この操作は取り消せません。`);
    if (!confirmed) return;

    setUserActionLoading(true);
    try {
      await adminApi.deleteUser(selectedUserId);
      setUserActionError(null);
      setSelectedUserId(null);
      setSelectedUserDetail(null);
      await fetchUsers(userSearch);
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザー削除に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUpdateLPStatus = async (lpId: string, status: 'published' | 'archived') => {
    let reason: string | undefined;
    if (status === 'archived') {
      reason = window.prompt('非公開理由を入力してください') || undefined;
    }

    setMarketLoading(true);
    try {
      await adminApi.updateLPStatus(lpId, { status, reason });
      await fetchMarketplace(marketSearch);
      setMarketError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'LPステータスの更新に失敗しました');
      console.error(error);
      setMarketError(message);
    } finally {
      setMarketLoading(false);
    }
  };

  const totals = analytics?.totals;

  const topDailyBreakdown = useMemo<AdminPointAnalyticsBreakdown[]>(() => {
    if (!analytics) return [];
    return analytics.daily.slice(0, 14);
  }, [analytics]);

  const activeMaintenanceModes = useMemo(() => maintenanceModes.filter((mode) => mode.status === 'active'), [maintenanceModes]);

  const nextScheduledMaintenance = useMemo(() => {
    const scheduled = maintenanceModes.filter((mode) => mode.status === 'scheduled');
    if (scheduled.length === 0) return null;
    return [...scheduled].sort((a, b) => {
      const aTime = new Date(a.planned_start ?? a.created_at).getTime();
      const bTime = new Date(b.planned_start ?? b.created_at).getTime();
      return aTime - bTime;
    })[0];
  }, [maintenanceModes]);

  const latestStatusCheck = useMemo(() => (statusChecks.length > 0 ? statusChecks[0] : null), [statusChecks]);

  const handleRefreshAll = async () => {
    setPageLoading(true);
    try {
      await Promise.all([
        fetchUsers(userSearch),
        fetchMarketplace(marketSearch),
        fetchAnalytics(),
        fetchLogs(),
        fetchAnnouncements(),
        fetchMaintenanceData(maintenanceScopeFilter),
        fetchStatusCheckData(),
      ]);
    } finally {
      setPageLoading(false);
    }
  };

  if (!isInitialized || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">管理者パネルを読み込んでいます...</div>
      </div>
    );
  }

  return (
    <AdminShell
      pageTitle="管理者ダッシュボード"
      pageSubtitle="運営状況と審査案件をリアルタイムに把握"
      sideNavItems={TABS}
      activeSideNav={activeSection}
      onSideNavChange={(tabId) => setActiveSection(tabId as TabKey)}
      sideNavTitle="管理メニュー"
      headerActions={
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
          最新情報に更新
        </button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6 sm:px-6 lg:px-8">
          {activeSection === 'users' && (
            <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6 xl:gap-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg shadow-gray-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">ユーザー一覧</h2>
                    <p className="text-xs text-gray-500 mt-1">検索・フィルタで対象ユーザーを絞り込み、詳細操作を行えます。</p>
                  </div>
                  <button
                    onClick={() => fetchUsers(userSearch)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    更新
                  </button>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    fetchUsers(userSearch);
                  }}
                  className="flex flex-col sm:flex-row gap-3 mb-4"
                >
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="ユーザー名・メールアドレスで検索"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      検索
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearch('');
                        fetchUsers();
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      リセット
                    </button>
                  </div>
                </form>

                {usersError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {usersError}
                  </div>
                )}

                <div className="hidden xl:block border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 grid grid-cols-8 gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span>ユーザー</span>
                    <span className="col-span-2">メール</span>
                    <span>ポイント</span>
                    <span>NOTE</span>
                    <span>LP</span>
                    <span>LINE</span>
                    <span>ステータス</span>
                  </div>
                  <div className="max-h-[540px] overflow-y-auto divide-y divide-gray-200">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
                        読み込み中...
                      </div>
                    ) : userSummaries.length === 0 ? (
                      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
                        ユーザーが見つかりません
                      </div>
                    ) : (
                      userSummaries.map((summary) => {
                        const isSelected = summary.id === selectedUserId;
                        return (
                          <button
                            key={summary.id}
                            onClick={() => handleSelectUser(summary.id)}
                            className={`grid grid-cols-8 gap-3 px-4 py-3 text-left transition-colors ${
                              isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-gray-700'
                            }`}
                          >
                            <div className="truncate text-sm font-semibold">{summary.username}</div>
                            <div className="col-span-2 truncate text-xs text-gray-500">{summary.email}</div>
                            <div className="text-sm font-semibold text-gray-900">{formatNumber(summary.point_balance)}</div>
                            <div className="text-xs text-gray-500">
                              <div>
                                {summary.total_note_count} 件
                                <span className="text-[10px] text-gray-600"> / 公開 {summary.published_note_count}</span>
                              </div>
                              <div className="text-[10px] text-gray-600 truncate">
                                {summary.latest_note_title ? summary.latest_note_title : '最新なし'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{summary.total_lp_count} 件</div>
                            <div className="text-xs">
                              {summary.line_connected ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700 text-[10px]">
                                    連携済み
                                  </span>
                                  {summary.line_bonus_awarded && (
                                    <span className="text-[10px] text-green-600">🎁 300P</span>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-gray-500 text-[10px]">
                                  未連携
                                </span>
                              )}
                            </div>
                            <div className="text-xs">
                              {summary.is_blocked ? (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-red-600">BLOCKED</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">ACTIVE</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="xl:hidden space-y-3">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-10 text-gray-500 text-sm">読み込み中...</div>
                  ) : userSummaries.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-gray-500 text-sm">ユーザーが見つかりません</div>
                  ) : (
                    userSummaries.map((summary) => {
                      const isSelected = summary.id === selectedUserId;
                      return (
                        <button
                          key={summary.id}
                          onClick={() => handleSelectUser(summary.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{summary.username}</div>
                              <div className="text-xs text-gray-500 break-all">{summary.email}</div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <div>{formatNumber(summary.point_balance)} P</div>
                                <div>{summary.total_lp_count} LP</div>
                                <div>
                                  {summary.total_note_count} NOTE
                                  <span className="text-[10px] text-gray-600"> / 公開 {summary.published_note_count}</span>
                                </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2 text-xs flex-wrap">
                            <span className="text-gray-500">ユーザー種別: {summary.user_type}</span>
                            <div className="flex items-center gap-2">
                              {summary.line_connected ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                                  LINE連携 {summary.line_bonus_awarded && '🎁'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                                  LINE未連携
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                                  summary.is_blocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {summary.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                                最新NOTE: {summary.latest_note_title ? summary.latest_note_title : 'なし'}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="xl:hidden">
                  {userDetailLoading ? (
                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-center text-gray-500">
                      詳細を読み込み中...
                    </div>
                  ) : !selectedUserDetail ? (
                    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center text-gray-500 text-sm">
                      ユーザーを選択すると詳細が表示されます
                    </div>
                  ) : (
                    <div className="mt-4 space-y-5 rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-gray-900">{selectedUserDetail.username}</h2>
                        <p className="text-xs text-gray-500 break-all">{selectedUserDetail.email}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{selectedUserDetail.user_type}</span>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">登録日: {formatDateTime(selectedUserDetail.created_at)}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                              selectedUserDetail.is_blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {selectedUserDetail.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-[11px] text-gray-500">ポイント残高</p>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.point_balance)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-[11px] text-gray-500">総購入ポイント</p>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.total_point_purchased)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-[11px] text-gray-500">マーケット利用ポイント</p>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.total_point_spent)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-[11px] text-gray-500">管理者付与累計</p>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.total_point_granted)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-[11px] text-gray-500">NOTE作成数</p>
                          <p className="mt-1 text-xl font-semibold text-gray-900">{formatNumber(selectedUserDetail.total_note_count)} 件</p>
                          <p className="text-[10px] text-gray-600 mt-1">
                            公開 {formatNumber(selectedUserDetail.published_note_count)} / 最新{' '}
                            {selectedUserDetail.latest_note_updated_at ? formatDateTime(selectedUserDetail.latest_note_updated_at) : 'なし'}
                          </p>
                        </div>
                      </div>

                      <div className={`rounded-xl border p-3 ${selectedUserDetail.line_connected ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-gray-500">LINE連携状態</p>
                          {selectedUserDetail.line_connected ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                              連携済み
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                              未連携
                            </span>
                          )}
                        </div>
                        {selectedUserDetail.line_connected ? (
                          <div className="mt-2 space-y-1">
                            {selectedUserDetail.line_display_name && (
                              <p className="text-sm text-gray-800">表示名: {selectedUserDetail.line_display_name}</p>
                            )}
                            {selectedUserDetail.line_bonus_awarded ? (
                              <p className="text-xs text-green-600">🎁 ボーナス300P付与済み</p>
                            ) : (
                              <p className="text-xs text-yellow-600">⏳ ボーナス未付与</p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-gray-600">LINE公式アカウント未連携</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-900">ブロック制御</span>
                          <span className="text-gray-500">
                            {selectedUserDetail.blocked_at ? `最終更新: ${formatDateTime(selectedUserDetail.blocked_at)}` : '未ブロック'}
                          </span>
                        </div>
                        {selectedUserDetail.blocked_reason && (
                          <div className="rounded-lg border border-red-500/30 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                            現在のブロック理由: {selectedUserDetail.blocked_reason}
                          </div>
                        )}
                        <textarea
                          value={blockReason}
                          onChange={(event) => setBlockReason(event.target.value)}
                          placeholder="ブロック理由 (任意)"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleBlockUser}
                            disabled={userActionLoading}
                            className="flex-1 rounded-xl bg-red-600 text-white text-sm font-semibold px-4 py-2 hover:bg-red-700 disabled:opacity-60"
                          >
                            ユーザーをブロック
                          </button>
                          <button
                            onClick={handleUnblockUser}
                            disabled={userActionLoading}
                            className="flex-1 rounded-xl bg-emerald-600 text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
                          >
                            ブロック解除
                          </button>
                          <button
                            onClick={handleDeleteUser}
                            disabled={userActionLoading}
                            className="flex-1 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            ユーザー削除
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleGrantPoints} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">ポイント手動調整</h3>
                          <span className="text-xs text-gray-500">正数で付与、負数で減算</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="number"
                            value={grantAmount}
                            onChange={(event) => setGrantAmount(Number(event.target.value))}
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={grantDescription}
                            onChange={(event) => setGrantDescription(event.target.value)}
                            placeholder="付与・減算理由"
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={userActionLoading}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            実行
                          </button>
                        </div>
                      </form>

                      {userActionError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                          {userActionError}
                        </div>
                      )}

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">NOTE 管理</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.notes.map((note) => {
                            const isProcessing = noteActionLoading && noteActionTarget === note.id;
                            return (
                              <div key={note.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">{note.title || '無題NOTE'}</div>
                                    <div className="text-[10px] text-gray-600">slug: {note.slug}</div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 text-[10px]">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${
                                        note.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      {note.status === 'published' ? '公開中' : '下書き'}
                                    </span>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                                        note.is_paid ? 'bg-amber-500/20 text-amber-200' : 'bg-gray-200 text-gray-500'
                                      }`}
                                    >
                                      {note.is_paid ? `${formatNumber(note.price_points)} P` : 'FREE'}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                                  <span>購入数: {formatNumber(note.total_purchases)}</span>
                                  <span>更新: {formatDateTime(note.updated_at)}</span>
                                </div>
                                {Array.isArray(note.categories) && note.categories.length > 0 ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {note.categories.map((category) => (
                                      <span
                                        key={`${note.id}-${category}`}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
                                      >
                                        #{getCategoryLabel(category)}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {note.status === 'published' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUnpublishNote(note.id)}
                                      disabled={isProcessing}
                                      className={`inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-600 ${
                                        isProcessing ? 'opacity-60' : 'hover:border-blue-400'
                                      }`}
                                    >
                                      <EyeSlashIcon className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                      非公開
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={isProcessing}
                                    className={`inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-[11px] font-semibold text-red-600 ${
                                      isProcessing ? 'opacity-60' : 'hover:border-red-600'
                                    }`}
                                  >
                                    <TrashIcon className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                    削除
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {selectedUserDetail.notes.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center text-xs text-gray-500">
                              NOTEがまだ作成されていません
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">最新トランザクション</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.transactions.slice(0, 6).map((tx) => (
                            <div key={tx.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">{tx.transaction_type}</span>
                                <span className={tx.amount >= 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                                  {formatPoints(tx.amount)}
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] text-gray-500">{formatDateTime(tx.created_at)}</div>
                              <div className="mt-1 text-[11px] text-gray-500 break-all">{tx.description || '-'}</div>
                            </div>
                          ))}
                          {selectedUserDetail.transactions.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-500">
                              トランザクションがありません
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">LP 作成履歴</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.landing_pages.slice(0, 6).map((lp) => (
                            <div key={lp.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                              <div className="text-gray-900 font-semibold">{lp.title}</div>
                              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                                <span>ステータス: {lp.status}</span>
                                <span>ビュー: {formatNumber(lp.total_views)}</span>
                              </div>
                              <div className="mt-1 text-[11px] text-gray-500">CTA: {formatNumber(lp.total_cta_clicks)}</div>
                            </div>
                          ))}
                          {selectedUserDetail.landing_pages.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-500">
                              LP作成履歴がありません
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">商品購入履歴</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.purchase_history.slice(0, 6).map((purchase) => (
                            <div key={purchase.transaction_id} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                              <div className="text-gray-900 font-semibold">{purchase.product_title || '-'}</div>
                              <div className="mt-1 text-[11px] text-gray-500 break-all">{purchase.description || '-'}</div>
                              <div className="mt-1 flex items-center justify-between text-[11px]">
                                <span className="text-red-600 font-semibold">{formatPoints(purchase.amount)}</span>
                                <span className="text-gray-500">{formatDateTime(purchase.created_at)}</span>
                              </div>
                            </div>
                          ))}
                          {selectedUserDetail.purchase_history.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-500">
                              商品購入履歴がありません
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden xl:block rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                {userDetailLoading ? (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    詳細を読み込み中...
                  </div>
                ) : !selectedUserDetail ? (
                  <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                    ユーザーを選択すると詳細が表示されます
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedUserDetail.username}</h2>
                      <p className="text-sm text-gray-500">{selectedUserDetail.email}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{selectedUserDetail.user_type}</span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">登録日: {formatDateTime(selectedUserDetail.created_at)}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                            selectedUserDetail.is_blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {selectedUserDetail.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">ポイント残高</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.point_balance)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">総購入ポイント</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.total_point_purchased)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">マーケット利用ポイント</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.total_point_spent)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">管理者付与累計</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPoints(selectedUserDetail.total_point_granted)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-xs text-gray-500">NOTE 作成数</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                          {formatNumber(selectedUserDetail.total_note_count)} 件
                        </p>
                        <p className="text-[11px] text-gray-600 mt-1">
                          公開 {formatNumber(selectedUserDetail.published_note_count)} / 最新更新{' '}
                          {selectedUserDetail.latest_note_updated_at ? formatDateTime(selectedUserDetail.latest_note_updated_at) : 'なし'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">ブロック制御</h3>
                        <div className="text-xs text-gray-500">
                          {selectedUserDetail.blocked_at ? `最終更新: ${formatDateTime(selectedUserDetail.blocked_at)}` : '未ブロック'}
                        </div>
                      </div>
                      {selectedUserDetail.blocked_reason && (
                        <div className="text-xs text-red-600">
                          現在のブロック理由: {selectedUserDetail.blocked_reason}
                        </div>
                      )}
                      <textarea
                        value={blockReason}
                        onChange={(event) => setBlockReason(event.target.value)}
                        placeholder="ブロック理由 (任意)"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleBlockUser}
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                        >
                          ユーザーをブロック
                        </button>
                        <button
                          onClick={handleUnblockUser}
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-600/80 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60"
                        >
                          ブロック解除
                        </button>
                        <button
                          onClick={handleDeleteUser}
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-white text-red-600 text-sm font-semibold border border-red-200 hover:bg-red-50 disabled:opacity-60"
                        >
                          ユーザー削除
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleGrantPoints} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">ポイント手動調整</h3>
                        <span className="text-xs text-gray-500">正数で付与、負数で減算</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="number"
                          value={grantAmount}
                          onChange={(event) => setGrantAmount(Number(event.target.value))}
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={grantDescription}
                          onChange={(event) => setGrantDescription(event.target.value)}
                          placeholder="メモ (任意)"
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                          実行
                        </button>
                      </div>
                    </form>

                    {userActionError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                        {userActionError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">最新トランザクション</h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-gray-600">
                          <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                              <th className="px-3 py-2 text-left">日時</th>
                              <th className="px-3 py-2 text-left">タイプ</th>
                              <th className="px-3 py-2 text-right">ポイント</th>
                              <th className="px-3 py-2 text-left">メモ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200/70">
                            {selectedUserDetail.transactions.slice(0, 8).map((tx) => (
                              <tr key={tx.id}>
                                <td className="px-3 py-2 text-xs text-gray-500">{formatDateTime(tx.created_at)}</td>
                                <td className="px-3 py-2 text-xs">{tx.transaction_type}</td>
                                <td className={`px-3 py-2 text-right text-sm font-semibold ${tx.amount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                  {formatPoints(tx.amount)}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{tx.description || '-'}</td>
                              </tr>
                            ))}
                            {selectedUserDetail.transactions.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                                  トランザクションがありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">NOTE 管理</h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-gray-600">
                          <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                              <th className="px-3 py-2 text-left">タイトル</th>
                              <th className="px-3 py-2 text-left">ステータス</th>
                              <th className="px-3 py-2 text-right">価格</th>
                              <th className="px-3 py-2 text-right">購入数</th>
                              <th className="px-3 py-2 text-left">更新</th>
                              <th className="px-3 py-2 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200/70">
                            {selectedUserDetail.notes.map((note) => {
                              const isProcessing = noteActionLoading && noteActionTarget === note.id;
                              return (
                                <tr key={note.id} className="align-top">
                                  <td className="px-3 py-2 text-xs text-gray-500">
                                    <div className="font-semibold text-gray-900">{note.title || '無題NOTE'}</div>
                                    <div className="text-[10px] text-gray-600">slug: {note.slug}</div>
                                    {Array.isArray(note.categories) && note.categories.length > 0 ? (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {note.categories.map((category) => (
                                          <span
                                            key={`${note.id}-${category}-table`}
                                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
                                          >
                                            #{getCategoryLabel(category)}
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </td>
                                  <td className="px-3 py-2 text-xs">
                                    <div className="inline-flex items-center gap-1">
                                      <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                          note.status === 'published'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                      >
                                        {note.status === 'published' ? '公開中' : '下書き'}
                                      </span>
                                      <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                                          note.is_paid ? 'bg-amber-500/20 text-amber-200' : 'bg-gray-200 text-gray-500'
                                        }`}
                                      >
                                        {note.is_paid ? '有料' : '無料'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right text-xs text-gray-600">
                                    {note.is_paid ? formatNumber(note.price_points) + ' P' : 'FREE'}
                                  </td>
                                  <td className="px-3 py-2 text-right text-xs text-gray-600">{formatNumber(note.total_purchases)}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{formatDateTime(note.updated_at)}</td>
                                  <td className="px-3 py-2 text-right text-xs">
                                    <div className="flex justify-end gap-2">
                                      {note.status === 'published' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUnpublishNote(note.id)}
                                          disabled={isProcessing}
                                          className={`inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:border-blue-400 ${
                                            isProcessing ? 'opacity-60' : ''
                                          }`}
                                        >
                                          <EyeSlashIcon className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                          非公開
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteNote(note.id)}
                                        disabled={isProcessing}
                                        className={`inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-[11px] font-semibold text-red-600 hover:border-red-600 ${
                                          isProcessing ? 'opacity-60' : ''
                                        }`}
                                      >
                                        <TrashIcon className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                        削除
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {selectedUserDetail.notes.length === 0 && (
                              <tr>
                                <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">
                                  NOTEがまだ作成されていません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">LP 作成履歴</h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-gray-600">
                          <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                              <th className="px-3 py-2 text-left">タイトル</th>
                              <th className="px-3 py-2 text-left">ステータス</th>
                              <th className="px-3 py-2 text-right">ビュー</th>
                              <th className="px-3 py-2 text-right">CTA</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200/70">
                            {selectedUserDetail.landing_pages.slice(0, 6).map((lp) => (
                              <tr key={lp.id}>
                                <td className="px-3 py-2 text-xs text-gray-500">{lp.title}</td>
                                <td className="px-3 py-2 text-xs">{lp.status}</td>
                                <td className="px-3 py-2 text-right text-xs">{formatNumber(lp.total_views)}</td>
                                <td className="px-3 py-2 text-right text-xs">{formatNumber(lp.total_cta_clicks)}</td>
                              </tr>
                            ))}
                            {selectedUserDetail.landing_pages.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                                  LP作成履歴がありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">商品購入履歴</h3>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-gray-600">
                          <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                              <th className="px-3 py-2 text-left">商品</th>
                              <th className="px-3 py-2 text-left">メモ</th>
                              <th className="px-3 py-2 text-right">ポイント</th>
                              <th className="px-3 py-2 text-left">日時</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200/70">
                            {selectedUserDetail.purchase_history.slice(0, 6).map((purchase) => (
                              <tr key={purchase.transaction_id}>
                                <td className="px-3 py-2 text-xs text-gray-500">{purchase.product_title || '-'}</td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{purchase.description || '-'}</td>
                                <td className="px-3 py-2 text-right text-xs text-red-600">{formatPoints(purchase.amount)}</td>
                                <td className="px-3 py-2 text-xs text-gray-500">{formatDateTime(purchase.created_at)}</td>
                              </tr>
                            ))}
                            {selectedUserDetail.purchase_history.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                                  商品購入履歴がありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeSection === 'moderation' && <NoteModerationCenter />}
          {activeSection === 'salons' && <SalonManagementCenter />}

          {activeSection === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">マーケット監視</h2>
                  <p className="text-xs text-gray-500 mt-1">公開中または非公開化したLPを確認し、違反コンテンツを素早く処理します。</p>
                </div>
                <button
                  onClick={() => fetchMarketplace(marketSearch)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  更新
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  fetchMarketplace(marketSearch);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={marketSearch}
                  onChange={(event) => setMarketSearch(event.target.value)}
                  placeholder="LPタイトル・スラッグで検索"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    検索
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketSearch('');
                      fetchMarketplace();
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    リセット
                  </button>
                </div>
              </form>

              {marketError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {marketError}
                </div>
              )}

              <div className="hidden sm:block border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-gray-600">
                  <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">LPタイトル</th>
                      <th className="px-4 py-3 text-left">販売者</th>
                      <th className="px-4 py-3 text-right">ビュー</th>
                      <th className="px-4 py-3 text-right">CTA</th>
                      <th className="px-4 py-3 text-left">ステータス</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/70">
                    {marketLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">読み込み中...</td>
                      </tr>
                    ) : marketplaceItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">対象のLPがありません</td>
                      </tr>
                    ) : (
                      marketplaceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                            <div className="text-xs text-gray-600">/{item.slug}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="text-gray-600">{item.seller_username}</div>
                            <div className="text-gray-600">{item.seller_email}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-xs">{formatNumber(item.total_views)}</td>
                          <td className="px-4 py-3 text-right text-xs">{formatNumber(item.total_cta_clicks)}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'archived'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleUpdateLPStatus(item.id, 'archived')}
                                className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-700"
                              >
                                非公開
                              </button>
                              <button
                                onClick={() => handleUpdateLPStatus(item.id, 'published')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/80 text-white hover:bg-emerald-600"
                              >
                                公開
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden space-y-3">
                {marketLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-500 text-sm">読み込み中...</div>
                ) : marketplaceItems.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-gray-500 text-sm">対象のLPがありません</div>
                ) : (
                  marketplaceItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 text-gray-600 space-y-3">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600 truncate">/{item.slug}</div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <span>販売者: {item.seller_username}</span>
                        <span className="break-all">{item.seller_email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>ビュー: {formatNumber(item.total_views)}</span>
                        <span>CTA: {formatNumber(item.total_cta_clicks)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            item.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'archived'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateLPStatus(item.id, 'archived')}
                            className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            非公開
                          </button>
                          <button
                            onClick={() => handleUpdateLPStatus(item.id, 'published')}
                            className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            公開
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">ポイント決済 売上分析</h2>
                  <p className="text-xs text-gray-500 mt-1">期間内のポイント購入・利用・付与のバランスを把握します。</p>
                </div>
                <button
                  onClick={() => fetchAnalytics()}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  更新
                </button>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
                  分析データを読み込み中...
                </div>
              ) : analyticsError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {analyticsError}
                </div>
              ) : !analytics ? (
                <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
                  分析データがありません
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
                      <p className="text-xs font-semibold text-blue-600">総ポイント購入</p>
                      <p className="mt-2 text-2xl font-semibold text-blue-700">{formatPoints(totals?.purchased || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-red-50 p-4">
                      <p className="text-xs font-semibold text-red-600">マーケット消費</p>
                      <p className="mt-2 text-2xl font-semibold text-red-700">{formatPoints(totals?.spent || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold text-emerald-600">管理者付与</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatPoints(totals?.granted || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">その他取引</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{formatPoints(totals?.other || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">ネット計</p>
                      <p className={`mt-2 text-2xl font-semibold ${totals && totals.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatPoints(totals?.net || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">直近日次トレンド</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-gray-600">
                        <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-3 py-2 text-left">日付</th>
                            <th className="px-3 py-2 text-right">購入</th>
                            <th className="px-3 py-2 text-right">利用</th>
                            <th className="px-3 py-2 text-right">付与</th>
                            <th className="px-3 py-2 text-right">ネット</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {topDailyBreakdown.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                                データがありません
                              </td>
                            </tr>
                          ) : (
                            topDailyBreakdown.map((row) => (
                              <tr key={row.label}>
                                <td className="px-3 py-2 text-gray-500">{row.label}</td>
                                <td className="px-3 py-2 text-right text-emerald-700">{formatPoints(row.purchased)}</td>
                                <td className="px-3 py-2 text-right text-red-600">{formatPoints(row.spent)}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{formatPoints(row.granted)}</td>
                                <td className={`px-3 py-2 text-right ${row.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatPoints(row.net)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">月次合計</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-gray-600">
                        <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-3 py-2 text-left">月</th>
                            <th className="px-3 py-2 text-right">購入</th>
                            <th className="px-3 py-2 text-right">利用</th>
                            <th className="px-3 py-2 text-right">付与</th>
                            <th className="px-3 py-2 text-right">ネット</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {analytics.monthly.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                                データがありません
                              </td>
                            </tr>
                          ) : (
                            analytics.monthly.map((row) => (
                              <tr key={row.label}>
                                <td className="px-3 py-2 text-gray-500">{row.label}</td>
                                <td className="px-3 py-2 text-right text-emerald-700">{formatPoints(row.purchased)}</td>
                                <td className="px-3 py-2 text-right text-red-600">{formatPoints(row.spent)}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{formatPoints(row.granted)}</td>
                                <td className={`px-3 py-2 text-right ${row.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatPoints(row.net)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === 'share-management' && (
            <div className="space-y-6">
              {shareError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{shareError}</div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">NOTEシェア ダッシュボード</h2>
                    <p className="text-sm text-gray-500">ユーザーのシェア行動と報酬配布の傾向を可視化し、早期異常検知に備えます。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchShareDashboard()}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-400"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    統計を更新
                  </button>
                </div>

                {shareOverviewLoading ? (
                  <div className="mt-6 flex items-center justify-center py-16 text-sm text-gray-500">統計を取得中...</div>
                ) : !shareOverview ? (
                  <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    シェア統計がまだ記録されていません。
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-semibold text-blue-600">累計シェア数</p>
                      <p className="mt-2 text-2xl font-semibold text-blue-700">{formatNumber(shareOverview.total_shares)}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold text-emerald-600">累計付与ポイント</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatPoints(shareOverview.total_reward_points)}</p>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                      <p className="text-xs font-semibold text-purple-600">今日のシェア</p>
                      <p className="mt-2 text-2xl font-semibold text-purple-700">{formatNumber(shareOverview.today_shares)}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-semibold text-amber-600">直近7日間</p>
                      <p className="mt-2 text-2xl font-semibold text-amber-700">{formatNumber(shareOverview.this_week_shares)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold text-gray-600">直近30日</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(shareOverview.this_month_shares)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">トップクリエイター</h3>
                      <p className="text-xs text-gray-500">シェア実績の高い発行者ランキング</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">上位 {shareTopCreators.length}</span>
                  </div>
                  {shareTopCreators.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                      ランキングを表示するデータがありません。
                    </div>
                  ) : (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                      <table className="w-full text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-4 py-3 text-left">クリエイター</th>
                            <th className="px-4 py-3 text-right">シェア数</th>
                            <th className="px-4 py-3 text-right">付与ポイント</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/70">
                          {shareTopCreators.map((creator) => (
                            <tr key={creator.user_id}>
                              <td className="px-4 py-3">
                                <div className="text-sm font-semibold text-gray-900">{creator.username}</div>
                                <div className="text-xs text-gray-500">{creator.email}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{formatNumber(creator.total_shares)}</td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">{formatPoints(creator.total_reward_points)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">トップNOTE</h3>
                      <p className="text-xs text-gray-500">シェア数の多いコンテンツを確認します</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">上位 {shareTopNotes.length}</span>
                  </div>
                  {shareTopNotes.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                      ランキングを表示するデータがありません。
                    </div>
                  ) : (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                      <table className="w-full text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-4 py-3 text-left">NOTE</th>
                            <th className="px-4 py-3 text-right">シェア数</th>
                            <th className="px-4 py-3 text-right">付与ポイント</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/70">
                          {shareTopNotes.map((note) => (
                            <tr key={note.note_id}>
                              <td className="px-4 py-3">
                                <div className="text-sm font-semibold text-gray-900 line-clamp-2">{note.title}</div>
                                <div className="text-xs text-gray-500">{note.author_username}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{formatNumber(note.share_count)}</td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">{formatPoints(note.total_reward_points)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">シェアログ</h3>
                      <p className="text-xs text-gray-500">最新100件のシェア履歴とスコアリング結果を確認します。</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShareFilters({ suspiciousOnly: false })}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          !shareFilters.suspiciousOnly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        全件
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareFilters({ suspiciousOnly: true })}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          shareFilters.suspiciousOnly ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        要調査のみ
                      </button>
                      <button
                        type="button"
                        onClick={() => fetchShareLogs(shareFilters.suspiciousOnly)}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-400"
                      >
                        <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                        更新
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full text-sm text-gray-600">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-3 py-3 text-left">NOTE</th>
                          <th className="px-3 py-3 text-left">シェア元</th>
                          <th className="px-3 py-3 text-left">ツイート</th>
                          <th className="px-3 py-3 text-right">付与P</th>
                          <th className="px-3 py-3 text-left">判定</th>
                          <th className="px-3 py-3 text-left">日時</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/70">
                        {shareLogLoading ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">履歴を取得中...</td>
                          </tr>
                        ) : shareLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">該当するシェア履歴がありません</td>
                          </tr>
                        ) : (
                          shareLogs.map((log) => (
                            <tr key={log.id} className={log.is_suspicious ? 'bg-red-50/40' : ''}>
                              <td className="px-3 py-3 align-top">
                                <div className="text-sm font-semibold text-gray-900 line-clamp-2">{log.note_title}</div>
                                <div className="text-xs text-gray-500">著者: {log.author_username}</div>
                              </td>
                              <td className="px-3 py-3 align-top">
                                <div className="text-sm font-semibold text-gray-900">{log.shared_by_username}</div>
                                <div className="text-xs text-gray-500">ID: {log.shared_by_user_id}</div>
                                {log.ip_address && <div className="text-[11px] text-gray-500">IP: {log.ip_address}</div>}
                              </td>
                              <td className="px-3 py-3 align-top">
                                {log.tweet_url ? (
                                  <a
                                    href={log.tweet_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-blue-600 hover:underline break-all"
                                  >
                                    {log.tweet_id}
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-3 py-3 align-top text-right text-sm font-semibold text-emerald-600">{formatPoints(log.points_amount)}</td>
                              <td className="px-3 py-3 align-top text-xs">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    log.is_suspicious ? 'bg-red-100 text-red-700' : log.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {log.is_suspicious ? '要調査' : log.verified ? '検証済み' : '未検証'}
                                </span>
                              </td>
                              <td className="px-3 py-3 align-top text-xs text-gray-600">{formatDateTime(log.shared_at)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-900">報酬レート設定</h3>
                    <p className="mt-1 text-xs text-gray-500">シェア1件あたりの付与ポイントを更新すると、即時で新しいレートが適用されます。</p>
                    <form onSubmit={handleShareRewardSubmit} className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-600">現在のレート</label>
                        <input
                          type="number"
                          min="0"
                          value={shareRewardInput}
                          onChange={(event) => setShareRewardInput(event.target.value)}
                          placeholder="例: 100"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      {shareRewardSettings && (
                        <div className="rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
                          最終更新: {formatDateTime(shareRewardSettings.updated_at)} / 更新者: {shareRewardSettings.updated_by ?? '不明'}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={shareRewardSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        更新する
                      </button>
                    </form>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">不正検知アラート</h3>
                        <p className="text-xs text-gray-500">シェア活動に関するリスクイベントを確認し、必要に応じて解決処理を行います。</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fetchShareAlerts()}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-400"
                      >
                        <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                        更新
                      </button>
                    </div>

                    {shareAlertsLoading ? (
                      <div className="mt-4 flex items-center justify-center py-10 text-sm text-gray-500">アラートを取得中...</div>
                    ) : shareFraudAlerts.length === 0 ? (
                      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">未解決のアラートはありません。</div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {shareFraudAlerts.map((alert) => {
                          const severity = alert.severity?.toLowerCase?.() ?? 'low';
                          const badgeClass = FRAUD_SEVERITY_BADGE[severity] ?? 'bg-gray-200 text-gray-600';
                          return (
                            <div key={alert.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{alert.alert_type}</span>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                                      {alert.severity}
                                    </span>
                                  </div>
                                  {alert.description && <p className="mt-1 whitespace-pre-line text-xs text-gray-500">{alert.description}</p>}
                                  <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                                    {alert.note_title && <div>対象NOTE: {alert.note_title}</div>}
                                    {alert.username && <div>ユーザー: {alert.username}</div>}
                                    <div>検知日時: {formatDateTime(alert.created_at)}</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  解決済みにする
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'announcements' && (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-red-700">稼働中のメンテナンス</h3>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-red-700">
                      {activeMaintenanceModes.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-red-700">
                    {activeMaintenanceModes.length === 0 ? (
                      <p className="text-red-600">現在稼働中のメンテナンスはありません。</p>
                    ) : (
                      activeMaintenanceModes.slice(0, 3).map((mode) => (
                        <div key={mode.id} className="rounded-lg bg-white/60 px-3 py-2">
                          <div className="text-sm font-semibold text-red-700 line-clamp-2">{mode.title}</div>
                          <div className="mt-1 text-[11px] text-red-600">
                            {formatDateTime(mode.activated_at ?? mode.planned_start)} 開始
                          </div>
                          <div className="mt-1 text-[11px] text-red-600">対象: {getMaintenanceScopeLabel(mode.scope)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-amber-700">直近の予定</h3>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-amber-700">
                      {maintenanceOverview?.scheduled?.length ?? 0}
                    </span>
                  </div>
                  {nextScheduledMaintenance ? (
                    <div className="mt-3 space-y-2 text-xs text-amber-800">
                      <div className="rounded-lg bg-white/60 px-3 py-2">
                        <div className="text-sm font-semibold text-amber-700 line-clamp-2">{nextScheduledMaintenance.title}</div>
                        <div className="mt-1 text-[11px] text-amber-600">
                          {formatDateTime(nextScheduledMaintenance.planned_start ?? nextScheduledMaintenance.created_at)}
                        </div>
                        <div className="mt-1 text-[11px] text-amber-600">対象: {getMaintenanceScopeLabel(nextScheduledMaintenance.scope)}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-amber-700">予定中のメンテナンスはありません。</p>
                  )}
                  {maintenanceLoading && <p className="mt-3 text-[11px] text-amber-600">最新情報を取得中...</p>}
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-emerald-700">直近の稼働状況</h3>
                    <button
                      type="button"
                      onClick={() => fetchStatusCheckData()}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                    >
                      再取得
                    </button>
                  </div>
                  {latestStatusCheck ? (
                    <div className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-xs text-emerald-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{latestStatusCheck.component}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${SYSTEM_STATUS_BADGE[latestStatusCheck.status]}`}
                        >
                          {latestStatusCheck.status}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-600">{formatDateTime(latestStatusCheck.checked_at)}</div>
                      {latestStatusCheck.response_time_ms != null && (
                        <div className="mt-1 text-[11px] text-emerald-600">応答: {latestStatusCheck.response_time_ms} ms</div>
                      )}
                      {latestStatusCheck.message && (
                        <div className="mt-2 text-[11px] text-emerald-700">{latestStatusCheck.message}</div>
                      )}
                    </div>
                  ) : statusCheckLoading ? (
                    <p className="mt-3 text-xs text-emerald-700">稼働状況を取得中...</p>
                  ) : (
                    <p className="mt-3 text-xs text-emerald-700">記録されたステータスチェックがありません。</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">メンテナンスモード管理</h2>
                    <p className="text-sm text-gray-500">サービス毎の停止・注意喚起を即時に登録し、稼働ステータスをリアルタイムに追跡します。</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fetchMaintenanceData(maintenanceScopeFilter)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-400"
                    >
                      <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                      最新に更新
                    </button>
                    <button
                      type="button"
                      onClick={handleRefreshAll}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-400"
                    >
                      全体再取得
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {MAINTENANCE_SCOPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMaintenanceScopeFilter(option.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        maintenanceScopeFilter === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {maintenanceError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{maintenanceError}</div>
                )}

                <div className="mt-6 hidden lg:block overflow-hidden rounded-2xl border border-gray-100">
                  <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">タイトル</th>
                        <th className="px-4 py-3 text-left">対象</th>
                        <th className="px-4 py-3 text-left">期間</th>
                        <th className="px-4 py-3 text-left">状態</th>
                        <th className="px-4 py-3 text-left">メモ</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/70">
                      {maintenanceLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">読み込み中...</td>
                        </tr>
                      ) : maintenanceModes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">該当するメンテナンス記録がありません</td>
                        </tr>
                      ) : (
                        maintenanceModes.map((mode) => (
                          <tr key={mode.id} className="align-top">
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900 line-clamp-2">{mode.title}</div>
                              <div className="mt-1 text-xs text-gray-500">登録: {formatDateTime(mode.created_at)}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{getMaintenanceScopeLabel(mode.scope)}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              <div>予定: {formatDateTime(mode.planned_start)}</div>
                              <div>終了: {formatDateTime(mode.planned_end)}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${MAINTENANCE_STATUS_BADGE[mode.status]}`}>
                                {MAINTENANCE_STATUS_LABELS[mode.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              <div className="max-w-xs whitespace-pre-line text-[11px] text-gray-500 line-clamp-4">
                                {mode.message || '（メモなし）'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap justify-end gap-2">
                                {mode.status === 'scheduled' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleMaintenanceStatusChange(mode, 'active')}
                                      disabled={maintenanceStatusUpdating === mode.id}
                                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      開始
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMaintenanceStatusChange(mode, 'cancelled')}
                                      disabled={maintenanceStatusUpdating === mode.id}
                                      className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      中止
                                    </button>
                                  </>
                                )}
                                {mode.status === 'active' && (
                                  <button
                                    type="button"
                                    onClick={() => handleMaintenanceStatusChange(mode, 'completed')}
                                    disabled={maintenanceStatusUpdating === mode.id}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    終了
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-3 lg:hidden">
                  {maintenanceLoading ? (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-500">読み込み中...</div>
                  ) : maintenanceModes.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-500">該当するメンテナンス記録がありません</div>
                  ) : (
                    maintenanceModes.map((mode) => (
                      <div key={mode.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900 line-clamp-2">{mode.title}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${MAINTENANCE_STATUS_BADGE[mode.status]}`}>
                            {MAINTENANCE_STATUS_LABELS[mode.status]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                          <span className="rounded-full bg-white px-2 py-0.5">{getMaintenanceScopeLabel(mode.scope)}</span>
                          <span>開始 {formatDateTime(mode.planned_start)}</span>
                          <span>終了 {formatDateTime(mode.planned_end)}</span>
                        </div>
                        <div className="whitespace-pre-line text-[11px] text-gray-500 line-clamp-4">{mode.message || '（メモなし）'}</div>
                        <div className="flex flex-wrap gap-2">
                          {mode.status === 'scheduled' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMaintenanceStatusChange(mode, 'active')}
                                disabled={maintenanceStatusUpdating === mode.id}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                開始
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMaintenanceStatusChange(mode, 'cancelled')}
                                disabled={maintenanceStatusUpdating === mode.id}
                                className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                中止
                              </button>
                            </>
                          )}
                          {mode.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleMaintenanceStatusChange(mode, 'completed')}
                              disabled={maintenanceStatusUpdating === mode.id}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              終了
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="text-sm font-semibold text-gray-900">新規メンテナンスの予約</h3>
                  <p className="mt-1 text-xs text-gray-500">日時と対象サービスを設定すると、ダッシュボードの告知枠とAI Wizardへ即時連携されます。</p>
                  <form onSubmit={handleMaintenanceSubmit} className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">対象サービス</label>
                      <select
                        value={maintenanceForm.scope}
                        onChange={(event) => setMaintenanceForm((prev) => ({ ...prev, scope: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      >
                        {MAINTENANCE_SCOPE_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">タイトル</label>
                      <input
                        type="text"
                        value={maintenanceForm.title}
                        onChange={(event) => setMaintenanceForm((prev) => ({ ...prev, title: event.target.value }))}
                        maxLength={120}
                        required
                        placeholder="例：決済システム臨時メンテナンス"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600">メッセージ / 詳細</label>
                      <textarea
                        value={maintenanceForm.message}
                        onChange={(event) => setMaintenanceForm((prev) => ({ ...prev, message: event.target.value }))}
                        rows={3}
                        maxLength={2000}
                        placeholder="ユーザー向けの影響範囲や代替手段などを記載してください。"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">開始予定</label>
                      <input
                        type="datetime-local"
                        value={maintenanceForm.planned_start}
                        onChange={(event) => setMaintenanceForm((prev) => ({ ...prev, planned_start: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">復旧予定</label>
                      <input
                        type="datetime-local"
                        value={maintenanceForm.planned_end}
                        onChange={(event) => setMaintenanceForm((prev) => ({ ...prev, planned_end: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <button
                        type="submit"
                        disabled={maintenanceLoading}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        メンテナンスを登録
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">ステータスチェック履歴</h2>
                    <p className="text-sm text-gray-500">外部依存や主要コンポーネントの健全性を記録し、障害対応のインシデントログとして活用します。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchStatusCheckData()}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-400"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    最新に更新
                  </button>
                </div>

                {statusCheckError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{statusCheckError}</div>
                )}

                <div className="mt-6 hidden lg:block overflow-hidden rounded-2xl border border-gray-100">
                  <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">コンポーネント</th>
                        <th className="px-4 py-3 text-left">状態</th>
                        <th className="px-4 py-3 text-left">応答時間</th>
                        <th className="px-4 py-3 text-left">メモ</th>
                        <th className="px-4 py-3 text-left">記録日時</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/70">
                      {statusCheckLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">読み込み中...</td>
                        </tr>
                      ) : statusChecks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">記録されたステータスチェックがありません</td>
                        </tr>
                      ) : (
                        statusChecks.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.component}</td>
                            <td className="px-4 py-3 text-xs">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${SYSTEM_STATUS_BADGE[item.status]}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{item.response_time_ms != null ? `${item.response_time_ms} ms` : '-'}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-pre-line line-clamp-3">{item.message || '（メモなし）'}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{formatDateTime(item.checked_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 space-y-3 lg:hidden">
                  {statusCheckLoading ? (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-500">読み込み中...</div>
                  ) : statusChecks.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-sm text-gray-500">記録されたステータスチェックがありません</div>
                  ) : (
                    statusChecks.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">{item.component}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${SYSTEM_STATUS_BADGE[item.status]}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">{formatDateTime(item.checked_at)}</div>
                        <div className="text-[11px] text-gray-500">応答時間: {item.response_time_ms != null ? `${item.response_time_ms} ms` : '-'}</div>
                        <div className="whitespace-pre-line text-[11px] text-gray-500">{item.message || '（メモなし）'}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="text-sm font-semibold text-gray-900">新規ステータスチェックを登録</h3>
                  <p className="mt-1 text-xs text-gray-500">外形監視結果やオンコール報告を手動で記録し、ログ履歴に残します。</p>
                  <form onSubmit={handleStatusCheckSubmit} className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">コンポーネント</label>
                      <input
                        type="text"
                        value={statusCheckForm.component}
                        onChange={(event) => setStatusCheckForm((prev) => ({ ...prev, component: event.target.value }))}
                        maxLength={80}
                        required
                        placeholder="例：Supabase, Stripe"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">ステータス</label>
                      <select
                        value={statusCheckForm.status}
                        onChange={(event) => setStatusCheckForm((prev) => ({ ...prev, status: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="healthy">正常</option>
                        <option value="degraded">注意</option>
                        <option value="down">障害</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">応答時間 (ms)</label>
                      <input
                        type="number"
                        min="0"
                        value={statusCheckForm.response_time_ms}
                        onChange={(event) => setStatusCheckForm((prev) => ({ ...prev, response_time_ms: event.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600">メッセージ</label>
                      <textarea
                        value={statusCheckForm.message}
                        onChange={(event) => setStatusCheckForm((prev) => ({ ...prev, message: event.target.value }))}
                        rows={3}
                        maxLength={2000}
                        placeholder="障害内容や一次対応の状況を記録してください"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <button
                        type="submit"
                        disabled={statusCheckLoading}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ステータスを登録
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.9)]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">お知らせコラム管理</h2>
                    <p className="text-sm text-gray-500">
                      ダッシュボード下部に掲載される公式アナウンスを作成・更新できます。顧客コミュニケーションの基点としてご活用ください。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetAnnouncementForm}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-400"
                  >
                    {editingAnnouncementId ? '新規作成モードに戻る' : '入力内容をクリア'}
                  </button>
                </div>

                <form onSubmit={handleAnnouncementSubmit} className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-600">タイトル</label>
                      <input
                        type="text"
                        value={announcementTitle}
                        onChange={(event) => setAnnouncementTitle(event.target.value)}
                        required
                        maxLength={200}
                        placeholder="例：年末年始サポート体制のご案内"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-600">掲載日時</label>
                      <input
                        type="datetime-local"
                        value={announcementPublishedAt}
                        onChange={(event) => setAnnouncementPublishedAt(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-600">配信日時を指定できます。未設定の場合は現在時刻で公開されます。</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-600">サマリー</label>
                    <input
                      type="text"
                      value={announcementSummary}
                      onChange={(event) => setAnnouncementSummary(event.target.value)}
                      required
                      maxLength={255}
                      placeholder="例：【重要】 新料金プラン提供のお知らせ"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-600">ダッシュボードでは投稿日とサマリーのみ表示され、クリックで本文をモーダル表示します。</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-600">本文</label>
                    <textarea
                      value={announcementBody}
                      onChange={(event) => setAnnouncementBody(event.target.value)}
                      required
                      rows={8}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="本文を入力してください。改行で段落を構成できます。"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={announcementPublished}
                        onChange={(event) => setAnnouncementPublished(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-500"
                      />
                      公開中として表示
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={announcementHighlight}
                        onChange={(event) => setAnnouncementHighlight(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 bg-white text-amber-500 focus:ring-amber-500"
                      />
                      トップで強調表示
                    </label>
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
                      <p className="font-semibold text-gray-600">運用メモ</p>
                      <p className="mt-1">強調表示をオンにすると、ダッシュボードで企業のお知らせとして目立つピル表示が追加されます。</p>
                    </div>
                  </div>

                  {announcementsError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                      {announcementsError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="submit"
                      disabled={announcementSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {editingAnnouncementId ? 'お知らせを更新する' : 'お知らせを公開する'}
                    </button>
                    {editingAnnouncementId && (
                      <button
                        type="button"
                        onClick={resetAnnouncementForm}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:border-blue-400"
                      >
                        新規作成に戻る
                      </button>
                    )}
                    <span className="text-xs text-gray-600">保存すると即座に利用者ダッシュボードに反映されます。</span>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">公開済み／下書き一覧</h3>
                    <p className="text-sm text-gray-500">投稿日とサマリーを一覧で確認できます。各項目から素早く編集・削除が可能です。</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAnnouncements}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-blue-400"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    最新情報を取得
                  </button>
                </div>

                {announcementsLoading ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-500">読み込み中です...</div>
                ) : announcements.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-500">
                    まだお知らせは登録されていません。企業の取り組みやメンテナンス情報を発信しましょう。
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">{formatDate(announcement.published_at)}</span>
                            {!announcement.is_published && (
                              <span className="inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">Draft</span>
                            )}
                            {announcement.highlight && announcement.is_published && (
                              <span className="inline-flex items-center rounded-full border border-blue-500/50 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-200">Highlight</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{announcement.title}</p>
                          <p className="text-xs text-gray-500 truncate">{announcement.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAnnouncementEdit(announcement)}
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-100 hover:bg-blue-500/20"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleAnnouncementDelete(announcement.id)}
                            disabled={announcementSaving}
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">モデレーションログ</h2>
                  <p className="text-xs text-gray-500 mt-1">管理者によるステータス変更やブロック操作の履歴を確認できます。</p>
                </div>
                <button
                  onClick={() => fetchLogs()}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  更新
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">日時</th>
                      <th className="px-4 py-3 text-left">アクション</th>
                      <th className="px-4 py-3 text-left">対象ユーザー</th>
                      <th className="px-4 py-3 text-left">対象LP</th>
                      <th className="px-4 py-3 text-left">理由</th>
                      <th className="px-4 py-3 text-left">実行者</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">読み込み中...</td>
                      </tr>
                    ) : logsError ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-600">
                          {logsError}
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">ログがありません</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(log.created_at)}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-900">{log.action}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{log.target_user_id || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{log.target_lp_id || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 truncate">{log.reason || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{log.performed_by_username || log.performed_by_email || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    </AdminShell>
  );
}
