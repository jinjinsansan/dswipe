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
  allow_point_subscription: boolean;
  allow_jpy_subscription: boolean;
  tax_rate: string;
  tax_inclusive: boolean;
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

    const allowPoint = form.allow_point_subscription;
    const allowJpy = form.allow_jpy_subscription;

    if (!allowPoint && !allowJpy) {
      setError("少なくとも1つの決済方法を有効にしてください");
      return;
    }

    if (allowJpy) {
      if (!selectedPlan) {
        setError("日本円サブスクを有効にするにはサブスクプランを選択してください");
        return;
      }
      if (!Number.isFinite(selectedPlan.points) || selectedPlan.points <= 0) {
        setError("選択したプランのポイント数が正しく設定されていません");
        return;
      }
    }

    const taxRateInput = form.tax_rate.trim();
    const parsedTaxRate = taxRateInput === "" ? null : Number(taxRateInput);
    if (parsedTaxRate !== null && (Number.isNaN(parsedTaxRate) || parsedTaxRate < 0 || parsedTaxRate > 100)) {
      setError("消費税率は0〜100の範囲で入力してください");
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

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">決済方法設定</div>
                  <p className="text-xs text-slate-500">
                    ポイント／日本円どちらで会費を徴収するか選択し、必要に応じて価格と税率を設定してください。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">ポイントサブスク</div>
                      <p className="text-xs text-slate-500">ONE.latプランと連携したポイント決済を利用します。</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.allow_point_subscription}
                        onChange={(event) => handleChange("allow_point_subscription", event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      有効化
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    ポイント決済を無効にして日本円のみで運用したい場合はチェックを外してください。
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">日本円サブスク</div>
                      <p className="text-xs text-slate-500">one.latの月額決済を利用して日本円で課金します。</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.allow_jpy_subscription}
                        onChange={(event) => handleChange("allow_jpy_subscription", event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500"
                      />
                      有効化
                    </label>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                        <span>
                          {selectedPlan && form.allow_jpy_subscription
                            ? `${selectedPlan.points.toLocaleString("ja-JP")} 円 / 月`
                            : "プラン選択で自動計算"}
                        </span>
                      </div>
                    </div>
                  <div className="text-xs text-slate-500">
                    <p>ONE.lat側のプランポイント数をそのまま日本円表示に利用します。</p>
                    <p>税込・税抜の表示は下記の税設定に準拠します。</p>
                    {form.allow_jpy_subscription && !selectedPlan ? (
                      <span className="mt-1 block text-rose-500">先にサブスクプランを選択してください。</span>
                    ) : null}
                  </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">税込表示設定</div>
                      <p className="text-xs text-slate-500">日本円決済の表示と決済データに反映される税率を設定します。</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.tax_inclusive}
                        onChange={(event) => handleChange("tax_inclusive", event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500"
                      />
                      税込として扱う
                    </label>
                  </div>
                  <div className="mt-3">
                    <label className="mb-2 block text-xs font-semibold text-slate-600">消費税率</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="10"
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
      </div>
    </DashboardLayout>
  );
}
