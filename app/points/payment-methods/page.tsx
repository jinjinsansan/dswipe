'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowPathIcon, PlusSmallIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { paymentMethodApi } from '@/lib/api';
import type { PaymentMethod } from '@/types';
import { useAuthStore } from '@/store/authStore';

type ActionState = 'adding' | 'settingDefault' | 'deleting' | null;

const STORAGE_NAMESPACE = 'oneLatPaymentMethodSetup:';

const formatExpiry = (method: PaymentMethod) => {
  if (!method.exp_month || !method.exp_year) {
    return null;
  }
  const month = String(method.exp_month).padStart(2, '0');
  const year = String(method.exp_year).slice(-2);
  return `${month}/${year}`;
};

export default function PaymentMethodsPage() {
  const t = useTranslations('paymentMethods');
  const { isInitialized, isAuthenticated } = useAuthStore();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>(null);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);

  const canPerformActions = useMemo(() => isInitialized && isAuthenticated, [isInitialized, isAuthenticated]);

  const loadMethods = useCallback(async () => {
    if (!canPerformActions) {
      setMethods([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentMethodApi.list();
      const items = Array.isArray(response.data?.items) ? response.data.items : [];
      setMethods(items);
    } catch (err) {
      console.error('Failed to load payment methods', err);
      setError(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [canPerformActions, t]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    loadMethods();
  }, [isInitialized, loadMethods]);

  const handleAdd = useCallback(async () => {
    if (!canPerformActions) {
      return;
    }

    setActionState('adding');
    setActionTargetId(null);
    setError(null);

    try {
      const response = await paymentMethodApi.initiateOneLatSetup();
      const data = response.data;

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`${STORAGE_NAMESPACE}${data.external_id}`, data.checkout_preference_id);
        } catch (storageError) {
          console.warn('Failed to persist payment method setup session', storageError);
        }
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      console.error('Failed to initiate payment method setup', err);
      setError(t('actionError'));
    } finally {
      setActionState(null);
    }
  }, [canPerformActions, t]);

  const handleSetDefault = useCallback(
    async (methodId: string) => {
      if (!canPerformActions) {
        return;
      }
      setActionState('settingDefault');
      setActionTargetId(methodId);
      setError(null);

      try {
        await paymentMethodApi.setDefault(methodId);
        await loadMethods();
      } catch (err) {
        console.error('Failed to set default payment method', err);
        setError(t('actionError'));
      } finally {
        setActionState(null);
        setActionTargetId(null);
      }
    },
    [canPerformActions, loadMethods, t]
  );

  const handleDelete = useCallback(
    async (methodId: string) => {
      if (!canPerformActions) {
        return;
      }

      if (!window.confirm(t('deleteConfirm'))) {
        return;
      }

      setActionState('deleting');
      setActionTargetId(methodId);
      setError(null);

      try {
        await paymentMethodApi.delete(methodId);
        await loadMethods();
      } catch (err) {
        console.error('Failed to delete payment method', err);
        setError(t('actionError'));
      } finally {
        setActionState(null);
        setActionTargetId(null);
      }
    },
    [canPerformActions, loadMethods, t]
  );

  const handleRefresh = useCallback(() => {
    if (!canPerformActions) {
      return;
    }
    loadMethods();
  }, [canPerformActions, loadMethods]);

  return (
    <DashboardLayout pageTitle={t('title')} pageSubtitle={t('description')}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1 text-sm text-slate-600">
            <span>{t('addDescription')}</span>
            {error ? <span className="text-xs text-red-600">{error}</span> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading || actionState !== null}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {t('refresh')}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={actionState === 'adding'}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-70"
            >
              <PlusSmallIcon className={`h-5 w-5 ${actionState === 'adding' ? 'animate-spin' : ''}`} aria-hidden="true" />
              {t('addButton')}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {isLoading ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-slate-500">
              <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
              {t('status.loading')}
            </div>
          ) : methods.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-slate-500">
              <p>{t('empty')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {methods.map((method) => {
                const expiryLabel = formatExpiry(method);
                const isDefault = method.is_default;
                const isActionTarget = actionTargetId === method.id;
                const isSetting = actionState === 'settingDefault' && isActionTarget;
                const isDeleting = actionState === 'deleting' && isActionTarget;

                return (
                  <li
                    key={method.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm text-slate-700 shadow-sm transition hover:border-emerald-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
                        <span>{method.brand_label ?? method.brand ?? 'Card'}</span>
                        {method.last4 ? <span className="text-sm text-slate-500">•••• {method.last4}</span> : null}
                      </div>
                      {isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                          <StarIcon className="h-4 w-4" aria-hidden="true" />
                          {t('defaultBadge')}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      {expiryLabel ? <span>{t('expiresOn', { expiry: expiryLabel })}</span> : <span>{t('expiresUnknown')}</span>}
                      <div className="flex flex-wrap items-center gap-2">
                        {!isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(method.id)}
                            disabled={isSetting}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isSetting ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin" aria-hidden="true" />
                            ) : (
                              <StarIcon className="h-3 w-3" aria-hidden="true" />
                            )}
                            {t('setDefault')}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(method.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-500 transition hover:border-red-300 hover:text-red-600 disabled:cursor-wait disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <ArrowPathIcon className="h-3 w-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <TrashIcon className="h-3 w-3" aria-hidden="true" />
                          )}
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
