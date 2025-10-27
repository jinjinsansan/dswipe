'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DSwipeLogo from '@/components/DSwipeLogo';
import { PageLoader } from '@/components/LoadingSpinner';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface LineBonusSettings {
  id: string;
  bonus_points: number;
  is_enabled: boolean;
  description: string;
  line_add_url: string;
  created_at: string;
  updated_at: string;
}

export default function LineSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, isAdmin } = useAuthStore();
  
  const [settings, setSettings] = useState<LineBonusSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bonus_points: 300,
    is_enabled: true,
    description: 'LINE公式アカウントを追加して300ポイントGET！',
    line_add_url: 'https://lin.ee/JFvc4dE',
  });

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || !isAdmin)) {
      router.push('/admin');
    }
  }, [isInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchSettings();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      const response = await fetch(`${apiUrl}/line/bonus-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('設定の取得に失敗しました');
      }

      const data = await response.json();
      setSettings(data);
      setFormData({
        bonus_points: data.bonus_points,
        is_enabled: data.is_enabled,
        description: data.description,
        line_add_url: data.line_add_url,
      });
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      const response = await fetch(`${apiUrl}/line/bonus-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '設定の更新に失敗しました');
      }

      const data = await response.json();
      setSettings(data);
      setSuccessMessage('設定を保存しました');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="block">
                <DSwipeLogo size="medium" showFullName={true} />
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-semibold text-gray-900">LINE連携設定</span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              管理者パネルに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {/* タイトル */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LINE連携ボーナス設定</h1>
            <p className="mt-1 text-sm text-gray-600">
              LINE公式アカウント連携時のボーナスポイント数や説明文を変更できます
            </p>
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              {successMessage}
            </div>
          )}

          {/* 設定フォーム */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-6">
              {/* 有効/無効 */}
              <div>
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">キャンペーン有効化</span>
                    <p className="mt-1 text-xs text-gray-500">
                      OFFにすると、LINE連携してもボーナスポイントが付与されなくなります
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_enabled: !formData.is_enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_enabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* ボーナスポイント数 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ボーナスポイント数
                </label>
                <input
                  type="number"
                  value={formData.bonus_points}
                  onChange={(e) => setFormData({ ...formData, bonus_points: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="10000"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="300"
                />
                <p className="mt-2 text-xs text-gray-500">
                  0〜10,000ポイントの範囲で設定できます
                </p>
              </div>

              {/* 説明文 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  説明文
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="LINE公式アカウントを追加して300ポイントGET！"
                />
                <p className="mt-2 text-xs text-gray-500">
                  ユーザーに表示される説明文です（最大500文字）
                </p>
              </div>

              {/* LINE追加URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  LINE追加URL
                </label>
                <input
                  type="url"
                  value={formData.line_add_url}
                  onChange={(e) => setFormData({ ...formData, line_add_url: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://lin.ee/JFvc4dE"
                />
                <p className="mt-2 text-xs text-gray-500">
                  LINE公式アカウントの友達追加URL
                </p>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin"
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? '保存中...' : '設定を保存'}
              </button>
            </div>
          </form>

          {/* 現在の設定情報 */}
          {settings && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">現在の設定情報</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">最終更新日時</dt>
                  <dd className="text-gray-900 font-medium">{new Date(settings.updated_at).toLocaleString('ja-JP')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">作成日時</dt>
                  <dd className="text-gray-900 font-medium">{new Date(settings.created_at).toLocaleString('ja-JP')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">設定ID</dt>
                  <dd className="text-gray-500 text-xs font-mono">{settings.id}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* 注意事項 */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ 注意事項</h4>
            <ul className="space-y-1 text-xs text-yellow-800">
              <li>• 設定変更は即座に反映されます</li>
              <li>• 既にボーナスを受け取ったユーザーには影響しません</li>
              <li>• キャンペーンを無効化しても、既存のLINE連携は解除されません</li>
              <li>• ボーナスポイント数の変更は、変更後に連携するユーザーから適用されます</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
