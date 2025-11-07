'use client';

import {useTranslations} from 'next-intl';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AccountShareManager from '@/components/settings/AccountShareManager';

export default function AccountShareSettingsPage() {
  const t = useTranslations('settings.sharePage');

  return (
    <DashboardLayout pageTitle={t('title')} pageSubtitle={t('subtitle')}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <AccountShareManager />
      </div>
    </DashboardLayout>
  );
}
