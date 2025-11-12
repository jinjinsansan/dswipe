'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageLoader } from '@/components/LoadingSpinner';
import { paymentApi, platformSettingsApi, subscriptionApi } from '@/lib/api';
import type {
  QuickCheckoutResponse,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
  UserSubscription,
  UserSubscriptionListResponse,
} from '@/types/api';

const STATUS_CLASS_MAP: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  COMPLETE: 'bg-sky-50 text-sky-600 border border-sky-200',
  PENDING: 'bg-amber-50 text-amber-600 border border-amber-200',
  UNPAID: 'bg-rose-50 text-rose-600 border border-rose-200',
  CANCELED: 'bg-slate-100 text-slate-500 border border-slate-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
  REJECTED: 'bg-rose-50 text-rose-600 border border-rose-200',
};

function SubscriptionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [effectiveRate, setEffectiveRate] = useState<number>(145);
  const formatter = useFormatter();
  const t = useTranslations('pointsSubscriptions');
  const selectionT = useTranslations('pointsSubscriptions.selection');
  const sellerNoticeT = useTranslations('pointsSubscriptions.sellerNotice');
  const subscriptionsT = useTranslations('pointsSubscriptions.subscriptions');
  const statusT = useTranslations('pointsSubscriptions.status');
  const errorsT = useTranslations('pointsSubscriptions.errors');
  const confirmT = useTranslations('pointsSubscriptions.confirm');
  const placeholdersT = useTranslations('pointsSubscriptions.placeholders');
  const statusLabels = useMemo(
    () => ({
      ACTIVE: statusT('ACTIVE'),
      COMPLETE: statusT('COMPLETE'),
      PENDING: statusT('PENDING'),
      UNPAID: statusT('UNPAID'),
      CANCELED: statusT('CANCELED'),
      CANCELLED: statusT('CANCELLED'),
      REJECTED: statusT('REJECTED'),
    }),
    [statusT]
  );

  const formatDateTime = useCallback(
    (value?: string | null) => {
      if (!value) return placeholdersT('none');
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return formatter.dateTime(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    [formatter, placeholdersT]
  );

  const formatPoints = useCallback((points?: number | null) => {
    if (points === undefined || points === null || Number.isNaN(points)) {
      return placeholdersT('none');
    }
    return formatter.number(points);
  }, [formatter, placeholdersT]);

  const yenLabel = useCallback(
    (usdAmount: number) => {
      if (!usdAmount || Number.isNaN(usdAmount)) {
        return selectionT('approxZero');
      }
      const yen = Math.round(usdAmount * effectiveRate);
      return selectionT('yenLabel', {
        amount: formatter.number(yen, { style: 'currency', currency: 'JPY' }),
      });
    },
    [effectiveRate, formatter, selectionT]
  );

  const fetchPlansAndSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plansRes, subsRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getSubscriptions(),
      ]);

      const planData = (plansRes.data as SubscriptionPlanListResponse).data ?? [];
      const subscriptionData = (subsRes.data as UserSubscriptionListResponse).data ?? [];

      // The plan_id parameter may correspond to either plan_key or subscription_plan_id
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
    } catch (error: unknown) {
      console.error('Failed to load subscription data', error);
      const detail =
        typeof error === 'object' && error !== null && 'response' in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === 'string'
          ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail as string)
          : errorsT('load');
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  }, [errorsT, planIdParam, planKeyParam, planPointsParam]);

  useEffect(() => {
    fetchPlansAndSubscriptions();
  }, [fetchPlansAndSubscriptions]);

  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        const response = await platformSettingsApi.getPaymentSettings();
        const data = response.data as {
          effective_exchange_rate?: number;
        };
        if (data?.effective_exchange_rate && Number.isFinite(data.effective_exchange_rate)) {
          setEffectiveRate(data.effective_exchange_rate);
        }
      } catch (error) {
        console.warn('Failed to fetch platform payment settings', error);
      }
    };
    void loadPlatformSettings();
  }, []);

  const handleSubscribe = async (planKey: string) => {
    if (restrictedPlanKey || restrictedPlanId || restrictedPlanPoints) {
      const targetPlan = plans.find((plan) => plan.plan_key === planKey);
      if (!targetPlan || !isPlanAllowed(targetPlan)) {
        setErrorMessage(errorsT('restrictedPlan'));
        return;
      }
    }
    try {
      setErrorMessage(null);
      setPlanLoadingKey(planKey);
      const quickPayload: Record<string, unknown> = {
        item_type: 'subscription',
        plan_key: planKey,
      };
      if (sellerId) {
        quickPayload.seller_id = sellerId;
      }
      if (sellerUsername) {
        quickPayload.seller_username = sellerUsername;
      }
      if (salonIdParam) {
        quickPayload.salon_id = salonIdParam;
      }
      const response = await paymentApi.quickCheckout(quickPayload);
      const data = response.data as QuickCheckoutResponse;
      if (!data.checkout_url) {
        throw new Error(errorsT('missingCheckoutUrl'));
      }
      window.location.href = data.checkout_url;
    } catch (error: unknown) {
      console.error('Failed to create subscription checkout', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === 'string'
      ) {
        const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail as string;
        if (detail === '請求先情報を設定してください') {
          alert(t('billingProfileRequired'));
          const redirectPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
          const search = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
          router.push(`/profile${search}`);
        } else {
          setErrorMessage(detail);
        }
      } else {
        setErrorMessage(errorsT('checkout'));
      }
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
    // On salon-specific pages, show only allowed plans
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
      return selectionT('pointsPerMonthLabel', {
        points: formatPoints(restrictedPlanPoints),
        suffix: selectionT('pointsSuffix'),
      });
    }
    if (restrictedPlanKey) {
      return restrictedPlanKey;
    }
    if (restrictedPlanId) {
      return restrictedPlanId;
    }
    return selectionT('restrictionDefaultLabel');
  }, [formatPoints, primaryPlan, restrictedPlanId, restrictedPlanKey, restrictedPlanPoints, selectionT]);

  const handleCancel = async (subscriptionId: string) => {
    const confirmCancel = window.confirm(confirmT('cancel'));
    if (!confirmCancel) return;

    try {
      setErrorMessage(null);
      setCancelingId(subscriptionId);
      await subscriptionApi.cancel(subscriptionId);
      await fetchPlansAndSubscriptions();
    } catch (error: unknown) {
      console.error('Failed to cancel subscription', error);
      const detail =
        typeof error === 'object' && error !== null && 'response' in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === 'string'
          ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail as string)
          : errorsT('cancel');
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
      pageTitle={t('pageTitle')}
      pageSubtitle={t('pageSubtitle')}
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
              {sellerNoticeT('title', { seller: sellerUsername })}
            </p>
            <p className="mt-1 text-xs text-blue-600">
              {sellerNoticeT('description')}
            </p>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">{selectionT('heading')}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectionT('description')}
          </p>
          {(restrictedPlanKey || restrictedPlanId || restrictedPlanPoints) && (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-700">
              {selectionT('restrictionNotice', { label: restrictionNoticeLabel })}
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
                      {selectionT('pointsPerMonthLabel', {
                        points: formatPoints(plan.points),
                        suffix: selectionT('pointsSuffix'),
                      })}
                    </p>
                    <p className={`mt-2 font-medium text-slate-700 ${orderedPlans.length === 1 ? 'text-lg' : 'text-sm'}`}>{yenLabel(plan.usd_amount)}</p>
                    <p className={`mt-1 text-slate-400 ${orderedPlans.length === 1 ? 'text-sm' : 'text-xs'}`}>
                      {selectionT('usdNote')}
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
                    {isProcessing ? selectionT('redirecting') : selectionT('subscribeButton')}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">{subscriptionsT('heading')}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {subscriptionsT('description')}
          </p>

          {subscriptions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                {subscriptionsT('empty')}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {subscriptions.map((subscription) => {
                const metaKey = subscription.status?.toUpperCase() ?? '';
                const className = STATUS_CLASS_MAP[metaKey] ?? 'bg-slate-100 text-slate-600 border border-slate-200';
                const statusLabel = (statusLabels as Record<string, string>)[metaKey]
                  ?? subscription.status
                  ?? subscriptionsT('statusUnknown');

                return (
                  <div
                    key={subscription.id}
                    className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{subscription.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {subscriptionsT('pricePerCycle', {
                            points: formatPoints(subscription.points_per_cycle),
                            suffix: selectionT('pointsSuffix'),
                            yen: yenLabel(subscription.usd_amount),
                          })}
                        </p>
                        {subscription.seller_username && (
                          <p className="mt-1 text-xs text-slate-500">
                            {subscriptionsT('sellerLabel', { seller: subscription.seller_username })}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">{subscriptionsT('fields.nextCharge')}</dt>
                        <dd className="mt-1 font-medium text-slate-800">{formatDateTime(subscription.next_charge_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">{subscriptionsT('fields.lastCharge')}</dt>
                        <dd className="mt-1 font-medium text-slate-800">{formatDateTime(subscription.last_charge_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">{subscriptionsT('fields.lastEvent')}</dt>
                        <dd className="mt-1 font-medium text-slate-800">{subscription.last_event_type ?? placeholdersT('none')}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">{subscriptionsT('fields.contractId')}</dt>
                        <dd className="mt-1 font-medium text-slate-800 break-all">{subscription.recurrent_payment_id ?? placeholdersT('none')}</dd>
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
                          {cancelingId === subscription.id
                            ? subscriptionsT('canceling')
                            : subscriptionsT('cancelButton')}
                        </button>
                      ) : (
                        <p className="text-xs text-slate-400">{subscriptionsT('cancelUnavailable')}</p>
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
