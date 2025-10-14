'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { lpApi, pointsApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [lps, setLps] = useState([]);
  const [pointBalance, setPointBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [lpsResponse, pointsResponse] = await Promise.all([
        lpApi.list(),
        pointsApi.getBalance(),
      ]);

      // APIレスポンスが配列かどうかを確認
      const lpsData = Array.isArray(lpsResponse.data) ? lpsResponse.data : [];
      setLps(lpsData);
      setPointBalance(pointsResponse.data.point_balance);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                SwipeLaunch
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  ダッシュボード
                </Link>
                <Link href="/lp/create" className="text-gray-300 hover:text-white transition-colors">
                  LP作成
                </Link>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  商品管理
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm">ポイント: </span>
                <span className="text-white font-bold">{pointBalance.toLocaleString()}</span>
              </div>
              <div className="text-gray-300">{user?.username}</div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ダッシュボード</h1>
          <p className="text-gray-400">ようこそ、{user?.username}さん</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">作成したLP</div>
            <div className="text-3xl font-bold text-white">{lps.length}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">総閲覧数</div>
            <div className="text-3xl font-bold text-white">
              {lps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0)}
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">総クリック数</div>
            <div className="text-3xl font-bold text-white">
              {lps.reduce((sum: number, lp: any) => sum + (lp.total_cta_clicks || 0), 0)}
            </div>
          </div>
        </div>

        {/* LP List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">LP一覧</h2>
            <Link
              href="/lp/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
            >
              + 新規LP作成
            </Link>
          </div>

          {lps.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">まだLPが作成されていません</div>
              <Link
                href="/lp/create"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                最初のLPを作成
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lps.map((lp: any) => (
                <div
                  key={lp.id}
                  className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{lp.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            lp.status === 'published'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {lp.status === 'published' ? '公開中' : '下書き'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-x-4">
                        <span>閲覧数: {lp.total_views || 0}</span>
                        <span>クリック数: {lp.total_cta_clicks || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/lp/${lp.id}/edit`}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        編集
                      </Link>
                      <Link
                        href={`/lp/${lp.id}/analytics`}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        分析
                      </Link>
                    </div>
                  </div>
                  
                  {/* 公開URL */}
                  {lp.status === 'published' && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/view/${lp.slug}`}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/view/${lp.slug}`);
                            alert('URLをコピーしました！');
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          コピー
                        </button>
                        <a
                          href={`/view/${lp.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          表示
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
