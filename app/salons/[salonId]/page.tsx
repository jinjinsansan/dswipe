"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonAnnouncementApi, salonApi, subscriptionApi } from "@/lib/api";
import type {
  Salon,
  SalonAnnouncement,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

type FormState = {
  title: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  thumbnail_url: "",
  is_active: true,
};

export default function SalonDetailPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const { user } = useAuthStore();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<SalonAnnouncement[]>([]);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!salonId) {
        setError("サロンIDが指定されていません");
        setIsLoading(false);
        return;
      }

      try {
        const [salonRes, planRes] = await Promise.all([
          salonApi.get(salonId),
          subscriptionApi.getPlans(),
        ]);

        const salonData = salonRes.data as Salon;
        setSalon(salonData);
        setForm({
          title: salonData.title ?? "",
          description: salonData.description ?? "",
          thumbnail_url: salonData.thumbnail_url ?? "",
          is_active: Boolean(salonData.is_active),
        });

        const planData = (planRes.data as SubscriptionPlanListResponse)?.data ?? [];
        setPlans(planData);
      } catch (loadError: any) {
        console.error("Failed to load salon detail", loadError);
        const detail = loadError?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "サロン情報の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [salonId]);

  const planDetail = useMemo(() => {
    if (!salon?.subscription_plan_id) return undefined;
    return plans.find((plan) => plan.subscription_plan_id === salon.subscription_plan_id);
  }, [plans, salon]);

  const formatSchedule = useCallback((startAt?: string | null, endAt?: string | null) => {
    const format = (value?: string | null) => (value ? new Date(value).toLocaleString("ja-JP") : undefined);
    const start = format(startAt);
    const end = format(endAt);
    if (start && end) return `${start} 〜 ${end}`;
    if (start) return `${start} 以降`;
    if (end) return `〜 ${end}`;
    return "期間指定なし";
  }, []);

  useEffect(() => {
    if (!salonId) return;
    const loadAnnouncements = async () => {
      try {
        const response = await salonAnnouncementApi.listAnnouncements(salonId, { limit: 4, offset: 0 });
        const payload = response.data as { data?: SalonAnnouncement[] };
        setAnnouncements(payload.data ?? []);
      } catch (loadError: any) {
        console.error("Failed to load announcements", loadError);
        const detail = loadError?.response?.data?.detail;
        setAnnouncementError(typeof detail === "string" ? detail : "お知らせの取得に失敗しました");
      }
    };
    loadAnnouncements();
  }, [salonId]);

  const handleChange = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!salonId || isSaving) return;
    setError(null);
    setSuccessMessage(null);

    if (!form.title.trim()) {
      setError("サロン名を入力してください");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        is_active: form.is_active,
      };

      const response = await salonApi.update(salonId, payload);
      const updated = response.data as Salon;
      setSalon(updated);
      setSuccessMessage("サロン情報を更新しました");
    } catch (saveError: any) {
      console.error("Failed to update salon", saveError);
      const detail = saveError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "サロン情報の更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!salon || !user?.username) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/points/subscriptions?seller=${encodeURIComponent(user.username)}&salon=${salon.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch (copyError) {
      console.error("Failed to copy link", copyError);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!salon) {
    return (
      <DashboardLayout pageTitle="サロン詳細" pageSubtitle="" requireAuth>
        <div className="mx-auto max-w-3xl px-3 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-600">
            サロン情報が見つかりませんでした。
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="サロン詳細"
      pageSubtitle="サロン情報の編集とサブスク導線を管理できます"
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/salons"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          サロン一覧に戻る
        </Link>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <ExclamationCircleIcon className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            <CheckCircleIcon className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">サロンからのお知らせ</h2>
              <p className="text-xs text-slate-500">最新のお知らせやピン留め情報を確認できます。</p>
            </div>
            <Link
              href={`/salons/${salon.id}/announcements`}
              className="text-xs font-medium text-sky-600 hover:text-sky-500"
            >
              お知らせ管理へ
            </Link>
          </div>

          {announcementError ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
              {announcementError}
            </div>
          ) : announcements.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
              現在表示できるお知らせはありません。
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {announcements.map((announcement) => (
                <article key={announcement.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{announcement.title}</h3>
                        {announcement.is_pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                            ピン留め
                          </span>
                        ) : null}
                      </div>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500">
                        <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatSchedule(announcement.start_at, announcement.end_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                    {announcement.body.length > 160 ? `${announcement.body.slice(0, 160)}…` : announcement.body}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  サロン名
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  サロン概要
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  サムネイルURL
                </label>
                <input
                  type="url"
                  value={form.thumbnail_url}
                  onChange={(event) => handleChange("thumbnail_url", event.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">公開設定</p>
                  <p className="text-xs text-slate-500">非公開にするとサブスク経由の新規会員は追加されません。</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => handleChange("is_active", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-600">公開する</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "保存中..." : "変更を保存"}
                </button>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">サロン情報</h3>
              <dl className="mt-3 space-y-3 text-sm text-slate-600">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">会員数</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    <UsersIcon className="h-4 w-4" aria-hidden="true" />
                    {salon.member_count?.toLocaleString() ?? 0}名
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">課金プラン</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {planDetail?.label ?? salon.subscription_plan_id ?? "未設定"}
                  </dd>
                  {planDetail ? (
                    <p className="text-xs text-slate-500">
                      {planDetail.points.toLocaleString("ja-JP")}pt / ${planDetail.usd_amount.toFixed(2)}
                    </p>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">サロンID</dt>
                  <dd className="mt-1 text-xs font-mono text-slate-500">{salon.id}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/salons/${salon.id}/members`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  会員管理ページへ
                </Link>
                <Link
                  href={`/salons/${salon.id}/feed`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  コミュニティフィード
                </Link>
                <Link
                  href={`/salons/${salon.id}/events`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  イベント管理
                </Link>
                <Link
                  href={`/salons/${salon.id}/announcements`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  お知らせ管理
                </Link>
                <Link
                  href={`/salons/${salon.id}/roles`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  ロール管理
                </Link>
                <Link
                  href={`/salons/${salon.id}/assets`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  アセットライブラリ
                </Link>
                {user?.username ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-100"
                  >
                    {copyState === "copied" ? (
                      <>
                        <ClipboardDocumentCheckIcon className="h-4 w-4" aria-hidden="true" />
                        コピーしました
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
                        サブスク導線リンクをコピー
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
