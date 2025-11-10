'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { paymentMethodApi } from '@/lib/api';
import type { PaymentMethod } from '@/types';

const STORAGE_NAMESPACE = 'oneLatPaymentMethodSetup:';

type Status = 'loading' | 'success' | 'error';

export default function PaymentMethodSuccessPage() {
  const t = useTranslations('paymentMethods');
  const router = useRouter();
  const searchParams = useSearchParams();

  const externalId = useMemo(() => searchParams.get('external_id'), [searchParams]);

  const [status, setStatus] = useState<Status>('loading');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!externalId) {
        setStatus('error');
        return;
      }

      let preferenceId: string | null = null;
      if (typeof window !== 'undefined') {
        preferenceId = sessionStorage.getItem(`${STORAGE_NAMESPACE}${externalId}`);
      }

      if (!preferenceId) {
        setStatus('error');
        return;
      }

      try {
        const response = await paymentMethodApi.confirmOneLatSetup({
          checkoutPreferenceId: preferenceId,
          externalId,
        });
        setPaymentMethod(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Failed to confirm payment method setup', error);
        setStatus('error');
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(`${STORAGE_NAMESPACE}${externalId}`);
        }
      }
    };

    run();
  }, [externalId]);

  const handleBack = () => {
    router.replace('/points/payment-methods');
  };

  const pageTitle = status === 'error' ? t('errorHeading') : t('successHeading');
  const pageSubtitle = status === 'error' ? t('errorDescription') : t('successDescription');

  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-emerald-200 bg-white px-6 py-10 text-center shadow-sm">
        {status === 'loading' ? (
          <>
            <ArrowPathIcon className="h-10 w-10 animate-spin text-emerald-500" aria-hidden="true" />
            <p className="text-sm text-slate-600">{t('successLoading')}</p>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <CheckCircleIcon className="h-12 w-12 text-emerald-500" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">{t('successHeading')}</h2>
              {paymentMethod ? (
                <p className="text-sm text-slate-600">
                  {(paymentMethod.brand_label ?? paymentMethod.brand ?? 'Card')}{' '}
                  {paymentMethod.last4 ? `•••• ${paymentMethod.last4}` : ''}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              {t('successBack')}
            </button>
          </>
        ) : null}

        {status === 'error' ? (
          <>
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {t('successError')}
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              {t('successBack')}
            </button>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
