'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

import { paymentApi } from '@/lib/api';
import type { BillingProfilePayload, BillingProfileResponse } from '@/types/api';

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  companyName: string;
};

const defaultFormState: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  postalCode: '',
  prefecture: '',
  city: '',
  addressLine1: '',
  addressLine2: '',
  companyName: '',
};

const normalizeValue = (value: string) => value.trim();

const toPayload = (state: FormState): BillingProfilePayload => {
  const payload: BillingProfilePayload = {
    full_name: normalizeValue(state.fullName),
    email: normalizeValue(state.email),
    country_code: 'JP',
  };

  const optionalMap: Array<[keyof FormState, keyof BillingProfilePayload]> = [
    ['phoneNumber', 'phone_number'],
    ['postalCode', 'postal_code'],
    ['prefecture', 'prefecture'],
    ['city', 'city'],
    ['addressLine1', 'address_line1'],
    ['addressLine2', 'address_line2'],
    ['companyName', 'company_name'],
  ];

  const optionalUpdates: Partial<BillingProfilePayload> = {};
  optionalMap.forEach(([field, key]) => {
    const value = normalizeValue(state[field]);
    if (value) {
      optionalUpdates[key] = value;
    }
  });

  return { ...payload, ...optionalUpdates };
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
    postalCode: profile.postal_code ?? '',
    prefecture: profile.prefecture ?? '',
    city: profile.city ?? '',
    addressLine1: profile.address_line1 ?? '',
    addressLine2: profile.address_line2 ?? '',
    companyName: profile.company_name ?? '',
  };
};

export default function BillingProfileCard() {
  const t = useTranslations('settings.billingProfile');
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
    if (!form.fullName.trim() || !form.email.trim()) {
      return true;
    }
    return saving;
  }, [form.email, form.fullName, saving]);

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
          <div className="sm:col-span-2">
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
              value={form.phoneNumber}
              onChange={handleChange('phoneNumber')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-postal">
              {t('form.postalCode')}
            </label>
            <input
              id="billing-postal"
              type="text"
              autoComplete="postal-code"
              value={form.postalCode}
              onChange={handleChange('postalCode')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-prefecture">
              {t('form.prefecture')}
            </label>
            <input
              id="billing-prefecture"
              type="text"
              autoComplete="address-level1"
              value={form.prefecture}
              onChange={handleChange('prefecture')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-city">
              {t('form.city')}
            </label>
            <input
              id="billing-city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={handleChange('city')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-address-line1">
              {t('form.addressLine1')}
            </label>
            <input
              id="billing-address-line1"
              type="text"
              autoComplete="address-line1"
              value={form.addressLine1}
              onChange={handleChange('addressLine1')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-address-line2">
              {t('form.addressLine2')}
            </label>
            <input
              id="billing-address-line2"
              type="text"
              autoComplete="address-line2"
              value={form.addressLine2}
              onChange={handleChange('addressLine2')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loading || saving}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="billing-company">
              {t('form.companyName')}
            </label>
            <input
              id="billing-company"
              type="text"
              autoComplete="organization"
              value={form.companyName}
              onChange={handleChange('companyName')}
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
