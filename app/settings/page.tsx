'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import XConnectionCard from '@/components/settings/XConnectionCard';

export default function SettingsPage() {
  return (
    <DashboardLayout pageTitle="設定" pageSubtitle="アカウント設定と連携管理">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          {/* X連携セクション */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">外部サービス連携</h2>
            <XConnectionCard />
          </section>

          {/* 今後の設定項目をここに追加 */}
          {/* 例: プロフィール設定、通知設定、セキュリティ設定など */}
        </div>
      </div>
    </DashboardLayout>
  );
}
