"use client";

import { PageLoader } from "@/components/LoadingSpinner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { mediaApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  InformationCircleIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type MediaItem = {
  url: string;
  uploaded_at: string;
};

export default function MediaPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchMedia();
  }, [isAuthenticated]);

  const fetchMedia = () => {
    try {
      const storedMedia = localStorage.getItem("uploaded_media");
      if (storedMedia) {
        const parsed: MediaItem[] = JSON.parse(storedMedia);
        setMedia(parsed);
      } else {
        setMedia([]);
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError("メディアの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);
    const uploaded: MediaItem[] = [];

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const response = await mediaApi.upload(file);
        uploaded.push({
          url: response.data.url,
          uploaded_at: new Date().toISOString(),
        });
      }

      const nextMedia = [...uploaded, ...media];
      localStorage.setItem("uploaded_media", JSON.stringify(nextMedia));
      setMedia(nextMedia);
    } catch (err: any) {
      console.error("Upload failed:", err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("コピーに失敗しました");
    }
  };

  const handleDelete = async (url: string) => {
    const confirmed = window.confirm("このメディアを削除しますか？");
    if (!confirmed) {
      return;
    }

    try {
      await mediaApi.delete(url);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      const nextMedia = media.filter((item) => item.url !== url);
      localStorage.setItem("uploaded_media", JSON.stringify(nextMedia));
      setMedia(nextMedia);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="メディアライブラリ"
      pageSubtitle="画像や動画をアップロードして、LPやNOTEですぐに利用できます"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">アップロード</p>
              <p className="text-xs text-slate-500">
                PNG・JPG・WEBP をサポートしています。複数ファイルを一括選択できます。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
                {isUploading ? "アップロード中..." : "メディアを追加"}
              </button>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                マーケットへ戻る
              </Link>
            </div>
          </div>
          {error ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/60 p-10 text-center text-sm text-slate-500">
            <PageLoader />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <PhotoIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-base font-semibold text-slate-900">まだメディアがありません</p>
              <p className="text-sm text-slate-500">
                「メディアを追加」から画像をアップロードするとここに表示されます。
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => (
              <div
                key={item.url}
                className="group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200">
                  <img src={item.url} alt="uploaded media" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/10" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(item.uploaded_at).toLocaleString("ja-JP")}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(item.url, "_blank")}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      表示
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
                      コピー
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.url)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
