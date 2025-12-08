"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
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

const STATUS_KEYS = ["ACTIVE", "PENDING", "UNPAID", "CANCELED", "CANCELLED"] as const;
type StatusKey = (typeof STATUS_KEYS)[number];
type ManualIdentifierType = "email" | "username";
type ManualStatus = "ACTIVE" | "PENDING" | "CANCELED";

const STATUS_STYLES: Record<StatusKey, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
  UNPAID: "bg-rose-50 text-rose-600 border border-rose-200",
  CANCELED: "bg-slate-100 text-slate-500 border border-slate-200",
  CANCELLED: "bg-slate-100 text-slate-500 border border-slate-200",
};

export default function SalonMembersPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const t = useTranslations("salons.members");
  const commonT = useTranslations("salons.common");
  const formatter = useFormatter();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [members, setMembers] = useState<SalonMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualIdentifierType, setManualIdentifierType] = useState<ManualIdentifierType>("email");
  const [manualIdentifier, setManualIdentifier] = useState("");
  const [manualStatus, setManualStatus] = useState<ManualStatus>("ACTIVE");
  const [manualMemo, setManualMemo] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("filters.status.all") },
      { value: "ACTIVE", label: t("filters.status.active") },
      { value: "PENDING", label: t("filters.status.pending") },
      { value: "UNPAID", label: t("filters.status.unpaid") },
      { value: "CANCELED", label: t("filters.status.cancelled") },
    ],
    [t],
  );

  const statusMeta = useMemo(
    () => ({
      ACTIVE: { label: t("status.active"), className: STATUS_STYLES.ACTIVE },
      PENDING: { label: t("status.pending"), className: STATUS_STYLES.PENDING },
      UNPAID: { label: t("status.unpaid"), className: STATUS_STYLES.UNPAID },
      CANCELED: { label: t("status.cancelled"), className: STATUS_STYLES.CANCELED },
      CANCELLED: { label: t("status.cancelled"), className: STATUS_STYLES.CANCELLED },
    }),
    [t],
  );

  const manualStatusOptions = useMemo(
    () => [
      { value: "ACTIVE", label: t("status.active") },
      { value: "PENDING", label: t("status.pending") },
      { value: "CANCELED", label: t("status.cancelled") },
    ],
    [t],
  );

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
      setError(typeof detail === "string" ? detail : t("errors.load"));
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [page, salonId, statusFilter, t]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const formatDateTime = useCallback(
    (value?: string | null) => {
      if (!value) {
        return commonT("placeholders.empty");
      }
      try {
        return formatter.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" });
      } catch (_error) {
        return value;
      }
    },
    [commonT, formatter],
  );

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const identifierPlaceholder = manualIdentifierType === "email"
    ? t("manualInvite.identifierPlaceholderEmail")
    : t("manualInvite.identifierPlaceholderUsername");

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!salonId) return;
    const trimmedIdentifier = manualIdentifier.trim();
    if (!trimmedIdentifier) {
      setManualError(t("manualInvite.errors.missingIdentifier"));
      setManualSuccess(null);
      return;
    }
    setManualError(null);
    setManualSuccess(null);
    setIsSubmittingManual(true);
    try {
      const payload: { email?: string; username?: string; status: ManualStatus; memo?: string } = {
        status: manualStatus,
      };
      if (manualIdentifierType === "email") {
        payload.email = trimmedIdentifier;
      } else {
        payload.username = trimmedIdentifier;
      }
      if (manualMemo.trim()) {
        payload.memo = manualMemo.trim();
      }
      await salonApi.manualAddMember(salonId, payload);
      setManualSuccess(
        manualIdentifierType === "email"
          ? t("manualInvite.successEmail", { email: trimmedIdentifier })
          : t("manualInvite.successUsername", { username: trimmedIdentifier }),
      );
      setManualIdentifier("");
      setManualMemo("");
      fetchMembers();
    } catch (submitError: any) {
      const detail = submitError?.response?.data?.detail;
      setManualError(typeof detail === "string" ? detail : t("manualInvite.errors.generic"));
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleManualReset = () => {
    setManualIdentifier("");
    setManualMemo("");
    setManualStatus("ACTIVE");
    setManualError(null);
    setManualSuccess(null);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle={t("pageTitle")}
      pageSubtitle={
        salon
          ? t("pageSubtitleWithSalon", { title: salon.title || commonT("untitledSalon") })
          : t("pageSubtitle")
      }
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href={`/salons/${salonId ?? ""}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          {t("nav.backToDetail")}
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900">{t("manualInvite.title")}</p>
              <p className="mt-1 text-sm text-slate-500">{t("manualInvite.description")}</p>
            </div>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleManualSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="sm:w-48">
                <label htmlFor="manualIdentifierType" className="text-sm font-medium text-slate-600">
                  {t("manualInvite.identifierTypeLabel")}
                </label>
                <select
                  id="manualIdentifierType"
                  value={manualIdentifierType}
                  onChange={(event) => setManualIdentifierType(event.target.value as ManualIdentifierType)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-100"
                >
                  <option value="email">{t("manualInvite.identifierTypeEmail")}</option>
                  <option value="username">{t("manualInvite.identifierTypeUsername")}</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="manualIdentifier" className="text-sm font-medium text-slate-600">
                  {t("manualInvite.identifierLabel")}
                </label>
                <input
                  id="manualIdentifier"
                  value={manualIdentifier}
                  onChange={(event) => setManualIdentifier(event.target.value)}
                  placeholder={identifierPlaceholder}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="lg:w-60">
                <label htmlFor="manualStatus" className="text-sm font-medium text-slate-600">
                  {t("manualInvite.statusLabel")}
                </label>
                <select
                  id="manualStatus"
                  value={manualStatus}
                  onChange={(event) => setManualStatus(event.target.value as ManualStatus)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-100"
                >
                  {manualStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="manualMemo" className="text-sm font-medium text-slate-600">
                  {t("manualInvite.memoLabel")}
                </label>
                <textarea
                  id="manualMemo"
                  value={manualMemo}
                  onChange={(event) => setManualMemo(event.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-100"
                />
              </div>
            </div>
            {manualError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                {manualError}
              </div>
            ) : null}
            {manualSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {manualSuccess}
              </div>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleManualReset}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                {t("manualInvite.reset")}
              </button>
              <button
                type="submit"
                disabled={isSubmittingManual}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingManual ? t("manualInvite.submitting") : t("manualInvite.submit")}
              </button>
            </div>
          </form>
        </div>

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
                {t("summary.total", { count: formatter.number(total) })}
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
                  <th scope="col" className="px-4 py-3">{t("columns.userId")}</th>
                  <th scope="col" className="px-4 py-3">{t("columns.status")}</th>
                  <th scope="col" className="px-4 py-3">{t("columns.joinedAt")}</th>
                  <th scope="col" className="px-4 py-3">{t("columns.nextCharge")}</th>
                  <th scope="col" className="px-4 py-3">{t("columns.lastCharge")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      {isFetching ? t("table.loading") : t("table.empty")}
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const rawStatus = (member.status ?? "").toUpperCase();
                    const statusKey = STATUS_KEYS.includes(rawStatus as StatusKey) ? (rawStatus as StatusKey) : undefined;
                    const status = statusKey ? statusMeta[statusKey] : undefined;
                    const metadataSource = (member.metadata as { source?: unknown })?.source;
                    const isManualMember = typeof metadataSource === "string" && metadataSource === "manual_invite";
                    return (
                      <tr key={member.id} className="bg-white">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{member.user_id}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              status?.className ?? STATUS_STYLES.CANCELED
                            }`}
                          >
                            {status?.label ?? member.status}
                          </span>
                          {isManualMember ? (
                            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                              {t("manualInvite.badge")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateTime(member.joined_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateTime(member.next_charge_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateTime(member.last_charged_at)}
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
              {t("summary.pagination", {
                count: formatter.number(total),
                pages: formatter.number(totalPages),
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isFetching}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("pagination.prev")}
              </button>
              <span className="text-sm text-slate-500">
                {t("pagination.pageOf", { current: formatter.number(page), total: formatter.number(totalPages) })}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isFetching}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("pagination.next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
