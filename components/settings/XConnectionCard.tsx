'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import {useFormatter, useTranslations} from 'next-intl';

import { useAuthStore } from '@/store/authStore';

interface XConnectionStatus {
  is_connected: boolean;
  x_username?: string;
  x_user_id?: string;
  connected_at?: string;
  followers_count?: number;
}

export default function XConnectionCard() {
  const { token } = useAuthStore();
  const [status, setStatus] = useState<XConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const t = useTranslations('settings.xConnection');
  const formatter = useFormatter();
  const benefitItems = t.raw('benefits.items') as string[];

  const fetchConnectionStatus = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/auth/x/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch X connection status:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  const handleConnect = async () => {
    if (!token) {
      window.alert(t('alerts.loginRequired'));
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      // 認証トークン付きでOAuth認証URLを取得
      const response = await fetch(`${apiUrl}/auth/x/authorize?redirect=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 認証URLにリダイレクト
        window.location.href = data.authorization_url;
      } else {
        throw new Error(t('errors.authorizationFailed'));
      }
    } catch (error) {
      console.error('Failed to initiate X connection:', error);
      window.alert(t('alerts.startFailed'));
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(t('confirmDisconnect'))) {
      return;
    }

    setDisconnecting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const response = await fetch(`${apiUrl}/auth/x/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setStatus({ is_connected: false });
        window.alert(t('alerts.disconnectSuccess'));
      } else {
        throw new Error(t('errors.disconnectFailed'));
      }
    } catch (error) {
      console.error('Failed to disconnect X:', error);
      window.alert(t('alerts.disconnectFailed'));
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{t('title')}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
              status?.is_connected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {status?.is_connected ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : (
              <XMarkIcon className="h-4 w-4" />
            )}
            {status?.is_connected ? t('status.connected') : t('status.disconnected')}
          </span>
          {status?.is_connected ? (
            <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
          ) : (
            <XMarkIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>
      </div>

      {status?.is_connected ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">{t('connected.heading')}</span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700">{t('connected.accountLabel')}</span>
                <span className="font-semibold">@{status.x_username}</span>
              </div>
              {status.followers_count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">{t('connected.followersLabel')}</span>
                  <span className="font-semibold">{t('connected.followersValue', {count: formatter.number(status.followers_count)})}</span>
                </div>
              )}
              {status.connected_at && (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">{t('connected.connectedAtLabel')}</span>
                  <span className="font-semibold">
                    {formatter.dateTime(new Date(status.connected_at), {dateStyle: 'medium'})}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {disconnecting ? t('connected.disconnecting') : t('connected.disconnectButton')}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900">{t('benefits.heading')}</h4>
            <ul className="mt-2 space-y-2 text-sm text-blue-800">
              {benefitItems.map((item, index) => (
                <li key={`benefit-${index}`} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleConnect}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t('connectButton')}
          </button>

          <p className="text-center text-xs text-slate-500">
            {t('permissionsNote')}
          </p>
        </div>
      )}
    </div>
  );
}
