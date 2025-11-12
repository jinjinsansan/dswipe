"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { platformSettingsApi, salonPublicApi, subscriptionApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { SalonPublicDetail } from "@/types/api";

type SalonPublicClientProps = {
  salonId: string;
  initialSalon: SalonPublicDetail | null;
};

export default function SalonPublicClient({ salonId, initialSalon }: SalonPublicClientProps) {
  const router = useRouter();
  const [salon, setSalon] = useState<SalonPublicDetail | null>(initialSalon);
  const [_isLoading, setIsLoading] = useState(!initialSalon);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoiningYen, setIsJoiningYen] = useState(false);
  const [effectiveRate, setEffectiveRate] = useState<number>(145);
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    if (!salonId) {
      setSalon(null);
      setIsLoading(false);
      setError("サロンIDが無効です");
      return () => {
        mounted = false;
      };
    }

    if (initialSalon && initialSalon.id === salonId) {
      setSalon(initialSalon);
      setIsLoading(false);
      setError(null);
      return () => {
        mounted = false;
      };
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await salonPublicApi.get(salonId);
        if (!mounted) return;
        setSalon(response.data as SalonPublicDetail);
        setJoinError(null);
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
  }, [salonId, initialSalon]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await platformSettingsApi.getPaymentSettings();
        const data = response.data as { effective_exchange_rate?: number };
        if (data?.effective_exchange_rate && Number.isFinite(data.effective_exchange_rate)) {
          setEffectiveRate(data.effective_exchange_rate);
        }
      } catch (err) {
        console.warn("Failed to fetch platform payment settings", err);
      }
    };
    void loadSettings();
  }, []);

  const priceLabelPoints = useMemo(() => {
    const points = salon?.plan?.points ?? 0;
    return points > 0 ? `月額 ${points.toLocaleString("ja-JP")}ポイント` : "月額プラン";
  }, [salon]);

  const priceLabelYen = useMemo(() => {
    const explicit = salon?.plan?.monthly_price_jpy;
    if (explicit && explicit > 0) {
      return `月額 ${explicit.toLocaleString("ja-JP")}円`;
    }
    const usdAmount = salon?.plan?.usd_amount;
    if (usdAmount && usdAmount > 0) {
      const estimated = Math.round(usdAmount * effectiveRate);
      return estimated > 0 ? `月額 約${estimated.toLocaleString("ja-JP") }円` : null;
    }
    return null;
  }, [salon, effectiveRate]);

  const handleJoinWithPoints = () => {
    if (!salon) return;
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const params = new URLSearchParams();
    const seller = salon.owner?.username?.trim();
    const planKey = salon.plan?.key?.trim();
    const planId = salon.plan?.subscription_plan_id?.trim();
    const planPoints = Number.isFinite(salon.plan?.points) ? salon.plan?.points : undefined;

    if (seller) params.set("seller", seller);
    params.set("salon", salon.id);
    if (planKey) params.set("plan_key", planKey);
    if (planId) params.set("plan_id", planId);
    if (typeof planPoints === "number" && planPoints > 0) {
      params.set("plan_points", String(planPoints));
    }

    window.location.href = `${origin}/points/subscriptions?${params.toString()}`;
  };

  const handleJoinWithYen = async () => {
    if (!salon || !salon.plan?.key) return;
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setJoinError(null);
    setIsJoiningYen(true);
    try {
      const response = await subscriptionApi.createCheckout({
        plan_key: salon.plan.key,
        seller_id: salon.owner?.id,
        seller_username: salon.owner?.username,
        salon_id: salon.id,
        metadata: {
          billing_method: "salon_yen",
          salon_id: salon.id,
        },
      });
      const data = response.data as { checkout_url?: string };
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("チェックアウトURLの取得に失敗しました");
      }
    } catch (joinErr: any) {
      console.error("Failed to start yen subscription", joinErr);
      const detail = joinErr?.response?.data?.detail;
      setJoinError(typeof detail === "string" ? detail : "決済の開始に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsJoiningYen(false);
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
              <p className="text-3xl font-bold text-slate-900">{priceLabelPoints}</p>
              {priceLabelYen ? (
                <p className="text-sm text-slate-500">{priceLabelYen}（クレジットカード決済）</p>
              ) : null}
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

            {joinError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                {joinError}
              </div>
            ) : null}

            <div className="space-y-2">
              {salon.is_member ? (
                <button
                  type="button"
                  onClick={() => router.push(`/salons/${salon.id}/feed`)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-500"
                >
                  コミュニティフィードへ
                </button>
              ) : (
                <>
                  {salon.allow_point_subscription ? (
                    <button
                      type="button"
                      onClick={handleJoinWithPoints}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-500"
                    >
                      ポイント自動チャージで参加する
                    </button>
                  ) : null}

                  {salon.allow_jpy_subscription ? (
                    <button
                      type="button"
                      onClick={handleJoinWithYen}
                      disabled={isJoiningYen}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isJoiningYen ? "リダイレクト中…" : "日本円クレジットカードで参加する"}
                    </button>
                  ) : null}
                  {salon.allow_jpy_subscription && salon.plan?.key ? (
                    <Link
                      href={{
                        pathname: "/checkout/quick",
                        query: {
                          type: "subscription",
                          plan_key: salon.plan.key,
                          title: salon.title ?? undefined,
                          price: salon.plan.monthly_price_jpy ?? undefined,
                          seller: salon.owner?.username ?? undefined,
                          seller_id: salon.owner?.id ?? undefined,
                          salon_id: salon.id,
                        },
                      }}
                      className="mt-2 block text-center text-xs font-semibold text-emerald-600 underline underline-offset-4"
                    >
                      保存済みの情報でクイック決済
                    </Link>
                  ) : null}

                  {!salon.allow_point_subscription && !salon.allow_jpy_subscription ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                      現在申し込み可能な決済方法が設定されていません。
                    </div>
                  ) : null}

                  <p className="text-[11px] leading-relaxed text-slate-500 text-center">
                    デジタルコンテンツの性質上、決済完了後のポイントおよび提供済みコンテンツはキャンセルできません。
                  </p>
                </>
              )}
            </div>

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
