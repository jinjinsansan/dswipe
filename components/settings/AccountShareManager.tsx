'use client';

import { useEffect, useState } from 'react';

import { getErrorMessage } from '@/lib/errorHandler';
import { useAccountShareStore } from '@/store/accountShareStore';

const STATUS_LABEL: Record<'pending' | 'active' | 'revoked', string> = {
  pending: '承認待ち',
  active: '有効',
  revoked: '解除済み',
};

const STATUS_CLASS: Record<'pending' | 'active' | 'revoked', string> = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  revoked: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export default function AccountShareManager() {
  const {
    ownerShares,
    delegateShares,
    fetchOwnerShares,
    fetchDelegateShares,
    inviteDelegate,
    revokeShare,
    inviteStatus,
  } = useAccountShareStore();

  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerShares().catch((error) => {
      console.error('Failed to load owner shares:', error);
    });
    fetchDelegateShares().catch((error) => {
      console.error('Failed to load delegated shares:', error);
    });
  }, [fetchOwnerShares, fetchDelegateShares]);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setInviteUrl(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: '招待する相手のメールアドレスを入力してください。' });
      return;
    }

    try {
      const response = await inviteDelegate({ email: trimmed });
      setFeedback({ type: 'success', message: '招待メールを送信しました。必要に応じてリンクを共有してください。' });
      setInviteUrl(response.invite_url);
      setEmail('');
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setFeedback({ type: 'success', message: '招待リンクをクリップボードにコピーしました。' });
    } catch {
      setFeedback({ type: 'error', message: 'クリップボードにコピーできませんでした。' });
    }
  };

  const handleRevoke = async (shareId: string) => {
    const shouldRevoke = window.confirm('共有を解除すると、相手はあなたのアカウントにアクセスできなくなります。続行しますか？');
    if (!shouldRevoke) return;
    try {
      await revokeShare(shareId);
      setFeedback({ type: 'success', message: '共有を解除しました。' });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <header className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">共有招待を送る</h2>
            <p className="text-sm text-slate-500">
              招待されたユーザーは承認後、あなたのダッシュボードを閲覧・編集できます。リンクの有効期限は数日間です。
            </p>
          </header>

          {feedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-slate-700">
                招待するユーザーのメールアドレス
              </label>
              <input
                id="inviteEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder="example@example.com"
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={inviteStatus === 'loading'}
              >
                {inviteStatus === 'loading' ? '送信中…' : '招待メールを送信'}
              </button>

              {inviteUrl && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  招待リンクをコピー
                </button>
              )}
            </div>

            {inviteUrl && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-700">招待リンク</p>
                <p className="mt-1 break-all text-xs text-slate-500">{inviteUrl}</p>
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">共有中のユーザー</h2>
            <p className="text-sm text-slate-500">承認待ち・有効な共有の状況を確認できます。</p>
          </div>
        </header>

        {ownerShares.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            現在共有中のユーザーはいません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                    ユーザー
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                    状態
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                    招待日 / 承認日
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownerShares.map((share) => (
                  <tr key={share.share_id} className="bg-white">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{share.delegate_username || share.delegate_email || '不明なユーザー'}</span>
                        <span className="text-xs text-slate-500">{share.delegate_email ?? 'メール未取得'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[share.status]}`}>
                        {STATUS_LABEL[share.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="space-y-1">
                        <div>招待: {formatDateTime(share.invited_at)}</div>
                        <div>有効期限: {formatDateTime(share.expires_at)}</div>
                        {share.accepted_at && <div>承認: {formatDateTime(share.accepted_at)}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {share.status !== 'revoked' ? (
                        <button
                          type="button"
                          onClick={() => handleRevoke(share.share_id)}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          共有を解除
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">解除済み</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">共有を受けているアカウント</h2>
          <p className="text-sm text-slate-500">あなたがアクセス可能なアカウントの一覧です。</p>
        </header>

        {delegateShares.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            他のユーザーから共有されているアカウントはありません。
          </p>
        ) : (
          <div className="space-y-3">
            {delegateShares.map((share) => (
              <div key={share.share_id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{share.owner_username || share.owner_email || 'オーナー情報なし'}</p>
                    <p className="text-xs text-slate-500">{share.owner_email ?? 'メール未取得'}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[share.status]}`}>
                    {STATUS_LABEL[share.status]}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <div>招待: {formatDateTime(share.invited_at)}</div>
                  <div>有効期限: {formatDateTime(share.expires_at)}</div>
                  {share.accepted_at && <div>承認: {formatDateTime(share.accepted_at)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
