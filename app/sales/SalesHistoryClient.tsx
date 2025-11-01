"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  UserGroupIcon,
  SparklesIcon,
  CurrencyYenIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salesApi } from "@/lib/api";
import type {
  SalesHistoryResponse,
  SalesNoteRecord,
  SalesProductRecord,
  SalesSalonRecord,
} from "@/types/api";

const formatDateTime = (value?: string | null) => {
  if (!value) return value ?? "";
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

const formatPoints = (points: number) => `${new Intl.NumberFormat("ja-JP").format(points)} pt`;
const formatYen = (amount?: number | null) => `${new Intl.NumberFormat("ja-JP").format(amount ?? 0)} 円`;

const getLpLink = (record: SalesProductRecord) => (record.lp_slug ? `/view/${record.lp_slug}` : null);
const getNoteLink = (record: SalesNoteRecord) => (record.note_slug ? `/notes/${record.note_slug}` : null);
const getSalonLink = (record: SalesSalonRecord) => `/salons/${record.salon_id}/public`;

export default function SalesHistoryClient() {
  const [history, setHistory] = useState<SalesHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await salesApi.getHistory();
      setHistory(response.data as SalesHistoryResponse);
    } catch (err: unknown) {
      console.error("Failed to load sales history", err);
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err instanceof Error ? err.message : undefined);
      setError(message ?? "販売履歴の取得に失敗しました");
      setHistory(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summaryCards = useMemo(() => {
    const summary = history?.summary;
    return [
      {
        label: "商品売上件数",
        value: (summary?.product_orders ?? 0).toLocaleString(),
        accent: "bg-purple-50 text-purple-600 border-purple-200",
        icon: <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />,
      },
      {
        label: "NOTE売上件数",
        value: (summary?.note_orders ?? 0).toLocaleString(),
        accent: "bg-sky-50 text-sky-600 border-sky-200",
        icon: <BookOpenIcon className="h-5 w-5" aria-hidden="true" />,
      },
      {
        label: "サロン加入人数",
        value: (summary?.salon_memberships ?? 0).toLocaleString(),
        accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
        icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />,
      },
      {
        label: "ポイント売上合計",
        value: formatPoints(summary?.total_points_revenue ?? 0),
        accent: "bg-blue-50 text-blue-600 border-blue-200",
        icon: <SparklesIcon className="h-5 w-5" aria-hidden="true" />,
      },
      {
        label: "日本円売上合計",
        value: formatYen(summary?.total_yen_revenue ?? 0),
        accent: "bg-amber-50 text-amber-600 border-amber-200",
        icon: <CurrencyYenIcon className="h-5 w-5" aria-hidden="true" />,
      },
    ];
  }, [history]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="販売履歴"
      pageSubtitle="LP商品・有料NOTE・オンラインサロンの販売状況を確認できます"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : (
            <p className="text-sm text-slate-500">売上データは最新状態を反映します。必要に応じて再取得してください。</p>
          )}
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
            再取得
          </button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <div key={card.label} className={`rounded-3xl border px-5 py-6 shadow-sm ${card.accent}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <span className="rounded-full bg-white/70 p-2 text-slate-600 shadow-sm">{card.icon}</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">LP・デジタル商品売上</h2>
              <p className="text-sm text-slate-500">ポイント / 日本円決済で販売された商品履歴です</p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
              {history?.products.length ?? 0} 件
            </span>
          </div>

          {history && history.products.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {history.products.map((sale) => {
                const isYen = sale.payment_method === "yen";
                const amountDisplay = isYen ? formatYen(sale.amount_jpy ?? 0) : formatPoints(sale.amount_points);
                const amountClass = isYen ? "text-emerald-600" : "text-purple-600";
                const methodLabel = isYen ? "日本円決済" : "ポイント決済";
                const lpLink = getLpLink(sale);
                return (
                  <li
                    key={sale.sale_id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900">{sale.product_title ?? "名称未設定の商品"}</p>
                      <p className="text-xs text-slate-500">
                        購入者: {sale.buyer_username ? `@${sale.buyer_username}` : "不明"}
                      </p>
                      {sale.description ? <p className="text-xs text-slate-500">{sale.description}</p> : null}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                            isYen ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {methodLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{formatDateTime(sale.purchased_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-semibold ${amountClass}`}>{amountDisplay}</span>
                      {lpLink ? (
                        <Link
                          href={lpLink}
                          className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-600 transition hover:bg-purple-50"
                        >
                          公開LPを見る
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              まだLP商品・テンプレートの販売履歴がありません。
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">有料NOTE売上</h2>
              <p className="text-sm text-slate-500">ポイント / 日本円決済で販売されたNOTEの履歴です</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
              {history?.notes.length ?? 0} 件
            </span>
          </div>

          {history && history.notes.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {history.notes.map((sale) => {
                const isYen = sale.payment_method === "yen";
                const amountDisplay = isYen ? formatYen(sale.amount_jpy ?? 0) : formatPoints(sale.points_spent);
                const amountClass = isYen ? "text-emerald-600" : "text-sky-600";
                const methodLabel = isYen ? "日本円決済" : "ポイント決済";
                const noteLink = getNoteLink(sale);
                return (
                  <li
                    key={sale.sale_id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900">{sale.note_title ?? "タイトル未設定のNOTE"}</p>
                      <p className="text-xs text-slate-500">
                        購入者: {sale.buyer_username ? `@${sale.buyer_username}` : "不明"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                            isYen ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
                          }`}
                        >
                          {methodLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{formatDateTime(sale.purchased_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-semibold ${amountClass}`}>{amountDisplay}</span>
                      {noteLink ? (
                        <Link
                          href={noteLink}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50"
                        >
                          NOTEを開く
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              有料NOTEの販売履歴はまだありません。
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">オンラインサロン加入状況</h2>
              <p className="text-sm text-slate-500">自分のサロンに加入したメンバーのステータスを一覧できます</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              {history?.salons.length ?? 0} 件
            </span>
          </div>

          {history && history.salons.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {history.salons.map((sale) => (
                <div
                  key={sale.membership_id}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{sale.salon_title ?? "名称未設定のサロン"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        会員: {sale.buyer_username ? `@${sale.buyer_username}` : "不明"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      {sale.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="font-semibold text-slate-500">加入日</p>
                      <p className="mt-1 text-slate-900">{formatDateTime(sale.joined_at)}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="font-semibold text-slate-500">次回課金予定</p>
                      <p className="mt-1 text-slate-900">
                        {sale.next_charge_at ? formatDateTime(sale.next_charge_at) : "未定"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {sale.last_charged_at ? `最終課金: ${formatDateTime(sale.last_charged_at)}` : "最終課金情報なし"}
                    </span>
                    <Link
                      href={getSalonLink(sale)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                    >
                      公開ページ
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-6 py-10 text-center text-sm text-emerald-600">
              現在のサロン加入履歴はまだありません。
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
