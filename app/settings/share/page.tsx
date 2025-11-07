'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AccountShareManager from '@/components/settings/AccountShareManager';

export default function AccountShareSettingsPage() {
  return (
    <DashboardLayout pageTitle="アカウント共有" pageSubtitle="信頼するユーザーにダッシュボードを委任できます">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <AccountShareManager />
      </div>
    </DashboardLayout>
  );
}
