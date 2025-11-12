'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { creatorApi } from '@/lib/api';
import type { CreatorFollowStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { redirectToLogin } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'outline';

interface CreatorFollowButtonProps {
  creatorId: string;
  className?: string;
  compact?: boolean;
  showEmailToggle?: boolean;
}

export default function CreatorFollowButton({
  creatorId,
  className,
  compact = false,
  showEmailToggle = true,
}: CreatorFollowButtonProps) {
  const router = useRouter();
  const t = useTranslations('creatorFollow');
  const { isAuthenticated, isInitialized } = useAuthStore();

  const [status, setStatus] = useState<CreatorFollowStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await creatorApi.getFollowStatus(creatorId);
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch follow status:', err);
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [creatorId, t]);

  useEffect(() => {
    if (!creatorId) return;
    if (!isInitialized) return;
    fetchStatus();
  }, [creatorId, fetchStatus, isInitialized]);

  const followerCountLabel = useMemo(() => {
    const count = status?.follower_count ?? 0;
    return t('followersCount', { count });
  }, [status?.follower_count, t]);

  const buttonVariant: ButtonVariant = status?.following ? 'outline' : 'primary';

  const handleFollowToggle = useCallback(async () => {
    if (!creatorId) return;
    if (!isAuthenticated) {
      redirectToLogin(router);
      return;
    }

    setPending(true);
    setError(null);
    try {
      if (status?.following) {
        await creatorApi.unfollow(creatorId);
        setStatus((prev) => {
          if (!prev) return prev;
          const nextCount = Math.max(0, prev.follower_count - 1);
          return {
            ...prev,
            follower_id: null,
            following: false,
            notify_email: false,
            follower_count: nextCount,
          };
        });
        return;
      }

      const response = await creatorApi.follow(creatorId, {
        notify_email: true,
      });
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to update follow state:', err);
      setError(t('updateError'));
    } finally {
      setPending(false);
    }
  }, [creatorId, isAuthenticated, router, status?.following, t]);

  const handleToggleEmail = useCallback(async () => {
    if (!creatorId || !status?.following) return;
    if (!isAuthenticated) {
      redirectToLogin(router);
      return;
    }

    const nextValue = !status.notify_email;
    setPending(true);
    setError(null);
    try {
      const response = await creatorApi.updateFollow(creatorId, {
        notify_email: nextValue,
      });
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to update email preference:', err);
      setError(t('updateError'));
      setPending(false);
      return;
    }
    setPending(false);
  }, [creatorId, isAuthenticated, router, status?.following, status?.notify_email, t]);

  const buttonLabel = useMemo(() => {
    if (loading) {
      return t('loading');
    }
    return status?.following ? t('following') : t('follow');
  }, [loading, status?.following, t]);

  const buttonClasses = useMemo(
    () =>
      cn(
        'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariant === 'primary'
          ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
          : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700',
        compact && 'px-3 py-1 text-xs'
      ),
    [buttonVariant, compact]
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className={cn('flex items-center gap-3', compact && 'flex-wrap')}>
        <button
          type="button"
          className={buttonClasses}
          onClick={handleFollowToggle}
          disabled={loading || pending}
        >
          {buttonLabel}
        </button>
        <span className={cn('text-sm text-slate-500', compact && 'text-xs')}>
          {followerCountLabel}
        </span>
      </div>

      {showEmailToggle && status?.following ? (
        <label className={cn('inline-flex items-center gap-2 text-xs text-slate-600', compact && 'text-[11px]')}>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={status.notify_email}
            onChange={handleToggleEmail}
            disabled={pending}
          />
          <span>{t('emailNotifications')}</span>
        </label>
      ) : null}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
