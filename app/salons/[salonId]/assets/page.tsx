"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonApi, salonAssetApi } from "@/lib/api";
import type {
  Salon,
  SalonAsset,
  SalonAssetListResult,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

type UploadFormState = {
  file: File | null;
  title: string;
  description: string;
  assetType: string;
  visibility: "MEMBERS" | "PUBLIC";
  thumbnail: File | null;
};

const INITIAL_UPLOAD_FORM: UploadFormState = {
  file: null,
  title: "",
  description: "",
  assetType: "",
  visibility: "MEMBERS",
  thumbnail: null,
};

type FilterState = {
  visibility: "ALL" | "MEMBERS" | "PUBLIC";
  assetType: "ALL" | "IMAGE" | "VIDEO" | "DOCUMENT" | "FILE";
};

const INITIAL_FILTER: FilterState = {
  visibility: "ALL",
  assetType: "ALL",
};

const humanizeAssetType = (value: string) => {
  switch (value) {
    case "IMAGE":
      return "画像";
    case "VIDEO":
      return "動画";
    case "DOCUMENT":
      return "ドキュメント";
    default:
      return "ファイル";
  }
};

const visibilityLabel = (value: string) => (value === "PUBLIC" ? "公開" : "会員限定");

const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export default function SalonAssetsPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const { user } = useAuthStore();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [assets, setAssets] = useState<SalonAsset[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState<UploadFormState>(INITIAL_UPLOAD_FORM);
  const [uploading, setUploading] = useState(false);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Record<string, { title: string; description: string; visibility: "MEMBERS" | "PUBLIC" }>>({});

  const isOwner = useMemo(() => {
    if (!salon || !user) return false;
    return salon.owner_id === user.id;
  }, [salon, user]);

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

  const loadAssets = useCallback(async () => {
    if (!salonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const query: Record<string, string | number> = { limit: 50, offset: 0 };
      if (filters.visibility !== "ALL") query.visibility = filters.visibility;
      if (filters.assetType !== "ALL") query.asset_type = filters.assetType;

      const response = await salonAssetApi.listAssets(salonId, query);
      const payload = response.data as SalonAssetListResult;
      setAssets(payload.data ?? []);
      setTotalAssets(payload.total ?? 0);
    } catch (loadError) {
      console.error("Failed to load assets", loadError);
      setError("アセット情報を取得できませんでした");
    } finally {
      setIsLoading(false);
    }
  }, [salonId, filters.visibility, filters.assetType]);

  useEffect(() => {
    loadSalon();
  }, [loadSalon]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUploadField = useCallback(<K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) => {
    setUploadForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetUploadForm = () => {
    setUploadForm(INITIAL_UPLOAD_FORM);
  };

  const handleUpload = async () => {
    if (!salonId || !uploadForm.file) {
      setError("アップロードするファイルを選択してください");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await salonAssetApi.uploadAsset(salonId, {
        file: uploadForm.file,
        title: uploadForm.title.trim() || undefined,
        description: uploadForm.description.trim() || undefined,
        asset_type: uploadForm.assetType ? uploadForm.assetType.toUpperCase() : undefined,
        visibility: uploadForm.visibility,
        thumbnail: uploadForm.thumbnail ?? undefined,
      });
      setSuccessMessage("ファイルをアップロードしました");
      resetUploadForm();
      await loadAssets();
    } catch (uploadError) {
      console.error("Failed to upload asset", uploadError);
      setError("アセットのアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!salonId) return;
    const confirmed = confirm("このアセットを削除しますか？");
    if (!confirmed) return;
    setActionLoading((prev) => ({ ...prev, [assetId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      await salonAssetApi.deleteAsset(salonId, assetId);
      setSuccessMessage("アセットを削除しました");
      await loadAssets();
    } catch (deleteError) {
      console.error("Failed to delete asset", deleteError);
      setError("アセットの削除に失敗しました");
    } finally {
      setActionLoading((prev) => ({ ...prev, [assetId]: false }));
    }
  };

  const startEdit = (asset: SalonAsset) => {
    setEditing((prev) => ({
      ...prev,
      [asset.id]: {
        title: asset.title ?? "",
        description: asset.description ?? "",
        visibility: asset.visibility === "PUBLIC" ? "PUBLIC" : "MEMBERS",
      },
    }));
  };

  const cancelEdit = (assetId: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[assetId];
      return next;
    });
  };

  const handleEditingField = (assetId: string, field: "title" | "description" | "visibility", value: string) => {
    setEditing((prev) => {
      const patch = prev[assetId];
      if (!patch) return prev;
      return {
        ...prev,
        [assetId]: {
          ...patch,
          [field]: field === "visibility" ? (value === "PUBLIC" ? "PUBLIC" : "MEMBERS") : value,
        },
      };
    });
  };

  const handleUpdate = async (assetId: string) => {
    if (!salonId) return;
    const patch = editing[assetId];
    if (!patch) return;
    setActionLoading((prev) => ({ ...prev, [assetId]: true }));
    setError(null);
    setSuccessMessage(null);
    try {
      await salonAssetApi.updateAsset(salonId, assetId, {
        title: patch.title.trim(),
        description: patch.description.trim(),
        visibility: patch.visibility,
      });
      setSuccessMessage("アセット情報を更新しました");
      cancelEdit(assetId);
      await loadAssets();
    } catch (updateError) {
      console.error("Failed to update asset", updateError);
      setError("アセット情報の更新に失敗しました");
    } finally {
      setActionLoading((prev) => ({ ...prev, [assetId]: false }));
    }
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAssets = useMemo(() => assets, [assets]);

  if (isLoading && assets.length === 0) {
    return <PageLoader />;
  }

  if (!salonId) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="サロンアセットライブラリ"
      pageSubtitle={salon ? `${salon.title} のファイル共有` : "オンラインサロンのアセット管理"}
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
            コミュニティフィード
          </Link>
          <Link
            href={`/salons/${salonId}/announcements`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            お知らせ管理
          </Link>
          <Link
            href={`/salons/${salonId}/events`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            イベント管理
          </Link>
          <Link
            href={`/salons/${salonId}/roles`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
          >
            ロール管理
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        ) : null}

        {isOwner ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">ファイルをアップロード</h2>
                <p className="mt-1 text-xs text-slate-500">会員と共有したい資料や動画を追加できます。</p>
              </div>
              <ArrowUpTrayIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
            </header>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">ファイル</label>
                <input
                  type="file"
                  onChange={(event) => handleUploadField("file", event.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">タイトル (任意)</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(event) => handleUploadField("title", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="例: 10月勉強会資料"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">種類 (任意)</label>
                  <select
                    value={uploadForm.assetType}
                    onChange={(event) => handleUploadField("assetType", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">自動判定</option>
                    <option value="IMAGE">画像</option>
                    <option value="VIDEO">動画</option>
                    <option value="DOCUMENT">ドキュメント</option>
                    <option value="FILE">その他</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">説明 (任意)</label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={(event) => handleUploadField("description", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="活用方法や閲覧対象者などを入力してください"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">公開設定</label>
                  <select
                    value={uploadForm.visibility}
                    onChange={(event) => handleUploadField("visibility", event.target.value === "PUBLIC" ? "PUBLIC" : "MEMBERS")}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="MEMBERS">会員限定</option>
                    <option value="PUBLIC">公開</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">サムネイル (任意)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleUploadField("thumbnail", event.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "アップロード中..." : "アップロード"}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">アセット一覧</h2>
              <p className="text-xs text-slate-500">{totalAssets}件のファイル</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={filters.visibility}
                onChange={(event) => handleFilterChange("visibility", event.target.value as FilterState["visibility"])}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 focus:border-sky-500 focus:outline-none"
              >
                <option value="ALL">すべての公開設定</option>
                <option value="MEMBERS">会員限定</option>
                <option value="PUBLIC">公開</option>
              </select>
              <select
                value={filters.assetType}
                onChange={(event) => handleFilterChange("assetType", event.target.value as FilterState["assetType"])}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 focus:border-sky-500 focus:outline-none"
              >
                <option value="ALL">すべての種類</option>
                <option value="IMAGE">画像</option>
                <option value="VIDEO">動画</option>
                <option value="DOCUMENT">ドキュメント</option>
                <option value="FILE">その他</option>
              </select>
            </div>
          </header>

          {filteredAssets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              条件に一致するアセットがありません。新しいファイルをアップロードするかフィルタを変更してください。
            </div>
          ) : (
            <div className="space-y-5">
              {filteredAssets.map((asset) => {
                const editingState = editing[asset.id];
                const loading = actionLoading[asset.id] ?? false;
                const createdAt = asset.created_at ? new Date(asset.created_at).toLocaleString("ja-JP") : "";
                const canManage = isOwner || asset.uploader_id === user?.id;

                let assetIcon = <DocumentIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />;
                if (asset.asset_type === "IMAGE") assetIcon = <PhotoIcon className="h-10 w-10 text-sky-400" aria-hidden="true" />;
                else if (asset.asset_type === "VIDEO") assetIcon = <VideoCameraIcon className="h-10 w-10 text-purple-400" aria-hidden="true" />;

                return (
                  <article key={asset.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <header className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          {assetIcon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{asset.title || "(無題のファイル)"}</p>
                            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              {humanizeAssetType(asset.asset_type)}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              asset.visibility === "PUBLIC" ? "border-sky-200 text-sky-600" : "border-slate-200 text-slate-500"
                            }`}>
                              {asset.visibility === "PUBLIC" ? <EyeIcon className="h-4 w-4" aria-hidden="true" /> : <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />}
                              {visibilityLabel(asset.visibility)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            アップロード者: {asset.uploader_id === user?.id ? "あなた" : asset.uploader_id.slice(0, 8)} ・ {createdAt} ・ {formatSize(asset.file_size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <a
                          href={asset.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300"
                        >
                          ファイルを開く
                        </a>
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              onClick={() => (editingState ? cancelEdit(asset.id) : startEdit(asset))}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:border-sky-200 hover:text-sky-600"
                              disabled={loading}
                            >
                              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                              {editingState ? "編集を閉じる" : "編集"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(asset.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 font-medium text-rose-500 hover:bg-rose-50"
                              disabled={loading}
                            >
                              <TrashIcon className="h-4 w-4" aria-hidden="true" />
                              削除
                            </button>
                          </>
                        ) : null}
                      </div>
                    </header>

                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      {asset.description ? asset.description : "説明は未設定です。"}
                    </div>

                    {editingState ? (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">タイトル</label>
                          <input
                            type="text"
                            value={editingState.title}
                            onChange={(event) => handleEditingField(asset.id, "title", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">説明</label>
                          <textarea
                            rows={3}
                            value={editingState.description}
                            onChange={(event) => handleEditingField(asset.id, "description", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">公開設定</label>
                          <select
                            value={editingState.visibility}
                            onChange={(event) => handleEditingField(asset.id, "visibility", event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          >
                            <option value="MEMBERS">会員限定</option>
                            <option value="PUBLIC">公開</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => cancelEdit(asset.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-300"
                            disabled={loading}
                          >
                            キャンセル
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdate(asset.id)}
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
      </div>
    </DashboardLayout>
  );
}
