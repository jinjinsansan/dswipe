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
import { redirectToLogin } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

interface ShareToUnlockButtonProps {
  noteId: string;
  pricePoints: number;
  allowShareUnlock: boolean;
  officialTweetId?: string | null;
  officialTweetUrl?: string | null;
  officialXUsername?: string | null;
  onShareSuccess?: () => void;
  basePath?: string;
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
  basePath = '',
}: ShareToUnlockButtonProps) {
  const withBasePath = useCallback((pathname: string) => {
    if (!basePath || basePath === '/') {
      return pathname;
    }
    if (pathname === '/') {
      return basePath;
    }
    return `${basePath}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  }, [basePath]);
  const { token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('shareUnlock');
  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<'requires-link' | null>(null);
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
      redirectToLogin(router);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);

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
        setShareStatus({
          has_shared: true,
          tweet_url: data.tweet_url,
          retweet_url: data.tweet_url,
          shared_at: new Date().toISOString(),
          verified: true,
        });

        if (onShareSuccess) {
          onShareSuccess();
        }

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const detail = typeof data?.detail === 'string' ? data.detail : '';

        if (detail.includes('X連携')) {
          setError(t('requiresXLink'));
          setErrorCode('requires-link');
        } else if (detail.includes('シェア済み') || detail.includes('リツイート済み')) {
          setError(t('alreadySharedError'));
          setErrorCode(null);
        } else if (detail.includes('公式')) {
          setError(t('unavailableError'));
          setErrorCode(null);
        } else {
          setError(detail || t('genericError'));
          setErrorCode(null);
        }
      }
    } catch (err) {
      console.error('Share failed:', err);
      setError(t('genericError'));
      setErrorCode(null);
    } finally {
      setLoading(false);
    }
  };

  if (!allowShareUnlock) {
    return null;
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-4 text-sm text-slate-500">
        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
        {t('checking')}
      </div>
    );
  }

  if (shareStatus?.has_shared) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-semibold">{t('alreadySharedTitle')}</span>
        </div>
        {shareStatus.tweet_url && (
          <a
            href={shareStatus.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-emerald-600 underline hover:text-emerald-700"
          >
            {t('viewRetweet')}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-12 sm:w-12">
            <ShareIcon className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 space-y-3 text-blue-800">
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-blue-900 sm:text-lg">{t('shareHeading')}</h4>
              <p className="text-sm leading-relaxed sm:text-base">
                {t('shareDescription', {
                  username: officialXUsername ?? t('defaultUsername'),
                  pricePoints,
                })}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-blue-600 sm:flex-row sm:items-center sm:text-sm">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                <span>{t('shareHintPrimary')}</span>
              </div>
              {!isAuthenticated && (
                <span className="font-semibold">{t('shareHintSecondary')}</span>
              )}
            </div>
            {officialUrl ? (
              <div className="max-w-full overflow-hidden rounded-lg border border-blue-100 bg-white/70 text-xs sm:text-sm">
                <a
                  href={officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate px-3 py-2 font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                  {t('viewOfficialPost', { url: officialUrl })}
                </a>
              </div>
            ) : null}
            {!canRetweet && (
              <p className="rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-xs font-semibold text-red-500">
                {t('officialMissing')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:mt-6">
          <button
            onClick={handleShare}
            disabled={loading || !canRetweet}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                {t('shareProcessing')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShareIcon className="h-4 w-4" />
                {t('shareButton')}
              </span>
            )}
          </button>
          {!isAuthenticated && (
            <p className="text-center text-xs text-blue-600 sm:text-sm">
              {t('connectHint')}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2 text-sm text-red-700">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{t('errorTitle')}</p>
              <p className="mt-1">{error}</p>
              {errorCode === 'requires-link' && (
                <button
                  onClick={() => router.push(withBasePath('/settings'))}
                  className="mt-2 text-sm font-semibold text-red-600 underline hover:text-red-700"
                >
                  {t('navigateToSettings')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
