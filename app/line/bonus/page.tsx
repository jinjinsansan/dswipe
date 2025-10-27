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

export default function LineBonusPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();
  const [linkStatus, setLinkStatus] = useState<LineLinkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
                    <a
                      href={lineAddUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
                    >
                      <span>LINE公式アカウントを追加</span>
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 使い方ガイド */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">ボーナスの受け取り方</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">LINE公式アカウントを追加</h4>
                    <p className="text-sm text-slate-600">
                      上記のボタンからD-swipe公式LINEアカウントを友達追加してください。
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">自動連携</h4>
                    <p className="text-sm text-slate-600">
                      友達追加すると、自動的にあなたのアカウントと連携されます。
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">ポイント自動付与</h4>
                    <p className="text-sm text-slate-600">
                      連携が完了すると、{bonusPoints}ポイントが自動的にあなたのアカウントに付与されます！
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900 mb-2 text-sm">注意事項</h4>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• ボーナスポイントは1アカウントにつき1回のみ付与されます</li>
                <li>• LINE連携を解除してもポイントは減算されません</li>
                <li>• ポイントの付与には数分かかる場合があります</li>
                <li>• 既に連携済みの場合は、追加でポイントは付与されません</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
