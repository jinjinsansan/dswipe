'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  CurrencyYenIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useFormatter, useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { publicApi, noteApi, paymentApi } from '@/lib/api';
import type { PublicNoteDetail } from '@/types';
import NoteRenderer from './NoteRenderer';
import ShareToUnlockButton from './ShareToUnlockButton';
import { getCategoryLabel } from '@/lib/noteCategories';
import { redirectToLogin } from '@/lib/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://d-swipe.com';

const withBasePath = (basePath: string, pathname: string) => {
  if (!basePath || basePath === '/') {
    return pathname;
  }
  if (pathname === '/') {
    return basePath;
  }
  return `${basePath}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
};

interface NoteDetailClientProps {
  slug?: string;
  shareToken?: string;
  basePath?: string;
}

type LoadingState = 'idle' | 'loading' | 'error';

type PurchaseState = 'idle' | 'processing' | 'success' | 'error';

const extractErrorInfo = (error: unknown) => {
  if (typeof error === 'object' && error) {
    const response = (error as {
      response?: {
        status?: number;
        data?: { detail?: unknown };
      };
    }).response;
    return {
      status: response?.status,
      detail: response?.data?.detail,
    };
  }
  return { status: undefined, detail: undefined };
};

export default function NoteDetailClient({ slug, shareToken, basePath = '' }: NoteDetailClientProps) {
  const router = useRouter();
  const t = useTranslations('noteDetail');
  const notePublicT = useTranslations('notePublic');
  const format = useFormatter();
  const locale = useLocale();
  const { token, isAuthenticated, isInitialized, user, pointBalance } = useAuthStore();

  const [note, setNote] = useState<PublicNoteDetail | null>(null);
  const [loading, setLoading] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'points' | 'yen'>('points');
  const [hasManualMethodSelection, setHasManualMethodSelection] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const formatDate = useCallback(
    (value?: string | null) => {
      if (!value) return t('unpublishedLabel');
      try {
        return format.dateTime(new Date(value), {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return value;
      }
    },
    [format, t]
  );

  const fetchNote = useCallback(async () => {
    if (!slug && !shareToken) return;
    setLoading('loading');
    setError(null);
    try {
      const response = shareToken
        ? await publicApi.getNoteByShareToken(shareToken, {
            accessToken: token ?? undefined,
            locale,
          })
        : await publicApi.getNote(slug!, {
            accessToken: token ?? undefined,
            locale,
          });
      const data = response.data;
      setNote(data);
      setHasManualMethodSelection(false);
      if (data.allow_point_purchase) {
        setSelectedMethod('points');
      } else if (data.allow_jpy_purchase) {
        setSelectedMethod('yen');
      } else {
        setSelectedMethod('points');
      }
      setLoading('idle');
    } catch (err: unknown) {
      const { status, detail } = extractErrorInfo(err);
      if (status === 401 || status === 403) {
        try {
          const fallback = shareToken
            ? await publicApi.getNoteByShareToken(shareToken, { locale })
            : await publicApi.getNote(slug!, { locale });
          const fallbackData = fallback.data;
          setNote(fallbackData);
          setHasManualMethodSelection(false);
          if (fallbackData.allow_point_purchase) {
            setSelectedMethod('points');
          } else if (fallbackData.allow_jpy_purchase) {
            setSelectedMethod('yen');
          } else {
            setSelectedMethod('points');
          }
          setLoading('idle');
          setError(null);
          return;
        } catch (fallbackError: unknown) {
          const { detail: fallbackDetail } = extractErrorInfo(fallbackError);
          setError(typeof fallbackDetail === 'string' ? fallbackDetail : t('fetchError'));
        }
      } else {
        setError(typeof detail === 'string' ? detail : t('fetchError'));
      }
      setLoading('error');
    }
  }, [shareToken, slug, token, t, locale]);

  useEffect(() => {
    if (!note || hasManualMethodSelection) {
      return;
    }
    if (note.allow_point_purchase && note.allow_jpy_purchase) {
      if (pointBalance < (note.price_points ?? 0)) {
        setSelectedMethod('yen');
        return;
      }
      setSelectedMethod('points');
      return;
    }
    if (note.allow_point_purchase) {
      setSelectedMethod('points');
      return;
    }
    if (note.allow_jpy_purchase) {
      setSelectedMethod('yen');
    }
  }, [note, pointBalance, hasManualMethodSelection]);

  const handleMethodSelect = useCallback((method: 'points' | 'yen') => {
    setHasManualMethodSelection(true);
    setSelectedMethod(method);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    fetchNote();
  }, [fetchNote, isInitialized]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [shareToken, slug]);

  const handlePurchase = async () => {
    if (!note) return;
    if (!isAuthenticated) {
      redirectToLogin(router);
      return;
    }
    const isPointsPurchase = selectedMethod === 'points';

    if (isPointsPurchase && !note.allow_point_purchase) {
      setPurchaseState('error');
      setPurchaseError(t('pointsNotAvailable'));
      return;
    }

    if (!isPointsPurchase && (!note.allow_jpy_purchase || (note.price_jpy ?? 0) <= 0)) {
      setPurchaseState('error');
      setPurchaseError(t('yenNotAvailable'));
      return;
    }

    const confirmMessage = isPointsPurchase
      ? t('confirmPointsPurchase', {
          title: note.title ?? '',
          pricePoints: note.price_points,
        })
      : t('confirmYenPurchase', {
          title: note.title ?? '',
          priceYen: note.price_jpy ?? 0,
        });

    if (!window.confirm(confirmMessage)) {
      setPurchaseState('idle');
      return;
    }

    setPurchaseState('processing');
    setPurchaseMessage(null);
    setPurchaseError(null);

    try {
      if (isPointsPurchase) {
        const response = await noteApi.purchase(note.id, selectedMethod, { locale });
        const result = response.data;

        setPurchaseState('success');
        setPurchaseMessage(
          t('pointsPurchaseSuccess', { remainingPoints: result.remaining_points })
        );
        setNote((prev) => (prev ? { ...prev, has_access: true } : prev));
        return;
      }

      const quickResponse = await paymentApi.quickCheckout({
        item_type: 'note',
        item_id: note.id,
        locale,
      });
      const { checkout_url: checkoutUrl } = quickResponse.data;
      if (!checkoutUrl) {
        throw new Error(t('checkoutUrlError'));
      }
      setPurchaseState('success');
      setPurchaseMessage(t('redirectingToCheckout'));
      window.location.href = checkoutUrl;
      return;
    } catch (err: unknown) {
      const { status, detail } = extractErrorInfo(err);
      setPurchaseState('error');
      const detailMessage = typeof detail === 'string' ? detail : null;
      if (status === 400 && detailMessage === '請求先情報を設定してください') {
        alert(t('billingProfileRequired'));
        const redirectPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        const search = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
        router.push(`/profile${search}`);
        return;
      }
      if (detailMessage) {
        if (detailMessage.includes('ポイントが不足')) {
          setPurchaseError(t('pointsBalanceInsufficient'));
        } else {
          setPurchaseError(detailMessage);
        }
      } else {
        setPurchaseError(t('genericPurchaseError'));
      }
    }
  };

  const isAuthor = useMemo(() => {
    if (!note || !user) return false;
    return note.author_id === user.id;
  }, [note, user]);

  const canonicalUrl = useMemo(() => {
    const normalizedOrigin = SITE_ORIGIN ? SITE_ORIGIN.replace(/\/$/, '') : '';
    const normalizedBase = basePath && basePath !== '/' ? basePath : '';
    if (shareUrl) {
      return shareUrl;
    }
    if (shareToken) {
      return `${normalizedOrigin}${normalizedBase}/notes/share/${shareToken}`;
    }
    const slugValue = note?.slug || slug;
    return `${normalizedOrigin}${normalizedBase}/notes/${slugValue}`;
  }, [note?.slug, shareToken, shareUrl, slug, basePath]);

  const shareLinks = useMemo(() => {
    const title = note?.title ? `${note.title}` : 'Swipeコラム';
    const encodedUrl = encodeURIComponent(canonicalUrl);
    const encodedTitle = encodeURIComponent(title);
    return {
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    };
  }, [canonicalUrl, note?.title]);

  if (!isInitialized) {
    return (
      <div className="flex h-80 items-center justify-center text-slate-500">{t('initializing')}</div>
    );
  }

  if (loading === 'loading') {
    return (
      <div className="flex h-80 items-center justify-center text-slate-500">
        <ArrowPathIcon className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        {t('loading')}
      </div>
    );
  }

  if (loading === 'error' || !note) {
    return (
      <div className="mx-auto max-w-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
        {error ?? t('notFound')}
      </div>
    );
  }

  const isPointsSelected = selectedMethod === 'points';
  const canPurchase = note.allow_point_purchase || note.allow_jpy_purchase;
  const methodAvailable = isPointsSelected
    ? note.allow_point_purchase
    : note.allow_jpy_purchase && (note.price_jpy ?? 0) > 0;
  const purchaseButtonLabel = !isAuthenticated
    ? t('loginToPurchase')
    : isPointsSelected
      ? t('purchaseButtonPoints', { pricePoints: note.price_points })
      : t('purchaseButtonQuickYen', { priceYen: note.price_jpy ?? 0 });
  const mustLoginToView = note.requires_login && !isAuthenticated;

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 rounded-3xl bg-white px-4 py-6 shadow-sm sm:px-10 sm:py-12">
      {note.cover_image_url ? (
        <div className="relative -mx-4 -mt-6 overflow-hidden bg-slate-200 sm:-mx-10">
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <Image
              src={note.cover_image_url}
              alt={note.title}
              fill
              className="object-contain object-center bg-slate-200"
              sizes="(max-width: 640px) 100vw, 640px"
              priority
            />
          </div>
        </div>
      ) : null}

      <header className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
            Swipeコラム
          </span>
          <span>
            {t('publishedAtLabel')}{' '}
            {formatDate(note.published_at)}
          </span>
          <span className="flex items-center gap-2">
            {t('priceLabel')}
            {note.is_paid ? (
              <span className="flex items-center gap-2">
                {note.allow_point_purchase && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {format.number(note.price_points)} pt
                  </span>
                )}
                {note.allow_jpy_purchase && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    ¥{format.number(note.price_jpy ?? 0)}
                  </span>
                )}
                {!note.allow_point_purchase && !note.allow_jpy_purchase && (
                  <span className="text-xs text-slate-500">{t('priceNotConfigured')}</span>
                )}
              </span>
            ) : (
              t('freeLabel')
            )}
          </span>
          <span className="flex items-center gap-1">
            {t('authorLabel')}
            {note.author_username ? (
              <Link
                href={`/u/${note.author_username}`}
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                @{note.author_username}
              </Link>
            ) : (
              <span>@unknown</span>
            )}
          </span>
          {isAuthor ? <span className="font-semibold text-emerald-600">{t('youAreAuthor')}</span> : null}
          </div>
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{note.title}</h1>
        {note.excerpt ? (
          <p className="text-base text-slate-600 sm:text-lg">{note.excerpt}</p>
        ) : null}
        {Array.isArray(note.categories) && note.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {note.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                #{notePublicT(`categories.${category}`, { default: getCategoryLabel(category) })}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <section className="flex flex-col gap-8">
        {mustLoginToView ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-6 text-sm text-blue-900">
            <p className="font-semibold">{t('loginRequiredTitle')}</p>
            <p className="mt-2 text-xs text-blue-700/80">{t('loginRequiredDescription')}</p>
            <button
              type="button"
              onClick={() => redirectToLogin(router)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-blue-400 bg-white px-5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              {t('loginRequiredAction')}
            </button>
          </div>
        ) : null}

        <NoteRenderer
          editorType={note.editor_type}
          blocks={Array.isArray(note.content_blocks) ? note.content_blocks : []}
          richContent={note.rich_content}
          showPaidSeparator={note.is_paid && !note.has_access}
          alwaysShowPaidBadge={note.is_paid}
        />

        {note.is_paid && !note.has_access ? (
          <div className="space-y-4">
            {note.allow_share_unlock && (
              <ShareToUnlockButton
                noteId={note.id}
                pricePoints={note.price_points}
                allowShareUnlock={note.allow_share_unlock}
                officialTweetId={note.official_share_tweet_id}
                officialTweetUrl={note.official_share_tweet_url}
                officialXUsername={note.official_share_x_username}
                basePath={basePath}
                onShareSuccess={() => {
                  /** no-op */
                }}
              />
            )}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-center text-sm text-amber-700">
              <p className="font-semibold">{t('paidContentTitle')}</p>
              <p className="mt-2 text-xs text-amber-700/80">
                {t('paidContentDescription')}
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {purchaseMessage ? (
                  <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                    {purchaseMessage}
                  </div>
                ) : null}
                {purchaseError ? (
                  <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {purchaseError}
                  </div>
                ) : null}
                {canPurchase ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {note.allow_point_purchase && (
                      <button
                        type="button"
                        onClick={() => handleMethodSelect('points')}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          isPointsSelected
                            ? 'border-blue-400 bg-white'
                            : 'border-amber-100 bg-white/60 hover:border-blue-300'
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {t('pointsPaymentTitle')}
                        </p>
                        <p className="mt-1 text-lg font-bold text-blue-600">
                          {format.number(note.price_points)} pt
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">{t('pointsPaymentNote')}</p>
                      </button>
                    )}
                    {note.allow_jpy_purchase && (
                      <button
                        type="button"
                        onClick={() => handleMethodSelect('yen')}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          !isPointsSelected
                            ? 'border-emerald-400 bg-white'
                            : 'border-amber-100 bg-white/60 hover:border-emerald-300'
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {t('yenPaymentTitle')}
                        </p>
                        <p className="mt-1 text-lg font-bold text-emerald-600">
                          ¥{format.number(note.price_jpy ?? 0)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">{t('yenPaymentNote')}</p>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700/80">{t('noPaymentMethods')}</p>
                )}
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={purchaseState === 'processing' || !methodAvailable || !canPurchase}
                  className={`inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 ${
                    purchaseState === 'processing' ? 'opacity-70' : ''
                  }`}
                >
                  {isPointsSelected ? (
                    <SparklesIcon
                      className={`h-4 w-4 ${purchaseState === 'processing' ? 'animate-pulse' : ''}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <CurrencyYenIcon
                      className={`h-4 w-4 ${purchaseState === 'processing' ? 'animate-pulse' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                  {purchaseState === 'processing' ? t('processing') : purchaseButtonLabel}
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {t('purchaseDisclaimer')}
                </p>
                {!isAuthenticated ? (
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-blue-600 underline underline-offset-4"
                  >
                    {t('loginPrompt')}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t('shareHeading')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={shareLinks.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <XIcon className="h-4 w-4" />
              {t('shareOnX')}
            </a>
            <a
              href={shareLinks.line}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100"
            >
              <LineIcon className="h-4 w-4" />
              {t('shareOnLine')}
            </a>
          </div>
        </div>
      </section>

      {note.is_paid && note.has_access ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            <span>{t('accessGrantedMessage')}</span>
          </div>
          {purchaseMessage ? (
            <p className="mt-2 text-xs text-emerald-600/80">{purchaseMessage}</p>
          ) : null}
        </div>
      ) : null}

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div className="flex flex-wrap gap-2">
          <Link
            href={withBasePath(basePath, '/notes')}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {t('backToNotes')}
          </Link>
          <Link
            href={withBasePath(basePath, '/note')}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {t('editNote')}
          </Link>
        </div>
        <span className="text-[10px] text-slate-400">@{note.author_username ?? 'unknown'}</span>
      </footer>
    </article>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18.3 4.5H21l-6.32 7.21L21.67 19.5H16.2l-4.05-4.73-4.63 4.73H3.15l6.75-7.09L2.67 4.5h5.58l3.65 4.26 4.4-4.26Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3.5c-5.24 0-9.5 3.47-9.5 7.76 0 3.06 1.97 5.66 4.92 6.93-.1.79-.36 2.18-.41 2.46-.06.37.14.36.3.27.13-.07 2.13-1.4 2.99-1.97.7.1 1.42.16 2.17.16 5.24 0 9.5-3.47 9.5-7.75 0-4.29-4.26-7.76-9.5-7.76Zm-2.3 9.35H7.97V8.25a.5.5 0 0 1 1 0v3.6h.73a.5.5 0 1 1 0 1Zm3.29 0H12a.5.5 0 0 1-.5-.5V8.25a.5.5 0 1 1 1 0v3.6h.49a.5.5 0 1 1 0 1Zm3.76 0h-1.98a.5.5 0 0 1-.5-.5V8.25a.5.5 0 1 1 1 0v3.1h1.48a.5.5 0 1 1 0 1Z"
        fill="currentColor"
      />
    </svg>
  );
}
