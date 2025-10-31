"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonApi, salonEventApi } from "@/lib/api";
import type { Salon, SalonEvent, SalonEventListResult } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

type EventFormState = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  meetingUrl: string;
  isPublic: boolean;
  capacity: string;
};

const INITIAL_FORM: EventFormState = {
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  location: "",
  meetingUrl: "",
  isPublic: true,
  capacity: "",
};

type ApiErrorShape = {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
};

type EventUpdatePayload = {
  title?: string;
  description?: string | null;
  start_at?: string;
  end_at?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  is_public?: boolean;
  capacity?: number | null;
};

const extractDetail = (error: unknown, fallback: string): string => {
  const detail = (error as ApiErrorShape | null)?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
};

const toInputValue = (iso?: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tzOffset * 60_000);
  return local.toISOString().slice(0, 16);
};

const toISOOrUndefined = (value: string): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

export default function SalonEventsPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const { user } = useAuthStore();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [events, setEvents] = useState<SalonEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<EventFormState>(INITIAL_FORM);
  const [isCreating, setIsCreating] = useState(false);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(INITIAL_FORM);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const loadEvents = useCallback(async () => {
    if (!salonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await salonEventApi.listEvents(salonId, { limit: 50, offset: 0 });
      const payload = response.data as SalonEventListResult;
      setEvents(payload.data ?? []);
      setTotalEvents(payload.total ?? 0);
    } catch (loadError) {
      console.error("Failed to load events", loadError);
      setError(extractDetail(loadError, "イベント情報を取得できませんでした"));
    } finally {
      setIsLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    loadSalon();
  }, [loadSalon]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateChange = useCallback(<K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetCreateForm = () => {
    setCreateForm(INITIAL_FORM);
  };

  const handleCreateEvent = async () => {
    if (!salonId) return;
    if (!createForm.title.trim()) {
      setError("イベント名を入力してください");
      return;
    }
    if (!createForm.startAt) {
      setError("開始日時を指定してください");
      return;
    }
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        start_at: toISOOrUndefined(createForm.startAt)!,
        end_at: toISOOrUndefined(createForm.endAt),
        location: createForm.location.trim() || undefined,
        meeting_url: createForm.meetingUrl.trim() || undefined,
        is_public: createForm.isPublic,
        capacity: createForm.capacity ? Number(createForm.capacity) : undefined,
      };

      await salonEventApi.createEvent(salonId, payload);
      resetCreateForm();
      setSuccessMessage("イベントを作成しました");
      await loadEvents();
    } catch (createError) {
      console.error("Failed to create event", createError);
      setError(extractDetail(createError, "イベントの作成に失敗しました"));
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (event: SalonEvent) => {
    setEditingEventId(event.id);
    setEditForm({
      title: event.title ?? "",
      description: event.description ?? "",
      startAt: toInputValue(event.start_at),
      endAt: toInputValue(event.end_at ?? undefined),
      location: event.location ?? "",
      meetingUrl: event.meeting_url ?? "",
      isPublic: Boolean(event.is_public),
      capacity: event.capacity ? String(event.capacity) : "",
    });
    setSuccessMessage(null);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingEventId(null);
    setEditForm(INITIAL_FORM);
  };

  const handleEditChange = useCallback(<K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleUpdateEvent = async () => {
    if (!salonId || !editingEventId) return;
    const target = events.find((evt) => evt.id === editingEventId);
    if (!target) {
      setError("編集対象のイベントが見つかりません");
      return;
    }
    if (!editForm.title.trim()) {
      setError("イベント名を入力してください");
      return;
    }
    if (!editForm.startAt) {
      setError("開始日時を指定してください");
      return;
    }

    const updatedStart = toISOOrUndefined(editForm.startAt);
    const updatedEnd = toISOOrUndefined(editForm.endAt);

    const changes: EventUpdatePayload = {};
    if (editForm.title.trim() !== target.title) changes.title = editForm.title.trim();
    const nextDescription = editForm.description.trim();
    if ((target.description ?? "") !== nextDescription) {
      changes.description = nextDescription ? nextDescription : null;
    }
    if (updatedStart && updatedStart !== target.start_at) changes.start_at = updatedStart;
    if ((updatedEnd ?? null) !== (target.end_at ?? null)) {
      changes.end_at = updatedEnd ?? null;
    }
    const nextLocation = editForm.location.trim();
    if ((target.location ?? "") !== nextLocation) {
      changes.location = nextLocation ? nextLocation : null;
    }
    const nextMeeting = editForm.meetingUrl.trim();
    if ((target.meeting_url ?? "") !== nextMeeting) {
      changes.meeting_url = nextMeeting ? nextMeeting : null;
    }
    if (target.is_public !== editForm.isPublic) {
      changes.is_public = editForm.isPublic;
    }
    const nextCapacity = editForm.capacity ? Number(editForm.capacity) : null;
    if ((target.capacity ?? null) !== (nextCapacity ?? null)) {
      changes.capacity = nextCapacity;
    }

    if (Object.keys(changes).length === 0) {
      setSuccessMessage("変更はありません");
      cancelEdit();
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await salonEventApi.updateEvent(salonId, editingEventId, changes);
      setSuccessMessage("イベントを更新しました");
      cancelEdit();
      await loadEvents();
    } catch (updateError) {
      console.error("Failed to update event", updateError);
      setError(extractDetail(updateError, "イベントの更新に失敗しました"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!salonId) return;
    const confirmed = confirm("このイベントを削除しますか？");
    if (!confirmed) return;
    setActionLoading((prev) => ({ ...prev, [eventId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      await salonEventApi.deleteEvent(salonId, eventId);
      await loadEvents();
      setSuccessMessage("イベントを削除しました");
    } catch (deleteError) {
      console.error("Failed to delete event", deleteError);
      setError(extractDetail(deleteError, "イベントの削除に失敗しました"));
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const performAttendanceAction = async (
    eventId: string,
    action: "GOING" | "INTERESTED" | "CANCEL"
  ) => {
    if (!salonId) return;
    setActionLoading((prev) => ({ ...prev, [eventId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      if (action === "CANCEL") {
        await salonEventApi.cancelAttendance(salonId, eventId);
        setSuccessMessage("参加登録を取り消しました");
      } else {
        await salonEventApi.attendEvent(salonId, eventId, { status: action });
        setSuccessMessage(action === "GOING" ? "参加登録しました" : "興味ありに設定しました");
      }
      await loadEvents();
    } catch (attendanceError) {
      console.error("Failed to update attendance", attendanceError);
      setError(extractDetail(attendanceError, "参加操作に失敗しました"));
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  if (isLoading && events.length === 0) {
    return <PageLoader />;
  }

  if (!salonId) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="サロンイベント管理"
      pageSubtitle={salon ? `${salon.title} のイベント計画と参加管理` : "オンラインサロンのイベント機能"}
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
            href={`/salons/${salonId}/announcements`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            お知らせ管理
          </Link>
          <Link
            href={`/salons/${salonId}/roles`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            ロール管理
          </Link>
          <Link
            href={`/salons/${salonId}/assets`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            アセットライブラリ
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        ) : null}

        {isOwner ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header>
              <h2 className="text-lg font-semibold text-slate-900">新規イベント</h2>
              <p className="mt-1 text-xs text-slate-500">サロン会員向けのイベントやワークショップを作成します。</p>
            </header>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">イベント名</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(event) => handleCreateChange("title", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="オンライン勉強会"
                  disabled={isCreating}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">説明</label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(event) => handleCreateChange("description", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="イベントの目的や参加特典を記入してください"
                  disabled={isCreating}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">開始日時</label>
                  <input
                    type="datetime-local"
                    value={createForm.startAt}
                    onChange={(event) => handleCreateChange("startAt", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    disabled={isCreating}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">終了日時 (任意)</label>
                  <input
                    type="datetime-local"
                    value={createForm.endAt}
                    onChange={(event) => handleCreateChange("endAt", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">場所 (任意)</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(event) => handleCreateChange("location", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="渋谷スタジオ / オンライン"
                    disabled={isCreating}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">オンラインURL (任意)</label>
                  <input
                    type="url"
                    value={createForm.meetingUrl}
                    onChange={(event) => handleCreateChange("meetingUrl", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="https://zoom.us/..."
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">定員 (任意)</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.capacity}
                    onChange={(event) => handleCreateChange("capacity", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="30"
                    disabled={isCreating}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">公開設定</p>
                    <p className="text-xs text-slate-500">非公開にすると会員のみがアクセスできます。</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createForm.isPublic}
                      onChange={(event) => handleCreateChange("isPublic", event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      disabled={isCreating}
                    />
                    <span className="text-sm text-slate-600">公開する</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateEvent}
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? "作成中..." : "イベントを作成"}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">イベント一覧</h2>
              <p className="text-xs text-slate-500">{totalEvents}件のイベント</p>
            </div>
          </header>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              まだイベントが登録されていません。新しいイベントを作成してサロンを活性化しましょう。
            </div>
          ) : (
            <div className="space-y-5">
              {events.map((event) => {
                const isEditing = editingEventId === event.id;
                const loading = actionLoading[event.id] ?? false;
                const startLabel = event.start_at ? new Date(event.start_at).toLocaleString("ja-JP") : "";
                const endLabel = event.end_at ? new Date(event.end_at).toLocaleString("ja-JP") : null;
                const capacityLabel = event.capacity ? `${event.attendee_count}/${event.capacity}` : `${event.attendee_count}`;

                return (
                  <article
                    key={event.id}
                    className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition ${
                      event.is_attending ? "border-sky-200 bg-sky-50" : ""
                    }`}
                  >
                    <header className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
                            {startLabel}
                          </span>
                          {endLabel ? (
                            <span className="inline-flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" aria-hidden="true" />
                              {endLabel}
                            </span>
                          ) : null}
                          {event.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                              {event.location}
                            </span>
                          ) : null}
                          {event.meeting_url ? (
                            <a
                              href={event.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-500"
                            >
                              <VideoCameraIcon className="h-4 w-4" aria-hidden="true" />
                              オンラインリンク
                            </a>
                          ) : null}
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="h-4 w-4" aria-hidden="true" />
                            {capacityLabel}名
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                            {event.is_public ? "公開" : "会員限定"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              onClick={() => (isEditing ? cancelEdit() : startEdit(event))}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-sky-200 hover:text-sky-600"
                              disabled={loading || isUpdating}
                            >
                              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                              {isEditing ? "編集を閉じる" : "編集"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 font-medium text-rose-500 hover:bg-rose-50"
                              disabled={loading}
                            >
                              <TrashIcon className="h-4 w-4" aria-hidden="true" />
                              削除
                            </button>
                          </>
                        ) : null}

                        {user ? (
                          event.is_attending ? (
                            <button
                              type="button"
                              onClick={() => performAttendanceAction(event.id, "CANCEL")}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 font-medium text-rose-500 hover:bg-rose-50"
                              disabled={loading}
                            >
                              参加をキャンセル
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => performAttendanceAction(event.id, "GOING")}
                                className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-3 py-1.5 font-medium text-sky-600 hover:bg-sky-100"
                                disabled={loading}
                              >
                                参加する
                              </button>
                              <button
                                type="button"
                                onClick={() => performAttendanceAction(event.id, "INTERESTED")}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-sky-200 hover:text-sky-600"
                                disabled={loading}
                              >
                                興味あり
                              </button>
                            </div>
                          )
                        ) : null}
                      </div>
                    </header>

                    {!isEditing ? (
                      <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                        {event.description ? event.description : "(説明は設定されていません)"}
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">イベント名</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(event) => handleEditChange("title", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={isUpdating}
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">説明</label>
                          <textarea
                            rows={3}
                            value={editForm.description}
                            onChange={(event) => handleEditChange("description", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={isUpdating}
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">開始日時</label>
                            <input
                              type="datetime-local"
                              value={editForm.startAt}
                              onChange={(event) => handleEditChange("startAt", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">終了日時</label>
                            <input
                              type="datetime-local"
                              value={editForm.endAt}
                              onChange={(event) => handleEditChange("endAt", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">場所</label>
                            <input
                              type="text"
                              value={editForm.location}
                              onChange={(event) => handleEditChange("location", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">オンラインURL</label>
                            <input
                              type="url"
                              value={editForm.meetingUrl}
                              onChange={(event) => handleEditChange("meetingUrl", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">定員</label>
                            <input
                              type="number"
                              min={1}
                              value={editForm.capacity}
                              onChange={(event) => handleEditChange("capacity", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">公開設定</p>
                              <p className="text-xs text-slate-500">チェックで公開、オフで会員限定となります。</p>
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.isPublic}
                                onChange={(event) => handleEditChange("isPublic", event.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                disabled={isUpdating}
                              />
                              <span className="text-sm text-slate-600">公開する</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300"
                            disabled={isUpdating}
                          >
                            キャンセル
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateEvent}
                            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "保存中..." : "変更を保存"}
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
