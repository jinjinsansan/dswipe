"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  MegaphoneIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
} from "@heroicons/react/24/outline";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { operatorMessageApi } from "@/lib/api";
import { useOperatorMessageStore } from "@/store/operatorMessageStore";
import type {
  OperatorMessageFeedResponse,
  OperatorMessageRecipient,
  OperatorMessageReadRequest,
  OperatorMessageUnreadCountResponse,
} from "@/types/api";

type FilterMode = "all" | "unread" | "read" | "archived";

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "unread", label: "未読" },
  { value: "read", label: "既読" },
  { value: "archived", label: "アーカイブ" },
];

const PAGE_SIZE = 20;

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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildBodyHtml = (message: OperatorMessageRecipient) => {
  if (message.body_html && message.body_html.trim().length > 0) {
    return message.body_html;
  }
  if (message.body_text && message.body_text.trim().length > 0) {
    const paragraphs = message.body_text
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const lines = block.split(/\n/).map((line) => escapeHtml(line.trim())).filter(Boolean);
        if (lines.length === 0) return "";
        return `<p>${lines.join("<br />")}</p>`;
      })
      .filter(Boolean)
      .join("");
    return paragraphs || "<p>(本文なし)</p>";
  }
  return "<p>(本文なし)</p>";
};

const filterToParam = (filter: FilterMode) => {
  if (filter === "all") return undefined;
  return filter;
};

export default function MessagesClient() {
  const [filter, setFilter] = useState<FilterMode>("unread");
  const [currentPage, setCurrentPage] = useState(0);
  const [messages, setMessages] = useState<OperatorMessageRecipient[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<OperatorMessageRecipient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { unreadCount, setUnreadCount } = useOperatorMessageStore();

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: currentPage * PAGE_SIZE,
        filter_mode: filterToParam(filter),
      };

      const [listResponse, unreadResponse] = await Promise.all([
        operatorMessageApi.list(params),
        operatorMessageApi.unreadCount().catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to fetch unread count", err);
          }
          return null;
        }),
      ]);

      const payload = listResponse.data as OperatorMessageFeedResponse;
      const rows = Array.isArray(payload.data) ? payload.data : [];

      setMessages(rows);
      setTotal(payload.total ?? rows.length);
      setSelectedMessage((prev) => {
        if (rows.length === 0) {
          return null;
        }
        if (prev) {
          const found = rows.find((item) => item.id === prev.id);
          if (found) {
            return found;
          }
        }
        return rows[0];
      });

      if (unreadResponse?.data) {
        const unread = (unreadResponse.data as OperatorMessageUnreadCountResponse | { unread_count?: number }).unread_count ?? 0;
        setUnreadCount(unread, Date.now());
      }
    } catch (err) {
      console.error("Failed to fetch operator messages", err);
      setMessages([]);
      setTotal(0);
      setSelectedMessage(null);
      setError("メッセージの取得に失敗しました");
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [currentPage, filter, setUnreadCount]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMark = useCallback(
    async (message: OperatorMessageRecipient | null, payload: OperatorMessageReadRequest) => {
      if (!message) return;
      setActionLoading(true);
      try {
        await operatorMessageApi.markMessage(message.message_id, payload);
        await fetchMessages();
      } catch (err) {
        console.error("Failed to update message state", err);
        alert("メッセージ状態の更新に失敗しました");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchMessages]
  );

  const handleRefresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  const messageBodyHtml = useMemo(() => {
    if (!selectedMessage) return "<p>(本文なし)</p>";
    return buildBodyHtml(selectedMessage);
  }, [selectedMessage]);

  if (isLoading && !hasLoadedOnce && !error) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="運営からのお知らせ"
      pageSubtitle="運営チームからのお知らせや施策情報をまとめて確認できます"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <MegaphoneIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">最新のお知らせ</p>
              <p className="text-xs text-slate-500">未読 {unreadCount.toLocaleString()} 件</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            {isLoading ? "更新中…" : "再読込"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => {
            const isActive = option.value === filter;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilter(option.value);
                  setCurrentPage(0);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {option.value === "unread" ? (
                  <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                ) : option.value === "read" ? (
                  <EnvelopeOpenIcon className="h-4 w-4" aria-hidden="true" />
                ) : option.value === "archived" ? (
                  <ArchiveBoxIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <MegaphoneIcon className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col gap-3">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                {isLoading && hasLoadedOnce ? (
                  <div className="flex min-h-[240px] items-center justify-center">
                    <ArrowPathIcon className="h-6 w-6 animate-spin text-slate-400" aria-hidden="true" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">対象のメッセージはありません。</p>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {messages.map((message) => {
                      const isActive = selectedMessage?.id === message.id;
                      const isUnread = !message.read_at;
                      return (
                        <li key={message.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedMessage(message)}
                            className={`flex w-full flex-col items-start gap-1 px-4 py-4 text-left transition-colors ${
                              isActive ? "bg-blue-50/70" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                    isUnread ? "bg-blue-500" : "bg-slate-300"
                                  }`}
                                />
                                <span className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                                  {message.title}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">{formatDateTime(message.send_at ?? message.created_at)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                {message.category}
                              </span>
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-600">
                                {message.priority}
                              </span>
                              {message.archived ? (
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                                  アーカイブ
                                </span>
                              ) : null}
                            </div>
                            {message.body_text ? (
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{message.body_text}</p>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {messages.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="rounded-full px-3 py-1 font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="rounded-full px-3 py-1 font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {selectedMessage ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-900">{selectedMessage.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          {selectedMessage.category}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-600">
                          {selectedMessage.priority}
                        </span>
                        <span>{formatDateTime(selectedMessage.send_at ?? selectedMessage.created_at)}</span>
                        {selectedMessage.archived ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                            アーカイブ済み
                          </span>
                        ) : null}
                        {selectedMessage.read_at ? (
                          <span className="text-slate-400">
                            既読: {formatDateTime(selectedMessage.read_at)}
                          </span>
                        ) : (
                          <span className="text-blue-600">未読</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleMark(selectedMessage, { read: true, archive: selectedMessage.archived })}
                      disabled={actionLoading || !!selectedMessage.read_at}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      <EnvelopeOpenIcon className="h-4 w-4" aria-hidden="true" />
                      既読にする
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMark(selectedMessage, { read: false, archive: selectedMessage.archived })}
                      disabled={actionLoading || !selectedMessage.read_at}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                      未読に戻す
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleMark(
                          selectedMessage,
                          selectedMessage.archived
                            ? { read: Boolean(selectedMessage.read_at), archive: false }
                            : { read: true, archive: true }
                        )
                      }
                      disabled={actionLoading}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedMessage.archived
                          ? "border border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      <ArchiveBoxIcon className="h-4 w-4" aria-hidden="true" />
                      {selectedMessage.archived ? "アーカイブ解除" : "アーカイブ"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    <p>
                      運営からの一斉配信メッセージです。問い合わせが必要な場合はサポート窓口までご連絡ください。
                    </p>
                  </div>

                  <article
                    className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600"
                    dangerouslySetInnerHTML={{ __html: messageBodyHtml }}
                  />
                </div>
              ) : (
                <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
                  メッセージを選択してください。
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
