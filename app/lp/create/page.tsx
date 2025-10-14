'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { lpApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errorHandler';
import AIWizard from '@/components/AIWizard';

export default function CreateLPPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showWizard, setShowWizard] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    swipe_direction: 'vertical' as 'vertical' | 'horizontal',
    is_fullscreen: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData({
      ...formData,
      title,
      slug,
    });
  };

  const handleWizardComplete = (result: any) => {
    // AI提案を保存
    setAiSuggestion(result);
    setShowWizard(false);
    
    // 提案されたタイトルをフォームに自動入力
    if (result.structure && result.structure[0]) {
      const heroBlock = result.structure[0];
      setFormData({
        ...formData,
        title: heroBlock.title || formData.title,
        slug: (heroBlock.title || formData.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      });
    }
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.slug) {
      setError('タイトルとスラッグを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const response = await lpApi.create(formData);
      const lpId = response.data.id;
      
      // AI提案がある場合は、sessionStorageで渡す（URLエンコーディングエラー回避）
      if (aiSuggestion) {
        sessionStorage.setItem('aiSuggestion', JSON.stringify(aiSuggestion));
        router.push(`/lp/${lpId}/edit?ai=true`);
      } else {
        router.push(`/lp/${lpId}/edit`);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <>
      {/* AIウィザード */}
      {showWizard && (
        <AIWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              SwipeLaunch
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">新規LP作成</h1>
          <p className="text-gray-400">基本情報を入力してLPを作成します</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                LPタイトル <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="例: 新商品キャンペーン"
              />
              <p className="mt-1 text-sm text-gray-500">ダッシュボードに表示される名前です</p>
            </div>

            {/* スラッグ */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                スラッグ（URL） <span className="text-red-400">*</span>
              </label>
              <input
                id="slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="例: new-product-campaign"
              />
              <p className="mt-1 text-sm text-gray-500">
                公開URL: https://swipelaunch.com/lp/<span className="text-blue-400">{formData.slug || 'your-slug'}</span>
              </p>
            </div>

            {/* スワイプ方向 */}
            <div>
              <label htmlFor="swipe_direction" className="block text-sm font-medium text-gray-300 mb-2">
                スワイプ方向
              </label>
              <select
                id="swipe_direction"
                name="swipe_direction"
                value={formData.swipe_direction}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="vertical">縦スワイプ（↓）</option>
                <option value="horizontal">横スワイプ（→）</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">ユーザーがLPをスワイプする方向を選択</p>
            </div>

            {/* フルスクリーン */}
            <div className="flex items-center">
              <input
                id="is_fullscreen"
                type="checkbox"
                name="is_fullscreen"
                checked={formData.is_fullscreen}
                onChange={handleChange}
                className="w-4 h-4 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="is_fullscreen" className="ml-2 text-sm text-gray-300">
                フルスクリーン表示
              </label>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '作成中...' : 'LP作成 →'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>

        {/* ヒント - AI提案がある場合 */}
        {aiSuggestion && (
          <div className="mt-8 bg-green-500/10 border border-green-500/50 rounded-lg p-6">
            <div className="flex items-start mb-4">
              <div className="text-2xl mr-3">🤖</div>
              <div>
                <h3 className="text-green-400 font-semibold mb-1">AI提案</h3>
                <p className="text-gray-400 text-sm">{aiSuggestion.reasoning}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-semibold">推奨構成:</h4>
              <div className="flex flex-wrap gap-2">
                {aiSuggestion.recommended_blocks?.map((block: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                    {block}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ヒント */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h3 className="text-blue-400 font-semibold mb-1">次のステップ</h3>
              <p className="text-gray-400 text-sm">
                LP作成後、編集ページでAI提案に基づいたテンプレートを追加できます。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
