"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  thumbnail_url: "",
  subscription_plan_id: "",
};

export default function SalonCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usedPlanIds, setUsedPlanIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setError(typeof detail === "string" ? detail : "サロン作成に必要な情報を取得できませんでした");
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
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);
    setSuccessMessage(null);

    if (!form.title.trim()) {
      setError("サロン名を入力してください");
      return;
    }
    if (!form.subscription_plan_id) {
      setError("紐付けるサブスクプランを選択してください");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        subscription_plan_id: form.subscription_plan_id,
      };

      const response = await salonApi.create(payload);
      const created = response.data as Salon;
      setSuccessMessage("サロンを作成しました。詳細ページに移動します。");

      setTimeout(() => {
        router.replace(`/salons/${created.id}`);
      }, 600);
    } catch (submitError: any) {
      console.error("Failed to create salon", submitError);
      const detail = submitError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "サロンの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="サロン新規作成"
      pageSubtitle="サロン名称とサブスクプランを設定するとオンラインサロンを開始できます"
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                サロン名
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="例：デジタルクリエイターズラボ"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                サロン概要
              </label>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                rows={4}
                placeholder="サロン内容や特典を記載してください"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                サムネイルURL (任意)
              </label>
              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(event) => handleChange("thumbnail_url", event.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <p className="text-xs text-slate-400">Mediaライブラリの画像URLなどを設定できます。</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                サブスクプラン
              </label>
              <div className="grid gap-3">
                {availablePlans.length === 0 ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    サブスクプランが見つかりません。事前にONE.lat側でプランを設定してください。
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
                          {plan.points.toLocaleString("ja-JP")}pt / ${plan.usd_amount.toFixed(2)}
                        </span>
                        {isDisabled ? (
                          <span className="mt-1 text-xs font-semibold text-rose-500">このプランは既に利用中です</span>
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
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Link
              href="/salons"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            >
              キャンセル
            </Link>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "作成中..." : "サロンを作成"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
