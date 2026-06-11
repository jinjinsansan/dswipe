"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { GRAD_BRAND, HEAD_BG } from "@/lib/momentum";
import { purchasesApi } from "@/lib/api";
import type { PurchaseHistoryResponse, PurchaseHistorySalon } from "@/types/api";
import { useTranslations } from "next-intl";

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const normalized = value.includes("Z") || value.includes("+") ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(date);
};

export default function JoinedSalonsPage() {
  const t = useTranslations("salons.joined");
  const [memberships, setMemberships] = useState<PurchaseHistorySalon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const response = await purchasesApi.getHistory();
      const payload = response.data as PurchaseHistoryResponse;
      setMemberships(payload.active_salons ?? []);
    } catch (err) {
      console.error("Failed to load joined salons", err);
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err instanceof Error ? err.message : undefined);
      setError(message ?? t("empty.description"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const activeCount = useMemo(
    () => memberships.filter((item) => (item.status || "").toUpperCase() === "ACTIVE").length,
    [memberships],
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout pageTitle={t("pageTitle")} pageSubtitle={t("pageSubtitle")}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <div
          className="flex flex-col gap-3 rounded-3xl px-6 py-7 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)] sm:flex-row sm:items-center sm:justify-between sm:px-9"
          style={{ background: HEAD_BG }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">{t("pageTitle")}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-pure-white">{activeCount.toLocaleString()} 件</p>
            <p className="mt-1 text-sm text-[#bcd3ee]">{t("pageSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={fetchMemberships}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-pure-white transition hover:bg-white/15 disabled:opacity-60"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            {t("actions.refresh")}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : null}

        {memberships.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#bfe6fb] bg-white px-8 py-16 text-center shadow-sm">
            <UserGroupIcon className="h-12 w-12 text-sky-300" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-[#0b1f3a]">{t("empty.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("empty.description")}</p>
            <Link
              href="/salons/all"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
              style={{ background: GRAD_BRAND }}
            >
              {t("actions.explore")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {memberships.map((membership) => {
              const isActive = (membership.status || "").toUpperCase() === "ACTIVE";
              return (
                <div
                  key={membership.membership_id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {membership.salon_title ?? "名称未設定のサロン"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {membership.owner_display_name ?? membership.owner_username ?? "オーナー情報未設定"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {membership.status}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#bfe6fb] bg-[#e9f6fe] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">加入日</p>
                      <p className="mt-1 text-sm font-semibold text-[#0b1f3a]">{formatDateTime(membership.joined_at)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#bfe6fb] bg-[#e9f6fe] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">次回課金予定</p>
                      <p className="mt-1 text-sm font-semibold text-[#0b1f3a]">
                        {membership.next_charge_at ? formatDateTime(membership.next_charge_at) : "未定"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#bfe6fb] bg-[#e9f6fe] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">プラン</p>
                      <p className="mt-1 text-sm font-semibold text-[#0b1f3a]">{membership.plan_label ?? "プラン情報未設定"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-slate-500">
                    <p>※ {t("notes.feedOnlyActive")}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/salons/${membership.salon_id}/feed`}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                        isActive
                          ? "text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                      style={isActive ? { background: GRAD_BRAND } : undefined}
                      aria-disabled={!isActive}
                      onClick={(event) => {
                        if (!isActive) {
                          event.preventDefault();
                        }
                      }}
                      >
                        {t("actions.feed")}
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href={`/salons/${membership.salon_id}/public`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        {t("actions.public")}
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
