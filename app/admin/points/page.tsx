'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

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
  const { isAuthenticated, isInitialized } = useAuthStore();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized]);

  const fetchUsers = async (query?: string) => {
    try {
      const response = await adminApi.searchUsers({ query, limit: 50 });
      const usersData = Array.isArray(response.data?.data) ? response.data.data : [];
      setUsers(usersData);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
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
      await fetchUsers(searchQuery);
      setSelectedUser((prev) => (prev ? { ...prev, point_balance: prev.point_balance + grantAmount } : prev));
      setGrantAmount(1000);
      setGrantDescription('');
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || 'ポイント付与に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-lg" style={{ color: 'var(--muted)' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <DashboardShell title="ポイント管理" subtitle="ユーザーにポイントを手動で付与できます">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: search + list */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--ink)' }}>
              ユーザー検索
            </h2>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="input-icon flex-1">
                <MagnifyingGlassIcon />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ユーザー名またはメールで検索..."
                  className="input"
                />
              </div>
              <Button type="submit">検索</Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--ink)' }}>
              ユーザー一覧（{users.length}件）
            </h2>
            <div className="max-h-[600px] space-y-2 overflow-y-auto">
              {users.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  ユーザーが見つかりませんでした
                </p>
              ) : (
                users.map((u) => {
                  const active = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={cn('w-full rounded-xl border p-4 text-left transition-all')}
                      style={active ? { borderColor: 'var(--brand)', background: 'var(--surface-tint)' } : { borderColor: 'var(--line)', background: 'var(--surface)' }}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="truncate font-semibold" style={{ color: 'var(--ink)' }}>
                            {u.username}
                          </div>
                          <div className="truncate text-sm" style={{ color: 'var(--muted)' }}>
                            {u.email}
                          </div>
                        </div>
                        <Badge tone={u.user_type === 'seller' ? 'seller' : 'live'} small>
                          {u.user_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          ポイント残高
                        </span>
                        <span className="font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                          {u.point_balance.toLocaleString()} P
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right: grant */}
        <div className="space-y-6">
          {selectedUser ? (
            <>
              <div className="rounded-[20px] p-6 text-white" style={{ background: 'linear-gradient(160deg,#0b1f3a,#0f2c52)' }}>
                <div className="mb-2 text-sm opacity-90">選択中のユーザー</div>
                <div className="mb-1 text-2xl font-bold">{selectedUser.username}</div>
                <div className="mb-4 text-sm opacity-75">{selectedUser.email}</div>
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="opacity-90">現在の残高</span>
                  <span className="text-3xl font-bold tabular-nums">{selectedUser.point_balance.toLocaleString()} P</span>
                </div>
              </div>

              <Card>
                <h2 className="mb-6 text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  ポイント付与
                </h2>
                <div className="space-y-4">
                  <div className="field">
                    <label className="field-label">付与ポイント数</label>
                    <input type="number" value={grantAmount} onChange={(e) => setGrantAmount(parseInt(e.target.value) || 0)} className="input" />
                    <span className="field-hint">マイナス値を入力すると減少します</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <button key={amount} onClick={() => setGrantAmount(amount)} className="btn btn-secondary btn-sm">
                        +{amount}
                      </button>
                    ))}
                  </div>

                  <div className="field">
                    <label className="field-label">付与理由（オプション）</label>
                    <textarea value={grantDescription} onChange={(e) => setGrantDescription(e.target.value)} rows={3} className="textarea" placeholder="例: テストユーザー用ポイント付与" />
                  </div>

                  <div className="rounded-xl border p-4" style={{ background: 'var(--surface-tint)', borderColor: 'var(--tint-border)' }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span style={{ color: 'var(--text-2)' }}>現在の残高</span>
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--ink)' }}>
                        {selectedUser.point_balance.toLocaleString()} P
                      </span>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span style={{ color: 'var(--text-2)' }}>変更</span>
                      <span className="font-semibold tabular-nums" style={{ color: grantAmount >= 0 ? 'var(--success-ink)' : 'var(--danger-ink)' }}>
                        {grantAmount >= 0 ? '+' : ''}
                        {grantAmount.toLocaleString()} P
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--tint-border)' }}>
                      <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                        付与後の残高
                      </span>
                      <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                        {(selectedUser.point_balance + grantAmount).toLocaleString()} P
                      </span>
                    </div>
                  </div>

                  {selectedUser.point_balance + grantAmount < 0 && (
                    <div className="rounded-lg border px-3 py-2 text-sm" style={{ background: 'var(--danger-tint)', borderColor: '#fcc', color: 'var(--danger-ink)' }}>
                      ⚠️ 残高がマイナスになります
                    </div>
                  )}

                  <Button onClick={handleGrantPoints} size="lg" block disabled={isProcessing || grantAmount === 0 || selectedUser.point_balance + grantAmount < 0}>
                    {isProcessing ? '処理中...' : 'ポイントを付与する'}
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <UserCircleIcon className="h-12 w-12" style={{ color: 'var(--faint)' }} />
              <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                ユーザーを選択
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                左側のリストからユーザーを選択してください
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
