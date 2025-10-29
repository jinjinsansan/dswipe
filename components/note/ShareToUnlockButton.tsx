'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  ShareIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ShareToUnlockButtonProps {
  noteId: string;
  pricePoints: number;
  allowShareUnlock: boolean;
  officialTweetId?: string | null;
  officialTweetUrl?: string | null;
  officialXUsername?: string | null;
  onShareSuccess?: () => void;
}

interface ShareStatus {
  has_shared: boolean;
  tweet_url?: string;
  retweet_url?: string;
  shared_at?: string;
  verified: boolean;
}

export default function ShareToUnlockButton({
  noteId,
  pricePoints,
  allowShareUnlock,
  officialTweetId,
  officialTweetUrl,
  officialXUsername,
  onShareSuccess,
}: ShareToUnlockButtonProps) {
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const officialUrl = useMemo(() => {
    if (officialTweetUrl) return officialTweetUrl;
    if (officialTweetId) {
      if (officialXUsername) {
        return `https://x.com/${officialXUsername}/status/${officialTweetId}`;
      }
      return `https://x.com/i/web/status/${officialTweetId}`;
    }
    return undefined;
  }, [officialTweetUrl, officialTweetId, officialXUsername]);
  const canRetweet = Boolean(officialUrl);

  const checkShareStatus = useCallback(async () => {
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/notes/${noteId}/share-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShareStatus({
          has_shared: Boolean(data.has_shared),
          tweet_url: data.retweet_url ?? data.tweet_url,
          retweet_url: data.retweet_url,
          shared_at: data.shared_at,
          verified: Boolean(data.verified),
        });
      }
    } catch (err) {
      console.error('Failed to check share status:', err);
    } finally {
      setChecking(false);
    }
  }, [noteId, token]);

  useEffect(() => {
    if (isAuthenticated && allowShareUnlock) {
      checkShareStatus();
    } else {
      setChecking(false);
    }
  }, [noteId, isAuthenticated, allowShareUnlock, checkShareStatus]);

  const handleShare = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/notes/${noteId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // シェア成功
        setShareStatus({
          has_shared: true,
          tweet_url: data.tweet_url,
          retweet_url: data.tweet_url,
          shared_at: new Date().toISOString(),
          verified: true,
        });

        // 成功コールバック
        if (onShareSuccess) {
          onShareSuccess();
        }

        // ページをリロードして記事を表示
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // エラー処理
        const errorMessage = data.detail || 'リツイートに失敗しました';
        
        if (errorMessage.includes('X連携が必要')) {
          setError('X連携が必要です。設定画面で連携してください。');
        } else if (errorMessage.includes('シェア済み') || errorMessage.includes('リツイート済み')) {
          setError('既にこのNOTEをリツイート済みです。');
        } else if (errorMessage.includes('公式リツイート対象')) {
          setError('販売者が公式ポストを設定していないため、現在リツイート解放は利用できません。');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Share failed:', err);
      setError('リツイート処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // シェア解放が許可されていない場合は表示しない
  if (!allowShareUnlock) {
    return null;
  }

  // チェック中
  if (checking) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-4 text-sm text-slate-500">
        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
        確認中...
      </div>
    );
  }

  // 既にシェア済み
  if (shareStatus?.has_shared) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-semibold">リツイート済み - 記事が解放されました！</span>
        </div>
        {shareStatus.tweet_url && (
          <a
            href={shareStatus.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-emerald-600 underline hover:text-emerald-700"
          >
            リツイートを表示 →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <ShareIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">Xでリツイートして無料で読む</h4>
            <p className="mt-1 text-sm text-blue-700">
              @{officialXUsername ?? '公式アカウント'} の公式ポストをリツイートすると、{pricePoints.toLocaleString()}P の支払いなしで全文を読むことができます。
            </p>
            
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
              <SparklesIcon className="h-4 w-4" />
              <span>ボタンを押すと連携済みのXアカウントで自動的にリツイートします</span>
            </div>
            {officialUrl && (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-blue-600 underline hover:text-blue-700"
              >
                公式ポストを確認する →
              </a>
            )}
            {!canRetweet && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                販売者が公式ポストを設定するまでリツイート解放は利用できません。
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={loading || !canRetweet}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              リツイート処理中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShareIcon className="h-4 w-4" />
              Xでリツイートして無料で読む
            </span>
          )}
        </button>

        {!isAuthenticated && (
          <p className="mt-2 text-center text-xs text-blue-600">
            ※ リツイートにはログインとX連携が必要です
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2 text-sm text-red-700">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">エラー</p>
              <p className="mt-1">{error}</p>
              {error.includes('X連携') && (
                <button
                  onClick={() => router.push('/settings')}
                  className="mt-2 text-sm font-semibold text-red-600 underline hover:text-red-700"
                >
                  設定画面でX連携する →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
