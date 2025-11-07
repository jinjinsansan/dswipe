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

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      requireAuth
      pageTitle={t("pageTitle")}
      pageSubtitle={t("pageSubtitle")}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {salons.length === 0
                  ? t("summary.empty")
                  : t("summary.count", { count: formatter.number(salons.length) })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchSalons}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {t("actions.refresh")}
            </button>
            <Link
              href="/salons/create"
              className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
            >
              <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
              {t("actions.createSalon")}
            </Link>
          </div>
        </div>

        {salons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
            <UsersIcon className="h-12 w-12 text-slate-300" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{t("empty.title")}</h2>
            <p className="mt-2 max-w-lg text-sm text-slate-500">{t("empty.description")}</p>
            <Link
              href="/salons/create"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500"
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

              return (
                <div key={salon.id} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{salon.title || commonT("untitledSalon")}</h3>
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
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{commonT("fields.memberCount")}</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">{commonT("fields.memberCountValue", { count: formatter.number(memberCount) })}</dd>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{commonT("fields.plan")}</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">
                        {plan?.label ?? salon.subscription_plan_id ?? commonT("fields.planUnassigned")}
                      </dd>
                      {plan ? (
                        <p className="text-xs text-slate-500">{t("card.planSummary", {
                          points: formatter.number(Number(plan.points ?? 0)),
                          usd: plan.usd_amount.toFixed(2),
                        })}</p>
                      ) : null}
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-wrap items-center gap-3">
                    <Link
                      href={`/salons/${salon.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    >
                      {t("card.actions.manage")}
                    </Link>
                    <Link
                      href={`/salons/${salon.id}/members`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
  );
}
