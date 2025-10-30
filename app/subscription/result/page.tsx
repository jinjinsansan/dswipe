'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import StickySiteHeader from '@/components/layout/StickySiteHeader';
import { subscriptionApi } from '@/lib/api';
import type { SubscriptionPlan, SubscriptionPlanListResponse } from '@/types/api';
import { PageLoader } from '@/components/LoadingSpinner';

const USD_TO_JPY = 145;

function SubscriptionResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? 'success';
  const planKey = searchParams.get('plan') ?? '';
  const seller = searchParams.get('seller');

  const [countdown, setCountdown] = useState(6);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const isSuccess = status === 'success';

  useEffect(() => {
    let active = true;
    const loadPlan = async () => {
      try {
        const response = await subscriptionApi.getPlans();
        const plans = (response.data as SubscriptionPlanListResponse).data ?? [];
        if (active) {
          const matched = plans.find((p) => p.plan_key === planKey);
          if (matched) {
            setPlan(matched);
          }
        }
      } catch (error) {
        console.warn('Failed to load subscription plans for result view', error);
      }
    };

    if (planKey) {
      loadPlan();
    }

    return () => {
      active = false;
    };
  }, [planKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/points/subscriptions');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const planDescription = useMemo(() => {
    if (!plan) return null;
    const yen = Math.round(plan.usd_amount * USD_TO_JPY).toLocaleString('ja-JP');
    return `${plan.label}（${plan.points.toLocaleString('ja-JP')}pt / 月 ・ 約${yen}円）`;
  }, [plan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mb-6 flex justify-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${
                  isSuccess ? 'bg-emerald-100' : 'bg-rose-100'
                }`}
              >
                {isSuccess ? (
                  <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-12 w-12 text-rose-600" />
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {isSuccess ? 'サブスク申込が完了しました！' : 'サブスク申込に失敗しました'}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              {isSuccess
                ? '数分でポイント残高へ反映されます。'
                : '決済が完了しませんでした。エラー内容をご確認のうえ、再度お試しください。'}
            </p>

            {planDescription && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700">
                <p className="font-semibold text-slate-800">選択プラン</p>
                <p className="mt-1">{planDescription}</p>
              </div>
            )}

            {seller && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-xs text-blue-700">
                <p>
                  このサブスクは販売者「{seller}」向けに紐付いています。案内されたコンテンツの視聴・利用にお役立てください。
                </p>
              </div>
            )}

            <p className="mt-8 text-xs text-slate-500">
              {countdown}秒後にサブスク管理ページに移動します。
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/points/subscriptions"
                className="block w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                サブスク管理へ移動する
              </Link>
              <Link
                href="/dashboard"
                className="block w-full rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionResultPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SubscriptionResultContent />
    </Suspense>
  );
}
