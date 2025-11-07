'use client';

import { useEffect, useMemo, useState } from 'react';
import {useFormatter, useTranslations} from 'next-intl';

import { getErrorMessage } from '@/lib/errorHandler';
import { useAccountShareStore } from '@/store/accountShareStore';

const STATUS_CLASS: Record<'pending' | 'active' | 'revoked', string> = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  revoked: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export default function AccountShareManager() {
  const {
    ownerShares,
    delegateShares,
    fetchOwnerShares,
    fetchDelegateShares,
    inviteDelegate,
    revokeShare,
    inviteStatus,
  } = useAccountShareStore();

  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const t = useTranslations('settings.accountShare');
  const formatter = useFormatter();

  const statusLabels = useMemo(
    () => ({
      pending: t('status.pending'),
      active: t('status.active'),
      revoked: t('status.revoked'),
    }),
    [t]
  );

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return t('date.notAvailable');
    }
    try {
      return formatter.dateTime(new Date(value), {dateStyle: 'short', timeStyle: 'short'});
    } catch (error) {
      return t('date.notAvailable');
    }
  };

  useEffect(() => {
    fetchOwnerShares().catch((error) => {
      console.error('Failed to load owner shares:', error);
    });
    fetchDelegateShares().catch((error) => {
      console.error('Failed to load delegated shares:', error);
    });
  }, [fetchOwnerShares, fetchDelegateShares]);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setInviteUrl(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: t('feedback.emailRequired') });
      return;
    }

    try {
      const response = await inviteDelegate({ email: trimmed });
      setFeedback({ type: 'success', message: t('feedback.inviteSent') });
      setInviteUrl(response.invite_url);
      setEmail('');
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setFeedback({ type: 'success', message: t('feedback.copySuccess') });
    } catch {
      setFeedback({ type: 'error', message: t('feedback.copyError') });
    }
  };

  const handleRevoke = async (shareId: string) => {
    const shouldRevoke = window.confirm(t('confirm.revoke'));
    if (!shouldRevoke) return;
    try {
      await revokeShare(shareId);
      setFeedback({ type: 'success', message: t('feedback.revokeSuccess') });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <header className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">{t('sections.invite.heading')}</h2>
            <p className="text-sm text-slate-500">
              {t('sections.invite.description')}
            </p>
          </header>

          {feedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-slate-700">
                {t('sections.invite.emailLabel')}
              </label>
              <input
                id="inviteEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder={t('sections.invite.emailPlaceholder')}
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={inviteStatus === 'loading'}
              >
                {inviteStatus === 'loading' ? t('buttons.sendingInvite') : t('buttons.sendInvite')}
              </button>

              {inviteUrl && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {t('buttons.copyInvite')}
                </button>
              )}
            </div>

            {inviteUrl && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-700">{t('sections.invite.linkHeading')}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{inviteUrl}</p>
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t('sections.owner.heading')}</h2>
            <p className="text-sm text-slate-500">{t('sections.owner.description')}</p>
          </div>
        </header>

        {ownerShares.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {t('sections.owner.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                    {t('sections.owner.table.user')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                    {t('sections.owner.table.status')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                    {t('sections.owner.table.dates')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-600">
                    {t('sections.owner.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownerShares.map((share) => (
                  <tr key={share.share_id} className="bg-white">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{share.delegate_username || share.delegate_email || t('misc.unknownUser')}</span>
                        <span className="text-xs text-slate-500">{share.delegate_email ?? t('misc.emailMissing')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[share.status]}`}>
                        {statusLabels[share.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="space-y-1">
                        <div>{t('date.invited', {value: formatDateTime(share.invited_at)})}</div>
                        <div>{t('date.expires', {value: formatDateTime(share.expires_at)})}</div>
                        {share.accepted_at && <div>{t('date.accepted', {value: formatDateTime(share.accepted_at)})}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {share.status !== 'revoked' ? (
                        <button
                          type="button"
                          onClick={() => handleRevoke(share.share_id)}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          {t('buttons.revokeShare')}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">{t('status.revoked')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{t('sections.delegate.heading')}</h2>
          <p className="text-sm text-slate-500">{t('sections.delegate.description')}</p>
        </header>

        {delegateShares.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {t('sections.delegate.empty')}
          </p>
        ) : (
          <div className="space-y-3">
            {delegateShares.map((share) => (
              <div key={share.share_id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{share.owner_username || share.owner_email || t('misc.ownerUnknown')}</p>
                    <p className="text-xs text-slate-500">{share.owner_email ?? t('misc.emailMissing')}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[share.status]}`}>
                    {statusLabels[share.status]}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <div>{t('date.invited', {value: formatDateTime(share.invited_at)})}</div>
                  <div>{t('date.expires', {value: formatDateTime(share.expires_at)})}</div>
                  {share.accepted_at && <div>{t('date.accepted', {value: formatDateTime(share.accepted_at)})}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
