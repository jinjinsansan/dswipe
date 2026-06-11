'use client';

import Link from 'next/link';
import {useTranslations} from 'next-intl';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import XConnectionCard from '@/components/settings/XConnectionCard';
import { GRAD_BRAND, HEAD_BG } from '@/lib/momentum';

export default function SettingsPage() {
  const t = useTranslations('settings.page');

  return (
    <DashboardLayout pageTitle={t('title')} pageSubtitle={t('subtitle')}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          {/* Navy hero — Momentum chrome */}
          <section
            className="rounded-3xl px-6 py-7 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)] sm:px-8"
            style={{ background: HEAD_BG }}
          >
            <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Settings</p>
            <h1 className="mt-2 text-[24px] font-extrabold tracking-tight text-pure-white">{t('title')}</h1>
            <p className="mt-2 text-sm text-[#bcd3ee]">{t('subtitle')}</p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0b1f3a]">{t('sections.integrations.heading')}</h2>
            <XConnectionCard />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0b1f3a]">{t('sections.accountSharing.heading')}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('sections.accountSharing.description')}
                </p>
              </div>
              <Link
                href="/settings/share"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] transition-shadow hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)]"
                style={{ background: GRAD_BRAND }}
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
