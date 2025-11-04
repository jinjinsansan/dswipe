'use client';

import { Suspense, useEffect, useMemo, useState, type JSX } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import StickySiteHeader from '@/components/layout/StickySiteHeader';
import { subscriptionApi } from '@/lib/api';
import type { SubscriptionSessionStatusResponse } from '@/types';
import { PageLoader } from '@/components/LoadingSpinner';

const statusLabel = (value?: string | null): string => {
  const normalized = (value ?? '').toUpperCase();
  if (normalized === 'RECURRENT_PAYMENT.ACTIVE' || normalized === 'ACTIVE') return 'アクティブ';
  if (normalized === 'RECURRENT_PAYMENT.COMPLETE' || normalized === 'COMPLETED') return '完了';
  if (
    normalized === 'RECURRENT_PAYMENT.CANCELED' ||
    normalized === 'RECURRENT_PAYMENT.CANCELLED' ||
    normalized === 'CANCELED' ||
    normalized === 'CANCELLED'
  ) {
    return 'キャンセル';
  }
  if (normalized === 'RECURRENT_PAYMENT.UNPAID' || normalized === 'UNPAID') return '未払い';
  if (normalized === 'RECURRENT_PAYMENT.PAUSED' || normalized === 'PAUSED') return '一時停止';
  if (normalized === 'RECURRENT_PAYMENT.REJECTED' || normalized === 'REJECTED') return '拒否';
  if (normalized === 'PENDING') return '確認中';
  if (!normalized) return '未確認';
  return normalized;
};

function SubscriptionResultContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = useMemo(() => (searchParams.get('status') ?? 'success').toLowerCase(), [searchParams]);
  const externalId = useMemo(() => searchParams.get('external_id'), [searchParams]);
  const planParam = useMemo(() => searchParams.get('plan'), [searchParams]);
  const sellerUsername = useMemo(() => searchParams.get('seller'), [searchParams]);

  const [sessionStatus, setSessionStatus] = useState<string>('PENDING');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('PENDING');
  const [notificationSent, setNotificationSent] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [planLabel, setPlanLabel] = useState<string | null>(planParam);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [salonTitle, setSalonTitle] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [polling, setPolling] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    if (!externalId) return;
    if (statusParam === 'error') return;

    let active = true;
    let attempts = 0;
    const maxAttempts = 6;

    const fetchStatus = async (): Promise<boolean> => {
      if (!active) return true;
      setPolling(true);
      try {
        const response = await subscriptionApi.sessionStatus(externalId);
        if (!active) return true;

        const payload = response.data as SubscriptionSessionStatusResponse;
        setSessionStatus(payload.session_status);
        setSubscriptionStatus(payload.subscription_status);
        setNotificationSent(Boolean(payload.notification_sent));
        setIsCompleted(Boolean(payload.is_completed));
        setMembershipStatus(payload.membership_status ?? null);
        setStatusError(null);

        if (payload.plan?.label) {
          setPlanLabel(payload.plan.label);
        }
        if (payload.salon?.id) {
          setSalonId(payload.salon.id);
          setSalonTitle(payload.salon.title ?? null);
        }

        attempts += 1;
        const finished = payload.is_completed || attempts >= maxAttempts;
        if (finished) {
          setPolling(false);
        }
        return finished;
      } catch (error) {
        if (!active) return true;
        setStatusError('ステータス確認に失敗しました。数秒後に再試行します。');
        return false;
      }
    };

    let timer: ReturnType<typeof setInterval> | null = null;

    const startPolling = async () => {
      const finished = await fetchStatus();
      if (finished) {
        return;
      }
      timer = setInterval(async () => {
        const done = await fetchStatus();
        if (done && timer) {
          clearInterval(timer);
          timer = null;
        }
      }, 5000);
    };

    startPolling();

    return () => {
      active = false;
      if (timer) {
        clearInterval(timer);
      }
      setPolling(false);
    };
  }, [externalId, statusParam]);

  useEffect(() => {
    if (!isCompleted || hasRedirected) return;

    const target = salonId ? `/salons/${salonId}/feed` : '/dashboard';
    setHasRedirected(true);
    setCountdown(6);

    let remaining = 6;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        router.push(target);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isCompleted, salonId, router, hasRedirected]);

  const heading = statusParam === 'error'
    ? '決済が完了しませんでした'
    : isCompleted
      ? 'サロンへの参加が確定しました！'
      : '決済状態を確認しています';

  const description = statusParam === 'error'
    ? '決済がキャンセルされたか、途中でエラーが発生した可能性があります。もう一度お試しいただくか、販売者・運営までお問い合わせください。'
    : 'サブスク決済の処理が完了するまで、このページを閉じずにお待ちください。';

  const membershipLabel = membershipStatus ? statusLabel(membershipStatus) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            {statusParam === 'error' ? (
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
                  <ExclamationTriangleIcon className="h-12 w-12 text-rose-600" />
                </div>
              </div>
            ) : (
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
            )}

            <h1 className="mb-2 text-2xl font-bold text-slate-900">{heading}</h1>
            <p className="mb-6 text-sm text-slate-600">{description}</p>

            {statusParam !== 'error' ? (
              <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                <div className="mb-2 flex items-center justify-between">
                  <span>セッション状態</span>
                  <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {statusLabel(sessionStatus)}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span>サブスク状態</span>
                  <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {statusLabel(subscriptionStatus)}
                  </span>
                </div>
                {membershipLabel ? (
                  <div className="mb-2 flex items-center justify-between">
                    <span>メンバーシップ</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {membershipLabel}
                    </span>
                  </div>
                ) : null}
                {externalId ? (
                  <div className="truncate text-xs text-slate-500">セッションID: {externalId}</div>
                ) : null}
                {planLabel ? (
                  <p className="mt-2 text-xs text-slate-500">プラン: {planLabel}</p>
                ) : null}
                {sellerUsername ? (
                  <p className="mt-1 text-xs text-slate-500">販売者: {sellerUsername}</p>
                ) : null}
                {polling ? (
                  <p className="mt-2 text-xs text-blue-600">決済状況を確認しています…</p>
                ) : null}
                {notificationSent ? (
                  <p className="mt-2 text-xs text-emerald-600">運営からのお知らせにメッセージを送信しました。</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">運営からのお知らせへの反映には数秒かかる場合があります。</p>
                )}
                {statusError ? (
                  <p className="mt-2 text-xs text-rose-500">{statusError}</p>
                ) : null}
              </div>
            ) : null}

            <p className="mb-6 text-xs text-slate-500">
              {isCompleted
                ? salonId
                  ? `${salonTitle ?? 'サロン'} のメンバー専用ページへ ${countdown}秒後に自動で移動します。`
                  : `${countdown}秒後にダッシュボードへ戻ります。`
                : statusParam === 'error'
                  ? 'ブラウザを閉じる前に販売者または運営へお問い合わせください。'
                  : '決済が完了すると自動的にサロンページへ移動します。'}
            </p>

            <div className="space-y-3">
              {salonId ? (
                <Link
                  href={`/salons/${salonId}/feed`}
                  className="block w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  サロンフィードへ移動する
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="block w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ダッシュボードに戻る
              </Link>
              <Link
                href="/operator/messages"
                className="block w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                運営からのお知らせを確認する
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionResultPage(): JSX.Element {
  return (
    <Suspense fallback={<PageLoader />}>
      <SubscriptionResultContent />
    </Suspense>
  );
}
