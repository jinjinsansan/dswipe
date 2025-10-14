'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi, mediaApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPDetail, LPStep, CTA } from '@/types';

export default function EditLPPage() {
  const router = useRouter();
  const params = useParams();
  const lpId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'steps' | 'ctas'>('steps');
  
  // ステップ追加フォーム
  const [stepImage, setStepImage] = useState<File | null>(null);
  const [stepUploading, setStepUploading] = useState(false);
  
  // CTA追加フォーム
  const [showCtaForm, setShowCtaForm] = useState(false);
  const [ctaFormData, setCtaFormData] = useState({
    cta_type: 'link' as 'link' | 'form' | 'product' | 'newsletter' | 'line',
    button_position: 'bottom' as 'top' | 'bottom' | 'floating',
    link_url: '',
    step_id: '',
  });
  const [ctaImage, setCtaImage] = useState<File | null>(null);
  const [ctaUploading, setCtaUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchLP();
  }, [isAuthenticated, lpId]);

  const fetchLP = async () => {
    try {
      const response = await lpApi.get(lpId);
      setLp(response.data);
    } catch (err) {
      setError('LPの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!stepImage) {
      alert('画像を選択してください');
      return;
    }

    setStepUploading(true);
    try {
      // 画像アップロード
      const uploadResponse = await mediaApi.upload(stepImage, {
        optimize: true,
        max_width: 1080,
        max_height: 1920,
      });
      const imageUrl = uploadResponse.data.url;

      // ステップ追加
      const stepOrder = lp?.steps.length || 0;
      await lpApi.addStep(lpId, {
        step_order: stepOrder,
        image_url: imageUrl,
      });

      // リロード
      await fetchLP();
      setStepImage(null);
      alert('ステップを追加しました！');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'ステップの追加に失敗しました');
    } finally {
      setStepUploading(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('このステップを削除しますか？')) return;

    try {
      await lpApi.deleteStep(lpId, stepId);
      await fetchLP();
      alert('ステップを削除しました');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'ステップの削除に失敗しました');
    }
  };

  const handleAddCta = async () => {
    if (!ctaImage) {
      alert('CTAボタン画像を選択してください');
      return;
    }

    setCtaUploading(true);
    try {
      // 画像アップロード
      const uploadResponse = await mediaApi.upload(ctaImage, {
        optimize: true,
        max_width: 500,
        max_height: 200,
      });
      const imageUrl = uploadResponse.data.url;

      // CTA追加
      await lpApi.addCta(lpId, {
        ...ctaFormData,
        button_image_url: imageUrl,
        step_id: ctaFormData.step_id || null,
      });

      // リロード
      await fetchLP();
      setCtaImage(null);
      setShowCtaForm(false);
      setCtaFormData({
        cta_type: 'link',
        button_position: 'bottom',
        link_url: '',
        step_id: '',
      });
      alert('CTAを追加しました！');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'CTAの追加に失敗しました');
    } finally {
      setCtaUploading(false);
    }
  };

  const handleDeleteCta = async (ctaId: string) => {
    if (!confirm('このCTAを削除しますか？')) return;

    try {
      await lpApi.deleteCta(ctaId);
      await fetchLP();
      alert('CTAを削除しました');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'CTAの削除に失敗しました');
    }
  };

  const handlePublish = async () => {
    if (!confirm('このLPを公開しますか？')) return;

    try {
      await lpApi.publish(lpId);
      await fetchLP();
      alert('LPを公開しました！');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'LPの公開に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!lp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">LPが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                SwipeLaunch
              </Link>
              <div className="text-sm text-gray-400 mt-1">編集中: {lp.title}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm rounded-full ${
                lp.status === 'published'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {lp.status === 'published' ? '公開中' : '下書き'}
              </span>
              {lp.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  公開する
                </button>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'steps'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            ステップ管理 ({lp.steps.length})
          </button>
          <button
            onClick={() => setActiveTab('ctas')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'ctas'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            CTA管理 ({lp.ctas.length})
          </button>
        </div>

        {/* ステップ管理 */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            {/* ステップ追加 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">ステップを追加</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    画像をアップロード
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStepImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {stepImage && (
                    <p className="mt-2 text-sm text-gray-400">選択: {stepImage.name}</p>
                  )}
                </div>
                <button
                  onClick={handleAddStep}
                  disabled={!stepImage || stepUploading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stepUploading ? 'アップロード中...' : 'ステップを追加'}
                </button>
              </div>
            </div>

            {/* ステップ一覧 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">ステップ一覧</h2>
              {lp.steps.length === 0 ? (
                <p className="text-gray-400 text-center py-8">まだステップがありません</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {lp.steps.sort((a, b) => a.step_order - b.step_order).map((step, index) => (
                    <div key={step.id} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                      <div className="relative aspect-[9/16]">
                        <img
                          src={step.image_url}
                          alt={`Step ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-xs text-gray-400 mb-2">
                          閲覧: {step.step_views} | 離脱: {step.step_exits}
                        </div>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="w-full px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA管理 */}
        {activeTab === 'ctas' && (
          <div className="space-y-6">
            {/* CTA追加ボタン */}
            {!showCtaForm && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <button
                  onClick={() => setShowCtaForm(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
                >
                  + CTAを追加
                </button>
              </div>
            )}

            {/* CTA追加フォーム */}
            {showCtaForm && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">CTAを追加</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CTAタイプ
                    </label>
                    <select
                      value={ctaFormData.cta_type}
                      onChange={(e) => setCtaFormData({ ...ctaFormData, cta_type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="link">リンク</option>
                      <option value="form">フォーム</option>
                      <option value="product">商品</option>
                      <option value="newsletter">メルマガ登録</option>
                      <option value="line">LINE追加</option>
                    </select>
                  </div>

                  {ctaFormData.cta_type === 'link' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        リンクURL
                      </label>
                      <input
                        type="url"
                        value={ctaFormData.link_url}
                        onChange={(e) => setCtaFormData({ ...ctaFormData, link_url: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ボタン位置
                    </label>
                    <select
                      value={ctaFormData.button_position}
                      onChange={(e) => setCtaFormData({ ...ctaFormData, button_position: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="top">上部</option>
                      <option value="bottom">下部</option>
                      <option value="floating">フローティング</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      表示するステップ（オプション）
                    </label>
                    <select
                      value={ctaFormData.step_id}
                      onChange={(e) => setCtaFormData({ ...ctaFormData, step_id: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">全ステップ</option>
                      {lp.steps.map((step, index) => (
                        <option key={step.id} value={step.id}>
                          ステップ #{index + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ボタン画像をアップロード
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCtaImage(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {ctaImage && (
                      <p className="mt-2 text-sm text-gray-400">選択: {ctaImage.name}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleAddCta}
                      disabled={!ctaImage || ctaUploading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ctaUploading ? 'アップロード中...' : 'CTAを追加'}
                    </button>
                    <button
                      onClick={() => setShowCtaForm(false)}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CTA一覧 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">CTA一覧</h2>
              {lp.ctas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">まだCTAがありません</p>
              ) : (
                <div className="space-y-4">
                  {lp.ctas.map((cta) => (
                    <div key={cta.id} className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={cta.button_image_url}
                          alt="CTA Button"
                          className="w-32 h-16 object-cover rounded"
                        />
                        <div>
                          <div className="text-white font-semibold">{cta.cta_type}</div>
                          <div className="text-sm text-gray-400">
                            位置: {cta.button_position} | クリック: {cta.click_count}
                          </div>
                          {cta.link_url && (
                            <div className="text-xs text-blue-400 mt-1">{cta.link_url}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCta(cta.id)}
                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
