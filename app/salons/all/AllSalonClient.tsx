"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonPublicApi } from "@/lib/api";
import type { SalonPublicListItem, SalonPublicListResult } from "@/types/api";

const PAGE_SIZE = 12;

const PRICE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "価格帯: 指定なし" },
  { value: "under_1000", label: "〜 ¥1,000" },
  { value: "1000_3000", label: "¥1,000〜¥3,000" },
  { value: "3000_5000", label: "¥3,000〜¥5,000" },
  { value: "over_5000", label: "¥5,000以上" },
];

const SORT_OPTIONS: { value: "new" | "popular"; label: string }[] = [
  { value: "new", label: "新着順" },
  { value: "popular", label: "人気順" },
];

interface FilterState {
  category: string;
  price_range: string;
  seller_username: string;
  sort: "new" | "popular";
}

export default function AllSalonClient() {
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    price_range: "",
    seller_username: "",
    sort: "new",
  });
  const [draftCategory, setDraftCategory] = useState("");
  const [draftSeller, setDraftSeller] = useState("");
  const [salons, setSalons] = useState<SalonPublicListItem[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftCategory(filters.category);
    setDraftSeller(filters.seller_username);
  }, [filters.category, filters.seller_username]);

  const fetchSalons = useCallback(
    async (nextOffset: number, append: boolean) => {
      setError(null);
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params: Record<string, string | number> = {
          limit: PAGE_SIZE,
          offset: nextOffset,
          sort: filters.sort,
        };
        if (filters.category) {
          params.category = filters.category;
        }
        if (filters.price_range) {
          params.price_range = filters.price_range;
        }
        if (filters.seller_username) {
          params.seller_username = filters.seller_username;
        }

        const response = await salonPublicApi.list(params);
        const payload = response.data as SalonPublicListResult;
        const records = payload?.data ?? [];

        setTotal(payload?.total ?? records.length);

        if (append) {
          setSalons((prev) => [...prev, ...records]);
        } else {
          setSalons(records);
        }

        setCategorySuggestions((prev) => {
          const base = append ? new Set(prev) : new Set<string>();
          records.forEach((item) => {
            if (item.category) {
              base.add(item.category);
            }
          });
          return Array.from(base).sort((a, b) => a.localeCompare(b, "ja"));
        });
      } catch (requestError: any) {
        console.error("Failed to load public salons", requestError);
        const detail = requestError?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "公開サロン一覧の取得に失敗しました");
        if (!append) {
          setSalons([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchSalons(0, false);
  }, [fetchSalons]);

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      category: draftCategory.trim(),
      seller_username: draftSeller.trim(),
    }));
  };

  const handleResetFilters = () => {
    setDraftCategory("");
    setDraftSeller("");
    setFilters({ category: "", price_range: "", seller_username: "", sort: "new" });
  };

  const handleLoadMore = () => {
    if (isLoadingMore) return;
    if (salons.length >= total) return;
    fetchSalons(salons.length, true);
  };

  const hasMore = salons.length < total;

  const priceLabel = useCallback((item: SalonPublicListItem) => {
    if (!item.plan_label) {
      return "プラン未設定";
    }
    return item.plan_label;
  }, []);

  const formatDate = useCallback((value: string) => {
    try {
      return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
    } catch (_error) {
      return value;
    }
  }, []);

  const categoryOptions = useMemo(() => {
    return categorySuggestions.map((option) => ({ value: option, label: option }));
  }, [categorySuggestions]);

  return (
    <DashboardLayout requireAuth={false} pageTitle="AllSalon" pageSubtitle="公開中のオンラインサロンを探す">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form className="grid gap-4 md:grid-cols-5" onSubmit={handleFilterSubmit}>
            <div className="md:col-span-2">
              <label htmlFor="category" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                カテゴリ
              </label>
              <input
                id="category"
                type="text"
                value={draftCategory}
                onChange={(event) => setDraftCategory(event.target.value)}
                list="salon-category-options"
                placeholder="例: 投資、競馬"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
              <datalist id="salon-category-options">
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="price_range" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                価格帯
              </label>
              <select
                id="price_range"
                value={filters.price_range}
                onChange={(event) => setFilters((prev) => ({ ...prev, price_range: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                {PRICE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="seller" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                オーナー
              </label>
              <input
                id="seller"
                type="text"
                value={draftSeller}
                onChange={(event) => setDraftSeller(event.target.value)}
                placeholder="ユーザー名で検索"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                並び替え
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, sort: event.target.value as "new" | "popular" }))
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500"
              >
                絞り込む
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                条件をクリア
              </button>
            </div>
          </form>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {salons.length === 0 && !error ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
            <p className="text-sm text-slate-600">条件に一致するサロンが見つかりませんでした。</p>
          </div>
        ) : null}

        {salons.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {salons.map((item) => (
                  <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md">
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={`${item.title}のサムネイル`} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                          サムネイル未設定
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {item.category ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                              {item.category}
                            </span>
                          ) : null}
                          <h3 className="mt-2 text-base font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>{formatDate(item.created_at)}</p>
                          <p>公開</p>
                        </div>
                      </div>

                      {item.description ? (
                        <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                      ) : null}

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        {item.owner_profile_image_url ? (
                          <img
                            src={item.owner_profile_image_url}
                            alt={`${item.owner_display_name ?? item.owner_username}のアバター`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">
                            {item.owner_display_name?.charAt(0) ?? item.owner_username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            <Link href={`/u/${item.owner_username}`} className="hover:text-sky-600">
                              {item.owner_display_name ?? item.owner_username}
                            </Link>
                          </p>
                          <p className="text-xs text-slate-500">@{item.owner_username}</p>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center gap-3">
                        <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                          {priceLabel(item)}
                        </div>
                        <Link
                          href={`/salons/${item.id}/public`}
                          className="ml-auto inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500"
                        >
                          公開ページを見る
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        ) : null}

        {hasMore && salons.length > 0 ? (
          <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? "読み込み中..." : "もっと見る"}
                </button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
