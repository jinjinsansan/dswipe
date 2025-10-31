"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonAnnouncementApi, salonApi, salonAssetApi, subscriptionApi } from "@/lib/api";
import type {
  Salon,
  SalonAnnouncement,
  SalonAsset,
  SalonAssetListResult,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
} from "@/types/api";

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
  const [thumbnailPickerOpen, setThumbnailPickerOpen] = useState(false);
  const [thumbnailTab, setThumbnailTab] = useState<"upload" | "library">("upload");
  const [assetItems, setAssetItems] = useState<SalonAsset[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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

  const openThumbnailPicker = useCallback(() => {
    setAssetError(null);
    setThumbnailTab("upload");
    setThumbnailPickerOpen(true);
  }, []);

  const closeThumbnailPicker = useCallback(() => {
    setThumbnailPickerOpen(false);
    setAssetError(null);
  }, []);

  const loadThumbnailAssets = useCallback(async () => {
    if (!salonId) return;
    setAssetLoading(true);
    setAssetError(null);
    try {
      const response = await salonAssetApi.listAssets(salonId, {
        limit: 60,
        offset: 0,
        asset_type: "IMAGE",
      });
      const payload = response.data as SalonAssetListResult;
      setAssetItems(payload.data ?? []);
    } catch (loadError: any) {
      console.error("Failed to load salon assets", loadError);
      const detail = loadError?.response?.data?.detail;
      setAssetError(typeof detail === "string" ? detail : "画像ライブラリの取得に失敗しました");
    } finally {
      setAssetLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    if (thumbnailPickerOpen && thumbnailTab === "library") {
      loadThumbnailAssets();
    }
  }, [thumbnailPickerOpen, thumbnailTab, loadThumbnailAssets]);

  const handleThumbnailUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!salonId) return;
      const file = event.target.files?.[0];
      if (!file) return;
      setSelectedFileName(file.name);
      setUploadingThumbnail(true);
      setAssetError(null);
      try {
        const response = await salonAssetApi.uploadAsset(salonId, {
          file,
          asset_type: "IMAGE",
          visibility: "MEMBERS",
          title: file.name,
        });
        const uploaded = response.data as SalonAsset;
        if (uploaded?.file_url) {
          setForm((prev) => ({ ...prev, thumbnail_url: uploaded.file_url }));
        }
        setAssetItems((prev) => [uploaded, ...prev]);
        setThumbnailPickerOpen(false);
        setThumbnailTab("upload");
      } catch (uploadError: any) {
        console.error("Failed to upload thumbnail", uploadError);
        const detail = uploadError?.response?.data?.detail;
        setAssetError(typeof detail === "string" ? detail : "サムネイルのアップロードに失敗しました");
      } finally {
        setUploadingThumbnail(false);
        setSelectedFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        event.target.value = "";
      }
    },
    [salonId],
  );

  const handleSelectAsset = useCallback((asset: SalonAsset) => {
    if (!asset?.file_url) return;
    setForm((prev) => ({ ...prev, thumbnail_url: asset.file_url }));
    setThumbnailPickerOpen(false);
  }, []);

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
    if (!salon) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/salons/${salon.id}/public`;
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

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  サムネイル
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="url"
                    value={form.thumbnail_url}
                    onChange={(event) => handleChange("thumbnail_url", event.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <button
                    type="button"
                    onClick={openThumbnailPicker}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    画像を選択
                  </button>
                </div>
                <p className="text-xs text-slate-500">URL を直接入力するか、画像を選択してください。推奨サイズ 1200×630px。</p>
                <div className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  {form.thumbnail_url ? (
                    <img
                      src={form.thumbnail_url}
                      alt="サロンのサムネイル"
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-xs text-slate-400">サムネイル未設定</div>
                  )}
                </div>
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
                      公開ページリンクをコピー
                    </>
                  )}
                </button>
                <Link
                  href={`/salons/${salon.id}/public`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  公開ページを開く
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {thumbnailPickerOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-8">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.15)]">
            <button
              type="button"
              onClick={closeThumbnailPicker}
              className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              aria-label="サムネイル選択を閉じる"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <h2 className="text-lg font-semibold text-slate-900">サムネイル画像を選択</h2>
            <p className="mt-1 text-xs text-slate-500">画像をアップロードするか、ライブラリから選択してください。</p>

            <div className="mt-4 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  setThumbnailTab("upload");
                  setAssetError(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${thumbnailTab === "upload" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                アップロード
              </button>
              <button
                type="button"
                onClick={() => {
                  setThumbnailTab("library");
                  setAssetError(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${thumbnailTab === "library" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                ライブラリ
              </button>
            </div>

            {assetError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">{assetError}</div>
            ) : null}

            {thumbnailTab === "upload" ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">画像ファイルを選択</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingThumbnail}
                      className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      デバイスから選択
                    </button>
                    {selectedFileName ? (
                      <span className="truncate text-xs text-slate-500">選択中: {selectedFileName}</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">推奨: JPG / PNG（2MB以内）。アップロードするとアセットライブラリにも保存されます。</p>
                </div>
                {uploadingThumbnail ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
                    アップロード中です…
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6">
                {assetLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    画像を読み込み中です…
                  </div>
                ) : assetItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    選択できる画像がありません。アップロードしてみましょう。
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {assetItems.map((asset) => (
                      <button
                        type="button"
                        key={asset.id}
                        onClick={() => handleSelectAsset(asset)}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-sky-200 hover:shadow-md"
                      >
                        {asset.thumbnail_url || asset.file_url ? (
                          <img
                            src={asset.thumbnail_url ?? asset.file_url ?? ""}
                            alt={asset.title ?? "サロン画像"}
                            className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-32 items-center justify-center bg-slate-100 text-xs text-slate-400">プレビューなし</div>
                        )}
                        <div className="px-3 py-2 text-xs text-slate-600">
                          <p className="line-clamp-2 font-medium text-slate-900">{asset.title ?? "名称未設定"}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{asset.visibility ?? "MEMBERS"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
