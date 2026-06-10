'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const SALON_ENABLED = process.env.NEXT_PUBLIC_SALON_FEATURE_ENABLED === 'true';

interface SalonFeatureGateProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function SalonFeatureGate({ children, pageTitle = 'サロン', pageSubtitle = 'コミュニティ管理' }: SalonFeatureGateProps) {
  const router = useRouter();

  if (!SALON_ENABLED) {
    return (
      <DashboardLayout
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        requireAuth
      >
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-8 py-12">
            <h2 className="text-xl font-semibold text-slate-900">
              現在このサービスは一時停止中です
            </h2>
            <p className="mt-4 text-slate-600">
              サロン機能は現在メンテナンス中です。
            </p>
            <p className="mt-2 text-sm text-slate-500">
              ご不便をおかけして申し訳ございません。
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 rounded-xl bg-[#0b1f3a] px-6 py-3 text-sm font-semibold text-pure-white hover:bg-[#122c4d]"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
