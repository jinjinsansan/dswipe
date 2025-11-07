'use client';

import Link from 'next/link';
import {useTranslations} from 'next-intl';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import XConnectionCard from '@/components/settings/XConnectionCard';

export default function SettingsPage() {
  const t = useTranslations('settings.page');

  return (
    <DashboardLayout pageTitle={t('title')} pageSubtitle={t('subtitle')}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">{t('sections.integrations.heading')}</h2>
            <XConnectionCard />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('sections.accountSharing.heading')}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('sections.accountSharing.description')}
                </p>
              </div>
              <Link
                href="/settings/share"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                {t('sections.accountSharing.button')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
