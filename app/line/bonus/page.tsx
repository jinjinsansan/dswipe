"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { GiftIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { HEAD_BG } from "@/lib/momentum";
import { toast } from "@/components/ui/Feedback";

interface LineBonusSettings {
  id: string;
  bonus_points: number;
  is_enabled: boolean;
  description: string;
  line_add_url: string;
}

interface LineConnection {
  id: string;
  line_user_id: string;
  display_name: string;
  connected_at: string;
  bonus_awarded: boolean;
  bonus_points: number;
  bonus_awarded_at: string;
}

interface LineLinkStatus {
  is_connected: boolean;
  bonus_settings: LineBonusSettings | null;
  connection: LineConnection | null;
}

interface LineLinkToken {
  token: string;
  line_add_url: string;
  expires_at: string;
}

export default function LineBonusPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [linkStatus, setLinkStatus] = useState<LineLinkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<LineLinkToken | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isActive = true;

    const fetchLinkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://swipelaunch-backend.onrender.com/api";
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("認証トークンが見つかりません。ログインし直してください。");
        }

        const response = await fetch(`${apiUrl}/line/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
          const detail = typeof errorData?.detail === "string" ? errorData.detail : undefined;
          throw new Error(detail || `LINE連携状態の取得に失敗しました (${response.status})`);
        }

        const data = await response.json();
        if (!isActive) return;
        setLinkStatus(data);
        setError(null);
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || "エラーが発生しました");
        setLinkStatus({
          is_connected: false,
          bonus_settings: {
            id: "",
            bonus_points: 300,
            is_enabled: true,
            description: "LINE公式アカウントを追加して300ポイントGET！",
            line_add_url: "https://lin.ee/JFvc4dE",
          },
          connection: null,
        });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchLinkStatus();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  const generateLinkToken = async () => {
    setIsGeneratingToken(true);
    setError(null);
    setTokenCopied(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://swipelaunch-backend.onrender.com/api";
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await fetch(`${apiUrl}/line/generate-link-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("トークンの生成に失敗しました");
      }

      const data = await response.json();
      setLinkToken(data);
    } catch (err: any) {
      setError(err?.message || "エラーが発生しました");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyToken = async () => {
    if (!linkToken) return;

    try {
      await navigator.clipboard.writeText(linkToken.token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("コピーに失敗しました");
    }
  };

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const bonusPoints = linkStatus?.bonus_settings?.bonus_points || 300;
  const isEnabled = linkStatus?.bonus_settings?.is_enabled ?? true;
  const lineAddUrl = linkStatus?.bonus_settings?.line_add_url || "https://lin.ee/JFvc4dE";
  const description =
    linkStatus?.bonus_settings?.description || "LINE公式アカウントを追加して300ポイントGET！";

  return (
    <DashboardLayout
      pageTitle="LINE連携ボーナス"
      pageSubtitle={`D-swipe公式LINEを追加して${bonusPoints}ポイントをゲットしよう！`}
    >
      {isLoading ? (
        <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
            読み込み中です...
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-4xl space-y-6 px-3 py-6 sm:px-6">
          {/* Navy hero — mock: D-Swipe LINE Bonus.html */}
          <div
            className="rounded-3xl px-6 py-6 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)] sm:px-8"
            style={{ background: HEAD_BG }}
          >
            <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Campaign</p>
            <h1 className="mt-1 text-[22px] font-extrabold tracking-tight text-pure-white">LINE連携ボーナス</h1>
            <p className="mt-1 text-sm text-on-navy">D-swipe公式LINEを追加して{bonusPoints}ポイントをゲットしよう！</p>
          </div>

          {error && !error.includes("認証トークン") ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
              <p className="mb-1 font-semibold">情報</p>
              <p>接続エラーが発生しましたが、LINE連携は利用できます。詳細: {error}</p>
            </div>
          ) : null}

          {error && error.includes("認証トークン") ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <p className="mb-1 font-semibold">認証エラー</p>
              <p>{error}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
                  <GiftIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{bonusPoints}ポイントプレゼント！</h2>
                  <p className="mt-2 text-slate-700">{description}</p>
                </div>

                {!isEnabled ? (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    現在、このキャンペーンは一時停止中です。
                  </div>
                ) : null}

                {linkStatus?.is_connected ? (
                  <div className="rounded-xl border border-green-300 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-green-700">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="font-semibold">連携済み</span>
                    </div>
                    {linkStatus.connection?.bonus_awarded ? (
                      <p className="text-sm text-slate-600">
                        {bonusPoints}ポイントを獲得しました！
                        <br />
                        獲得日時: {new Date(linkStatus.connection.bonus_awarded_at).toLocaleString("ja-JP")}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-600">LINE連携が完了しています。ポイント付与処理中です...</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!linkToken ? (
                      <button
                        onClick={generateLinkToken}
                        disabled={isGeneratingToken}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isGeneratingToken ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>生成中...</span>
                          </>
                        ) : (
                          <>
                            <span>連携コードを生成</span>
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-4 rounded-xl border-2 border-green-500 bg-white p-6">
                        <div className="mb-2 flex items-center gap-2 text-green-700">
                          <CheckCircleIcon className="h-6 w-6" />
                          <span className="text-lg font-semibold">連携コード生成完了！</span>
                        </div>

                        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">あなたの連携コード：</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 break-all font-mono text-lg font-bold text-slate-900">{linkToken.token}</code>
                            <button
                              onClick={copyToken}
                              className="flex-shrink-0 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                            >
                              {tokenCopied ? "✓ コピー済み" : "コピー"}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">
                            有効期限: {new Date(linkToken.expires_at).toLocaleString("ja-JP")}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-700">次の手順で連携を完了してください：</p>
                          <ol className="space-y-2 text-sm text-slate-600">
                            <li className="flex gap-2">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">1</span>
                              <span>上の連携コードをコピー</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">2</span>
                              <span>
                                <a
                                  href={lineAddUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-green-600 hover:underline"
                                >
                                  LINE公式アカウントを友達追加
                                </a>
                              </span>
                            </li>
                            <li className="flex gap-2">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">3</span>
                              <span>LINEトークに連携コードを貼り付けて送信</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">4</span>
                              <span className="font-semibold text-green-700">自動で{bonusPoints}ポイント付与！🎉</span>
                            </li>
                          </ol>
                        </div>

                        <a
                          href={lineAddUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl bg-green-500 px-6 py-3 text-center font-semibold text-white shadow-lg transition-colors hover:bg-green-600"
                        >
                          LINE公式アカウントを追加する
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-900">注意事項</h4>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• ボーナスポイントは1アカウントにつき1回のみ付与されます</li>
              <li>• 連携コードの有効期限は24時間です（期限切れの場合は再生成してください）</li>
              <li>• LINEトークに連携コードを送信すると即座にポイントが付与されます</li>
              <li>• LINE連携を解除してもポイントは減算されません</li>
              <li>• 既に連携済みの場合は、追加でポイントは付与されません</li>
            </ul>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
