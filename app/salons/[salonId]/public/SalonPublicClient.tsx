"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { salonPublicApi } from "@/lib/api";
import type { SalonPublicDetail } from "@/types/api";

type SalonPublicClientProps = {
  salonId: string;
  initialSalon: SalonPublicDetail | null;
};

export default function SalonPublicClient({ salonId, initialSalon }: SalonPublicClientProps) {
  const router = useRouter();
  const [salon, setSalon] = useState<SalonPublicDetail | null>(initialSalon);
  const [isLoading, setIsLoading] = useState(!initialSalon);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await salonPublicApi.get(salonId);
        if (!mounted) return;
        setSalon(response.data as SalonPublicDetail);
      } catch (loadError: any) {
        if (!mounted) return;
        const detail = loadError?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "サロン情報の取得に失敗しました");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [salonId]);

  const priceLabel = useMemo(() => {
    const points = salon?.plan?.points ?? 0;
    return points > 0 ? `月額 ¥${points.toLocaleString("ja-JP")}` : "月額プラン";
  }, [salon]);

  const handlePrimaryAction = () => {
    if (!salon) return;
    if (salon.is_member) {
      router.push(`/salons/${salon.id}/feed`);
      return;
    }
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const seller = salon.owner?.username ? encodeURIComponent(salon.owner.username) : "";
      const url = `${origin}/points/subscriptions?seller=${seller}&salon=${salon.id}`;
      window.location.href = url;
    }
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined" || !salon) return;
    const publicUrl = `${window.location.origin}/salons/${salon.id}/public`;
    navigator.clipboard.writeText(publicUrl).catch(() => undefined);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950/95 px-4 py-16">
        <div className="max-w-md rounded-3xl border border-rose-200/40 bg-white/95 px-6 py-8 text-center shadow-lg">
          <h1 className="text-lg font-semibold text-rose-600">サロンが見つかりません</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!salon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900/5">
      <header className="bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Online Salon</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{salon.title}</h1>
              {salon.category ? (
                <span className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {salon.category}
                </span>
              ) : null}
              <p className="mt-3 max-w-2xl text-sm text-slate-600 whitespace-pre-wrap">{salon.description || "サロンの説明が登録されていません。"}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Link
                href={`/u/${salon.owner.username}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-600"
              >
                オーナープロフィールを見る
              </Link>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                メンバー {salon.member_count.toLocaleString("ja-JP") } 名
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {salon.thumbnail_url ? (
              <img src={salon.thumbnail_url} alt={`${salon.title}のサムネイル`} className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                サムネイルが設定されていません
              </div>
            )}
            <div className="space-y-4 px-6 py-6">
              <h2 className="text-lg font-semibold text-slate-900">サロンについて</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {salon.description || "サロンの詳細情報は現在準備中です。"}
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">PLAN</p>
              <p className="text-3xl font-bold text-slate-900">{priceLabel}</p>
              <p className="text-xs text-slate-500">※ 決済はサロン運営のメンバーシップとして行われます</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              サロン加入中の方はコミュニティに直接アクセスできます。
            </div>

            {salon.membership_status && salon.is_member ? (
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-600">
                現在のステータス: {salon.membership_status}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salon.is_member ? "コミュニティフィードへ" : `${priceLabel}で参加する`}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              公開ページのリンクをコピー
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}
