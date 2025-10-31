"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonApi, salonAnnouncementApi } from "@/lib/api";
import type {
  Salon,
  SalonAnnouncement,
  SalonAnnouncementListResult,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

type AnnouncementFormState = {
  title: string;
  body: string;
  isPinned: boolean;
  isPublished: boolean;
  startAt: string;
  endAt: string;
};

const INITIAL_FORM: AnnouncementFormState = {
  title: "",
  body: "",
  isPinned: false,
  isPublished: true,
  startAt: "",
  endAt: "",
};

const toInputValue = (iso?: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
};

const toISO = (value: string): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const formatSchedule = (startAt?: string | null, endAt?: string | null): string => {
  const format = (value?: string | null) => (value ? new Date(value).toLocaleString("ja-JP") : undefined);
  const start = format(startAt);
  const end = format(endAt);
  if (start && end) return `${start} 〜 ${end}`;
  if (start) return `${start} 以降`;
  if (end) return `〜 ${end}`;
  return "期間指定なし";
};

export default function SalonAnnouncementsPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const { user } = useAuthStore();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [announcements, setAnnouncements] = useState<SalonAnnouncement[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<AnnouncementFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editing, setEditing] = useState<Record<string, AnnouncementFormState>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const isOwner = useMemo(() => {
    if (!salon || !user) return false;
    return salon.owner_id === user.id;
  }, [salon, user]);

  const loadSalon = useCallback(async () => {
    if (!salonId) return;
    try {
      const response = await salonApi.get(salonId);
      setSalon(response.data as Salon);
    } catch (loadError) {
      console.error("Failed to load salon", loadError);
      setError("サロン情報の取得に失敗しました");
    }
  }, [salonId]);

  const loadAnnouncements = useCallback(async () => {
    if (!salonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { limit: 50, offset: 0 };
      if (isOwner) params.include_unpublished = true;
      const response = await salonAnnouncementApi.listAnnouncements(salonId, params);
      const payload = response.data as SalonAnnouncementListResult;
      setAnnouncements(payload.data ?? []);
      setTotal(payload.total ?? 0);
    } catch (loadError) {
      console.error("Failed to load announcements", loadError);
      setError("お知らせの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [salonId, isOwner]);

  useEffect(() => {
    loadSalon();
  }, [loadSalon]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleFormChange = useCallback(<K extends keyof AnnouncementFormState>(key: K, value: AnnouncementFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const handleCreate = async () => {
    if (!salonId) return;
    if (!form.title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!form.body.trim()) {
      setError("本文を入力してください");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await salonAnnouncementApi.createAnnouncement(salonId, {
        title: form.title.trim(),
        body: form.body.trim(),
        is_pinned: form.isPinned,
        is_published: form.isPublished,
        start_at: toISO(form.startAt),
        end_at: toISO(form.endAt),
      });
      setSuccessMessage("お知らせを作成しました");
      resetForm();
      await loadAnnouncements();
    } catch (createError) {
      console.error("Failed to create announcement", createError);
      setError("お知らせの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (announcement: SalonAnnouncement) => {
    setEditing((prev) => ({
      ...prev,
      [announcement.id]: {
        title: announcement.title ?? "",
        body: announcement.body ?? "",
        isPinned: Boolean(announcement.is_pinned),
        isPublished: Boolean(announcement.is_published),
        startAt: toInputValue(announcement.start_at ?? undefined),
        endAt: toInputValue(announcement.end_at ?? undefined),
      },
    }));
    setSuccessMessage(null);
    setError(null);
  };

  const cancelEdit = (announcementId: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[announcementId];
      return next;
    });
  };

  const handleEditChange = (announcementId: string, field: keyof AnnouncementFormState, value: AnnouncementFormState[keyof AnnouncementFormState]) => {
    setEditing((prev) => {
      const patch = prev[announcementId];
      if (!patch) return prev;
      return {
        ...prev,
        [announcementId]: {
          ...patch,
          [field]: value,
        },
      };
    });
  };

  const handleUpdate = async (announcementId: string) => {
    if (!salonId) return;
    const patch = editing[announcementId];
    if (!patch) return;
    if (!patch.title.trim() || !patch.body.trim()) {
      setError("タイトルと本文を入力してください");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [announcementId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      await salonAnnouncementApi.updateAnnouncement(salonId, announcementId, {
        title: patch.title.trim(),
        body: patch.body.trim(),
        is_pinned: patch.isPinned,
        is_published: patch.isPublished,
        start_at: toISO(patch.startAt),
        end_at: toISO(patch.endAt),
      });
      setSuccessMessage("お知らせを更新しました");
      cancelEdit(announcementId);
      await loadAnnouncements();
    } catch (updateError) {
      console.error("Failed to update announcement", updateError);
      setError("お知らせの更新に失敗しました");
    } finally {
      setActionLoading((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!salonId) return;
    if (!confirm("このお知らせを削除しますか？")) return;
    setActionLoading((prev) => ({ ...prev, [announcementId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      await salonAnnouncementApi.deleteAnnouncement(salonId, announcementId);
      setSuccessMessage("お知らせを削除しました");
      await loadAnnouncements();
    } catch (deleteError) {
      console.error("Failed to delete announcement", deleteError);
      setError("お知らせの削除に失敗しました");
    } finally {
      setActionLoading((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  if (isLoading && announcements.length === 0) {
    return <PageLoader />;
  }

  if (!salonId) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="サロンお知らせ管理"
      pageSubtitle={salon ? `${salon.title} のお知らせとピン留め投稿` : "お知らせ管理"}
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href={`/salons/${salonId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          サロン詳細に戻る
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={`/salons/${salonId}/feed`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            コミュニティフィード
          </Link>
          <Link
            href={`/salons/${salonId}/events`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            イベント管理
          </Link>
          <Link
            href={`/salons/${salonId}/assets`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            アセットライブラリ
          </Link>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <ExclamationCircleIcon className="h-5 w-5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {isOwner ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">新しいお知らせ</h2>
                <p className="mt-1 text-xs text-slate-500">会員への告知や重要情報を共有しましょう。</p>
              </div>
              <BellAlertIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
            </header>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">タイトル</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleFormChange("title", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="例: 10月のスケジュール"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">本文</label>
                <textarea
                  rows={5}
                  value={form.body}
                  onChange={(event) => handleFormChange("body", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="詳細な発表内容を記入してください"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">ピン留め</p>
                    <p className="text-xs text-slate-500">有効にするとトップで強調表示されます。</p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(event) => handleFormChange("isPinned", event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-600">ピン留めする</span>
                  </label>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">公開設定</p>
                    <p className="text-xs text-slate-500">オフにすると下書き状態になります。</p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(event) => handleFormChange("isPublished", event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-600">公開する</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">開始日時 (任意)</label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(event) => handleFormChange("startAt", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">終了日時 (任意)</label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(event) => handleFormChange("endAt", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "作成中..." : "お知らせを発信"}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <header className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-900">お知らせ一覧</h2>
            <p className="text-xs text-slate-500">{total}件登録されています</p>
          </header>

          {announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              まだお知らせがありません。最新情報を発信して会員に知らせましょう。
            </div>
          ) : (
            <div className="space-y-5">
              {announcements.map((announcement) => {
                const editingState = editing[announcement.id];
                const loading = actionLoading[announcement.id] ?? false;
                const scheduleLabel = formatSchedule(announcement.start_at, announcement.end_at);
                const isActive = announcement.is_published && (!announcement.start_at || new Date(announcement.start_at) <= new Date()) && (!announcement.end_at || new Date(announcement.end_at) >= new Date());

                return (
                  <article key={announcement.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <header className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                          {announcement.is_pinned ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                              ピン留め
                            </span>
                          ) : null}
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isActive ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}>
                            <ClockIcon className="h-4 w-4" aria-hidden="true" />
                            {isActive ? "公開中" : "非公開"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">作成日: {new Date(announcement.created_at).toLocaleString("ja-JP")}</p>
                        <p className="text-xs text-slate-500">公開期間: {scheduleLabel}</p>
                      </div>

                      {isOwner ? (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => (editingState ? cancelEdit(announcement.id) : startEdit(announcement))}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-sky-200 hover:text-sky-600"
                            disabled={loading}
                          >
                            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                            {editingState ? "編集を閉じる" : "編集"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(announcement.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 font-medium text-rose-500 hover:bg-rose-50"
                            disabled={loading}
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            削除
                          </button>
                        </div>
                      ) : null}
                    </header>

                    {!editingState ? (
                      <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{announcement.body}</div>
                    ) : (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">タイトル</label>
                          <input
                            type="text"
                            value={editingState.title}
                            onChange={(event) => handleEditChange(announcement.id, "title", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">本文</label>
                          <textarea
                            rows={4}
                            value={editingState.body}
                            onChange={(event) => handleEditChange(announcement.id, "body", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={editingState.isPinned}
                              onChange={(event) => handleEditChange(announcement.id, "isPinned", event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            ピン留めする
                          </label>
                          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={editingState.isPublished}
                              onChange={(event) => handleEditChange(announcement.id, "isPublished", event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            公開する
                          </label>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">開始日時</label>
                            <input
                              type="datetime-local"
                              value={editingState.startAt}
                              onChange={(event) => handleEditChange(announcement.id, "startAt", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">終了日時</label>
                            <input
                              type="datetime-local"
                              value={editingState.endAt}
                              onChange={(event) => handleEditChange(announcement.id, "endAt", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => cancelEdit(announcement.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300"
                            disabled={loading}
                          >
                            キャンセル
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdate(announcement.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={loading}
                          >
                            {loading ? "保存中..." : "変更を保存"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
