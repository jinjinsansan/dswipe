'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageLoader } from '@/components/LoadingSpinner';
import { subscriptionApi } from '@/lib/api';
import type {
  SubscriptionPlan,
  SubscriptionPlanListResponse,
  SubscriptionCheckoutResponse,
  UserSubscription,
  UserSubscriptionListResponse,
} from '@/types/api';

const USD_TO_JPY = 145;

const formatDateTime = (value?: string | null) => {
  if (!value) return '---';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    return value;
  }
};

const statusMeta: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: '有効',
    className: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  },
  COMPLETE: {
    label: '決済完了',
    className: 'bg-sky-50 text-sky-600 border border-sky-200',
  },
  PENDING: {
    label: '処理中',
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
  UNPAID: {
    label: '未入金',
    className: 'bg-rose-50 text-rose-600 border border-rose-200',
  },
  CANCELED: {
    label: '解約済',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  CANCELLED: {
    label: '解約済',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  REJECTED: {
    label: '拒否',
    className: 'bg-rose-50 text-rose-600 border border-rose-200',
  },
};

const yenLabel = (usdAmount: number) => {
  const yen = Math.round(usdAmount * USD_TO_JPY);
  return `約${yen.toLocaleString('ja-JP')}円 / 月`;
};

function SubscriptionPageContent() {
  const searchParams = useSearchParams();
  const sellerUsername = searchParams.get('seller') ?? undefined;
  const sellerId =
    searchParams.get('seller_id') ?? searchParams.get('sellerId') ?? undefined;
  const planKeyParam =
    searchParams.get('plan_key') ?? searchParams.get('planKey') ?? undefined;
  const planIdParam =
    searchParams.get('plan_id') ?? searchParams.get('planId') ?? undefined;
  const planPointsParamRaw = searchParams.get('plan_points') ?? undefined;
  const planPointsParam = useMemo(() => {
    if (!planPointsParamRaw) return undefined;
    const parsed = Number(planPointsParamRaw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [planPointsParamRaw]);
  const salonIdParam = searchParams.get('salon') ?? undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [planLoadingKey, setPlanLoadingKey] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restrictedPlanKey, setRestrictedPlanKey] = useState<string | null>(null);
  const [restrictedPlanId, setRestrictedPlanId] = useState<string | null>(null);
  const [restrictedPlanPoints, setRestrictedPlanPoints] = useState<number | null>(null);

  const fetchPlansAndSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plansRes, subsRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getSubscriptions(),
      ]);

      const planData = (plansRes.data as SubscriptionPlanListResponse).data ?? [];
      const subscriptionData = (subsRes.data as UserSubscriptionListResponse).data ?? [];

      // plan_idパラメータはplan_keyまたはsubscription_plan_idのどちらかの可能性がある
      const matchedPlanById = planIdParam
        ? planData.find((plan) => plan.subscription_plan_id === planIdParam || plan.plan_key === planIdParam)
        : undefined;
      const matchedPlanByKey = !matchedPlanById && planKeyParam
        ? planData.find((plan) => plan.plan_key === planKeyParam)
        : undefined;
      const resolvedPlan = matchedPlanById ?? matchedPlanByKey ?? null;

      if (resolvedPlan) {
        setRestrictedPlanKey(resolvedPlan.plan_key ?? null);
        setRestrictedPlanId(resolvedPlan.subscription_plan_id ?? null);
        setRestrictedPlanPoints(
          typeof resolvedPlan.points === 'number' && resolvedPlan.points > 0
            ? resolvedPlan.points
            : null,
        );
      } else {
        const planIdExists = planIdParam
          ? planData.some((plan) => plan.subscription_plan_id === planIdParam)
          : false;
        const planKeyExists = planKeyParam
          ? planData.some((plan) => plan.plan_key === planKeyParam)
          : false;

        setRestrictedPlanId(planIdExists ? planIdParam ?? null : null);
        setRestrictedPlanPoints(planPointsParam ?? null);
        setRestrictedPlanKey(
          planKeyExists && !planIdExists && !planPointsParam ? planKeyParam ?? null : null,
        );
      }

      setPlans(planData);
      setSubscriptions(subscriptionData);
    } catch (error: any) {
      console.error('Failed to load subscription data', error);
      const detail = error?.response?.data?.detail ?? 'データの取得に失敗しました。時間をおいて再度お試しください。';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  }, [planIdParam, planKeyParam, planPointsParam]);

  useEffect(() => {
    fetchPlansAndSubscriptions();
  }, [fetchPlansAndSubscriptions]);

  const handleSubscribe = async (planKey: string) => {
    if (restrictedPlanKey || restrictedPlanId || restrictedPlanPoints) {
      const targetPlan = plans.find((plan) => plan.plan_key === planKey);
      if (!targetPlan || !isPlanAllowed(targetPlan)) {
        setErrorMessage('このサロンでは指定されたプランのみお申し込みいただけます。');
        return;
      }
    }
    try {
      setErrorMessage(null);
      setPlanLoadingKey(planKey);
      const response = await subscriptionApi.createCheckout({
        plan_key: planKey,
        seller_id: sellerId,
        seller_username: sellerUsername,
        salon_id: salonIdParam,
      });
      const data = response.data as SubscriptionCheckoutResponse;
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Checkout URLが取得できませんでした');
      }
    } catch (error: any) {
      console.error('Failed to create subscription checkout', error);
      const detail = error?.response?.data?.detail ?? 'サブスク決済の開始に失敗しました。もう一度お試しください。';
      setErrorMessage(detail);
    } finally {
      setPlanLoadingKey(null);
    }
  };

  const isPlanAllowed = useCallback(
    (plan: SubscriptionPlan) => {
      if (!restrictedPlanId && !restrictedPlanKey && !restrictedPlanPoints) {
        return true;
      }

      const matchesId = restrictedPlanId
        ? plan.subscription_plan_id === restrictedPlanId
        : false;
      const matchesKey = restrictedPlanKey ? plan.plan_key === restrictedPlanKey : false;
      const matchesPoints = restrictedPlanPoints
        ? plan.points === restrictedPlanPoints
        : false;

      return matchesId || matchesKey || matchesPoints;
    },
    [restrictedPlanId, restrictedPlanKey, restrictedPlanPoints],
  );

  const orderedPlans = useMemo(() => {
    if (!restrictedPlanId && !restrictedPlanKey && !restrictedPlanPoints) {
      return plans;
    }
    // サロン専用ページでは、許可されたプランのみ表示
    return plans.filter(isPlanAllowed);
  }, [plans, isPlanAllowed, restrictedPlanId, restrictedPlanKey, restrictedPlanPoints]);

  const primaryPlan = useMemo(() => {
    if (!restrictedPlanId && !restrictedPlanKey && !restrictedPlanPoints) {
      return null;
    }
    return plans.find(isPlanAllowed) ?? null;
  }, [isPlanAllowed, plans, restrictedPlanId, restrictedPlanKey, restrictedPlanPoints]);

  const restrictionNoticeLabel = useMemo(() => {
    if (primaryPlan?.label) {
      return primaryPlan.label;
    }
    if (restrictedPlanPoints) {
      return `${restrictedPlanPoints.toLocaleString('ja-JP')}ポイント / 月`;
    }
    if (restrictedPlanKey) {
      return restrictedPlanKey;
    }
    if (restrictedPlanId) {
      return restrictedPlanId;
    }
    return '指定プラン';
  }, [primaryPlan, restrictedPlanId, restrictedPlanKey, restrictedPlanPoints]);

  const handleCancel = async (subscriptionId: string) => {
    const confirmCancel = window.confirm('自動更新を停止します。よろしいですか？');
    if (!confirmCancel) return;

    try {
      setErrorMessage(null);
      setCancelingId(subscriptionId);
      await subscriptionApi.cancel(subscriptionId);
      await fetchPlansAndSubscriptions();
    } catch (error: any) {
      console.error('Failed to cancel subscription', error);
      const detail = error?.response?.data?.detail ?? '解約処理に失敗しました。時間をおいて再度お試しください。';
      setErrorMessage(detail);
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="サブスク自動チャージ"
      pageSubtitle="毎月自動でポイントをチャージして購入忘れをゼロに"
      requireAuth
    >
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {errorMessage}
          </div>
        )}

        {sellerUsername && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
            <p className="font-medium">
              このリンクは「{sellerUsername}」向けのサブスク申込ページです。
            </p>
            <p className="mt-1 text-xs text-blue-600">
              申込完了後は自動的にポイントがチャージされ、販売者のコンテンツ利用にご使用いただけます。
            </p>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">プランを選択</h2>
          <p className="mt-1 text-sm text-slate-500">
            毎月自動でポイントがチャージされます。いつでも停止できます。
          </p>
          {(restrictedPlanKey || restrictedPlanId || restrictedPlanPoints) && (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-700">
              このサロンでは「{restrictionNoticeLabel}」のみお申し込みいただけます。
            </div>
          )}

          <div className={`mt-4 ${orderedPlans.length === 1 ? 'flex justify-center' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}`}>
            {orderedPlans.map((plan) => {
              const isProcessing = planLoadingKey === plan.plan_key;

              return (
                <div
                  key={plan.plan_key}
                  className={`flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm transition ${
                    orderedPlans.length === 1 ? 'w-full max-w-lg p-8' : 'p-6'
                  }`}
                >
                  <div>
                    <p className={`font-semibold text-slate-900 ${orderedPlans.length === 1 ? 'text-2xl' : 'text-lg'}`}>{plan.label}</p>
                    <p className={`mt-1 text-slate-500 ${orderedPlans.length === 1 ? 'text-base' : 'text-sm'}`}>
                      {plan.points.toLocaleString('ja-JP')}ポイント / 月
                    </p>
                    <p className={`mt-2 font-medium text-slate-700 ${orderedPlans.length === 1 ? 'text-lg' : 'text-sm'}`}>{yenLabel(plan.usd_amount)}</p>
                    <p className={`mt-1 text-slate-400 ${orderedPlans.length === 1 ? 'text-sm' : 'text-xs'}`}>
                      決済はONE.lat経由でUSD建てとなります。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan.plan_key)}
                    disabled={isProcessing}
                    className={`mt-6 w-full rounded-xl border border-blue-500 bg-blue-500 font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                      orderedPlans.length === 1 ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
                    }`}
                  >
                    {isProcessing ? 'リダイレクト中…' : 'このプランで申込む'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">契約中のサブスク</h2>
          <p className="mt-1 text-sm text-slate-500">
            ステータスや次回課金日を確認できます。必要に応じて自動更新を停止してください。
          </p>

          {subscriptions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                現在アクティブなサブスクはありません。上のプランからお申し込みいただけます。
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {subscriptions.map((subscription) => {
                const metaKey = subscription.status?.toUpperCase() ?? '';
                const meta = statusMeta[metaKey] ?? {
                  label: subscription.status,
                  className: 'bg-slate-100 text-slate-600 border border-slate-200',
                };

                return (
                  <div
                    key={subscription.id}
                    className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{subscription.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {subscription.points_per_cycle.toLocaleString('ja-JP')}ポイント / 月 ・ {yenLabel(subscription.usd_amount)}
                        </p>
                        {subscription.seller_username && (
                          <p className="mt-1 text-xs text-slate-500">
                            販売者: {subscription.seller_username}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">次回課金予定</dt>
                        <dd className="mt-1 font-medium text-slate-800">{formatDateTime(subscription.next_charge_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">最終課金</dt>
                        <dd className="mt-1 font-medium text-slate-800">{formatDateTime(subscription.last_charge_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">最新イベント</dt>
                        <dd className="mt-1 font-medium text-slate-800">{subscription.last_event_type ?? '---'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">契約ID</dt>
                        <dd className="mt-1 font-medium text-slate-800 break-all">{subscription.recurrent_payment_id ?? '---'}</dd>
                      </div>
                    </dl>

                    <div className="mt-6 flex justify-end">
                      {subscription.cancelable && subscription.recurrent_payment_id ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(subscription.id)}
                          disabled={cancelingId === subscription.id}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                        >
                          {cancelingId === subscription.id ? '処理中…' : '自動更新を停止'}
                        </button>
                      ) : (
                        <p className="text-xs text-slate-400">このサブスクは現在キャンセルできません。</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}
