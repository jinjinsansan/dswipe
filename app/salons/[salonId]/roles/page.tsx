"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonApi, salonRoleApi } from "@/lib/api";
import type {
  Salon,
  SalonMember,
  SalonRole,
  SalonRoleCreatePayload,
  SalonRoleUpdatePayload,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

const PERMISSION_FIELDS: Array<{ key: keyof SalonRoleCreatePayload; label: string; description: string }> = [
  { key: "manage_feed", label: "フィード管理", description: "投稿の公開・ピン留め・削除が可能" },
  { key: "manage_events", label: "イベント管理", description: "イベントの作成・更新・削除が可能" },
  { key: "manage_assets", label: "アセット管理", description: "ファイルライブラリを編集" },
  { key: "manage_announcements", label: "お知らせ管理", description: "告知の作成・公開設定が可能" },
  { key: "manage_members", label: "メンバー管理", description: "メンバーのロール割り当てが可能" },
  { key: "manage_roles", label: "ロール設定", description: "ロールの作成・編集が可能" },
];

type RoleFormState = SalonRoleCreatePayload;

const INITIAL_FORM: RoleFormState = {
  name: "",
  description: "",
  is_default: false,
  manage_feed: false,
  manage_events: false,
  manage_assets: false,
  manage_announcements: false,
  manage_members: false,
  manage_roles: false,
};

export default function SalonRolesPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const { user } = useAuthStore();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [roles, setRoles] = useState<SalonRole[]>([]);
  const [members, setMembers] = useState<SalonMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<RoleFormState>(INITIAL_FORM);
  const [editing, setEditing] = useState<Record<string, SalonRoleUpdatePayload>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const [assignRoleId, setAssignRoleId] = useState<string>("");
  const [assignMemberId, setAssignMemberId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);

  const ownerName = useMemo(() => {
    if (!salon) return "";
    if (salon.owner_id === user?.id) return "あなた";
    return "サロンオーナー";
  }, [salon, user?.id]);

  const loadSalon = useCallback(async () => {
    if (!salonId) return;
    try {
      const response = await salonApi.get(salonId);
      setSalon(response.data as Salon);
    } catch (loadError) {
      console.error("Failed to load salon", loadError);
      setError("サロン情報の取得に失敗しました");
    }
  }, [salonId]);

  const loadRoles = useCallback(async () => {
    if (!salonId) return;
    try {
      const response = await salonRoleApi.listRoles(salonId, { limit: 100, offset: 0 });
      const payload = response.data;
      setRoles((payload as { data?: SalonRole[] })?.data ?? []);
    } catch (loadError) {
      console.error("Failed to load roles", loadError);
      setError("ロールの取得に失敗しました");
    }
  }, [salonId]);

  const loadMembers = useCallback(async () => {
    if (!salonId) return;
    try {
      const response = await salonApi.getMembers(salonId, { limit: 100, offset: 0, status_filter: "ACTIVE" });
      const payload = response.data as { data?: SalonMember[] };
      setMembers(payload.data ?? []);
    } catch (loadError) {
      console.error("Failed to load members", loadError);
    }
  }, [salonId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadSalon(), loadRoles(), loadMembers()])
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [loadSalon, loadRoles, loadMembers]);

  const handleFormChange = useCallback(<K extends keyof RoleFormState>(key: K, value: RoleFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const handleCreateRole = async () => {
    if (!salonId) return;
    if (!form.name.trim()) {
      setError("ロール名を入力してください");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await salonRoleApi.createRole(salonId, {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
      });
      setSuccessMessage("ロールを作成しました");
      resetForm();
      await loadRoles();
    } catch (createError) {
      console.error("Failed to create role", createError);
      setError("ロールの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (role: SalonRole) => {
    setEditing((prev) => ({
      ...prev,
      [role.id]: {
        name: role.name,
        description: role.description ?? "",
        is_default: role.is_default,
        manage_feed: role.manage_feed,
        manage_events: role.manage_events,
        manage_assets: role.manage_assets,
        manage_announcements: role.manage_announcements,
        manage_members: role.manage_members,
        manage_roles: role.manage_roles,
      },
    }));
    setSuccessMessage(null);
    setError(null);
  };

  const cancelEdit = (roleId: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
  };

  const handleEditChange = (roleId: string, field: keyof SalonRoleUpdatePayload, value: SalonRoleUpdatePayload[keyof SalonRoleUpdatePayload]) => {
    setEditing((prev) => {
      const roleState = prev[roleId];
      if (!roleState) return prev;
      return {
        ...prev,
        [roleId]: {
          ...roleState,
          [field]: value,
        },
      };
    });
  };

  const saveRoleChanges = async (roleId: string) => {
    if (!salonId) return;
    const payload = editing[roleId];
    if (!payload) return;
    if (payload.name !== undefined && !payload.name?.toString().trim()) {
      setError("ロール名を入力してください");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [roleId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      const sanitized: SalonRoleUpdatePayload = { ...payload };
      if (sanitized.name !== undefined && sanitized.name !== null) {
        sanitized.name = sanitized.name.toString().trim();
      }
      if (sanitized.description !== undefined) {
        sanitized.description = sanitized.description?.toString().trim() || "";
      }
      await salonRoleApi.updateRole(salonId, roleId, sanitized);
      cancelEdit(roleId);
      setSuccessMessage("ロールを更新しました");
      await loadRoles();
    } catch (updateError) {
      console.error("Failed to update role", updateError);
      setError("ロールの更新に失敗しました");
    } finally {
      setActionLoading((prev) => ({ ...prev, [roleId]: false }));
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!salonId) return;
    if (!confirm("このロールを削除しますか？")) return;
    setActionLoading((prev) => ({ ...prev, [roleId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      await salonRoleApi.deleteRole(salonId, roleId);
      setSuccessMessage("ロールを削除しました");
      await loadRoles();
    } catch (deleteError) {
      console.error("Failed to delete role", deleteError);
      setError("ロールの削除に失敗しました");
    } finally {
      setActionLoading((prev) => ({ ...prev, [roleId]: false }));
    }
  };

  const handleAssign = async (mode: "assign" | "unassign") => {
    if (!salonId) return;
    if (!assignRoleId) {
      setError("ロールを選択してください");
      return;
    }
    if (!assignMemberId) {
      setError("メンバーを選択してください");
      return;
    }
    setAssignLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (mode === "assign") {
        await salonRoleApi.assignRole(salonId, assignRoleId, { user_id: assignMemberId });
        setSuccessMessage("ロールを付与しました");
      } else {
        await salonRoleApi.unassignRole(salonId, assignRoleId, assignMemberId);
        setSuccessMessage("ロールを解除しました");
      }
      await loadRoles();
    } catch (assignError) {
      console.error("Failed to update assignment", assignError);
      setError(mode === "assign" ? "ロールの付与に失敗しました" : "ロールの解除に失敗しました");
    } finally {
      setAssignLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!salonId) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="ロールと権限管理"
      pageSubtitle={salon ? `${salon.title} の運営権限を管理できます` : "サロン権限設定"}
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href={`/salons/${salonId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          サロン詳細に戻る
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={`/salons/${salonId}/feed`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            フィード管理
          </Link>
          <Link
            href={`/salons/${salonId}/events`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            イベント管理
          </Link>
          <Link
            href={`/salons/${salonId}/announcements`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            お知らせ管理
          </Link>
          <Link
            href={`/salons/${salonId}/assets`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            アセットライブラリ
          </Link>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <ExclamationCircleIcon className="h-5 w-5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">新しいロールを作成</h2>
              <p className="mt-1 text-xs text-slate-500">運営メンバーに柔軟な権限を割り当てましょう。</p>
            </div>
            <ShieldCheckIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
          </header>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">ロール名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="例: モデレーター"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">デフォルト付与</label>
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_default)}
                    onChange={(event) => handleFormChange("is_default", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  新規メンバーに自動で付与する
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">説明 (任意)</label>
              <textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(event) => handleFormChange("description", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="ロールの概要や想定する役割を記入してください"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PERMISSION_FIELDS.map((field) => (
                <label
                  key={field.key as string}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(event) => handleFormChange(field.key, event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    <span className="font-semibold text-slate-900">{field.label}</span>
                    <span className="block text-xs text-slate-500">{field.description}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCreateRole}
                disabled={isSubmitting}
              >
                {isSubmitting ? "作成中..." : "ロールを追加"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">ロール一覧</h2>
            <p className="text-xs text-slate-500">{roles.length} 件のロールが設定されています</p>
          </div>

          {roles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              まだカスタムロールがありません。運営体制に合わせて作成しましょう。
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => {
                const editingState = editing[role.id];
                const loading = actionLoading[role.id] ?? false;
                const assignedLabel = role.assigned_member_count === 0 ? "未割り当て" : `${role.assigned_member_count} 名が利用中`;

                return (
                  <article key={role.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <header className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{role.name}</h3>
                          {role.is_default ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                              デフォルト
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">{role.description || "説明なし"}</p>
                        <p className="text-xs text-slate-500">{assignedLabel}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => (editingState ? cancelEdit(role.id) : startEdit(role))}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-sky-200 hover:text-sky-600"
                          disabled={loading}
                        >
                          {editingState ? "編集を閉じる" : "編集"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRole(role.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 font-medium text-rose-500 hover:bg-rose-50"
                          disabled={loading}
                        >
                          削除
                        </button>
                      </div>
                    </header>

                    {editingState ? (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                          <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">ロール名</label>
                            <input
                              type="text"
                              value={editingState.name ?? ""}
                              onChange={(event) => handleEditChange(role.id, "name", event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={Boolean(editingState.is_default)}
                              onChange={(event) => handleEditChange(role.id, "is_default", event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            新規メンバーへ自動付与
                          </label>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">説明</label>
                          <textarea
                            rows={3}
                            value={editingState.description ?? ""}
                            onChange={(event) => handleEditChange(role.id, "description", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {PERMISSION_FIELDS.map((field) => (
                            <label
                              key={field.key as string}
                              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(editingState[field.key])}
                                onChange={(event) => handleEditChange(role.id, field.key, event.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                              />
                              <span>
                                <span className="font-semibold text-slate-900">{field.label}</span>
                                <span className="block text-xs text-slate-500">{field.description}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => cancelEdit(role.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300"
                            disabled={loading}
                          >
                            キャンセル
                          </button>
                          <button
                            type="button"
                            onClick={() => saveRoleChanges(role.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-1.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={loading}
                          >
                            {loading ? "保存中..." : "変更を保存"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">メンバーへのロール割り当て</h2>
              <p className="text-xs text-slate-500">{ownerName}が付与したメンバー権限を管理できます。</p>
            </div>
            <UserPlusIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
          </header>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">メンバー</label>
              <select
                value={assignMemberId}
                onChange={(event) => setAssignMemberId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">選択してください</option>
                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {member.user_id}（加入日: {new Date(member.joined_at).toLocaleDateString("ja-JP")}）
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">ロール</label>
              <select
                value={assignRoleId}
                onChange={(event) => setAssignRoleId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">選択してください</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleAssign("assign")}
              disabled={assignLoading}
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {assignLoading ? "処理中..." : "ロールを付与"}
            </button>
            <button
              type="button"
              onClick={() => handleAssign("unassign")}
              disabled={assignLoading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ロールを解除
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            ※ メンバーの最新状態はサロンメンバー一覧から確認できます。付与済みのロールは、再付与してもエラーにはなりません。
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
