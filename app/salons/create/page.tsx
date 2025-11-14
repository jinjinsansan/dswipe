"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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

type FormState = {
  title: string;
  description: string;
  thumbnail_url: string;
  subscription_plan_id: string;
  allow_point_subscription: boolean;
  allow_jpy_subscription: boolean;
  tax_rate: string;
  tax_inclusive: boolean;
  introductory_offer_enabled: boolean;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  thumbnail_url: "",
  subscription_plan_id: "",
  allow_point_subscription: true,
  allow_jpy_subscription: false,
  tax_rate: "10",
  tax_inclusive: true,
  introductory_offer_enabled: false,
};

export default function SalonCreatePage() {
  const router = useRouter();
  const t = useTranslations("salons.create");
  const formatter = useFormatter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usedPlanIds, setUsedPlanIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const selectedPlan = useMemo(() => {
    if (!form.subscription_plan_id) {
      return undefined;
    }
    return plans.find((plan) => {
      const planId = plan.subscription_plan_id ?? plan.plan_key;
      return planId === form.subscription_plan_id;
    });
  }, [form.subscription_plan_id, plans]);

  useEffect(() => {
    const init = async () => {
      try {
        const [planRes, salonRes] = await Promise.all([
          subscriptionApi.getPlans(),
          salonApi.list(),
        ]);

        const fetchedPlans = (planRes.data as SubscriptionPlanListResponse)?.data ?? [];
        setPlans(fetchedPlans);

        const existingSalons = (salonRes.data as SalonListResult)?.data ?? [];
        setUsedPlanIds(
          new Set(
            existingSalons
              .map((salon) => salon.subscription_plan_id)
              .filter((id): id is string => typeof id === "string" && id.length > 0)
          )
        );
      } catch (requestError: any) {
        console.error("Failed to initialize salon creation", requestError);
        const detail = requestError?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : t("errors.initFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const availablePlans = useMemo(() => {
    return plans.map((plan) => ({
      ...plan,
      disabled: plan.subscription_plan_id ? usedPlanIds.has(plan.subscription_plan_id) : false,
    }));
  }, [plans, usedPlanIds]);

  const handleChange = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      if (prev.introductory_offer_enabled) {
        if (key === "allow_point_subscription" && value === true) {
          return prev;
        }
        if (key === "allow_jpy_subscription" && value === false) {
          return prev;
        }
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const handleIntroOfferChange = useCallback((enabled: boolean) => {
    setForm((prev) => (
      enabled
        ? {
            ...prev,
            introductory_offer_enabled: true,
            allow_point_subscription: false,
            allow_jpy_subscription: true,
          }
        : { ...prev, introductory_offer_enabled: false }
    ));
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);
    setSuccessMessage(null);

    if (!form.title.trim()) {
      setError(t("errors.titleRequired"));
      return;
    }
    if (!form.subscription_plan_id) {
      setError(t("errors.planRequired"));
      return;
    }

    const isIntroOffer = form.introductory_offer_enabled;
    const allowPoint = isIntroOffer ? false : form.allow_point_subscription;
    const allowJpy = isIntroOffer ? true : form.allow_jpy_subscription;

    if (!allowPoint && !allowJpy) {
      setError(t("errors.paymentMethodRequired"));
      return;
    }

    if (allowJpy) {
      if (!selectedPlan) {
        setError(t("errors.jpyRequiresPlan"));
        return;
      }
      if (!Number.isFinite(selectedPlan.points) || selectedPlan.points <= 0) {
        setError(t("errors.planPointsInvalid"));
        return;
      }
    }

    const taxRateInput = form.tax_rate.trim();
    const parsedTaxRate = taxRateInput === "" ? null : Number(taxRateInput);
    if (parsedTaxRate !== null && (Number.isNaN(parsedTaxRate) || parsedTaxRate < 0 || parsedTaxRate > 100)) {
      setError(t("errors.taxRateRange"));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        subscription_plan_id: form.subscription_plan_id,
        allow_point_subscription: allowPoint,
        allow_jpy_subscription: allowJpy,
        monthly_price_jpy: allowJpy && selectedPlan ? selectedPlan.points : null,
        tax_rate: parsedTaxRate,
        tax_inclusive: form.tax_inclusive,
        introductory_offer_enabled: isIntroOffer || undefined,
        introductory_offer_type: isIntroOffer ? "first_month_free_direct" : undefined,
      } satisfies Parameters<typeof salonApi.create>[0];

      const response = await salonApi.create(payload);
      const created = response.data as Salon;
      setSuccessMessage(t("messages.created"));

      setTimeout(() => {
        router.replace(`/salons/${created.id}`);
      }, 600);
    } catch (submitError: any) {
      console.error("Failed to create salon", submitError);
      const detail = submitError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : t("errors.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle={t("pageTitle")}
      pageSubtitle={t("pageSubtitle")}
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t("labels.title")}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder={t("placeholders.title")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t("labels.description")}
              </label>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                rows={4}
                placeholder={t("placeholders.description")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t("labels.thumbnail")}
              </label>
              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(event) => handleChange("thumbnail_url", event.target.value)}
                placeholder={t("placeholders.thumbnail")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <p className="text-xs text-slate-400">{t("helpers.thumbnail")}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t("labels.plan")}
              </label>
              <div className="grid gap-3">
                {availablePlans.length === 0 ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {t("helpers.noPlans")}
                  </p>
                ) : (
                  availablePlans.map((plan) => {
                    const planId = plan.subscription_plan_id ?? plan.plan_key;
                    const isDisabled = plan.disabled;
                    const isSelected = form.subscription_plan_id === planId;
                    return (
                      <button
                        key={planId}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleChange("subscription_plan_id", planId)}
                        className={`flex w-full flex-col items-start rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                          isSelected
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                        } ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <span className="text-sm font-semibold text-slate-900">{plan.label}</span>
                        <span className="text-xs text-slate-500">
                          {t("plan.summary", {
                            points: formatter.number(plan.points ?? 0),
                            usd: plan.usd_amount.toFixed(2),
                          })}
                        </span>
                        {isDisabled ? (
                          <span className="mt-1 text-xs font-semibold text-rose-500">{t("plan.inUse")}</span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
              <input
                type="hidden"
                name="subscription_plan_id"
                value={form.subscription_plan_id}
              />
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t("sections.payment.title")}</div>
                  <p className="text-xs text-slate-500">{t("sections.payment.description")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t("sections.payment.point.title")}</div>
                      <p className="text-xs text-slate-500">{t("sections.payment.point.description")}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.allow_point_subscription}
                        onChange={(event) => handleChange("allow_point_subscription", event.target.checked)}
                        disabled={form.introductory_offer_enabled}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      {t("toggles.enable")}
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{t("sections.payment.point.helper")}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t("sections.payment.jpy.title")}</div>
                      <p className="text-xs text-slate-500">{t("sections.payment.jpy.description")}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.allow_jpy_subscription}
                        onChange={(event) => handleChange("allow_jpy_subscription", event.target.checked)}
                        disabled={form.introductory_offer_enabled}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500"
                      />
                      {t("toggles.enable")}
                    </label>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                        <span>
                          {selectedPlan && form.allow_jpy_subscription
                            ? t("sections.payment.jpy.priceComputed", {
                                amount: formatter.number(selectedPlan.points ?? 0),
                              })
                            : t("sections.payment.jpy.pricePlaceholder")}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      <p>{t("sections.payment.jpy.helperLine1")}</p>
                      <p>{t("sections.payment.jpy.helperLine2")}</p>
                      {form.allow_jpy_subscription && !selectedPlan ? (
                        <span className="mt-1 block text-rose-500">{t("sections.payment.jpy.selectPlanWarning")}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t("sections.introOffer.title")}</div>
                      <p className="text-xs text-slate-500">{t("sections.introOffer.description")}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.introductory_offer_enabled}
                        onChange={(event) => handleIntroOfferChange(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500"
                      />
                      {t("sections.introOffer.checkbox")}
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{t("sections.introOffer.helper")}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t("sections.tax.title")}</div>
                      <p className="text-xs text-slate-500">{t("sections.tax.description")}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.tax_inclusive}
                        onChange={(event) => handleChange("tax_inclusive", event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500"
                      />
                      {t("toggles.taxInclusive")}
                    </label>
                  </div>
                  <div className="mt-3">
                    <label className="mb-2 block text-xs font-semibold text-slate-600">{t("labels.taxRate")}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder={t("placeholders.taxRate")}
                      value={form.tax_rate}
                      onChange={(event) => handleChange("tax_rate", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                href="/salons"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                {t("actions.cancel")}
              </Link>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t("actions.creating") : t("actions.submit")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
