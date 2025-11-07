'use client';

import Link from 'next/link';

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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">アカウント共有</h2>
                <p className="mt-1 text-sm text-slate-500">
                  信頼できるユーザーにダッシュボードの閲覧・編集を委任できます。共有中の相手はいつでも管理画面から確認・解除できます。
                </p>
              </div>
              <Link
                href="/settings/share"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                共有設定を開く
              </Link>
            </div>
          </section>

          {/* 今後の設定項目をここに追加 */}
          {/* 例: プロフィール設定、通知設定、セキュリティ設定など */}
        </div>
      </div>
    </DashboardLayout>
  );
}
