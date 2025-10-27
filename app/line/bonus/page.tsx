'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DSwipeLogo from '@/components/DSwipeLogo';
import { getDashboardNavLinks, isDashboardLinkActive } from '@/components/dashboard/navLinks';
import { GiftIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { PageLoader } from '@/components/LoadingSpinner';

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
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();
  const [linkStatus, setLinkStatus] = useState<LineLinkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<LineLinkToken | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinkStatus();
    }
  }, [isAuthenticated]);

  const fetchLinkStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('認証トークンが見つかりません。ログインし直してください。');
      }

      const response = await fetch(`${apiUrl}/line/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.detail || `LINE連携状態の取得に失敗しました (${response.status})`);
      }

      const data = await response.json();
      console.log('LINE Status:', data);
      setLinkStatus(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching LINE link status:', err);
      setError(err.message || 'エラーが発生しました');
      
      // エラーが発生してもデフォルトの設定を表示できるようにする
      setLinkStatus({
        is_connected: false,
        bonus_settings: {
          id: '',
          bonus_points: 300,
          is_enabled: true,
          description: 'LINE公式アカウントを追加して300ポイントGET！',
          line_add_url: 'https://lin.ee/JFvc4dE',
        },
        connection: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const generateLinkToken = async () => {
    setIsGeneratingToken(true);
    setError(null);
    setTokenCopied(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      const response = await fetch(`${apiUrl}/line/generate-link-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('トークンの生成に失敗しました');
      }

      const data = await response.json();
      setLinkToken(data);
    } catch (err: any) {
      console.error('Error generating link token:', err);
      setError(err.message || 'エラーが発生しました');
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
      console.error('Failed to copy:', err);
      alert('コピーに失敗しました');
    }
  };

  if (!isInitialized || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const bonusPoints = linkStatus?.bonus_settings?.bonus_points || 300;
  const isEnabled = linkStatus?.bonus_settings?.is_enabled ?? true;
  const lineAddUrl = linkStatus?.bonus_settings?.line_add_url || 'https://lin.ee/JFvc4dE';
  const description = linkStatus?.bonus_settings?.description || 'LINE公式アカウントを追加して300ポイントGET！';

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
      {/* サイドバー */}
      <aside className="hidden sm:flex w-52 flex-shrink-0 bg-white border-r border-slate-200 flex-col">
        <div className="px-6 h-16 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navLinks.map((link) => {
              const isActive = isDashboardLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between space-x-2 px-3 py-2 rounded transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  {link.badge && !isActive && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-slate-900 text-sm font-semibold truncate">
                {user?.username || 'ユーザー'}
              </div>
              <div className="text-slate-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* モバイルヘッダー */}
        <div className="sm:hidden border-b border-slate-200 bg-white w-full">
          <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-slate-900 text-sm font-semibold truncate">
                  {user?.username || 'ユーザー'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              ログアウト
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-slate-100 px-3 sm:px-6 py-6 w-full min-w-0">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            {/* ヘッダー */}
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">LINE連携ボーナス</h1>
              <p className="text-sm text-slate-600 mt-1">
                D-swipe公式LINEを追加して、{bonusPoints}ポイントをゲットしよう！
              </p>
            </div>

            {error && !error.includes('認証トークン') && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">ℹ️ 情報</p>
                <p>接続エラーが発生しましたが、LINE連携は利用できます。詳細: {error}</p>
              </div>
            )}
            
            {error && error.includes('認証トークン') && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <p className="font-semibold mb-1">❌ 認証エラー</p>
                <p>{error}</p>
              </div>
            )}

            {/* ボーナス情報カード */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                    <GiftIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {bonusPoints}ポイントプレゼント！
                  </h2>
                  <p className="text-slate-700 mb-4">
                    {description}
                  </p>
                  
                  {!isEnabled && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        現在、このキャンペーンは一時停止中です。
                      </p>
                    </div>
                  )}

                  {linkStatus?.is_connected ? (
                    <div className="bg-white rounded-xl p-4 border border-green-300">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="font-semibold">連携済み</span>
                      </div>
                      {linkStatus.connection?.bonus_awarded ? (
                        <p className="text-sm text-slate-600">
                          {bonusPoints}ポイントを獲得しました！<br />
                          獲得日時: {new Date(linkStatus.connection.bonus_awarded_at).toLocaleString('ja-JP')}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-600">
                          LINE連携が完了しています。ポイント付与処理中です...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!linkToken ? (
                        <button
                          onClick={generateLinkToken}
                          disabled={isGeneratingToken}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingToken ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              <span>生成中...</span>
                            </>
                          ) : (
                            <>
                              <span>連携コードを生成</span>
                              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="bg-white rounded-xl p-6 border-2 border-green-500 space-y-4">
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <CheckCircleIcon className="w-6 h-6" />
                            <span className="font-semibold text-lg">連携コード生成完了！</span>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-xs text-slate-500 mb-2">あなたの連携コード：</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-lg font-mono font-bold text-slate-900 break-all">
                                {linkToken.token}
                              </code>
                              <button
                                onClick={copyToken}
                                className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                {tokenCopied ? '✓ コピー済み' : 'コピー'}
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              有効期限: {new Date(linkToken.expires_at).toLocaleString('ja-JP')}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-700">次の手順で連携を完了してください：</p>
                            <ol className="space-y-2 text-sm text-slate-600">
                              <li className="flex gap-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <span>上の連携コードをコピー</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <span>
                                  <a
                                    href={lineAddUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 font-semibold hover:underline"
                                  >
                                    LINE公式アカウントを友達追加
                                  </a>
                                </span>
                              </li>
                              <li className="flex gap-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <span>LINEトークに連携コードを貼り付けて送信</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                <span className="font-semibold text-green-700">自動で{bonusPoints}ポイント付与！🎉</span>
                              </li>
                            </ol>
                          </div>

                          <a
                            href={lineAddUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
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

            {/* 注意事項 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900 mb-2 text-sm">注意事項</h4>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• ボーナスポイントは1アカウントにつき1回のみ付与されます</li>
                <li>• 連携コードの有効期限は24時間です（期限切れの場合は再生成してください）</li>
                <li>• LINEトークに連携コードを送信すると即座にポイントが付与されます</li>
                <li>• LINE連携を解除してもポイントは減算されません</li>
                <li>• 既に連携済みの場合は、追加でポイントは付与されません</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
