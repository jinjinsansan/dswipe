"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  MegaphoneIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  ClockIcon,
  EyeSlashIcon,
  EyeIcon,
  ArchiveBoxArrowDownIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { adminMessageApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type {
  OperatorMessage,
  OperatorMessageListResponse,
  OperatorMessageSegment,
  OperatorMessageCreatePayload,
  OperatorMessageUpdatePayload,
} from "@/types/api";

type TargetType = "all_sellers" | "all_users" | "user_ids" | "emails";
type VisibilityFilter = "active" | "hidden" | "archived" | "all";

const SUPER_ADMIN_EMAILS = new Set([
  "goldbenchan@gmail.com",
  "kusanokiyoshi1@gmail.com",
]);

const toDatetimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - tzOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const parseUserIds = (value: string): string[] =>
  value
    .split(/[\,\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);

const parseEmails = (value: string): string[] =>
  value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateTargetInput = (targetType: TargetType, targetUserIds: string, targetEmails: string) => {
  if (targetType === "user_ids") {
    const ids = parseUserIds(targetUserIds);
    if (ids.length === 0) {
      return { valid: false as const, message: "ユーザーIDを入力してください" };
    }
    return { valid: true as const, ids };
  }
  if (targetType === "emails") {
    const emails = parseEmails(targetEmails);
    if (emails.length === 0) {
      return { valid: false as const, message: "メールアドレスを入力してください" };
    }
    const invalid = emails.filter((email) => !isValidEmail(email));
    if (invalid.length > 0) {
      return { valid: false as const, message: `メールアドレスの形式が正しくありません: ${invalid.join(", ")}` };
    }
    return { valid: true as const, emails };
  }
  return { valid: true as const };
};

const extractErrorMessage = (error: unknown): string | null => {
  const detail = (error as any)?.response?.data?.detail;
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail !== null) {
    const message = typeof detail.message === "string" ? detail.message : null;
    const missingEmails = Array.isArray(detail.missing_emails) ? detail.missing_emails : [];
    if (message && missingEmails.length > 0) {
      return `${message} (${missingEmails.join(", ")})`;
    }
    if (message) {
      return message;
    }
  }
  return null;
};

const segmentsToTarget = (segments: OperatorMessageSegment[] | undefined) => {
  if (!segments || segments.length === 0) {
    return { targetType: "all_sellers" as TargetType, targetUserIds: "", targetEmails: "" };
  }

  const emailSegment = segments.find((segment) => segment.segment_type === "emails");
  if (emailSegment) {
    const raw = emailSegment.segment_payload?.emails;
    const emails = Array.isArray(raw)
      ? (raw as unknown[]).map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
      : typeof raw === "string"
        ? raw
            .split(/[\s,;]+/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
    return {
      targetType: "emails" as TargetType,
      targetUserIds: "",
      targetEmails: emails.join(","),
    };
  }

  const hasAllUsers = segments.some((segment) => segment.segment_type === "all_users");
  if (hasAllUsers) {
    return { targetType: "all_users" as TargetType, targetUserIds: "", targetEmails: "" };
  }

  const userIdSegment = segments.find((segment) => segment.segment_type === "user_ids");
  if (userIdSegment && Array.isArray(userIdSegment.segment_payload?.user_ids)) {
    return {
      targetType: "user_ids" as TargetType,
      targetUserIds: (userIdSegment.segment_payload.user_ids as unknown[])
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean)
        .join(","),
      targetEmails: "",
    };
  }

  return { targetType: "all_sellers" as TargetType, targetUserIds: "", targetEmails: "" };
};

const buildSegments = (targetType: TargetType, targetUserIds: string, targetEmails: string): OperatorMessageSegment[] => {
  if (targetType === "user_ids") {
    const ids = parseUserIds(targetUserIds);
    return [
      {
        segment_type: "user_ids",
        segment_payload: { user_ids: ids },
      },
    ];
  }
  if (targetType === "emails") {
    const emails = Array.from(new Set(parseEmails(targetEmails)));
    return [
      {
        segment_type: "emails",
        segment_payload: { emails },
      },
    ];
  }
  return [
    {
      segment_type: targetType,
      segment_payload: {},
    },
  ];
};

const INITIAL_CREATE_FORM = {
  title: "",
  body_text: "",
  body_html: "",
  category: "general",
  priority: "normal",
  send_now: true,
  send_at: "",
  targetType: "all_sellers" as TargetType,
  targetUserIds: "",
  targetEmails: "",
  sendEmail: false,
  emailSubject: "",
  emailFromName: "",
  emailFromAddress: "",
  emailReplyTo: "",
};

export default function AdminMessagesPage() {
  const { isAdmin, isAuthenticated, isInitialized, user } = useAuthStore();
  const isSuperAdmin = useMemo(() => SUPER_ADMIN_EMAILS.has((user?.email ?? "").toLowerCase()), [user?.email]);
  const router = useRouter();
  const [messages, setMessages] = useState<OperatorMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<OperatorMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("active");
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [detailForm, setDetailForm] = useState({
    title: "",
    body_text: "",
    body_html: "",
    category: "general",
    priority: "normal",
    send_at: "",
    targetType: "all_sellers" as TargetType,
    targetUserIds: "",
    targetEmails: "",
    sendEmail: false,
    emailSubject: "",
    emailFromName: "",
    emailFromAddress: "",
    emailReplyTo: "",
  });

  const isCreateValid = useMemo(() => {
    const hasBody = createForm.title.trim().length > 0 && (createForm.body_text.trim().length > 0 || createForm.body_html.trim().length > 0);
    if (!hasBody) return false;
    return validateTargetInput(createForm.targetType, createForm.targetUserIds, createForm.targetEmails).valid;
  }, [createForm.body_html, createForm.body_text, createForm.targetEmails, createForm.targetType, createForm.targetUserIds, createForm.title]);

  const canUpdate = useMemo(() => {
    if (!selectedMessage) return false;
    if (selectedMessage.status === "sent") return false;
    return true;
  }, [selectedMessage]);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const response = await adminMessageApi.list({ limit: 100, offset: 0, visibility: visibilityFilter });
      const payload = response.data as OperatorMessageListResponse;
      const rows = Array.isArray(payload.data) ? payload.data : [];
      setMessages(rows);
      setTotal(payload.total ?? rows.length);
      if (rows.length > 0) {
        setSelectedId((prev) => {
          if (prev && rows.some((row) => row.id === prev)) {
            return prev;
          }
          return rows[0].id;
        });
      } else {
        setSelectedId(null);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to fetch operator messages", error);
      setMessages([]);
      setTotal(0);
      setSelectedId(null);
      setSelectedMessage(null);
    } finally {
      setListLoading(false);
    }
  }, [visibilityFilter]);

  const fetchDetail = useCallback(async (messageId: string) => {
    setDetailLoading(true);
    try {
      const response = await adminMessageApi.get(messageId);
      const detail = response.data as OperatorMessage;
      setSelectedMessage(detail);
      setSelectedId(detail.id);
      const segmentInfo = segmentsToTarget(detail.segment_summary);
      setDetailForm({
        title: detail.title ?? "",
        body_text: detail.body_text ?? "",
        body_html: detail.body_html ?? "",
        category: detail.category ?? "general",
        priority: detail.priority ?? "normal",
        send_at: toDatetimeLocalValue(detail.send_at),
        targetType: segmentInfo.targetType,
        targetUserIds: segmentInfo.targetUserIds,
        targetEmails: segmentInfo.targetEmails,
        sendEmail: Boolean(detail.send_email),
        emailSubject: detail.email_subject ?? "",
        emailFromName: detail.email_from_name ?? "",
        emailFromAddress: detail.email_from_address ?? "",
        emailReplyTo: detail.email_reply_to ?? "",
      });
    } catch (error) {
      console.error("Failed to fetch message detail", error);
      setSelectedMessage(null);
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
  }, [fetchList, isAdmin, isAuthenticated, isInitialized, router]);

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId).catch(() => undefined);
    }
  }, [fetchDetail, selectedId]);

  const handleCreateSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isCreateValid) {
        alert("入力内容を確認してください（タイトル・本文・配信対象）");
        return;
      }

      const targetValidation = validateTargetInput(createForm.targetType, createForm.targetUserIds, createForm.targetEmails);
      if (!targetValidation.valid) {
        alert(targetValidation.message);
        return;
      }

      setCreateLoading(true);
      try {
        const payload: OperatorMessageCreatePayload = {
          title: createForm.title.trim(),
          body_text: createForm.body_text.trim() || undefined,
          body_html: createForm.body_html.trim() || undefined,
          category: createForm.category || "general",
          priority: createForm.priority || "normal",
          send_now: createForm.send_now,
          send_at: createForm.send_now || !createForm.send_at
            ? undefined
            : new Date(createForm.send_at).toISOString(),
          target_segments: buildSegments(createForm.targetType, createForm.targetUserIds, createForm.targetEmails),
          send_email: createForm.sendEmail,
          email_subject: createForm.emailSubject.trim() || undefined,
          email_from_name: createForm.emailFromName.trim() || undefined,
          email_from_address: createForm.emailFromAddress.trim() || undefined,
          email_reply_to: createForm.emailReplyTo.trim() || undefined,
        };

        await adminMessageApi.create(payload);
        alert("メッセージを作成しました");
        setCreateForm(INITIAL_CREATE_FORM);
        await fetchList();
      } catch (error) {
        console.error("Failed to create operator message", error);
        const message = extractErrorMessage(error) ?? "メッセージの作成に失敗しました";
        alert(message);
      } finally {
        setCreateLoading(false);
      }
    },
    [createForm, fetchList, isCreateValid]
  );

  const handleUpdate = useCallback(async () => {
    if (!selectedMessage) return;

    const targetValidation = validateTargetInput(detailForm.targetType, detailForm.targetUserIds, detailForm.targetEmails);
    if (!targetValidation.valid) {
      alert(targetValidation.message);
      return;
    }

    setUpdateLoading(true);
    try {
      const payload: OperatorMessageUpdatePayload = {
        title: detailForm.title.trim() || selectedMessage.title,
        body_text: detailForm.body_text.trim() || undefined,
        body_html: detailForm.body_html.trim() || undefined,
        category: detailForm.category || selectedMessage.category,
        priority: detailForm.priority || selectedMessage.priority,
        send_at: detailForm.send_at ? new Date(detailForm.send_at).toISOString() : undefined,
        target_segments: buildSegments(detailForm.targetType, detailForm.targetUserIds, detailForm.targetEmails),
        send_email: detailForm.sendEmail,
        email_subject: detailForm.emailSubject.trim() || undefined,
        email_from_name: detailForm.emailFromName.trim() || undefined,
        email_from_address: detailForm.emailFromAddress.trim() || undefined,
        email_reply_to: detailForm.emailReplyTo.trim() || undefined,
      };

      await adminMessageApi.update(selectedMessage.id, payload);
      alert("メッセージを更新しました");
      await fetchList();
      await fetchDetail(selectedMessage.id);
    } catch (error) {
      console.error("Failed to update operator message", error);
      const message = extractErrorMessage(error) ?? "メッセージの更新に失敗しました";
      alert(message);
    } finally {
      setUpdateLoading(false);
    }
  }, [detailForm, fetchDetail, fetchList, selectedMessage]);

  const handleDispatch = useCallback(async () => {
    if (!selectedMessage) return;
    setDispatchLoading(true);
    try {
      await adminMessageApi.dispatch(selectedMessage.id);
      alert("メッセージを配信しました");
      await fetchList();
      await fetchDetail(selectedMessage.id);
    } catch (error) {
      console.error("Failed to dispatch message", error);
      const message = extractErrorMessage(error) ?? "配信処理に失敗しました";
      alert(message);
    } finally {
      setDispatchLoading(false);
    }
  }, [fetchDetail, fetchList, selectedMessage]);

  const handleHideToggle = useCallback(
    async (message: OperatorMessage, nextHidden: boolean) => {
      try {
        const response = await adminMessageApi.hide(message.id, { hidden: nextHidden });
        const updated = response.data as OperatorMessage;
        setSelectedMessage((prev) => (prev?.id === updated.id ? updated : prev));
        await fetchList();
      } catch (error) {
        console.error("Failed to toggle message visibility", error);
        alert("表示状態の更新に失敗しました");
      }
    },
    [fetchList]
  );

  const handleArchiveToggle = useCallback(
    async (message: OperatorMessage, nextArchived: boolean) => {
      try {
        const response = await adminMessageApi.archive(message.id, { archived: nextArchived });
        const updated = response.data as OperatorMessage;
        setSelectedMessage((prev) => (prev?.id === updated.id ? updated : prev));
        await fetchList();
      } catch (error) {
        console.error("Failed to toggle message archive", error);
        alert("アーカイブ状態の更新に失敗しました");
      }
    },
    [fetchList]
  );

  const handleDelete = useCallback(
    async (message: OperatorMessage) => {
      if (!window.confirm("このメッセージを完全に削除しますか？この操作は元に戻せません。")) {
        return;
      }
      try {
        await adminMessageApi.delete(message.id);
        setSelectedId(null);
        setSelectedMessage(null);
        await fetchList();
        alert("メッセージを削除しました");
      } catch (error) {
        console.error("Failed to delete message", error);
        const messageText = extractErrorMessage(error) ?? "メッセージの削除に失敗しました";
        alert(messageText);
      }
    },
    [fetchList]
  );

  const handleProcessDue = useCallback(async () => {
    setProcessLoading(true);
    try {
      const response = await adminMessageApi.processDue();
      const processed = (response.data as { processed?: number }).processed ?? 0;
      alert(`配信対象のメッセージを処理しました (${processed}件)`);
      await fetchList();
      if (selectedId) {
        await fetchDetail(selectedId);
      }
    } catch (error) {
      console.error("Failed to process due messages", error);
      alert("配信キューの処理に失敗しました");
    } finally {
      setProcessLoading(false);
    }
  }, [fetchDetail, fetchList, selectedId]);

  const statusBadgeClass = (status?: string | null) => {
    const normalized = (status ?? "").toLowerCase();
    if (normalized === "sent") return "bg-emerald-100 text-emerald-700";
    if (normalized === "scheduled") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <AdminShell
      pageTitle="運営メッセージ"
      pageSubtitle="販売者向けのお知らせ作成・配信を管理します"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <MegaphoneIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">配信メッセージ一覧</p>
                  <p className="text-xs text-slate-500">総件数 {total.toLocaleString()} 件</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProcessDue}
                  disabled={processLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ClockIcon className="h-4 w-4" aria-hidden="true" />
                  {processLoading ? "処理中…" : "予約配信を処理"}
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={visibilityFilter}
                    onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="active">表示中のみ</option>
                    <option value="archived">アーカイブ</option>
                    <option value="hidden">非表示</option>
                    <option value="all">すべて</option>
                  </select>
                  <button
                    type="button"
                    onClick={fetchList}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    更新
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {listLoading ? (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">読み込み中です…</p>
              ) : messages.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  まだ作成されたメッセージはありません。
                </p>
              ) : (
                <ul className="space-y-3">
                  {messages.map((message) => {
                    const isActive = selectedId === message.id;
                    const isHidden = message.admin_hidden;
                    const isArchived = Boolean(message.admin_archived_at);
                    return (
                      <li key={message.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(message.id)}
                          className={`flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50 ${
                            isActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                            <span className="truncate">{message.title}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(message.status)}`}>
                              {message.status ?? "draft"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            予定日時: {message.send_at ? new Date(message.send_at).toLocaleString("ja-JP") : "未設定"}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                            {isHidden ? (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">非表示</span>
                            ) : null}
                            {isArchived ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">アーカイブ</span>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <PlusCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
              新規メッセージ作成
            </div>

            <div className="grid gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-slate-700">タイトル</span>
                <input
                  value={createForm.title}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                  placeholder="販売者へ通知する見出し"
                  required
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">カテゴリ</span>
                  <input
                    value={createForm.category}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                    placeholder="例: general"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">優先度</span>
                  <input
                    value={createForm.priority}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, priority: event.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                    placeholder="例: normal"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={createForm.send_now}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, send_now: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                即時配信する
              </label>
              {!createForm.send_now && (
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">配信予定日時</span>
                  <input
                    type="datetime-local"
                    value={createForm.send_at}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, send_at: event.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                    required={!createForm.send_now}
                  />
                </label>
              )}

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-slate-700">本文（プレーンテキスト）</span>
                <textarea
                  value={createForm.body_text}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, body_text: event.target.value }))}
                  rows={4}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                  placeholder="テキスト本文"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-slate-700">本文（HTML任意）</span>
                <textarea
                  value={createForm.body_html}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, body_html: event.target.value }))}
                  rows={4}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                  placeholder="HTMLで整形された本文（任意）"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">配信対象</span>
                  <select
                    value={createForm.targetType}
                    onChange={(event) => {
                      const nextType = event.target.value as TargetType;
                      setCreateForm((prev) => ({ ...prev, targetType: nextType }));
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="all_sellers">全販売者</option>
                    <option value="all_users">全ユーザー</option>
                    <option value="user_ids">ユーザーID指定</option>
                    <option value="emails">メールアドレス指定</option>
                  </select>
                </label>
                {createForm.targetType === "user_ids" && (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-slate-700">ユーザーID（カンマ区切り）</span>
                    <input
                      value={createForm.targetUserIds}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, targetUserIds: event.target.value }))}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                      placeholder="id1,id2,id3"
                      required
                    />
                  </label>
                )}
                {createForm.targetType === "emails" && (
                  <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                    <span className="font-semibold text-slate-700">メールアドレス（カンマ・改行区切り）</span>
                    <textarea
                      value={createForm.targetEmails}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, targetEmails: event.target.value }))}
                      rows={3}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                      placeholder="user1@example.com, user2@example.com"
                      required
                    />
                    <span className="text-xs text-slate-500">※指定したメールアドレスに一致するユーザーのみが対象になります。</span>
                  </label>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={createForm.sendEmail}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, sendEmail: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  メールでも配信する（Mailgun）
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  チェックを入れると、対象ユーザーのメールアドレス宛に同じ内容を送信します。未入力項目はデフォルト値（タイトル・既定差出人）を使用します。
                </p>
                {createForm.sendEmail && (
                  <div className="mt-3 grid gap-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-slate-700">メール件名（未入力時はタイトルを使用）</span>
                      <input
                        value={createForm.emailSubject}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, emailSubject: event.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                        placeholder="例: 【重要】メンテナンスのお知らせ"
                      />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-slate-700">差出人名（任意）</span>
                        <input
                          value={createForm.emailFromName}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, emailFromName: event.target.value }))}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                          placeholder="例: D-swipe運営事務局"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-slate-700">差出人メール（任意）</span>
                        <input
                          value={createForm.emailFromAddress}
                          onChange={(event) => setCreateForm((prev) => ({ ...prev, emailFromAddress: event.target.value }))}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                          placeholder="例: no-reply@mg.example.com"
                        />
                      </label>
                    </div>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-slate-700">返信先メール（任意）</span>
                      <input
                        value={createForm.emailReplyTo}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, emailReplyTo: event.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none"
                        placeholder="例: support@example.com"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={createLoading || !isCreateValid}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
                {createLoading ? "作成中…" : "メッセージを作成"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          {detailLoading ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">詳細を読み込み中です…</p>
          ) : !selectedMessage ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              左の一覧からメッセージを選択してください。
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedMessage.title}</h2>
                  <p className="text-xs text-slate-500">作成: {new Date(selectedMessage.created_at).toLocaleString("ja-JP")}</p>
                </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedMessage.status)} ${selectedMessage.admin_hidden ? "line-through" : ""}`}>
                      {selectedMessage.status ?? "draft"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedMessage.send_email ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      メール配信 {selectedMessage.send_email ? "ON" : "OFF"}
                    </span>
                    {selectedMessage.admin_archived_at ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        アーカイブ済み
                      </span>
                    ) : null}
                    {selectedMessage.admin_hidden ? (
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        非表示
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleDispatch}
                      disabled={dispatchLoading || selectedMessage.status === "sent"}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
                      {dispatchLoading ? "配信中…" : "今すぐ配信"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHideToggle(selectedMessage, !selectedMessage.admin_hidden)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    >
                      {selectedMessage.admin_hidden ? (
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                      )}
                      {selectedMessage.admin_hidden ? "表示に戻す" : "非表示"}
                    </button>
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(selectedMessage, !selectedMessage.admin_archived_at)}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        {selectedMessage.admin_archived_at ? (
                          <ArrowUturnLeftIcon className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ArchiveBoxArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                        )}
                        {selectedMessage.admin_archived_at ? "アーカイブ解除" : "アーカイブ"}
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedMessage)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        完全削除
                      </button>
                    )}
                  </div>
              </div>

              <div className="grid gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">タイトル</span>
                  <input
                    value={detailForm.title}
                    onChange={(event) => setDetailForm((prev) => ({ ...prev, title: event.target.value }))}
                    disabled={!canUpdate}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-slate-700">カテゴリ</span>
                    <input
                      value={detailForm.category}
                      onChange={(event) => setDetailForm((prev) => ({ ...prev, category: event.target.value }))}
                      disabled={!canUpdate}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-slate-700">優先度</span>
                    <input
                      value={detailForm.priority}
                      onChange={(event) => setDetailForm((prev) => ({ ...prev, priority: event.target.value }))}
                      disabled={!canUpdate}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">本文（プレーンテキスト）</span>
                  <textarea
                    value={detailForm.body_text}
                    onChange={(event) => setDetailForm((prev) => ({ ...prev, body_text: event.target.value }))}
                    rows={4}
                    disabled={!canUpdate}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">本文（HTML任意）</span>
                  <textarea
                    value={detailForm.body_html}
                    onChange={(event) => setDetailForm((prev) => ({ ...prev, body_html: event.target.value }))}
                    rows={4}
                    disabled={!canUpdate}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-semibold text-slate-700">配信予定日時</span>
                  <input
                    type="datetime-local"
                    value={detailForm.send_at}
                    onChange={(event) => setDetailForm((prev) => ({ ...prev, send_at: event.target.value }))}
                    disabled={!canUpdate}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                  />
                </label>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-slate-700">配信対象</span>
                    <select
                      value={detailForm.targetType}
                      onChange={(event) => {
                        const nextType = event.target.value as TargetType;
                        setDetailForm((prev) => ({ ...prev, targetType: nextType }));
                      }}
                      disabled={!canUpdate}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                    >
                      <option value="all_sellers">全販売者</option>
                      <option value="all_users">全ユーザー</option>
                      <option value="user_ids">ユーザーID指定</option>
                      <option value="emails">メールアドレス指定</option>
                    </select>
                  </label>
                  {detailForm.targetType === "user_ids" && (
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-slate-700">ユーザーID（カンマ区切り）</span>
                      <input
                        value={detailForm.targetUserIds}
                        onChange={(event) => setDetailForm((prev) => ({ ...prev, targetUserIds: event.target.value }))}
                        disabled={!canUpdate}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                      />
                    </label>
                  )}
                  {detailForm.targetType === "emails" && (
                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-semibold text-slate-700">メールアドレス（カンマ・改行区切り）</span>
                      <textarea
                        value={detailForm.targetEmails}
                        onChange={(event) => setDetailForm((prev) => ({ ...prev, targetEmails: event.target.value }))}
                        disabled={!canUpdate}
                        rows={3}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                      />
                      <span className="text-xs text-slate-500">※指定したメールアドレスに一致するユーザーのみが対象になります。</span>
                    </label>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <label className={`flex items-center gap-2 text-sm font-semibold ${canUpdate ? "text-slate-700" : "text-slate-500"}`}>
                    <input
                      type="checkbox"
                      checked={detailForm.sendEmail}
                      onChange={(event) => setDetailForm((prev) => ({ ...prev, sendEmail: event.target.checked }))}
                      disabled={!canUpdate}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                    />
                    メールでも配信する（Mailgun）
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    同報メールの設定です。空欄の項目はタイトルや既定差出人にフォールバックします。
                  </p>
                  {detailForm.sendEmail && (
                    <div className="mt-3 grid gap-2">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-slate-700">メール件名</span>
                        <input
                          value={detailForm.emailSubject}
                          onChange={(event) => setDetailForm((prev) => ({ ...prev, emailSubject: event.target.value }))}
                          disabled={!canUpdate}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                          placeholder="未入力時はタイトルを使用"
                        />
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-semibold text-slate-700">差出人名</span>
                          <input
                            value={detailForm.emailFromName}
                            onChange={(event) => setDetailForm((prev) => ({ ...prev, emailFromName: event.target.value }))}
                            disabled={!canUpdate}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                            placeholder="例: D-swipe運営事務局"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-semibold text-slate-700">差出人メール</span>
                          <input
                            value={detailForm.emailFromAddress}
                            onChange={(event) => setDetailForm((prev) => ({ ...prev, emailFromAddress: event.target.value }))}
                            disabled={!canUpdate}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                            placeholder="例: no-reply@mg.example.com"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-slate-700">返信先メール</span>
                        <input
                          value={detailForm.emailReplyTo}
                          onChange={(event) => setDetailForm((prev) => ({ ...prev, emailReplyTo: event.target.value }))}
                          disabled={!canUpdate}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-400 focus:outline-none disabled:bg-slate-100"
                          placeholder="例: support@example.com"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>
                    最終更新: {selectedMessage.updated_at ? new Date(selectedMessage.updated_at).toLocaleString("ja-JP") : "-"}
                  </span>
                  {selectedMessage.created_by ? <span>作成者: {selectedMessage.created_by}</span> : null}
                </div>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={!canUpdate || updateLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  {updateLoading ? "更新中…" : "下書きを更新"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
