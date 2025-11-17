"use client";

import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  InformationCircleIcon,
  PhotoIcon,
  PlayCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import {useFormatter, useTranslations} from "next-intl";

import { PageLoader } from "@/components/LoadingSpinner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { mediaApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type MediaType = "image" | "video" | "file";

type MediaItem = {
  url: string;
  uploaded_at: string;
  mediaType: MediaType;
  filename?: string | null;
  contentType?: string | null;
  size?: number | null;
};

const MEDIA_STORAGE_KEY = "uploaded_media";

const inferMediaTypeFromUrl = (url: string, contentType?: string | null): MediaType => {
  if (contentType?.startsWith("video/")) {
    return "video";
  }
  const lowered = url.toLowerCase();
  if (/(\.mp4|\.webm|\.mov|\.m4v)(\?|$)/.test(lowered)) {
    return "video";
  }
  if (/\.(apng|avif|gif|jpe?g|png|svg|webp)(\?|$)/.test(lowered)) {
    return "image";
  }
  return "file";
};

const detectMediaTypeFromFile = (file: File): MediaType => {
  if (file.type.startsWith("video/")) {
    return "video";
  }
  if (file.type.startsWith("image/")) {
    return "image";
  }
  const loweredName = file.name.toLowerCase();
  if (/(\.mp4|\.webm|\.mov|\.m4v)$/.test(loweredName)) {
    return "video";
  }
  if (/(\.apng|\.avif|\.gif|\.jpe?g|\.png|\.svg|\.webp)$/.test(loweredName)) {
    return "image";
  }
  return "file";
};

const normalizeStoredMedia = (raw: unknown): MediaItem[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const url = (entry as any).url;
      const uploadedAt = (entry as any).uploaded_at;
      if (!url || typeof url !== "string" || !uploadedAt || typeof uploadedAt !== "string") {
        return null;
      }

      const storedMediaType = (entry as any).mediaType as MediaType | undefined;
      const contentType = (entry as any).contentType as string | null | undefined;
      const filename = (entry as any).filename as string | null | undefined;
      const size = (entry as any).size as number | null | undefined;

      return {
        url,
        uploaded_at: uploadedAt,
        mediaType: storedMediaType && ["image", "video", "file"].includes(storedMediaType)
          ? storedMediaType
          : inferMediaTypeFromUrl(url, contentType),
        contentType: contentType ?? null,
        filename: filename ?? null,
        size: typeof size === "number" ? size : null,
      } as MediaItem;
    })
    .filter((item): item is MediaItem => Boolean(item));
};

const mergeMediaItems = (items: MediaItem[], existing: MediaItem[]): MediaItem[] => {
  const combined = [...items, ...existing];
  const deduped = new Map<string, MediaItem>();

  combined.forEach((item) => {
    deduped.set(item.url, item);
  });

  return Array.from(deduped.values()).sort(
    (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
  );
};

const persistMedia = (items: MediaItem[]) => {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
};

export default function MediaPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("media.page");
  const actionsT = useTranslations("media.actions");
  const errorsT = useTranslations("media.errors");
  const confirmT = useTranslations("media.confirm");
  const formatter = useFormatter();

  const fetchMedia = useCallback(() => {
    try {
      const storedMedia = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (!storedMedia) {
        setMedia([]);
        return;
      }

      const parsed = JSON.parse(storedMedia);
      const normalized = normalizeStoredMedia(parsed);
      setMedia(normalized);
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError(errorsT("fetch"));
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [errorsT]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchMedia();
  }, [isAuthenticated, fetchMedia]);

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
        const mediaType = detectMediaTypeFromFile(file);
        const response = await mediaApi.upload(file, {
          mediaType: mediaType === "file" ? "image" : mediaType,
          optimize: mediaType === "image",
        });

        const { data } = response;
        const url: string | undefined = data?.url;
        if (!url) {
          continue;
        }

        const responseMediaType = data?.media_type === "video"
          ? "video"
          : data?.media_type === "image"
            ? "image"
            : mediaType;

        uploaded.push({
          url,
          uploaded_at: new Date().toISOString(),
          mediaType: responseMediaType,
          filename: data?.filename ?? file.name ?? null,
          contentType: data?.content_type ?? file.type ?? null,
          size: typeof data?.size === "number" ? data.size : file.size ?? null,
        });
      }

      if (uploaded.length > 0) {
        const nextMedia = mergeMediaItems(uploaded, media);
        persistMedia(nextMedia);
        setMedia(nextMedia);
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" && detail.trim().length > 0 ? detail : errorsT("upload"));
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
      window.alert(errorsT("copy"));
    }
  };

  const handleDelete = async (url: string) => {
    const confirmed = window.confirm(confirmT("delete"));
    if (!confirmed) {
      return;
    }

    try {
      await mediaApi.delete(url);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      const nextMedia = media.filter((item) => item.url !== url);
      persistMedia(nextMedia);
      setMedia(nextMedia);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle={t("title")}
      pageSubtitle={t("subtitle")}
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-6 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{t("upload.heading")}</p>
              <p className="text-xs text-slate-500">{t("upload.description")}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
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
                {isUploading ? t("upload.buttonUploading") : t("upload.button")}
              </button>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                {t("upload.backButton")}
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
              <p className="text-base font-semibold text-slate-900">{t("empty.title")}</p>
              <p className="text-sm text-slate-500">{t("empty.description")}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => {
              const isVideo = item.mediaType === "video";
              const isImage = item.mediaType === "image";
              const uploadedAt = new Date(item.uploaded_at);
              const formattedTimestamp = formatter.dateTime(uploadedAt, { dateStyle: "short", timeStyle: "short" });
              const fallbackName = item.url.split("/").pop() ?? t("list.itemAlt");
              const filename = item.filename ?? fallbackName;
              const badgeLabel = isVideo ? "VIDEO" : isImage ? "IMAGE" : "FILE";

              return (
                <div
                  key={item.url}
                  className="group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {isImage ? (
                      <img src={item.url} alt={filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-600">
                        {isVideo ? (
                          <PlayCircleIcon className="h-14 w-14 text-blue-500" aria-hidden="true" />
                        ) : (
                          <PhotoIcon className="h-12 w-12 text-slate-400" aria-hidden="true" />
                        )}
                        <span className="max-w-[80%] truncate text-sm font-semibold" title={filename}>{filename}</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {badgeLabel}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/10" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span title={formattedTimestamp}>{formattedTimestamp}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(item.url, "_blank")}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                        {actionsT("view")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
                        {actionsT("copy")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.url)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        {actionsT("delete")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
