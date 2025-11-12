'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { paymentApi } from '@/lib/api';
import type { BillingProfilePayload, BillingProfileResponse } from '@/types/api';

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

const defaultFormState: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
};

const normalizeValue = (value: string) => value.trim();

const toPayload = (state: FormState): BillingProfilePayload => {
  const payload: BillingProfilePayload = {
    full_name: normalizeValue(state.fullName),
    email: normalizeValue(state.email),
    country_code: 'JP',
  };

  const phone = normalizeValue(state.phoneNumber);
  if (phone) {
    payload.phone_number = phone;
  }

  return payload;
};

const fromResponse = (response: BillingProfileResponse | undefined): FormState => {
  if (!response?.profile) {
    return { ...defaultFormState };
  }
  const profile = response.profile;
  return {
    fullName: profile.full_name ?? '',
    email: profile.email ?? '',
    phoneNumber: profile.phone_number ?? '',
  };
};

export default function BillingProfileCard() {
  const t = useTranslations('settings.billingProfile');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(() => {
    const value = searchParams.get('redirect');
    if (!value) return null;
    if (!value.startsWith('/')) return null;
    return value;
  }, [searchParams]);
  const [form, setForm] = useState<FormState>({ ...defaultFormState });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const response = await paymentApi.getBillingProfile();
        if (!isMounted) return;
        const data = response.data;
        setForm(fromResponse(data));
        setUpdatedAt(data.updated_at ?? null);
      } catch {
        if (isMounted) {
          setErrorMessage(t('messages.loadFailed'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload = toPayload(form);
      const response = await paymentApi.updateBillingProfile(payload);
      setForm(fromResponse(response.data));
      setUpdatedAt(response.data.updated_at ?? null);
      setSuccessMessage(t('messages.saveSuccess'));
      if (redirectTarget) {
        setTimeout(() => {
          router.push(redirectTarget);
        }, 600);
      }
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage(t('messages.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const disableSubmit = useMemo(() => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phoneNumber.trim()) {
      return true;
    }
    return saving;
  }, [form.email, form.fullName, form.phoneNumber, saving]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('heading')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('description')}</p>
        </div>
        {updatedAt ? (
          <p className="text-xs text-slate-400">
            {t('updatedAtLabel', {
              value: new Date(updatedAt).toLocaleString(),
            })}
          </p>
        ) : null}
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-full-name">
              {t('form.fullName')}
            </label>
            <input
              id="billing-full-name"
              type="text"
              autoComplete="name"
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-email">
              {t('form.email')}
            </label>
            <input
              id="billing-email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-phone">
              {t('form.phoneNumber')}
            </label>
            <input
              id="billing-phone"
              type="tel"
              autoComplete="tel"
              required
              value={form.phoneNumber}
              onChange={handleChange('phoneNumber')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        ) : null}
        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
            {successMessage}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={loading || disableSubmit}
          >
            {saving ? t('buttons.saving') : t('buttons.save')}
          </button>
        </div>
      </form>
    </section>
  );
}
