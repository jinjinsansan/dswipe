"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GRAD_BRAND, HEAD_BG, NAVY_CARD_BG, pickThumbFallback } from "@/lib/momentum";
import { paymentApi, platformSettingsApi, salonPublicApi } from "@/lib/api";
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

  const isIntroOffer = Boolean(
    salon?.introductory_offer_enabled && salon.introductory_offer_type === "first_month_free_direct"
  );

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
      const payload: Record<string, unknown> = {
        item_type: "subscription",
        plan_key: salon.plan.key,
        salon_id: salon.id,
      };
      if (salon.owner?.id) {
        payload.seller_id = salon.owner.id;
      }
      if (salon.owner?.username) {
        payload.seller_username = salon.owner.username;
      }
      const response = await paymentApi.quickCheckout(payload);
      const data = response.data as { checkout_url?: string };
      if (!data.checkout_url) {
        throw new Error("チェックアウトURLの取得に失敗しました");
      }
      window.location.href = data.checkout_url;
    } catch (joinErr: any) {
      console.error("Failed to start yen subscription", joinErr);
      const detail = joinErr?.response?.data?.detail;
      if (detail === "請求先情報を設定してください") {
        alert("先に請求先情報（氏名・メール・電話番号）を登録してください。プロフィール設定画面に移動します。");
        const redirectPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
        const search = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
        router.push(`/profile${search}`);
        return;
      }
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
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8fd] px-4 py-16">
        <div className="max-w-md rounded-3xl border border-rose-200/40 bg-white/95 px-6 py-8 text-center shadow-lg">
          <h1 className="text-lg font-semibold text-rose-600">サロンが見つかりません</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0b1f3a] px-6 py-2 text-sm font-semibold text-pure-white transition hover:bg-[#122c4d]"
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
    <div className="min-h-screen bg-[#f4f8fd]">
      {/* Navy cover — mock: D-Swipe Salon.html .cover */}
      <header style={{ background: HEAD_BG }}>
        <div className="mx-auto flex max-w-5xl flex-col justify-center gap-2 px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-cyan-300">MEMBERSHIP · オンラインサロン</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-pure-white sm:text-4xl">{salon.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/u/${salon.owner.username}`}
              className="inline-flex items-center gap-2 text-[13px] text-[#cfe3f5] transition hover:text-pure-white"
            >
              主宰：{salon.owner.username}
              {salon.member_count_visible && typeof salon.member_count === "number"
                ? ` · ${salon.member_count.toLocaleString("ja-JP")}名が参加中`
                : ""}
            </Link>
            {salon.category ? (
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cfe3f5]">
                {salon.category}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {salon.thumbnail_url ? (
              <img src={salon.thumbnail_url} alt={`${salon.title}のサムネイル`} className="h-64 w-full object-cover" />
            ) : (
              <div
                className="flex h-64 w-full items-center justify-center text-sm font-bold text-pure-white/80"
                style={{ background: pickThumbFallback(salon.id) }}
              >
                サムネイルが設定されていません
              </div>
            )}
            <div className="space-y-4 px-6 py-6">
              <h2 className="text-lg font-bold text-[#0b1f3a]">サロンについて</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {salon.description || "サロンの詳細情報は現在準備中です。"}
              </p>
            </div>
          </div>

          {/* Dark membership card — mock: .side-card.dark */}
          <aside
            className="flex h-fit flex-col gap-4 rounded-3xl p-6 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]"
            style={{ background: NAVY_CARD_BG }}
          >
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">MEMBERSHIP</p>
              <p className="text-3xl font-extrabold tracking-tight text-pure-white">{priceLabelPoints}</p>
              {priceLabelYen ? (
                <p className="text-sm text-[#9fb4d0]">{priceLabelYen}（クレジットカード決済）</p>
              ) : null}
              {isIntroOffer ? (
                <p className="text-xs font-bold text-emerald-300">初月無料（カード登録のみで完了します）</p>
              ) : null}
              <p className="text-xs text-[#9fb4d0]">※ 決済はサロン運営のメンバーシップとして行われます</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs text-[#bcd3ee]">
              サロン加入中の方はコミュニティに直接アクセスできます。
            </div>

            {salon.membership_status && salon.is_member ? (
              <div className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-4 py-2 text-xs font-semibold text-emerald-200">
                現在のステータス: {salon.membership_status}
              </div>
            ) : null}

            {joinError ? (
              <div className="rounded-2xl border border-rose-300/30 bg-rose-400/15 px-4 py-3 text-xs text-rose-200">
                {joinError}
              </div>
            ) : null}

            <div className="space-y-2">
              {salon.is_member ? (
                <button
                  type="button"
                  onClick={() => router.push(`/salons/${salon.id}/feed`)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
                  style={{ background: GRAD_BRAND }}
                >
                  コミュニティフィードへ
                </button>
              ) : (
                <>
                  {salon.allow_point_subscription && !isIntroOffer ? (
                    <button
                      type="button"
                      onClick={handleJoinWithPoints}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
                      style={{ background: GRAD_BRAND }}
                    >
                      ポイント自動チャージで参加する
                    </button>
                  ) : null}

                  {salon.allow_jpy_subscription ? (
                    <button
                      type="button"
                      onClick={handleJoinWithYen}
                      disabled={isJoiningYen}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-pure-white shadow transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isJoiningYen
                        ? "決済ページへ移動中..."
                        : isIntroOffer
                        ? "初月無料でクイック決済"
                        : "保存済み情報でクイック決済"}
                    </button>
                  ) : null}

                  {!salon.allow_point_subscription && !salon.allow_jpy_subscription ? (
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs text-[#bcd3ee]">
                      現在申し込み可能な決済方法が設定されていません。
                    </div>
                  ) : null}

                  <div className="space-y-1 text-[11px] leading-relaxed text-[#9fb4d0] text-center">
                    {isIntroOffer ? (
                      <p>初月は無料です。解約しない限り、翌月以降は通常料金が自動で請求されます。</p>
                    ) : null}
                    <p>デジタルコンテンツの性質上、決済完了後のポイントおよび提供済みコンテンツはキャンセルできません。</p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-pure-white transition hover:bg-white/15"
            >
              公開ページのリンクをコピー
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}
