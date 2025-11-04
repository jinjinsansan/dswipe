'use client';

import { Suspense, useEffect, useMemo, useState, type JSX } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import StickySiteHeader from '@/components/layout/StickySiteHeader';
import { productApi } from '@/lib/api';
import type { ProductOrderStatusResponse } from '@/types';
import { PageLoader } from '@/components/LoadingSpinner';

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED' | 'UNKNOWN';

const FINAL_STATUSES: Set<OrderStatus> = new Set(['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED']);

const normalizeStatus = (value?: string | null): OrderStatus => {
  const normalized = (value ?? 'PENDING').toUpperCase();
  if (normalized === 'PENDING') return 'PENDING';
  if (normalized === 'COMPLETED') return 'COMPLETED';
  if (normalized === 'CANCELLED') return 'CANCELLED';
  if (normalized === 'REJECTED') return 'REJECTED';
  if (normalized === 'EXPIRED') return 'EXPIRED';
  return 'UNKNOWN';
};

function ProductOrderCompleteContent(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const externalId = useMemo(() => searchParams.get('external_id'), [searchParams]);

  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [productTitle, setProductTitle] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [thanksSlug, setThanksSlug] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!externalId) return;

    let active = true;
    let attempts = 0;
    const maxAttempts = 6;

    const fetchStatus = async (): Promise<boolean> => {
      if (!active) return true;
      setChecking(true);
      try {
        const response = await productApi.orderStatus(externalId);
        if (!active) return true;

        const payload = response.data as ProductOrderStatusResponse;
        const nextStatus = normalizeStatus(payload.status);
        setStatus(nextStatus);
        setProductTitle(payload.product?.title ?? null);
        setNotificationSent(Boolean(payload.notification_sent));
        setRedirectUrl(payload.redirect_url ?? null);
        setThanksSlug(payload.thanks_lp_slug ?? null);
        setStatusError(null);

        attempts += 1;
        const finished = FINAL_STATUSES.has(nextStatus) || attempts >= maxAttempts;
        if (finished) {
          setChecking(false);
        }
        return finished;
      } catch (error) {
        if (!active) return true;
        setStatusError('決済状態の確認に失敗しました。数秒後に再試行します。');
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
      setChecking(false);
    };
  }, [externalId]);

  useEffect(() => {
    if (status !== 'COMPLETED' || hasRedirected) return;

    const target = redirectUrl || (thanksSlug ? `/view/${thanksSlug}` : '/dashboard');
    if (!target) return;

    const isExternal = Boolean(redirectUrl && /^https?:\/\//i.test(redirectUrl));
    setHasRedirected(true);
    setCountdown(5);

    let remaining = 5;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (isExternal) {
          window.location.href = target;
        } else {
          router.push(target);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [status, redirectUrl, thanksSlug, router, hasRedirected]);

  const productLabel = productTitle ?? 'LP商品';
  const targetLabel = redirectUrl
    ? '運営が案内するサンクスページ'
    : thanksSlug
      ? 'サンクスLP'
      : 'ダッシュボード';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            {status === 'COMPLETED' ? (
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
            ) : (
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                  <ExclamationTriangleIcon className="h-12 w-12 text-amber-600" />
                </div>
              </div>
            )}
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              {status === 'COMPLETED' ? '決済が完了しました！' : '決済状況を確認しています'}
            </h1>
            <p className="mb-8 text-sm text-slate-600">
              {externalId
                ? `${productLabel} のお手続きが完了するまで、このページを閉じずにお待ちください。`
                : '決済情報が確認できませんでした。お手数ですがサポートまでご連絡ください。'}
            </p>

            <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
              <div className="mb-2 flex items-center justify-between">
                <span>決済ステータス</span>
                <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {status === 'COMPLETED'
                    ? '完了'
                    : status === 'PENDING'
                      ? '確認中'
                      : status === 'CANCELLED'
                        ? 'キャンセル'
                        : status === 'REJECTED'
                          ? '拒否'
                          : status === 'EXPIRED'
                            ? '期限切れ'
                            : '未確認'}
                </span>
              </div>
              {externalId ? (
                <div className="truncate text-xs text-slate-500">トランザクションID: {externalId}</div>
              ) : null}
              {checking ? (
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

            <p className="mb-6 text-xs text-slate-500">
              {status === 'COMPLETED'
                ? `${targetLabel} へ ${countdown}秒後に自動で移動します。`
                : '決済が完了すると自動的にサンクスページへ移動します。'}
            </p>

            <div className="space-y-3">
              {status === 'COMPLETED' ? (
                <>
                  {redirectUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = redirectUrl;
                      }}
                      className="block w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      サンクスページを開く
                    </button>
                  ) : null}
                  {thanksSlug ? (
                    <Link
                      href={`/view/${thanksSlug}`}
                      className="block w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      サンクスLPに移動する
                    </Link>
                  ) : null}
                </>
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

export default function ProductOrderCompletePage(): JSX.Element {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductOrderCompleteContent />
    </Suspense>
  );
}
