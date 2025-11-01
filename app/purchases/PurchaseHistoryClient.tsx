"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { purchasesApi } from "@/lib/api";
import type {
  PurchaseHistoryResponse,
  PurchaseHistoryProduct,
  PurchaseHistoryNote,
  PurchaseHistorySalon,
} from "@/types/api";

const formatDateTime = (value: string) => {
  if (!value) return value;
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

const getProductLink = (item: PurchaseHistoryProduct) => {
  if (item.lp_slug) {
    return `/view/${item.lp_slug}`;
  }
  return null;
};

const getNoteLink = (item: PurchaseHistoryNote) => {
  if (item.note_slug) {
    return `/notes/${item.note_slug}`;
  }
  return null;
};

const getSalonLink = (item: PurchaseHistorySalon) => `/salons/${item.salon_id}/public`;

export default function PurchaseHistoryClient() {
  const [history, setHistory] = useState<PurchaseHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await purchasesApi.getHistory();
      setHistory(response.data as PurchaseHistoryResponse);
    } catch (err: unknown) {
      console.error("Failed to load purchase history", err);
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err instanceof Error ? err.message : undefined);
      setError(message ?? "購入履歴の取得に失敗しました");
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
        label: "LP・デジタル商品",
        value: summary?.product_purchases ?? 0,
        icon: <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-purple-50 text-purple-600 border-purple-200",
      },
      {
        label: "有料NOTE",
        value: summary?.note_purchases ?? 0,
        icon: <BookOpenIcon className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-sky-50 text-sky-600 border-sky-200",
      },
      {
        label: "加入中のサロン",
        value: summary?.active_salon_memberships ?? 0,
        icon: <UserGroupIcon className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
      },
    ];
  }, [history]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="購入履歴"
      pageSubtitle="LP商品・有料NOTE・オンラインサロンの購入状況を確認できます"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              最新の購入データは即時に反映されます。必要に応じて再取得してください。
            </p>
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

        <section className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-3xl border px-5 py-6 shadow-sm ${card.accent}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {card.label}
                </p>
                <span className="rounded-full bg-white/70 p-2 text-slate-600 shadow-sm">
                  {card.icon}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">LP・デジタル商品</h2>
              <p className="text-sm text-slate-500">
                ポイント / 日本円決済で購入したLP連動商品やテンプレートの履歴です
              </p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
              {history?.products.length ?? 0} 件
            </span>
          </div>

          {history && history.products.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {history.products.map((item) => {
                const link = getProductLink(item);
                const isYenPayment = item.payment_method === "yen";
                const amountDisplay = isYenPayment
                  ? formatYen(item.amount_jpy)
                  : formatPoints(item.amount_points);
                const amountClass = isYenPayment ? "text-emerald-600" : "text-purple-600";
                const methodLabel = isYenPayment ? "日本円決済" : "ポイント決済";
                return (
                  <li
                    key={item.transaction_id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.product_title ?? "名称未設定の商品"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.seller_display_name ?? item.seller_username ?? "販売者不明"}
                      </p>
                      {item.description ? (
                        <p className="text-xs text-slate-500">{item.description}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                            isYenPayment ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {methodLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{formatDateTime(item.purchased_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-semibold ${amountClass}`}>
                        {amountDisplay}
                      </span>
                      {link ? (
                        <Link
                          href={link}
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
              まだLP商品・テンプレートの購入履歴がありません。
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">有料NOTE</h2>
              <p className="text-sm text-slate-500">ポイント / 日本円決済で購入済みの有料NOTE一覧です</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
              {history?.notes.length ?? 0} 件
            </span>
          </div>

          {history && history.notes.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {history.notes.map((item) => {
                const link = getNoteLink(item);
                const isYenPayment = item.payment_method === "yen";
                const amountDisplay = isYenPayment ? formatYen(item.amount_jpy) : formatPoints(item.points_spent);
                const amountClass = isYenPayment ? "text-emerald-600" : "text-sky-600";
                const methodLabel = isYenPayment ? "日本円決済" : "ポイント決済";
                return (
                  <li
                    key={item.purchase_id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.note_title ?? "タイトル未設定のNOTE"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.author_display_name ?? item.author_username ?? "著者不明"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                            isYenPayment ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
                          }`}
                        >
                          {methodLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{formatDateTime(item.purchased_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-semibold ${amountClass}`}>
                        {amountDisplay}
                      </span>
                      {link ? (
                        <Link
                          href={link}
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
              有料NOTEの購入履歴はまだありません。
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">加入中のオンラインサロン</h2>
              <p className="text-sm text-slate-500">アクティブなメンバーシップと次回課金予定を確認できます</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              {history?.active_salons.length ?? 0} 件
            </span>
          </div>

          {history && history.active_salons.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {history.active_salons.map((item) => (
                <div
                  key={item.membership_id}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.salon_title ?? "名称未設定のサロン"}
                      </p>
                      {item.salon_category ? (
                        <span className="mt-1 inline-flex items-center rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {item.salon_category}
                        </span>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-white bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.owner_display_name ?? item.owner_username ?? "オーナー未設定"}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="font-semibold text-slate-500">加入日</p>
                      <p className="mt-1 text-slate-900">{formatDateTime(item.joined_at)}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                      <p className="font-semibold text-slate-500">次回課金予定</p>
                      <p className="mt-1 text-slate-900">
                        {item.next_charge_at ? formatDateTime(item.next_charge_at) : "未定"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {item.plan_label ?? "プラン情報未設定"}
                      {item.plan_points ? ` / ${formatPoints(item.plan_points)}` : ""}
                    </span>
                    <Link
                      href={getSalonLink(item)}
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
              現在加入中のオンラインサロンはありません。
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
