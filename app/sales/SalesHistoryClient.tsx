"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentProps, type ComponentType } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  UserGroupIcon,
  SparklesIcon,
  CurrencyYenIcon,
  ArrowTopRightOnSquareIcon,
  WalletIcon,
  CalendarIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salesApi, payoutApi } from "@/lib/api";
import type {
  SalesHistoryResponse,
  SalesNoteRecord,
  SalesProductRecord,
  SalesSalonRecord,
  PayoutDashboardResponse,
  PayoutLedgerEntry,
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
const formatUsd = (amount?: number | null) => (amount === undefined || amount === null ? "-" : `${amount.toFixed(2)} USD`);
const formatShortDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

type ClearingStateConfig = {
  label: string;
  description: string;
  badgeClass: string;
  icon: ComponentType<ComponentProps<"svg">>;
};

const CLEARING_STATE_DISPLAY: Record<string, ClearingStateConfig> = {
  pending: {
    label: "決済待機中",
    description: "カード会社での決済確定を待っています。",
    badgeClass: "bg-slate-100 text-slate-600",
    icon: ClockIcon,
  },
  clearing: {
    label: "決済確認中",
    description: "チャージバック確認期間中のため支払いを保留しています。",
    badgeClass: "bg-amber-100 text-amber-700",
    icon: ClockIcon,
  },
  ready: {
    label: "支払い対象",
    description: "次回の支払いサイクルで送金処理されます。",
    badgeClass: "bg-emerald-100 text-emerald-600",
    icon: ShieldCheckIcon,
  },
  dispute: {
    label: "調査中",
    description: "カード会社による調査中のため一時停止しています。",
    badgeClass: "bg-rose-100 text-rose-600",
    icon: ExclamationTriangleIcon,
  },
  released: {
    label: "送金完了",
    description: "送金済みの決済です。",
    badgeClass: "bg-sky-100 text-sky-600",
    icon: ShieldCheckIcon,
  },
  cancelled: {
    label: "キャンセル済み",
    description: "返金またはキャンセルされた決済です。",
    badgeClass: "bg-slate-200 text-slate-600",
    icon: ExclamationTriangleIcon,
  },
};

const resolveClearingState = (sale: SalesProductRecord | SalesNoteRecord) => {
  if (sale.dispute_flag) {
    return "dispute";
  }
  const state = (sale.clearing_state || "").toLowerCase();
  if (state === "ready_to_payout") {
    return "ready";
  }
  if (!state) {
    return sale.ready_for_payout_at ? "ready" : "pending";
  }
  return state;
};

const riskBadgeClass = (riskLevel?: string | null) => {
  if (!riskLevel) return "bg-slate-100 text-slate-600";
  const level = riskLevel.toLowerCase();
  if (level === "high") return "bg-rose-100 text-rose-600";
  if (level === "medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-600";
};

const getLpLink = (record: SalesProductRecord) => (record.lp_slug ? `/view/${record.lp_slug}` : null);
const getNoteLink = (record: SalesNoteRecord) => (record.note_slug ? `/notes/${record.note_slug}` : null);
const getSalonLink = (record: SalesSalonRecord) => `/salons/${record.salon_id}/public`;

export default function SalesHistoryClient() {
  const [history, setHistory] = useState<SalesHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payoutDashboard, setPayoutDashboard] = useState<PayoutDashboardResponse | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutLedgerEntry | null>(null);
  const [addressInput, setAddressInput] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [salesResponse, payoutResponse] = await Promise.all([
        salesApi.getHistory(),
        payoutApi.getDashboard().catch((err) => {
          console.error("Failed to load payout dashboard", err);
          return null;
        }),
      ]);
      setHistory(salesResponse.data as SalesHistoryResponse);
      if (payoutResponse) {
        const dashboard = payoutResponse.data as PayoutDashboardResponse;
        setPayoutDashboard(dashboard);
        setAddressInput(dashboard.settings?.usdt_address ?? "");
      }
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

  const handleSaveAddress = useCallback(async () => {
    if (!addressInput || !addressInput.startsWith("T")) {
      alert("TRC20形式のUSDTウォレットアドレスを入力してください (先頭がT)。");
      return;
    }
    try {
      setIsSavingAddress(true);
      await payoutApi.updateSettings({ usdt_address: addressInput });
      const dashboard = await payoutApi.getDashboard();
      setPayoutDashboard(dashboard.data as PayoutDashboardResponse);
      alert("受取アドレスを更新しました");
    } catch (err) {
      console.error("Failed to update payout address", err);
      alert("受取アドレスの更新に失敗しました");
    } finally {
      setIsSavingAddress(false);
    }
  }, [addressInput]);

  const handleViewPayoutDetail = useCallback(async (payoutId: string) => {
    try {
      setDetailLoading(true);
      const response = await payoutApi.getDetail(payoutId);
      setSelectedPayout(response.data as PayoutLedgerEntry);
    } catch (err) {
      console.error("Failed to load payout detail", err);
      alert("支払い詳細の取得に失敗しました");
    } finally {
      setDetailLoading(false);
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

  const renderClearingStatus = useCallback(
    (sale: SalesProductRecord | SalesNoteRecord) => {
      if (sale.payment_method !== "yen") {
        return null;
      }
      const stateKey = resolveClearingState(sale);
      const config = CLEARING_STATE_DISPLAY[stateKey] ?? CLEARING_STATE_DISPLAY.pending;
      const Icon = config.icon;
      const riskLevel = sale.risk_level ?? undefined;
      const readyAt = formatShortDate(sale.ready_for_payout_at);
      const holdUntil = formatShortDate(sale.chargeback_hold_until);
      const reserve = sale.reserve_amount_usd && sale.reserve_amount_usd > 0 ? `${sale.reserve_amount_usd.toFixed(2)} USD` : null;
      const riskScore = sale.risk_score !== null && sale.risk_score !== undefined ? sale.risk_score : null;
      const riskFactors = sale.risk_factors && typeof sale.risk_factors === "object" ? Object.keys(sale.risk_factors) : [];

      return (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {config.label}
            </span>
            {riskLevel && (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${riskBadgeClass(riskLevel)}`}
              >
                リスク {riskLevel.toUpperCase()}
                {riskScore !== null && <span className="ml-1 text-[11px] font-normal">(スコア {riskScore})</span>}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-600">{config.description}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            {readyAt && (
              <span>
                支払い目安: <span className="font-semibold text-slate-700">{readyAt}</span>
              </span>
            )}
            {holdUntil && holdUntil !== readyAt && (
              <span>
                ホールド期限: <span className="font-semibold text-slate-700">{holdUntil}</span>
              </span>
            )}
            {reserve && (
              <span>
                留保額: <span className="font-semibold text-slate-700">{reserve}</span>
              </span>
            )}
          </div>
          {riskFactors.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {riskFactors.map((factorKey) => (
                <span
                  key={factorKey}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
                >
                  {factorKey.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
          {sale.dispute_flag && sale.dispute_status && (
            <p className="mt-2 text-xs font-semibold text-rose-600">
              カード会社調査ステータス: {sale.dispute_status}
            </p>
          )}
        </div>
      );
    },
    []
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="販売履歴"
      pageSubtitle="LP商品・有料NOTE・オンラインサロンの販売状況と支払い予定を確認できます"
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
            onClick={() => {
              setSelectedPayout(null);
              refresh();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
            再取得
          </button>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-relaxed text-amber-800">
          <p className="font-semibold">クレジット決済の支払いタイミング</p>
          <p className="mt-1">
            決済完了後はカード会社のチャージバック確認期間として最大45日間「決済確認中」となります。リスクスコアが高い取引は安全のため一部金額を留保し、調査が完了次第に送金対象へ切り替わります。
          </p>
          <p className="mt-1">
            支払い状況・留保額・ホールド期限はそれぞれの決済カード内で確認できます。調査中の決済についてご不明点がある場合はサポート窓口までお問い合わせください。
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-2 text-blue-600">
                  <WalletIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">USDT受取設定</h2>
                  <p className="text-sm text-slate-500">決済翌日から換算し10日後以降に運営よりTRC20ネットワークで送金されます。</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500">受取ウォレットアドレス（TRC20）</span>
                  <input
                    value={addressInput}
                    onChange={(event) => setAddressInput(event.target.value.trim())}
                    placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isSavingAddress ? "更新中…" : "アドレスを保存"}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  次回支払い予定
                  <CalendarIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {payoutDashboard?.next_settlement_at ? formatDateTime(payoutDashboard.next_settlement_at) : "未定"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  支払い待機中合計
                  <BanknotesIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <p className="mt-2 text-base font-semibold text-emerald-600">{formatUsd(payoutDashboard?.pending_net_amount_usdt)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">支払い待機中</h3>
                <span className="text-xs text-slate-500">{payoutDashboard?.pending_records.length ?? 0} 件</span>
              </div>
              <div className="mt-3 space-y-3">
                {(payoutDashboard?.pending_records ?? []).map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => handleViewPayoutDetail(record.id)}
                    className="w-full rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>
                        {formatDateTime(record.period_start)} ～ {formatDateTime(record.period_end)}
                      </span>
                      <span className="text-emerald-600">{formatUsd(record.net_amount_usdt)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>支払い予定: {formatDateTime(record.settlement_due_at)}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600">{record.status}</span>
                    </div>
                  </button>
                ))}
                {(payoutDashboard?.pending_records?.length ?? 0) === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                    現在支払い待機中のレコードはありません。
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">最近の支払い履歴</h3>
                <span className="text-xs text-slate-500">{payoutDashboard?.recent_records.length ?? 0} 件</span>
              </div>
              <div className="mt-3 space-y-3">
                {(payoutDashboard?.recent_records ?? []).map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => handleViewPayoutDetail(record.id)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>
                        {formatDateTime(record.period_start)} ～ {formatDateTime(record.period_end)}
                      </span>
                      <span className="text-slate-700">{formatUsd(record.net_amount_usdt)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>支払い日: {formatDateTime(record.settlement_due_at)}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{record.status}</span>
                    </div>
                  </button>
                ))}
                {(payoutDashboard?.recent_records?.length ?? 0) === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                    まだ支払い履歴がありません。
                  </p>
                )}
              </div>
            </div>
          </div>

          {detailLoading ? (
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">支払い詳細を読み込み中です…</p>
          ) : null}

          {selectedPayout ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">支払い詳細</h3>
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                >
                  閉じる
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-500">期間</p>
                  <p className="mt-1 text-slate-900">
                    {formatDateTime(selectedPayout.period_start)}
                    <br />～ {formatDateTime(selectedPayout.period_end)}
                  </p>
                </div>
                <div className="rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-500">支払い予定日</p>
                  <p className="mt-1 text-slate-900">{formatDateTime(selectedPayout.settlement_due_at)}</p>
                </div>
                <div className="rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-500">ステータス</p>
                  <p className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                    {selectedPayout.status}
                  </p>
                </div>
                <div className="rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-500">送金Tx</p>
                  <p className="mt-1 break-all text-slate-900">{selectedPayout.admin_tx_hash ?? "未登録"}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-900">対象決済 {selectedPayout.line_items.length} 件</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">決済日時</th>
                        <th className="px-3 py-2 text-left">説明</th>
                        <th className="px-3 py-2 text-right">売上USD</th>
                        <th className="px-3 py-2 text-right">手数料USD</th>
                        <th className="px-3 py-2 text-right">支払額USDT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {selectedPayout.line_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-slate-600">{formatDateTime(item.occurred_at ?? "")}</td>
                          <td className="px-3 py-2 text-slate-600">{item.description ?? item.source_type}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatUsd(item.gross_amount_usd)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatUsd(item.fee_amount_usd)}</td>
                          <td className="px-3 py-2 text-right text-emerald-600">{formatUsd(item.net_amount_usdt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-900">イベントログ</h4>
                <div className="mt-2 space-y-2">
                  {selectedPayout.events.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">イベントログはまだありません。</p>
                  ) : (
                    selectedPayout.events.map((event) => (
                      <div key={event.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          <span>{event.event_type}</span>
                          <span>{formatDateTime(event.created_at)}</span>
                        </div>
                        {event.title ? <p className="mt-1 text-sm font-semibold text-slate-900">{event.title}</p> : null}
                        {event.body ? <p className="text-xs text-slate-600">{event.body}</p> : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>

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
                    <div className="flex flex-col gap-2">
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
                      {renderClearingStatus(sale)}
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
                    <div className="flex flex-col gap-2">
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
                      {renderClearingStatus(sale)}
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
