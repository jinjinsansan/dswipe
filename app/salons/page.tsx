"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowPathIcon,
  PlusCircleIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { SalonFeatureGate } from "@/components/SalonFeatureGate";
import { GRAD_BRAND, HEAD_BG } from "@/lib/momentum";
import { salonApi, subscriptionApi } from "@/lib/api";
import type {
  Salon,
  SalonListResult,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

export default function SalonListPage() {
  const t = useTranslations("salons.list");
  const commonT = useTranslations("salons.common");
  const formatter = useFormatter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const getStatusBadge = useCallback(
    (active: boolean) =>
      active
        ? {
            label: commonT("status.active"),
            className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
            Icon: CheckCircleIcon,
          }
        : {
            label: commonT("status.inactive"),
            className: "bg-slate-100 text-slate-500 border border-slate-200",
            Icon: XCircleIcon,
          },
    [commonT],
  );

  const fetchSalons = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      const [salonRes, planRes] = await Promise.all([
        salonApi.list(),
        subscriptionApi.getPlans(),
      ]);

      const salonData = (salonRes.data as SalonListResult)?.data ?? [];
      setSalons(salonData);

      const planData = (planRes.data as SubscriptionPlanListResponse)?.data ?? [];
      setPlans(planData);

    } catch (requestError: any) {
      console.error("Failed to load salons", requestError);
      const detail = requestError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : t("errors.loadList"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const planLabelMap = useMemo(() => {
    const map = new Map<string, SubscriptionPlan>();
    plans.forEach((plan) => {
      if (plan.subscription_plan_id) {
        map.set(plan.subscription_plan_id, plan);
      }
    });
    return map;
  }, [plans]);

  return (
    <SalonFeatureGate pageTitle="サロン" pageSubtitle="コミュニティ管理">
      {isLoading ? (
        <PageLoader />
      ) : (
        <DashboardLayout
      requireAuth
      pageTitle={t("pageTitle")}
      pageSubtitle={t("pageSubtitle")}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Navy hero — mock: D-Swipe Salon.html cover */}
        <div
          className="rounded-3xl px-6 py-7 sm:px-9 sm:py-8 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]"
          style={{ background: HEAD_BG }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Membership</div>
              <h1 className="mt-2 text-[24px] font-extrabold tracking-tight text-pure-white sm:text-[28px]">
                {t("pageTitle")}
              </h1>
              <p className="mt-2 text-sm text-on-navy">
                {salons.length === 0
                  ? t("summary.empty")
                  : t("summary.count", { count: formatter.number(salons.length) })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={fetchSalons}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-pure-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                {t("actions.refresh")}
              </button>
              <Link
                href="/salons/create"
                className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
                style={{ background: GRAD_BRAND }}
              >
                <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
                {t("actions.createSalon")}
              </Link>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {salons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-tint-border bg-white px-8 py-16 text-center shadow-sm">
            <UsersIcon className="h-12 w-12 text-sky-300" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-navy-900">{t("empty.title")}</h2>
            <p className="mt-2 max-w-lg text-sm text-slate-500">{t("empty.description")}</p>
            <Link
              href="/salons/create"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
              style={{ background: GRAD_BRAND }}
            >
              <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
              {t("actions.createFirstSalon")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {salons.map((salon) => {
              const badge = getStatusBadge(Boolean(salon.is_active));
              const plan = planLabelMap.get(salon.subscription_plan_id ?? "");
              const memberCount = salon.member_count ?? 0;
              const planPointLabel = plan ? formatter.number(Number(plan.points ?? 0)) : null;

              return (
                <div key={salon.id} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">{salon.title || commonT("untitledSalon")}</h3>
                      {salon.description ? (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{salon.description}</p>
                      ) : null}
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                      <badge.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {badge.label}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl border border-tint-border bg-brand-tint px-4 py-3">
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">{commonT("fields.memberCount")}</dt>
                      <dd className="mt-1 text-base font-extrabold text-navy-900">{commonT("fields.memberCountValue", { count: formatter.number(memberCount) })}</dd>
                    </div>
                    <div className="rounded-2xl border border-tint-border bg-brand-tint px-4 py-3">
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">{commonT("fields.plan")}</dt>
                      <dd className="mt-1 text-sm font-extrabold text-navy-900">
                        {plan?.label ?? salon.subscription_plan_id ?? commonT("fields.planUnassigned")}
                      </dd>
                      {plan ? (
                        <p className="text-xs text-slate-500">{t("card.planSummary", {
                          points: planPointLabel ?? formatter.number(0),
                          usd: plan.usd_amount.toFixed(2),
                          yen: planPointLabel ?? formatter.number(0),
                        })}</p>
                      ) : null}
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-wrap items-center gap-3">
                    <Link
                      href={`/salons/${salon.id}`}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
                      style={{ background: GRAD_BRAND }}
                    >
                      {t("card.actions.manage")}
                    </Link>
                    <Link
                      href={`/salons/${salon.id}/members`}
                      className="inline-flex items-center gap-2 rounded-full border border-tint-border px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-brand-tint"
                    >
                      {t("card.actions.members")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
      )}
    </SalonFeatureGate>
  );
}
