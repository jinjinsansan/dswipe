'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NoteEditor from '@/components/note/NoteEditor';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { mediaApi, noteApi, salonApi } from '@/lib/api';
import { createEmptyBlock, normalizeBlock, isPaidBlock } from '@/lib/noteBlocks';
import type { NoteBlock, NoteVisibility, Salon, SalonListResult } from '@/types';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';

const MIN_TITLE_LENGTH = 3;
const MAX_CATEGORIES = 5;

export default function NoteCreatePage() {
  const t = useTranslations('noteCreate');
  const categoryT = useTranslations('notePublic.categories');
  const noteEditorT = useTranslations('noteEditor');
  const formatter = useFormatter();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [pricePoints, setPricePoints] = useState('');
  const [priceJpy, setPriceJpy] = useState('');
  const [allowPointPurchase, setAllowPointPurchase] = useState(true);
  const [allowJpyPurchase, setAllowJpyPurchase] = useState(false);
  const [taxRate, setTaxRate] = useState('10');
  const [taxInclusive, setTaxInclusive] = useState(true);
  const [blocks, setBlocks] = useState<NoteBlock[]>(() => [createEmptyBlock('paragraph')]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCoverMediaOpen, setIsCoverMediaOpen] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [salonOptions, setSalonOptions] = useState<Salon[]>([]);
  const [selectedSalonIds, setSelectedSalonIds] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<NoteVisibility>('private');

  const visibilityOptions = useMemo(
    () => ([
      {
        value: 'public' as NoteVisibility,
        label: t('visibility.public.label'),
        description: t('visibility.public.description'),
      },
      {
        value: 'limited' as NoteVisibility,
        label: t('visibility.limited.label'),
        description: t('visibility.limited.description'),
      },
      {
        value: 'private' as NoteVisibility,
        label: t('visibility.private.label'),
        description: t('visibility.private.description'),
      },
    ]),
    [t],
  );

  useEffect(() => {
    const loadSalons = async () => {
      try {
        const response = await salonApi.list();
        const data = response.data as SalonListResult;
        setSalonOptions(data?.data ?? []);
      } catch (error) {
        console.warn('Failed to load salon list', error);
      }
    };

    loadSalons();
  }, []);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverMediaSelect = (url: string) => {
    setCoverImageUrl(url);
    setIsCoverMediaOpen(false);
  };

  const openCoverFilePicker = () => {
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
      coverFileInputRef.current.click();
    }
  };

  const handleCoverFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    try {
      const response = await mediaApi.upload(file, {
        optimize: true,
        max_width: 1920,
        max_height: 1080,
      });
      const url: string | undefined = response.data?.url;
      if (!url) {
        throw new Error(t('errors.coverUploadMissingUrl'));
      }
      setCoverImageUrl(url);
    } catch (uploadError) {
      console.error(t('errors.coverUploadFailed'), uploadError);
      alert(t('alerts.coverUploadFailed'));
    } finally {
      setIsCoverUploading(false);
      event.target.value = '';
    }
  };

  const toggleCategory = (value: string) => {
    setCategories((prev) => {
      if (prev.includes(value)) {
        return prev.filter((category) => category !== value);
      }
      if (prev.length >= MAX_CATEGORIES) {
        alert(t('alerts.maxCategories', { max: MAX_CATEGORIES }));
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleBlocksChange = useCallback((next: NoteBlock[]) => {
    setBlocks(next.map((block) => normalizeBlock(block)));
  }, []);

  const paidBlockExists = useMemo(() => blocks.some((block) => isPaidBlock(block)), [blocks]);
  const effectivePaid = isPaid || paidBlockExists;

  const paidStatusMessage = useMemo(() => {
    if (!effectivePaid) {
      return t('labels.paidStatus.free');
    }
    return paidBlockExists ? t('labels.paidStatus.withPaidBlocks') : t('labels.paidStatus.manual');
  }, [effectivePaid, paidBlockExists, t]);

  const handleAllowPointPurchaseChange = (checked: boolean) => {
    if (!checked && effectivePaid && !allowJpyPurchase) {
      alert(t('alerts.requirePaymentMethod'));
      return;
    }
    setAllowPointPurchase(checked);
    if (!checked) {
      setPricePoints('');
    }
  };

  const handleAllowJpyPurchaseChange = (checked: boolean) => {
    if (!checked && effectivePaid && !allowPointPurchase) {
      alert(t('alerts.requirePaymentMethod'));
      return;
    }
    setAllowJpyPurchase(checked);
    if (!checked) {
      setPriceJpy('');
    }
  };

  const handlePaidToggle = (checked: boolean) => {
    setIsPaid(checked);
    if (!checked) {
      setBlocks((prev) => prev.map((block) => normalizeBlock({ ...block, access: 'public' })));
      setPricePoints('');
      setPriceJpy('');
    }
    if (checked && !allowPointPurchase && !allowJpyPurchase) {
      setAllowPointPurchase(true);
    }
  };

  const handlePriceChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPricePoints(value);
  };

  const handlePriceJpyChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPriceJpy(value);
  };

  const handleTaxRateChange = (value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    setTaxRate(value);
  };

  const toggleSalonAccess = (salonId: string) => {
    setSelectedSalonIds((prev) =>
      prev.includes(salonId)
        ? prev.filter((id) => id !== salonId)
        : [...prev, salonId]
    );
  };

  const handleVisibilityChange = (value: NoteVisibility) => {
    setVisibility(value);
  };

  const validate = () => {
    if (!title || title.trim().length < MIN_TITLE_LENGTH) {
      return t('errors.titleTooShort', { min: MIN_TITLE_LENGTH });
    }

    const hasContent = blocks.some((block) => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
        return Boolean(block.data?.text && String(block.data.text).trim().length > 0);
      }
      if (block.type === 'list') {
        return Array.isArray(block.data?.items) && block.data.items.length > 0;
      }
      if (block.type === 'image') {
        return Boolean(block.data?.url && String(block.data.url).trim().length > 0);
      }
      return true;
    });

    if (!hasContent) {
      return t('errors.bodyRequired');
    }

    if (effectivePaid) {
      if (!allowPointPurchase && !allowJpyPurchase) {
        return t('errors.requirePaymentMethodForPaid');
      }

      if (allowPointPurchase) {
        const priceValue = Number(pricePoints);
        if (!Number.isFinite(priceValue) || priceValue <= 0) {
          return t('errors.invalidPointsPrice');
        }
      }

      if (allowJpyPurchase) {
        const priceValueJpy = Number(priceJpy);
        if (!Number.isFinite(priceValueJpy) || priceValueJpy <= 0) {
          return t('errors.invalidYenPrice');
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (saving) return;
    setError(null);
    setInfo(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      const normalizedBlocks = blocks.map((block) => normalizeBlock(block));
      const parsedPoints = Number(pricePoints);
      const parsedJpy = Number(priceJpy);
      const normalizedTaxRate = taxRate.trim();
      const parsedTaxRate = normalizedTaxRate === '' ? null : Number(normalizedTaxRate);
      const pricePointsValue =
        effectivePaid && allowPointPurchase && Number.isFinite(parsedPoints) ? parsedPoints : 0;
      const priceJpyValue =
        effectivePaid && allowJpyPurchase && Number.isFinite(parsedJpy) ? parsedJpy : null;
      const taxRateValue =
        parsedTaxRate === null || Number.isNaN(parsedTaxRate) ? null : parsedTaxRate;
      const payload = {
        title: title.trim(),
        cover_image_url: coverImageUrl.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content_blocks: normalizedBlocks,
        is_paid: effectivePaid,
        price_points: pricePointsValue,
        price_jpy: priceJpyValue,
        allow_point_purchase: effectivePaid ? allowPointPurchase : false,
        allow_jpy_purchase: effectivePaid ? allowJpyPurchase : false,
        tax_rate: effectivePaid ? taxRateValue : null,
        tax_inclusive: effectivePaid ? taxInclusive : true,
        categories,
        salon_ids: selectedSalonIds,
        visibility,
      };

      const response = await noteApi.create(payload);
      setInfo(t('messages.savedDraft'));
      setTimeout(() => {
        router.push(`/note/${response.data.id}/edit`);
      }, 600);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : t('errors.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle={t('pageTitle')}
      pageSubtitle={t('pageSubtitle')}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {info ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('labels.title')}</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t('placeholders.title')}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('labels.excerpt')}</label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder={t('placeholders.excerpt')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('labels.coverImage')}</label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openCoverFilePicker}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {noteEditorT('buttons.uploadImage')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCoverMediaOpen(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {noteEditorT('buttons.chooseFromMedia')}
                  </button>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileSelect}
                  />
                </div>
                {isCoverUploading ? (
                  <p className="mt-2 text-xs font-semibold text-blue-600">{noteEditorT('status.uploading')}</p>
                ) : null}
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder={t('placeholders.coverImageUrl')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={saving}
                />
                {coverImageUrl.trim() ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <img src={coverImageUrl} alt="cover preview" className="h-40 w-full object-cover" />
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-600">{t('labels.draftStatusTitle')}</p>
                <p className="mt-1">{t('labels.draftStatusDescription')}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t('labels.categoryTitle')}</p>
                  <p className="text-xs text-slate-500">{t('labels.categoryDescription', { max: MAX_CATEGORIES })}</p>
                </div>
                {categories.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                    <span>{t('labels.categoriesSelected')}</span>
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600"
                      >
                        #{categoryT(category)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {NOTE_CATEGORY_OPTIONS.map((option) => {
                  const isActive = categories.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleCategory(option.value)}
                      disabled={saving}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {categoryT(option.value)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-800">{t('labels.visibilityTitle')}</p>
              <p className="mt-1 text-xs text-slate-500">{t('labels.visibilityDescription')}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {visibilityOptions.map((option) => {
                  const isChecked = visibility === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-3 py-3 text-sm transition ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="note-visibility"
                          value={option.value}
                          checked={isChecked}
                          onChange={() => handleVisibilityChange(option.value)}
                          disabled={saving}
                          className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t('labels.paidTitle')}</p>
                  <p className="text-xs text-slate-500">{t('labels.paidDescription')}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={isPaid}
                    onChange={(event) => handlePaidToggle(event.target.checked)}
                    disabled={saving}
                  />
                  {t('labels.manualPaidToggle')}
                </label>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{t('labels.pointsPayment')}</p>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={allowPointPurchase}
                        onChange={(event) => handleAllowPointPurchaseChange(event.target.checked)}
                        disabled={!effectivePaid}
                      />
                      {t('labels.enable')}
                    </label>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pricePoints}
                    onChange={(event) => handlePriceChange(event.target.value)}
                    placeholder={t('placeholders.pointsExample')}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    disabled={saving || !effectivePaid || !allowPointPurchase}
                  />
                  <p className="mt-2 text-xs text-slate-500">{t('labels.pointsDescription')}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{t('labels.jpyPayment')}</p>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={allowJpyPurchase}
                        onChange={(event) => handleAllowJpyPurchaseChange(event.target.checked)}
                        disabled={!effectivePaid}
                      />
                      {t('labels.enable')}
                    </label>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceJpy}
                    onChange={(event) => handlePriceJpyChange(event.target.value)}
                    placeholder={t('placeholders.jpyExample')}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                    disabled={saving || !effectivePaid || !allowJpyPurchase}
                  />
                  <p className="mt-2 text-xs text-slate-500">{t('labels.jpyDescription')}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('labels.taxRate')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={taxRate}
                    onChange={(event) => handleTaxRateChange(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    disabled={saving || !effectivePaid || (!allowPointPurchase && !allowJpyPurchase)}
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={taxInclusive}
                      onChange={(event) => setTaxInclusive(event.target.checked)}
                      disabled={saving || !effectivePaid || (!allowPointPurchase && !allowJpyPurchase)}
                    />
                    {t('labels.taxInclusive')}
                  </label>
                </div>
                <div className="sm:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs text-slate-600">
                  <p>{paidStatusMessage}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t('labels.salonAccessTitle')}</p>
                  <p className="text-xs text-slate-500">{t('labels.salonAccessDescription')}</p>
                </div>
              </div>
              {salonOptions.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  {t('labels.salonEmptyMessage')}
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {salonOptions.map((salon) => {
                    const isActive = selectedSalonIds.includes(salon.id);
                    return (
                      <button
                        key={salon.id}
                        type="button"
                        onClick={() => toggleSalonAccess(salon.id)}
                        disabled={saving}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {salon.title ?? t('labels.untitledSalon')}
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
                          {t('labels.salonMemberCount', {
                            count: formatter.number(salon.member_count ?? 0),
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('labels.contentBlocksTitle')}</h2>
              <p className="mt-1 text-xs text-slate-500">{t('labels.contentBlocksDescription')}</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              {t('labels.blockCount', { count: formatter.number(blocks.length) })}
            </div>
          </div>
          <NoteEditor value={blocks} onChange={handleBlocksChange} disabled={saving} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/note"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
          >
            {t('buttons.cancel')}
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t('buttons.saving') : t('buttons.saveDraft')}
          </button>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isCoverMediaOpen}
        onClose={() => setIsCoverMediaOpen(false)}
        onSelect={handleCoverMediaSelect}
      />
    </DashboardLayout>
  );
}
