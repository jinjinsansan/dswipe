"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { adminRevenueApi } from "@/lib/api";
import type {
  RevenueAnalyticsResponse,
  RevenuePointCategoryBreakdown,
  RevenuePointSeriesEntry,
  SettlementBucket,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

const formatJPY = (value?: number | null) =>
  value === undefined || value === null
    ? "-"
    : `¥${value.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`;

const formatUSDT = (value?: number | null) =>
  value === undefined || value === null ? "-" : `${value.toFixed(2)} USDT`;

const formatNumber = (value?: number | null) =>
  value === undefined || value === null ? "-" : value.toLocaleString("ja-JP");

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const LIMIT_OPTIONS = [30, 90, 120];

export default function AdminRevenuePage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isInitialized } = useAuthStore();
  const [limitDays, setLimitDays] = useState(120);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RevenueAnalyticsResponse | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminRevenueApi.getSummary({ limit_days: limitDays });
      setData(response.data as RevenueAnalyticsResponse);
    } catch (err) {
      console.error("Failed to load revenue analytics", err);
      setError("売上ダッシュボードの取得に失敗しました");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [limitDays]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [isInitialized, isAuthenticated, isAdmin, router, fetchData]);

  const summaryCards = useMemo(() => {
    if (!data) return [];
    const summary = data.summary;
    return [
      {
        title: "総売上",
        value: formatJPY(summary.total_revenue_jpy),
        description: `注文数 ${formatNumber(summary.total_orders)} 件`,
      },
      {
        title: "平均注文額",
        value: formatJPY(summary.average_order_value_jpy),
        description: "全期間平均",
      },
      {
        title: "推定USDT",
        value: formatUSDT(summary.total_revenue_usdt),
        description: `更新時刻 ${formatDateTime(summary.generated_at)}`,
      },
      {
        title: "直近7日",
        value: formatJPY(summary.last_seven_days_jpy),
        description: "完了ベース",
      },
      {
        title: "直近30日",
        value: formatJPY(summary.last_thirty_days_jpy),
        description: "完了ベース",
      },
    ];
  }, [data]);

  const settlementBuckets = useMemo<SettlementBucket[]>(
    () => data?.settlements.buckets ?? [],
    [data],
  );
  const pointCategories = useMemo<RevenuePointCategoryBreakdown[]>(
    () => data?.point_categories ?? [],
    [data],
  );
  const pointSeries = useMemo<RevenuePointSeriesEntry[]>(
    () => data?.point_series ?? [],
    [data],
  );

  return (
    <AdminShell pageTitle="売上ダッシュボード" pageSubtitle="全体売上・入金待ち・ポイント流通を俯瞰します">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
              <span>集計期間</span>
              <select
                value={limitDays}
                onChange={(event) => setLimitDays(Number(event.target.value))}
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              >
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    過去{option}日
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              再読込
            </button>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        ) : data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {summaryCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.description}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">入金ステータス</h2>
                  <span className="text-xs text-slate-500">USDT換算は最新レート基準</span>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">ステータス</th>
                        <th className="px-3 py-2 text-right">件数</th>
                        <th className="px-3 py-2 text-right">金額 (JPY)</th>
                        <th className="px-3 py-2 text-right">換算 (USDT)</th>
                        <th className="px-3 py-2 text-right">平均待機日数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {settlementBuckets.map((bucket: SettlementBucket) => (
                        <tr key={bucket.key}>
                          <td className="px-3 py-2 text-slate-700">{bucket.label}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatNumber(bucket.order_count)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatJPY(bucket.amount_jpy)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatUSDT(bucket.amount_usdt)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{bucket.average_wait_days.toFixed(1)} 日</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">ポイント概要</h2>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ネット残高</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formatNumber(data.point_net.net_points)} P</p>
                  <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <span>付与合計: {formatNumber(data.point_net.total_granted)} P</span>
                    <span>消費合計: {formatNumber(data.point_net.total_spent)} P</span>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">カテゴリ</th>
                        <th className="px-3 py-2 text-right">累計</th>
                        <th className="px-3 py-2 text-right">取引数</th>
                        <th className="px-3 py-2 text-right">直近7日</th>
                        <th className="px-3 py-2 text-right">直近30日</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {pointCategories.map((category: RevenuePointCategoryBreakdown) => (
                        <tr key={category.category}>
                          <td className="px-3 py-2 capitalize text-slate-700">{category.category.replace(/_/g, ' ')}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatNumber(category.total_points)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatNumber(category.transaction_count)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatNumber(category.last_seven_days)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatNumber(category.last_thirty_days)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">日別売上 (直近)</h2>
                <span className="text-xs text-slate-500">最大30行を表示</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">日付</th>
                      <th className="px-3 py-2 text-right">売上 (JPY)</th>
                      <th className="px-3 py-2 text-right">換算 (USDT)</th>
                      <th className="px-3 py-2 text-right">注文数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(data.daily ?? []).slice(0, 30).map((entry) => (
                      <tr key={entry.date}>
                        <td className="px-3 py-2 text-slate-700">{formatDate(entry.date)}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{formatJPY(entry.revenue_jpy)}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{formatUSDT(entry.revenue_usdt)}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{formatNumber(entry.orders)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">ポイント日次推移</h2>
                <span className="text-xs text-slate-500">付与・消費の粗い変化を確認</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">日付</th>
                      <th className="px-3 py-2 text-right">付与</th>
                      <th className="px-3 py-2 text-right">消費</th>
                      <th className="px-3 py-2 text-right">購入</th>
                      <th className="px-3 py-2 text-right">ボーナス</th>
                      <th className="px-3 py-2 text-right">その他</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pointSeries.slice(0, 30).map((entry: RevenuePointSeriesEntry) => (
                      <tr key={entry.date}>
                        <td className="px-3 py-2 text-slate-700">{formatDate(entry.date)}</td>
                        <td className="px-3 py-2 text-right text-emerald-600">{formatNumber(entry.granted)}</td>
                        <td className="px-3 py-2 text-right text-rose-600">{formatNumber(entry.spent)}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{formatNumber(entry.purchased)}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{formatNumber(entry.bonus)}</td>
                        <td className="px-3 py-2 text-right text-slate-900">{formatNumber(entry.other)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            データが見つかりませんでした。
          </div>
        )}
      </div>
    </AdminShell>
  );
}
