'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { XMarkIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
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
  };

  const handleConnect = async () => {
    if (!token) {
      alert('ログインが必要です');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
    // OAuth認証URLにリダイレクト
    window.location.href = `${apiUrl}/auth/x/authorize`;
  };

  const handleDisconnect = async () => {
    if (!confirm('X（Twitter）連携を解除しますか？\n解除すると、シェアによるNOTE無料解放ができなくなります。')) {
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
        alert('X連携を解除しました');
      } else {
        throw new Error('連携解除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to disconnect X:', error);
      alert('連携解除に失敗しました。もう一度お試しください。');
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
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">X (Twitter) 連携</h3>
          <p className="mt-1 text-sm text-slate-600">
            有料NOTEをXでシェアして無料で読めるようにします
          </p>
        </div>
        
        {status?.is_connected ? (
          <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
        ) : (
          <XMarkIcon className="h-6 w-6 text-slate-300" />
        )}
      </div>

      {status?.is_connected ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">連携済み</span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700">アカウント:</span>
                <span className="font-semibold">@{status.x_username}</span>
              </div>
              {status.followers_count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">フォロワー:</span>
                  <span className="font-semibold">{status.followers_count.toLocaleString()}人</span>
                </div>
              )}
              {status.connected_at && (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">連携日:</span>
                  <span className="font-semibold">
                    {new Date(status.connected_at).toLocaleDateString('ja-JP')}
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
            {disconnecting ? '解除中...' : '連携を解除'}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900">連携するとできること</h4>
            <ul className="mt-2 space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>有料NOTEをXでシェアして無料で読める</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>お金をかけずに気になる記事を閲覧可能</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>シェアするだけで簡単に記事が解放される</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Xアカウントと連携する
          </button>

          <p className="text-center text-xs text-slate-500">
            連携すると、X（Twitter）でのツイート投稿権限が付与されます
          </p>
        </div>
      )}
    </div>
  );
}
