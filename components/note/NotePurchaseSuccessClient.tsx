'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import StickySiteHeader from '@/components/layout/StickySiteHeader';
import { noteApi } from '@/lib/api';
import type { NotePurchaseStatusResponse } from '@/types';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NotePurchaseSuccessClientProps {
  basePath?: string;
}

const withBasePath = (basePath: string, pathname: string) => {
  if (!basePath || basePath === '/') {
    return pathname;
  }
  if (pathname === '/') {
    return basePath;
  }
  return `${basePath}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
};

export default function NotePurchaseSuccessClient({ basePath = '' }: NotePurchaseSuccessClientProps) {
  const params = useParams<{ slug?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('checkout');
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED' | 'UNKNOWN'>('PENDING');
  const [notificationSent, setNotificationSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const slug = useMemo(() => {
    const value = params?.slug;
    if (!value) return null;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const externalId = searchParams.get('external_id');

  useEffect(() => {
    setResolvedSlug((current) => current ?? slug ?? null);
  }, [slug]);

  useEffect(() => {
    if (!externalId) return;

    let active = true;
    let attempts = 0;
    const maxAttempts = 6;

    const fetchStatus = async () => {
      if (!active) return;
      setChecking(true);
      try {
        const response = await noteApi.purchaseStatus(externalId);
        if (!active) return;

        const payload = response.data as NotePurchaseStatusResponse;
        const nextStatus = (payload.status || 'PENDING').toUpperCase() as typeof status;
        setStatus(nextStatus);
        setNotificationSent(Boolean(payload.notification_sent));
        setStatusError(null);

        if (payload.note?.slug) {
          setResolvedSlug(payload.note.slug);
        }

        const done = nextStatus === 'COMPLETED' || nextStatus === 'CANCELLED' || nextStatus === 'REJECTED' || nextStatus === 'EXPIRED';
        attempts += 1;
        if (done || attempts >= maxAttempts) {
          setChecking(false);
          return true;
        }
      } catch (error) {
        if (!active) return false;
        setStatusError(t('statusError'));
      }
      return false;
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
  }, [externalId, t]);

  useEffect(() => {
    if (!resolvedSlug) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(withBasePath(basePath, `/notes/${resolvedSlug}`));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, resolvedSlug, basePath]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mb-4 flex justify-end">
              <LanguageSwitcher />
            </div>
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">{t('heading')}</h1>
            <p className="mb-8 text-sm text-slate-600">
              {t('description')}
            </p>
            <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
              <div className="mb-2 flex items-center justify-between">
                <span>{t('statusLabel')}</span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {t(`statuses.${status}` as const)}
                </span>
              </div>
              {externalId ? (
                <div className="truncate text-xs text-slate-500">
                  {t('transactionId', { id: externalId })}
                </div>
              ) : null}
              {checking ? (
                <p className="mt-2 text-xs text-blue-600">{t('checkingStatus')}</p>
              ) : null}
              {notificationSent ? (
                <p className="mt-2 text-xs text-emerald-600">{t('notificationSent')}</p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">{t('notificationPending')}</p>
              )}
              {statusError ? (
                <p className="mt-2 text-xs text-rose-500">{statusError}</p>
              ) : null}
            </div>
            <p className="mb-6 text-xs text-slate-500">
              {resolvedSlug ? t('autoRedirect', { seconds: countdown }) : t('manualRedirect')}
            </p>
            <div className="space-y-3">
              {resolvedSlug ? (
                <Link
                  href={withBasePath(basePath, `/notes/${resolvedSlug}`)}
                  className="block w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t('goToArticle')}
                </Link>
              ) : null}
              <Link
                href={withBasePath(basePath, '/dashboard')}
                className="block w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t('goToDashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
