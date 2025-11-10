'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {useFormatter, useTranslations} from 'next-intl';
import { PageLoader } from '@/components/LoadingSpinner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { paymentMethodApi, pointsApi } from '@/lib/api';
import type { PaymentMethod } from '@/types';
import {
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
}

const POINT_PACKAGES = [
  { points: 1000, price: 1000, bonus: 0 },
  { points: 3000, price: 3000, bonus: 0 },
  { points: 5000, price: 5000, bonus: 0 },
  { points: 10000, price: 10000, bonus: 0 },
  { points: 30000, price: 30000, bonus: 0 },
  { points: 100000, price: 100000, bonus: 0 },
];

const NEW_PAYMENT_METHOD_OPTION = '__new__';

const PAYMENT_METHODS = [
  {
    id: 'one_lat',
    icon: <CurrencyDollarIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'active',
  },
  {
    id: 'jpyc',
    icon: <BanknotesIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
  {
    id: 'stripe',
    icon: <CreditCardIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
  {
    id: 'paypal',
    icon: <BanknotesIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
  {
    id: 'bank',
    icon: <BuildingLibraryIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
];

export default function PointPurchasePage() {
  const { isAuthenticated, isInitialized, pointBalance, setPointBalance } = useAuthStore();
  const [currentBalance, setCurrentBalance] = useState<number>(pointBalance);
  const [selectedPackage, setSelectedPackage] = useState(POINT_PACKAGES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [savedMethodsLoading, setSavedMethodsLoading] = useState(false);
  const [savedMethodsError, setSavedMethodsError] = useState<string | null>(null);
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState<string>(NEW_PAYMENT_METHOD_OPTION);
  const formatter = useFormatter();
  const t = useTranslations('pointsPurchase');
  const packagesT = useTranslations('pointsPurchase.packages');
  const paymentsT = useTranslations('pointsPurchase.payments');
  const summaryT = useTranslations('pointsPurchase.summary');
  const alertsT = useTranslations('pointsPurchase.alerts');
  const errorsT = useTranslations('pointsPurchase.errors');
  const transactionsT = useTranslations('pointsPurchase.transactions');
  const guidelinesT = useTranslations('pointsPurchase.guidelines');
  const paymentMethodsT = useTranslations('paymentMethods');
  const guidelineItems = useMemo(() => {
    const rawItems = guidelinesT.raw('items');
    return Array.isArray(rawItems) ? rawItems.map(String) : [];
  }, [guidelinesT]);

  useEffect(() => {
    setCurrentBalance(pointBalance);
  }, [pointBalance]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    let isActive = true;

    const load = async () => {
      try {
        setLoadError(null);

        const [balanceRes, transactionsRes] = await Promise.all([
          pointsApi.getBalance(),
          pointsApi.getTransactions({ transaction_type: 'purchase', limit: 10 }),
        ]);

        if (!isActive) return;

        const fetchedBalance = balanceRes.data.point_balance ?? 0;
        setCurrentBalance(fetchedBalance);
        setPointBalance(fetchedBalance);

        const txData = Array.isArray(transactionsRes.data?.data)
          ? transactionsRes.data.data
          : Array.isArray(transactionsRes.data)
          ? transactionsRes.data
          : [];

        setTransactions(
          (txData as Transaction[]).filter((item): item is Transaction => Boolean(item?.id))
        );
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (isActive) {
          setLoadError(errorsT('fetch'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [errorsT, isInitialized, isAuthenticated, setPointBalance]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || selectedPaymentMethod.id !== 'one_lat') {
      setSavedPaymentMethods([]);
      setSelectedSavedMethodId(NEW_PAYMENT_METHOD_OPTION);
      setSavedMethodsError(null);
      return;
    }

    let isActive = true;
    setSavedMethodsLoading(true);
    setSavedMethodsError(null);

    paymentMethodApi
      .list()
      .then((response) => {
        if (!isActive) return;
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        setSavedPaymentMethods(items);
        const defaultMethod = items.find((item) => item.is_default) || items[0];
        setSelectedSavedMethodId(defaultMethod ? defaultMethod.id : NEW_PAYMENT_METHOD_OPTION);
      })
      .catch((error) => {
        console.error('Failed to load saved payment methods', error);
        if (isActive) {
          setSavedMethodsError(paymentMethodsT('actionError'));
        }
      })
      .finally(() => {
        if (isActive) {
          setSavedMethodsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isInitialized, isAuthenticated, selectedPaymentMethod.id, paymentMethodsT]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      alert(alertsT('loginRequired'));
      return;
    }

    if (selectedPaymentMethod.id === 'jpyc') {
      alert(alertsT('jpycComingSoon'));
      return;
    }

    if (selectedPaymentMethod.status === 'coming_soon') {
      alert(alertsT('comingSoon'));
      return;
    }

    if (selectedPaymentMethod.id === 'one_lat') {
      try {
        setIsPurchasing(true);
        const paymentMethodRecordId =
          selectedSavedMethodId !== NEW_PAYMENT_METHOD_OPTION ? selectedSavedMethodId : undefined;

        const response = await pointsApi.purchaseWithYen({
          amount: selectedTotalPoints,
          paymentMethodRecordId,
        });

        const checkoutUrl = response.data?.checkout_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }

        throw new Error(
          alertsT('purchaseStartFailed', {
            status: '200',
            details: 'Missing checkout URL',
          })
        );
      } catch (error: unknown) {
        console.error('Purchase error:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
          });
        }
        const message = error instanceof Error ? error.message : String(error);
        alert(alertsT('purchaseError', { message }));
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  const selectedTotalPoints = selectedPackage.points + selectedPackage.bonus;
  const projectedBalance = currentBalance + selectedTotalPoints;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle={t('pageTitle')}
      pageSubtitle={t('pageSubtitle')}
    >
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">{packagesT('heading')}</h2>
                    <p className="mt-1 text-sm text-slate-500">{packagesT('description')}</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{packagesT('secureLabel')}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {POINT_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.points === pkg.points;
                    return (
                      <button
                        key={pkg.points}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:p-6 ${
                          isSelected
                            ? 'border-blue-500/70 bg-blue-50 shadow-[0_15px_40px_-25px_rgba(37,99,235,0.4)]'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xl font-semibold text-slate-900 sm:text-2xl">
                              {packagesT('pointsLabel', { points: formatter.number(pkg.points) })}
                            </p>
                            {pkg.bonus > 0 && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                {packagesT('bonusBadge', { bonus: formatter.number(pkg.bonus) })}
                              </span>
                            )}
                          </div>
                          {isSelected && <span className="text-sm font-semibold text-blue-600">{packagesT('selectedLabel')}</span>}
                        </div>
                        <p className="mt-4 text-sm text-slate-500">
                          {packagesT('priceLabel', {
                            price: formatter.number(pkg.price, { style: 'currency', currency: 'JPY' }),
                          })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:mb-6">{paymentsT('heading')}</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethod.id === method.id;
                    const isComingSoon = method.status === 'coming_soon';
                    return (
                      <button
                        key={method.id}
                        onClick={() => !isComingSoon && setSelectedPaymentMethod(method)}
                        disabled={isComingSoon}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all sm:px-5 sm:py-4 ${
                          isSelected
                            ? 'border-blue-500/70 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        } ${isComingSoon ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            {method.icon}
                          </span>
                          <span className="truncate text-sm font-medium text-slate-900 sm:text-base">
                            {paymentsT(`methods.${method.id}.name`)}
                          </span>
                        </div>
                        {isComingSoon ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            {paymentsT('statusBadge.comingSoon')}
                          </span>
                        ) : isSelected ? (
                          <span className="text-sm font-semibold text-blue-600">{paymentsT('statusBadge.selected')}</span>
                        ) : (
                          <span className="text-sm text-slate-500">{paymentsT('statusBadge.select')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedPaymentMethod.id === 'one_lat' ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 sm:text-base">
                          {paymentMethodsT('selectionTitle')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                          {paymentMethodsT('selectionDescription')}
                        </p>
                      </div>
                      <Link
                        href="/points/payment-methods"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                      >
                        {paymentMethodsT('manageLink')}
                      </Link>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      {savedMethodsError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
                          {savedMethodsError}
                        </div>
                      ) : null}
                      {savedMethodsLoading ? (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                          {paymentMethodsT('selectionLoading')}
                        </div>
                      ) : savedPaymentMethods.length ? (
                        <div className="space-y-2">
                          {savedPaymentMethods.map((method) => (
                            <label
                              key={method.id}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
                                selectedSavedMethodId === method.id
                                  ? 'border-emerald-400 bg-white'
                                  : 'border-transparent bg-white/70 hover:border-emerald-300'
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="saved-point-method"
                                  value={method.id}
                                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                                  checked={selectedSavedMethodId === method.id}
                                  onChange={() => setSelectedSavedMethodId(method.id)}
                                />
                                <span className="text-sm font-medium text-slate-800">
                                  {(method.brand_label ?? method.brand ?? 'Card')}{' '}
                                  {method.last4 ? `•••• ${method.last4}` : ''}
                                </span>
                              </span>
                              {method.is_default ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                  {paymentMethodsT('defaultBadge')}
                                </span>
                              ) : null}
                            </label>
                          ))}
                          <label
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
                              selectedSavedMethodId === NEW_PAYMENT_METHOD_OPTION
                                ? 'border-emerald-400 bg-white'
                                : 'border-transparent bg-white/70 hover:border-emerald-300'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="saved-point-method"
                                value={NEW_PAYMENT_METHOD_OPTION}
                                className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                                checked={selectedSavedMethodId === NEW_PAYMENT_METHOD_OPTION}
                                onChange={() => setSelectedSavedMethodId(NEW_PAYMENT_METHOD_OPTION)}
                              />
                              <span className="text-sm font-medium text-slate-800">
                                {paymentMethodsT('selectionUseNew')}
                              </span>
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs text-slate-500">
                          {paymentMethodsT('selectionNone')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-4 grid grid-cols-2 gap-4 sm:mb-6">
                  <div>
                    <div className="text-xs text-slate-500 sm:text-sm">{summaryT('purchasePointsLabel')}</div>
                    <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {summaryT('pointsValue', { points: formatter.number(selectedTotalPoints) })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 sm:text-sm">{summaryT('paymentAmountLabel')}</div>
                    <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {summaryT('paymentValue', {
                        amount: formatter.number(selectedPackage.price, {
                          style: 'currency',
                          currency: 'JPY',
                        }),
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || selectedPaymentMethod.status === 'coming_soon'}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-4 sm:text-base"
                >
                  {isPurchasing ? summaryT('processing') : summaryT('proceedButton')}
                </button>
                {selectedPaymentMethod.id === 'one_lat' && (
                  <p className="mt-3 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
                    {summaryT('paymentNotices.one_lat')}
                  </p>
                )}
                {selectedPaymentMethod.id === 'jpyc' && (
                  <p className="mt-3 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
                    {summaryT('paymentNotices.jpyc')}
                  </p>
                )}
                {selectedPaymentMethod.status === 'coming_soon' && selectedPaymentMethod.id !== 'jpyc' && (
                  <p className="mt-3 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
                    {summaryT('paymentNotices.comingSoon')}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-blue-500/70 sm:text-sm">{t('balance.sectionLabel')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-4xl">
                  {formatter.number(currentBalance)}{' '}
                  <span className="text-base font-normal text-blue-500/80 sm:text-xl">{t('balance.pointsSuffix')}</span>
                </p>
                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  {t('balance.projected', {
                    balance: formatter.number(projectedBalance),
                    suffix: t('balance.pointsSuffix'),
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">{transactionsT('heading')}</h3>
                {transactions.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                    {transactionsT('empty')}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {transactionsT('pointsAdded', {
                              points: formatter.number(Math.abs(tx.amount)),
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatter.dateTime(new Date(tx.created_at), {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">{transactionsT('statusCompleted')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">{guidelinesT('heading')}</h3>
                <ul className="space-y-3 text-xs text-slate-600 sm:text-sm">
                  {guidelineItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
