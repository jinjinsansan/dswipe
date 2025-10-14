'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  user_type: string;
  point_balance: number;
  created_at: string;
}

export default function AdminPointsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [grantAmount, setGrantAmount] = useState<number>(1000);
  const [grantDescription, setGrantDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, isInitialized]);

  const fetchUsers = async (query?: string) => {
    try {
      const response = await adminApi.searchUsers({ 
        query,
        limit: 50 
      });
      
      const usersData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      
      setUsers(usersData);
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('管理者権限が必要です');
        router.push('/dashboard');
      } else {
        console.error('Failed to fetch users:', error);
        alert('ユーザーの取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handleGrantPoints = async () => {
    if (!selectedUser) return;

    if (grantAmount === 0) {
      alert('付与ポイント数を入力してください');
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.grantPoints({
        user_id: selectedUser.id,
        amount: grantAmount,
        description: grantDescription || `管理者による${grantAmount > 0 ? '付与' : '減少'}`,
      });

      alert(`${selectedUser.username} に ${grantAmount} ポイントを${grantAmount > 0 ? '付与' : '減少'}しました`);
      
      // ユーザーリストを再取得
      await fetchUsers(searchQuery);
      
      // 選択ユーザーを更新
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser({
          ...updatedUser,
          point_balance: updatedUser.point_balance + grantAmount,
        });
      }

      // フォームをリセット
      setGrantAmount(1000);
      setGrantDescription('');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'ポイント付与に失敗しました');
    } finally {
      setIsProcessing(false);
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
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              SwipeLaunch <span className="text-red-500 text-sm">ADMIN</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                ダッシュボード
              </Link>
              <Link href="/admin/points" className="text-white font-semibold">
                ポイント管理
              </Link>
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                <span className="text-gray-300">
                  {user?.username || 'ユーザー'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ポイント管理（管理者専用）</h1>
          <p className="text-gray-400">ユーザーにポイントを手動で付与できます</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - User Search */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">ユーザー検索</h2>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ユーザー名またはメールアドレスで検索..."
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  検索
                </button>
              </form>
            </div>

            {/* User List */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                ユーザー一覧（{users.length}件）
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    ユーザーが見つかりませんでした
                  </p>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedUser?.id === u.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-white font-semibold">{u.username}</div>
                          <div className="text-gray-400 text-sm">{u.email}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.user_type === 'seller'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {u.user_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">ポイント残高</span>
                        <span className="text-white font-bold">
                          {u.point_balance.toLocaleString()} P
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Grant Points */}
          <div className="space-y-6">
            {selectedUser ? (
              <>
                {/* Selected User Info */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                  <div className="text-sm opacity-90 mb-2">選択中のユーザー</div>
                  <div className="text-2xl font-bold mb-1">{selectedUser.username}</div>
                  <div className="text-sm opacity-75 mb-4">{selectedUser.email}</div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="opacity-90">現在の残高</span>
                    <span className="text-3xl font-bold">
                      {selectedUser.point_balance.toLocaleString()} P
                    </span>
                  </div>
                </div>

                {/* Grant Form */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-6">ポイント付与</h2>
                  
                  <div className="space-y-4">
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        付与ポイント数
                      </label>
                      <input
                        type="number"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        マイナス値を入力すると減少します
                      </p>
                    </div>

                    {/* Quick Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 500, 1000, 5000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setGrantAmount(amount)}
                          className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          +{amount}
                        </button>
                      ))}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        付与理由（オプション）
                      </label>
                      <textarea
                        value={grantDescription}
                        onChange={(e) => setGrantDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="例: テストユーザー用ポイント付与"
                      />
                    </div>

                    {/* Preview */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">現在の残高</span>
                        <span className="text-white font-semibold">
                          {selectedUser.point_balance.toLocaleString()} P
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">変更</span>
                        <span className={`font-semibold ${
                          grantAmount >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {grantAmount >= 0 ? '+' : ''}{grantAmount.toLocaleString()} P
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-blue-500/30">
                        <span className="text-white font-semibold">付与後の残高</span>
                        <span className="text-white font-bold text-xl">
                          {(selectedUser.point_balance + grantAmount).toLocaleString()} P
                        </span>
                      </div>
                    </div>

                    {/* Warning */}
                    {(selectedUser.point_balance + grantAmount) < 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">
                          ⚠️ 残高がマイナスになります
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleGrantPoints}
                      disabled={isProcessing || grantAmount === 0 || (selectedUser.point_balance + grantAmount) < 0}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? '処理中...' : 'ポイントを付与する'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-white mb-2">ユーザーを選択</h2>
                <p className="text-gray-400">
                  左側のリストからユーザーを選択してください
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
