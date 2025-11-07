"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  UsersIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { lpApi, salonAnnouncementApi, salonApi, salonAssetApi, subscriptionApi } from "@/lib/api";
import type {
  Salon,
  SalonAnnouncement,
  SalonAsset,
  SalonAssetListResult,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
} from "@/types/api";
import type { LandingPage } from "@/types";

type FormState = {
  title: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
  lp_id: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  thumbnail_url: "",
  is_active: true,
  lp_id: "",
};

export default function SalonDetailPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const router = useRouter();
  const t = useTranslations("salons.detail");
  const commonT = useTranslations("salons.common");
  const formatter = useFormatter();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [lpOptions, setLpOptions] = useState<Array<Pick<LandingPage, "id" | "title">>>([]);
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
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!salonId) {
        setError(t("errors.missingId"));
        setIsLoading(false);
        return;
      }

      try {
        const [salonRes, planRes, lpsRes] = await Promise.all([
          salonApi.get(salonId),
          subscriptionApi.getPlans(),
          lpApi.list({ limit: 100 }),
        ]);

        const salonData = salonRes.data as Salon;
        setSalon(salonData);
        setForm({
          title: salonData.title ?? "",
          description: salonData.description ?? "",
          thumbnail_url: salonData.thumbnail_url ?? "",
          is_active: Boolean(salonData.is_active),
          lp_id: (salonData as any).lp_id ?? "",
        });

        const planData = (planRes.data as SubscriptionPlanListResponse)?.data ?? [];
        setPlans(planData);

        const lpPayload = lpsRes.data as { data?: LandingPage[] | null } | LandingPage[] | null | undefined;
        let lpRows: LandingPage[] = [];
        if (Array.isArray(lpPayload)) {
          lpRows = lpPayload;
        } else if (lpPayload && "data" in lpPayload && Array.isArray(lpPayload.data)) {
          lpRows = lpPayload.data;
        }
        const lpOptionsData = lpRows.map((lp) => ({ id: lp.id, title: lp.title }));
        setLpOptions(lpOptionsData);
      } catch (loadError: any) {
        console.error("Failed to load salon detail", loadError);
        const detail = loadError?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : t("errors.loadDetail"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [salonId, t]);

  const planDetail = useMemo(() => {
    if (!salon?.subscription_plan_id) return undefined;
    return plans.find((plan) => plan.subscription_plan_id === salon.subscription_plan_id);
  }, [plans, salon]);

  const formatSchedule = useCallback(
    (startAt?: string | null, endAt?: string | null) => {
      const format = (value?: string | null) =>
        value ? formatter.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" }) : undefined;
      const start = format(startAt);
      const end = format(endAt);
      if (start && end) return t("sections.announcements.scheduleRange", { start, end });
      if (start) return t("sections.announcements.scheduleFrom", { start });
      if (end) return t("sections.announcements.scheduleUntil", { end });
      return t("sections.announcements.scheduleUnset");
    },
    [formatter, t],
  );

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
        setAnnouncementError(typeof detail === "string" ? detail : t("sections.announcements.errors.load"));
      }
    };
    loadAnnouncements();
  }, [salonId, t]);

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
      setAssetError(typeof detail === "string" ? detail : t("thumbnailPicker.errors.loadAssets"));
    } finally {
      setAssetLoading(false);
    }
  }, [salonId, t]);

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
        setAssetError(typeof detail === "string" ? detail : t("thumbnailPicker.errors.upload"));
      } finally {
        setUploadingThumbnail(false);
        setSelectedFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        event.target.value = "";
      }
    },
    [salonId, t],
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
      setError(t("validation.titleRequired"));
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        is_active: form.is_active,
      };
      if (form.lp_id) {
        payload.lp_id = form.lp_id;
      } else {
        payload.lp_id = null;
      }

      const response = await salonApi.update(salonId, payload);
      const updated = response.data as Salon;
      setSalon(updated);
      setSuccessMessage(t("messages.updateSuccess"));
    } catch (saveError: any) {
      console.error("Failed to update salon", saveError);
      const detail = saveError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : t("errors.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSalon = useCallback(async () => {
    if (!salonId || isDeleting) return;
    if (!window.confirm(t("delete.confirm"))) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      setIsDeleting(true);
      await salonApi.delete(salonId);
      alert(t("delete.success"));
      router.push("/salons");
    } catch (deleteError: any) {
      console.error("Failed to delete salon", deleteError);
      const detail = deleteError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : t("delete.error"));
    } finally {
      setIsDeleting(false);
    }
  }, [salonId, isDeleting, router, t]);

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
      <DashboardLayout pageTitle={t("pageTitle")} pageSubtitle="" requireAuth>
        <div className="mx-auto max-w-3xl px-3 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-600">
            {t("errors.notFound")}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={t("pageTitle")}
      pageSubtitle={t("pageSubtitle")}
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/salons"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          {t("nav.backToList")}
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
              <h2 className="text-base font-semibold text-slate-900">{t("sections.announcements.title")}</h2>
              <p className="text-xs text-slate-500">{t("sections.announcements.description")}</p>
            </div>
            <Link
              href={`/salons/${salon.id}/announcements`}
              className="text-xs font-medium text-sky-600 hover:text-sky-500"
            >
              {t("sections.announcements.manageLink")}
            </Link>
          </div>

          {announcementError ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
              {announcementError}
            </div>
          ) : announcements.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
              {t("sections.announcements.empty")}
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
                            {t("sections.announcements.pinned")}
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
                  {t("form.fields.title")}
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
                  {t("form.fields.description")}
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
                  {t("form.fields.thumbnail")}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="url"
                    value={form.thumbnail_url}
                    onChange={(event) => handleChange("thumbnail_url", event.target.value)}
                    placeholder={t("form.placeholders.thumbnail")}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <button
                    type="button"
                    onClick={openThumbnailPicker}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {t("form.actions.chooseImage")}
                  </button>
                </div>
                <p className="text-xs text-slate-500">{t("form.helpers.thumbnail")}</p>
                <div className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  {form.thumbnail_url ? (
                    <img
                      src={form.thumbnail_url}
                      alt={t("form.thumbnailAlt")}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-xs text-slate-400">{t("form.thumbnailFallback")}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {t("form.fields.lp")}
                </label>
                <select
                  value={form.lp_id}
                  onChange={(event) => handleChange("lp_id", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">{t("form.options.noLp")}</option>
                  {lpOptions.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {lp.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">{t("form.helpers.lp")}</p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("form.visibility.title")}</p>
                  <p className="text-xs text-slate-500">{t("form.visibility.description")}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => handleChange("is_active", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-600">{t("form.visibility.toggle")}</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? t("form.actions.saving") : t("form.actions.save")}
                </button>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{t("infoPanel.title")}</h3>
              <dl className="mt-3 space-y-3 text-sm text-slate-600">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("infoPanel.fields.memberCount")}</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    <UsersIcon className="h-4 w-4" aria-hidden="true" />
                    {t("infoPanel.memberCountValue", { count: formatter.number(salon.member_count ?? 0) })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("infoPanel.fields.plan")}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {planDetail?.label ?? salon.subscription_plan_id ?? t("infoPanel.planUnassigned")}
                  </dd>
                  {planDetail ? (
                    <p className="text-xs text-slate-500">
                      {t("infoPanel.planSummary", {
                        points: formatter.number(Number(planDetail.points ?? 0)),
                        usd: planDetail.usd_amount.toFixed(2),
                      })}
                    </p>
                  ) : null}
                </div>
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-rose-700">{t("delete.title")}</h3>
              <p className="mt-2 text-xs text-rose-600">{t("delete.description")}</p>
              <button
                type="button"
                onClick={handleDeleteSalon}
                disabled={isDeleting}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                {isDeleting ? t("delete.deleting") : t("delete.button")}
              </button>
            </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("infoPanel.fields.salonId")}</dt>
                  <dd className="mt-1 text-xs font-mono text-slate-500">{salon.id}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/salons/${salon.id}/members`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.members")}
                </Link>
                <Link
                  href={`/salons/${salon.id}/feed`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.feed")}
                </Link>
                <Link
                  href={`/salons/${salon.id}/events`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.events")}
                </Link>
                <Link
                  href={`/salons/${salon.id}/announcements`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.announcements")}
                </Link>
                <Link
                  href={`/salons/${salon.id}/roles`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.roles")}
                </Link>
                <Link
                  href={`/salons/${salon.id}/assets`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.assets")}
                </Link>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-100"
                >
                  {copyState === "copied" ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4" aria-hidden="true" />
                      {t("shortcuts.copySuccess")}
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
                      {t("shortcuts.copyLink")}
                    </>
                  )}
                </button>
                <Link
                  href={`/salons/${salon.id}/public`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t("shortcuts.openPublic")}
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
              aria-label={t("thumbnailPicker.closeAria")}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <h2 className="text-lg font-semibold text-slate-900">{t("thumbnailPicker.title")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("thumbnailPicker.description")}</p>

            <div className="mt-4 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  setThumbnailTab("upload");
                  setAssetError(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${thumbnailTab === "upload" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t("thumbnailPicker.tabs.upload")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setThumbnailTab("library");
                  setAssetError(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${thumbnailTab === "library" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t("thumbnailPicker.tabs.library")}
              </button>
            </div>

            {assetError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">{assetError}</div>
            ) : null}

            {thumbnailTab === "upload" ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">{t("thumbnailPicker.upload.label")}</label>
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
                      {t("thumbnailPicker.upload.selectDevice")}
                    </button>
                    {selectedFileName ? (
                      <span className="truncate text-xs text-slate-500">{t("thumbnailPicker.upload.selected", { name: selectedFileName })}</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">{t("thumbnailPicker.upload.helper")}</p>
                </div>
                {uploadingThumbnail ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
                    {t("thumbnailPicker.upload.uploading")}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6">
                {assetLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    {t("thumbnailPicker.library.loading")}
                  </div>
                ) : assetItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    {t("thumbnailPicker.library.empty")}
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
                            alt={asset.title ?? t("thumbnailPicker.library.thumbnailAlt")}
                            className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-32 items-center justify-center bg-slate-100 text-xs text-slate-400">{t("thumbnailPicker.library.noPreview")}</div>
                        )}
                        <div className="px-3 py-2 text-xs text-slate-600">
                          <p className="line-clamp-2 font-medium text-slate-900">{asset.title ?? t("thumbnailPicker.library.nameFallback")}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{asset.visibility ?? t("thumbnailPicker.library.visibilityFallback")}</p>
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
