'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

const STORAGE_NAMESPACE = 'oneLatPaymentMethodSetup:';

export default function PaymentMethodErrorPage() {
  const t = useTranslations('paymentMethods');
  const router = useRouter();
  const searchParams = useSearchParams();

  const externalId = searchParams.get('external_id');

  useEffect(() => {
    if (!externalId) return;
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`${STORAGE_NAMESPACE}${externalId}`);
  }, [externalId]);

  const handleBack = () => {
    router.replace('/points/payment-methods');
  };

  return (
    <DashboardLayout pageTitle={t('errorHeading')} pageSubtitle={t('errorDescription')}>
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-red-200 bg-white px-6 py-10 text-center shadow-sm">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" aria-hidden="true" />
        <p className="text-sm text-red-600">{t('errorDescription')}</p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          {t('errorBack')}
        </button>
      </div>
    </DashboardLayout>
  );
}
