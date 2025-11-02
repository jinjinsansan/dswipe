"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BanknotesIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

import AdminShell from "@/components/admin/AdminShell";
import { adminPayoutApi } from "@/lib/api";
import type {
  AdminPayoutEventPayload,
  AdminPayoutGeneratePayload,
  AdminPayoutListItem,
  AdminPayoutListResponse,
  AdminPayoutStatusUpdatePayload,
  AdminPayoutTxRecordPayload,
  PayoutLedgerEntry,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

const STATUS_OPTIONS = [
  { value: "pending", label: "pending" },
  { value: "funds_received", label: "funds_received" },
  { value: "ready_to_payout", label: "ready_to_payout" },
  { value: "paid", label: "paid" },
  { value: "on_hold", label: "on_hold" },
  { value: "cancelled", label: "cancelled" },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const normalized = value.includes("Z") || value.includes("+") ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatUsd = (value?: number | null) => (value === undefined || value === null ? "-" : `${value.toFixed(2)} USD`);

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isInitialized } = useAuthStore();
  const [list, setList] = useState<AdminPayoutListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PayoutLedgerEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState<{ status?: string; seller_query?: string }>({});
  const [generateLoading, setGenerateLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [txRecording, setTxRecording] = useState(false);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [statusInput, setStatusInput] = useState("paid");
  const [statusNote, setStatusNote] = useState("");
  const [txHash, setTxHash] = useState("");
  const [txMemo, setTxMemo] = useState("");
  const [eventBody, setEventBody] = useState("");

  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminPayoutApi.list({ status: filters.status, seller_query: filters.seller_query, limit: 100 });
      const payload = response.data as AdminPayoutListResponse;
      setList(payload.data);
      setTotal(payload.total);
    } catch (err) {
      console.error("Failed to load payout list", err);
      setList([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchDetail = useCallback(async (payoutId: string) => {
    try {
      setDetailLoading(true);
      const response = await adminPayoutApi.getDetail(payoutId);
      setSelectedEntry(response.data as PayoutLedgerEntry);
      setSelectedId(payoutId);
      setStatusInput((response.data as PayoutLedgerEntry).status);
      setStatusNote("");
    } catch (err) {
      console.error("Failed to load payout detail", err);
      alert("支払い詳細の取得に失敗しました");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchList();
  }, [isInitialized, isAuthenticated, isAdmin, router, fetchList]);

  const handleGenerate = useCallback(async () => {
    try {
      setGenerateLoading(true);
      const payload: AdminPayoutGeneratePayload = { lookback_days: 14, fee_percent: 5 };
      const result = await adminPayoutApi.generate(payload);
      const createdList = Array.isArray((result.data as { created?: unknown[] }).created)
        ? ((result.data as { created: unknown[] }).created.length)
        : 0;
      alert(`支払いエントリを生成しました (${createdList}件)`);
      await fetchList();
    } catch (err) {
      console.error("Failed to generate payouts", err);
      alert("支払いエントリの生成に失敗しました");
    } finally {
      setGenerateLoading(false);
    }
  }, [fetchList]);

  const handleUpdateStatus = useCallback(async () => {
    if (!selectedId) return;
    try {
      setStatusUpdateLoading(true);
      const payload: AdminPayoutStatusUpdatePayload = { status: statusInput, note: statusNote || undefined };
      const response = await adminPayoutApi.updateStatus(selectedId, payload);
      setSelectedEntry(response.data as PayoutLedgerEntry);
      await fetchList();
      alert("ステータスを更新しました");
    } catch (err) {
      console.error("Failed to update payout status", err);
      alert("ステータス更新に失敗しました");
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [fetchList, selectedId, statusInput, statusNote]);

  const handleRecordTransaction = useCallback(async () => {
    if (!selectedId || !txHash) {
      alert("Txハッシュを入力してください");
      return;
    }
    try {
      setTxRecording(true);
      const payload: AdminPayoutTxRecordPayload = { tx_hash: txHash, tx_memo: txMemo || undefined };
      const response = await adminPayoutApi.recordTransaction(selectedId, payload);
      setSelectedEntry(response.data as PayoutLedgerEntry);
      setTxHash("");
      setTxMemo("");
      await fetchList();
      alert("送金情報を記録しました");
    } catch (err) {
      console.error("Failed to record transaction", err);
      alert("送金情報の記録に失敗しました");
    } finally {
      setTxRecording(false);
    }
  }, [fetchList, selectedId, txHash, txMemo]);

  const handleAddEvent = useCallback(async () => {
    if (!selectedId || !eventBody) {
      alert("メモを入力してください");
      return;
    }
    try {
      setEventSubmitting(true);
      const payload: AdminPayoutEventPayload = { event_type: "memo", body: eventBody };
      await adminPayoutApi.addEvent(selectedId, payload);
      setEventBody("");
      await fetchDetail(selectedId);
      alert("メモを追加しました");
    } catch (err) {
      console.error("Failed to add payout memo", err);
      alert("メモの追加に失敗しました");
    } finally {
      setEventSubmitting(false);
    }
  }, [eventBody, fetchDetail, selectedId]);

  const listContent = useMemo(() => {
    if (isLoading) {
      return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">読み込み中です…</p>;
    }
    if (list.length === 0) {
      return <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">対象の支払いエントリがありません。</p>;
    }
    return (
      <ul className="space-y-3">
        {list.map((item) => {
          const isActive = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => fetchDetail(item.id)}
                className={`flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50/60 ${
                  isActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>{item.seller_username ?? item.seller_id}</span>
                  <span className="text-emerald-600">{formatUsd(item.net_amount_usdt)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <span>期間: {formatDateTime(item.period_start)} ～ {formatDateTime(item.period_end)}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{item.status}</span>
                </div>
                <div className="text-xs text-slate-400">支払い予定: {formatDateTime(item.settlement_due_at)}</div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }, [fetchDetail, isLoading, list, selectedId]);

  return (
    <AdminShell pageTitle="支払い管理" pageSubtitle="one.lat決済後のUSDT送金キューを管理します">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <BanknotesIcon className="h-4 w-4" aria-hidden="true" />
            合計 {total.toLocaleString()} 件
          </span>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
              <FunnelIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <select
                value={filters.status ?? ""}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value || undefined }))}
                className="bg-transparent text-sm text-slate-700 focus:outline-none"
              >
                <option value="">全てのステータス</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <input
              value={filters.seller_query ?? ""}
              onChange={(event) => setFilters((prev) => ({ ...prev, seller_query: event.target.value || undefined }))}
              placeholder="販売者ID / メール / ユーザー名"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={fetchList}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
              更新
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generateLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4" aria-hidden="true" />
              {generateLoading ? "生成中…" : "支払い対象を生成"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            {listContent}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">支払い詳細</h2>
            {detailLoading ? (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">読み込み中です…</p>
            ) : selectedEntry ? (
              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">販売者</p>
                  <p className="mt-1 text-slate-900">{selectedEntry.seller_username ?? selectedEntry.seller_id}</p>
                  <p className="text-xs text-slate-500">{selectedEntry.seller_email ?? "メール未登録"}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <p className="font-semibold text-slate-500">期間</p>
                    <p className="mt-1 text-slate-900">{formatDateTime(selectedEntry.period_start)}<br />～ {formatDateTime(selectedEntry.period_end)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <p className="font-semibold text-slate-500">支払い予定日</p>
                    <p className="mt-1 text-slate-900">{formatDateTime(selectedEntry.settlement_due_at)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <p className="font-semibold text-slate-500">ステータス</p>
                    <p className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600">{selectedEntry.status}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <p className="font-semibold text-slate-500">支払額</p>
                    <p className="mt-1 text-emerald-600">{formatUsd(selectedEntry.net_amount_usdt)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-500">送金Tx</p>
                    <p className="mt-1 break-all text-slate-900">{selectedEntry.admin_tx_hash ?? "未登録"}</p>
                    <p className="text-[11px] text-slate-500">{formatDateTime(selectedEntry.admin_tx_confirmed_at)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">ステータス更新</p>
                    <div className="mt-2 flex flex-col gap-2">
                      <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={statusNote}
                        onChange={(event) => setStatusNote(event.target.value)}
                        placeholder="メモ (任意)"
                        className="min-h-[72px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={statusUpdateLoading}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {statusUpdateLoading ? "更新中…" : "ステータスを更新"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">送金情報の記録</p>
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        value={txHash}
                        onChange={(event) => setTxHash(event.target.value.trim())}
                        placeholder="トランザクションハッシュ"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                      />
                      <input
                        value={txMemo}
                        onChange={(event) => setTxMemo(event.target.value)}
                        placeholder="メモ (任意)"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleRecordTransaction}
                        disabled={txRecording}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        {txRecording ? "記録中…" : "送金済みに更新"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">運営メモ</p>
                    <textarea
                      value={eventBody}
                      onChange={(event) => setEventBody(event.target.value)}
                      placeholder="送金メモや注意事項を残せます"
                      className="min-h-[72px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddEvent}
                      disabled={eventSubmitting}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
                    >
                      <ChatBubbleBottomCenterTextIcon className="h-4 w-4" aria-hidden="true" />
                      {eventSubmitting ? "追加中…" : "メモを追加"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">イベントログ</p>
                    <div className="mt-2 space-y-2">
                      {selectedEntry.events.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">イベントログはまだありません。</p>
                      ) : (
                        selectedEntry.events.map((event) => (
                          <div key={event.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              <span>{event.event_type}</span>
                              <span>{formatDateTime(event.created_at)}</span>
                            </div>
                            {event.title ? <p className="text-sm font-semibold text-slate-900">{event.title}</p> : null}
                            {event.body ? <p className="text-xs text-slate-600">{event.body}</p> : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                左のリストから支払いエントリを選択してください。
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">対象決済一覧</h2>
          {selectedEntry ? (
            <div className="mt-3 overflow-x-auto">
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
                  {selectedEntry.line_items.map((item) => (
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
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              支払い詳細を選択すると対象決済が表示されます。
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
