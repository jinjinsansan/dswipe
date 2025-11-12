'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useFormatter, useTranslations } from 'next-intl';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { paymentApi, productApi, publicApi } from '@/lib/api';
import type { BillingProfileResponse } from '@/types/api';
import type { PublicNoteDetail, Product } from '@/types';
import { redirectToLogin } from '@/lib/navigation';

type ItemType = 'note' | 'product' | 'subscription';

interface QuickItemSummary {
  id: string;
  type: ItemType;
  title: string;
  priceYen?: number | null;
  quantity?: number;
  sellerUsername?: string | null;
  sellerId?: string | null;
  description?: string | null;
  slug?: string | null;
  planKey?: string | null;
  salonId?: string | null;
}

const SUPPORTED_TYPES: ItemType[] = ['note', 'product', 'subscription'];

const parseItemType = (value: string | null): ItemType | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return SUPPORTED_TYPES.includes(normalized as ItemType) ? (normalized as ItemType) : null;
};

const parsePositiveInt = (value: string | null, fallback = 1): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const parsePrice = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed);
};

export default function QuickCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('quickCheckout');
  const formatter = useFormatter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  const [profile, setProfile] = useState<BillingProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [item, setItem] = useState<QuickItemSummary | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [itemError, setItemError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const itemType = useMemo(() => parseItemType(searchParams.get('type')), [searchParams]);
  const itemId = useMemo(() => searchParams.get('id') ?? searchParams.get('item') ?? searchParams.get('note_id') ?? null, [searchParams]);
  const slugParam = useMemo(() => searchParams.get('slug'), [searchParams]);
  const titleParam = useMemo(() => searchParams.get('title'), [searchParams]);
  const priceParam = useMemo(() => parsePrice(searchParams.get('price')), [searchParams]);
  const quantityParam = useMemo(() => parsePositiveInt(searchParams.get('quantity')), [searchParams]);
  const planKeyParam = useMemo(() => searchParams.get('plan_key') ?? searchParams.get('plan'), [searchParams]);
  const localeParam = useMemo(() => searchParams.get('locale'), [searchParams]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      redirectToLogin(router);
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await paymentApi.getBillingProfile();
        setProfile(response.data);
      } catch {
        setProfile(null);
        setProfileError(t('profile.loadFailed'));
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [t]);

  const profileReady = useMemo(() => Boolean(profile && profile.profile), [profile]);

  const fallbackUrl = useMemo(() => {
    if (!itemType) {
      return null;
    }

    if (itemType === 'note') {
      if (slugParam) {
        const prefix = localeParam ? `/${localeParam}` : '';
        return `${prefix}/notes/${slugParam}`.replace('//', '/');
      }
      if (itemId) {
        return `/notes/${itemId}`;
      }
      return '/notes';
    }

    if (itemType === 'product') {
      if (itemId) {
        return `/products/${itemId}`;
      }
      return '/products';
    }

    if (itemType === 'subscription') {
      const salonId = searchParams.get('salon_id') ?? searchParams.get('salon');
      if (salonId) {
        return `/salons/${salonId}/public`;
      }
      return '/points/subscriptions';
    }

    return null;
  }, [itemId, itemType, localeParam, slugParam, searchParams]);

  const fallbackLinkLabel = useMemo(() => {
    if (!fallbackUrl) {
      return null;
    }
    return fallbackUrl.startsWith('/settings') ? t('profile.goToSettings') : t('item.viewOriginal');
  }, [fallbackUrl, t]);

  useEffect(() => {
    if (profileLoading || itemLoading) {
      return;
    }
    if (!profileReady && !profileError && fallbackUrl) {
      router.replace(fallbackUrl);
    }
  }, [fallbackUrl, itemLoading, profileError, profileLoading, profileReady, router]);

  useEffect(() => {
    const loadItem = async () => {
      setItemLoading(true);
      setItemError(null);

      if (!itemType) {
        setItem(null);
        setItemError(t('errors.unsupportedType'));
        setItemLoading(false);
        return;
      }

      if (!itemId && itemType !== 'subscription') {
        setItem(null);
        setItemError(t('errors.missingItem'));
        setItemLoading(false);
        return;
      }

      try {
        if (itemType === 'note') {
          if (slugParam) {
            const response = await publicApi.getNote(slugParam, {
              accessToken: localStorage.getItem('access_token') ?? undefined,
            });
            const data = response.data as PublicNoteDetail;
            setItem({
              id: itemId ?? data.id,
              type: 'note',
              title: data.title ?? titleParam ?? t('item.untitledNote'),
              priceYen: data.price_jpy ?? priceParam ?? undefined,
              sellerUsername: data.author_username ?? null,
              sellerId: (data as { author_id?: string | null }).author_id ?? null,
              slug: data.slug ?? slugParam,
            });
          } else {
            setItem({
              id: itemId!,
              type: 'note',
              title: titleParam ?? t('item.untitledNote'),
              priceYen: priceParam ?? undefined,
              sellerUsername: null,
              sellerId: null,
              slug: null,
            });
          }
        } else if (itemType === 'product') {
          const response = await productApi.get(itemId!);
          const data = response.data as Product;
          setItem({
            id: data.id,
            type: 'product',
            title: data.title ?? titleParam ?? t('item.untitledProduct'),
            priceYen: data.price_jpy ?? priceParam ?? undefined,
            quantity: quantityParam,
            sellerUsername:
              'seller_username' in data
                ? ((data as { seller_username?: string | null }).seller_username ?? null)
                : null,
            sellerId: (data as { seller_id?: string | null }).seller_id ?? null,
            description: data.description ?? null,
          });
        } else if (itemType === 'subscription') {
          if (!planKeyParam) {
            setItemError(t('errors.missingPlanKey'));
            setItem(null);
          } else {
            setItem({
              id: planKeyParam,
              type: 'subscription',
              title: titleParam ?? t('item.subscriptionDefaultTitle'),
              priceYen: priceParam ?? undefined,
              planKey: planKeyParam,
              sellerUsername: searchParams.get('seller') ?? null,
              sellerId: searchParams.get('seller_id') ?? searchParams.get('sellerId') ?? null,
              salonId: searchParams.get('salon_id') ?? searchParams.get('salon') ?? null,
            });
          }
        }
      } catch {
        setItem(null);
        setItemError(t('errors.itemLoadFailed'));
      } finally {
        setItemLoading(false);
      }
    };

    loadItem();
  }, [itemId, itemType, planKeyParam, quantityParam, slugParam, titleParam, priceParam, searchParams, t]);

  const formattedPrice = useMemo(() => {
    if (!item?.priceYen) return null;
    try {
      return formatter.number(item.priceYen, { style: 'currency', currency: 'JPY' });
    } catch {
      return `¥${item.priceYen.toLocaleString()}`;
    }
  }, [formatter, item]);

  const isReady = profileReady && item && !itemLoading && !profileLoading;

  const handlePurchase = useCallback(async () => {
    if (!itemType || !item) {
      setPurchaseError(t('errors.missingItem'));
      return;
    }
    if (itemType !== 'subscription' && !item.id) {
      setPurchaseError(t('errors.missingItem'));
      return;
    }
    setProcessing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      const payload: Record<string, unknown> = {
        item_type: itemType,
        locale: searchParams.get('locale') ?? undefined,
      };

      if (itemType === 'note') {
        payload.item_id = item.id;
        payload.seller_username = item.sellerUsername ?? undefined;
        payload.seller_id = item.sellerId ?? undefined;
      } else if (itemType === 'product') {
        payload.item_id = item.id;
        payload.quantity = item.quantity ?? 1;
        payload.seller_username = item.sellerUsername ?? undefined;
        payload.seller_id = item.sellerId ?? undefined;
      } else if (itemType === 'subscription') {
        if (!item.planKey) {
          setPurchaseError(t('errors.missingPlanKey'));
          setProcessing(false);
          return;
        }
        payload.plan_key = item.planKey;
        payload.seller_username = item.sellerUsername ?? undefined;
        payload.seller_id = item.sellerId ?? undefined;
        payload.salon_id = item.salonId ?? undefined;
        payload.success_path = searchParams.get('success_path') ?? undefined;
        payload.error_path = searchParams.get('error_path') ?? undefined;
      }

      const response = await paymentApi.quickCheckout(payload);
      const result = response.data;
      if (result.checkout_url) {
        setPurchaseSuccess(true);
        window.location.href = result.checkout_url;
        return;
      }
      setPurchaseError(t('errors.missingCheckoutUrl'));
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
      if (typeof detail === 'string') {
        setPurchaseError(detail);
      } else {
        setPurchaseError(t('errors.purchaseFailed'));
      }
    } finally {
      setProcessing(false);
    }
  }, [item, itemType, searchParams, t]);

  const renderProfileDetails = () => {
    if (profileLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t('profile.loading')}
        </div>
      );
    }
    if (!profileReady) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">{t('profile.missingTitle')}</p>
          <p className="mt-1">{t('profile.missingDescription')}</p>
          <Link
            href="/settings"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {t('profile.goToSettings')}
          </Link>
        </div>
      );
    }

    const data = profile!.profile!;
    return (
      <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
        <dl className="space-y-1">
          <dt className="font-medium text-slate-500">{t('profile.labels.fullName')}</dt>
          <dd>{data.full_name}</dd>
          <dt className="font-medium text-slate-500">{t('profile.labels.email')}</dt>
          <dd>{data.email}</dd>
          {data.phone_number ? (
            <>
              <dt className="font-medium text-slate-500">{t('profile.labels.phoneNumber')}</dt>
              <dd>{data.phone_number}</dd>
            </>
          ) : null}
        </dl>
        <dl className="space-y-1">
          {(data.postal_code || data.prefecture || data.city || data.address_line1) ? (
            <>
              <dt className="font-medium text-slate-500">{t('profile.labels.address')}</dt>
              <dd className="whitespace-pre-line">
                {[data.postal_code, data.prefecture, data.city, data.address_line1, data.address_line2]
                  .filter(Boolean)
                  .join('\n')}
              </dd>
            </>
          ) : null}
          {data.company_name ? (
            <>
              <dt className="font-medium text-slate-500">{t('profile.labels.company')}</dt>
              <dd>{data.company_name}</dd>
            </>
          ) : null}
        </dl>
      </div>
    );
  };

  const renderItemDetails = () => {
    if (itemLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t('item.loading')}
        </div>
      );
    }
    if (!item || itemError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {itemError ?? t('errors.itemLoadFailed')}
        </div>
      );
    }

    return (
      <div className="space-y-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <ShieldCheckIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <span>{item.title}</span>
        </div>
        {formattedPrice ? (
          <p className="text-lg font-semibold text-emerald-600">{formattedPrice}</p>
        ) : null}
        {item.quantity && item.quantity > 1 ? (
          <p className="text-slate-500">{t('item.quantityLabel', { count: item.quantity })}</p>
        ) : null}
        {itemType === 'subscription' && item.planKey ? (
          <p className="text-slate-500">{t('item.planKeyLabel', { value: item.planKey })}</p>
        ) : null}
        {item.sellerUsername ? (
          <p className="text-slate-500">{t('item.sellerLabel', { username: item.sellerUsername })}</p>
        ) : null}
        {item.description ? (
          <p className="text-slate-500">{item.description}</p>
        ) : null}
      </div>
    );
  };

  const showPurchaseButton = isReady && !processing;

  return (
    <DashboardLayout pageTitle={t('title')} pageSubtitle={t('subtitle')}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('profile.heading')}</h2>
                <p className="text-sm text-slate-500">{t('profile.description')}</p>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
              >
                {t('profile.editButton')}
              </Link>
            </div>
            <div className="mt-4">
              {renderProfileDetails()}
              {profileError ? (
                <p className="mt-3 text-sm text-red-600">{profileError}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('item.heading')}</h2>
                <p className="text-sm text-slate-500">{t('item.description')}</p>
              </div>
              {item?.slug ? (
                <Link
                  href={`/notes/${item.slug}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
                >
                  {t('item.viewOriginal')}
                </Link>
              ) : null}
            </div>
            <div className="mt-4">
              {renderItemDetails()}
            </div>
          </section>

          {purchaseError ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <p>{purchaseError}</p>
              </div>
              {fallbackUrl ? (
                <Link
                  href={fallbackUrl}
                  className="inline-flex w-fit items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:border-red-300"
                >
                  {fallbackLinkLabel}
                </Link>
              ) : null}
            </div>
          ) : null}

          {purchaseSuccess ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <p>{t('status.redirecting')}</p>
            </div>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('actions.heading')}</h2>
                <p className="text-sm text-slate-500">{t('actions.description')}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
                >
                  {t('actions.editProfile')}
                </Link>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={!showPurchaseButton}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                      {t('actions.processing')}
                    </span>
                  ) : (
                    t('actions.quickPurchase')
                  )}
                </button>
              </div>
            </div>
            {!profileReady ? (
              <p className="mt-3 text-sm text-amber-600">{t('profile.requiredNotice')}</p>
            ) : null}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
