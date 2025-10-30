"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonApi } from "@/lib/api";
import type { Salon, SalonMember, SalonMemberListResult } from "@/types/api";

const PAGE_SIZE = 20;

const STATUS_META: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "有効",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
  PENDING: {
    label: "保留",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  UNPAID: {
    label: "未入金",
    className: "bg-rose-50 text-rose-600 border border-rose-200",
  },
  CANCELED: {
    label: "解約",
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
  CANCELLED: {
    label: "解約",
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
};

const statusOptions = [
  { value: "", label: "すべて" },
  { value: "ACTIVE", label: "有効" },
  { value: "PENDING", label: "保留" },
  { value: "UNPAID", label: "未入金" },
  { value: "CANCELED", label: "解約" },
];

export default function SalonMembersPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [members, setMembers] = useState<SalonMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSalon = async () => {
      if (!salonId) return;
      try {
        const response = await salonApi.get(salonId);
        setSalon(response.data as Salon);
      } catch (salonError) {
        console.error("Failed to load salon", salonError);
      }
    };
    loadSalon();
  }, [salonId]);

  const fetchMembers = useCallback(async () => {
    if (!salonId) return;
    setIsFetching(true);
    setError(null);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const response = await salonApi.getMembers(salonId, {
        status_filter: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      const payload = response.data as SalonMemberListResult;
      setMembers(payload?.data ?? []);
      setTotal(payload?.total ?? 0);
    } catch (memberError: any) {
      console.error("Failed to load members", memberError);
      const detail = memberError?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "会員情報の取得に失敗しました");
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [page, salonId, statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="サロン会員管理"
      pageSubtitle={salon ? `${salon.title} の会員状況を確認できます` : "サロン会員状況を確認できます"}
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href={`/salons/${salonId ?? ""}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          サロン詳細に戻る
        </Link>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <ExclamationCircleIcon className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                合計 {total.toLocaleString()} 名の会員が登録されています。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <select
                  value={statusFilter}
                  onChange={(event) => handleStatusChange(event.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <th scope="col" className="px-4 py-3">ユーザーID</th>
                  <th scope="col" className="px-4 py-3">ステータス</th>
                  <th scope="col" className="px-4 py-3">初回参加</th>
                  <th scope="col" className="px-4 py-3">次回課金予定</th>
                  <th scope="col" className="px-4 py-3">最終決済</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      {isFetching ? "読み込み中です..." : "該当する会員が見つかりませんでした。"}
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const status = STATUS_META[member.status?.toUpperCase() ?? ""];
                    return (
                      <tr key={member.id} className="bg-white">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{member.user_id}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              status?.className ?? "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {status?.label ?? member.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {member.joined_at ? new Date(member.joined_at).toLocaleString("ja-JP") : "---"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {member.next_charge_at ? new Date(member.next_charge_at).toLocaleString("ja-JP") : "---"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {member.last_charged_at ? new Date(member.last_charged_at).toLocaleString("ja-JP") : "---"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <UsersIcon className="h-4 w-4" aria-hidden="true" />
              {total.toLocaleString()}名の会員 / {totalPages}ページ
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isFetching}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                前へ
              </button>
              <span className="text-sm text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isFetching}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
