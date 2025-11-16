'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { lpApi, productApi } from '@/lib/api';
import { loadTemplateBundle, type TemplateDataBundle } from '@/lib/templates';
import type { TemplateBlock } from '@/types/templates';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errorHandler';
import AIWizard from '@/components/AIWizard';
import type { AIGenerationResponse } from '@/types/api';
import { ArrowLeftIcon, DocumentIcon, SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';

export default function CreateLPPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [templateData, setTemplateData] = useState<TemplateDataBundle | null>(null);
  const [showWizard, setShowWizard] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<AIGenerationResponse | null>(null);
  const templateMetaSource = useMemo(() => {
    if (!templateData) {
      return [] as TemplateBlock[];
    }
    return [
      ...templateData.templateLibrary,
      ...templateData.infoProductBlocks,
      ...templateData.contactBlocks,
      ...templateData.tokushoBlocks,
      ...templateData.newsletterBlocks,
      ...templateData.handwrittenBlocks,
    ];
  }, [templateData]);

  useEffect(() => {
    let mounted = true;
    loadTemplateBundle().then((bundle) => {
      if (!mounted) {
        return;
      }
      setTemplateData(bundle);
    });

    return () => {
      mounted = false;
    };
  }, []);
  const outlinePreview = useMemo(() => {
    if (!aiSuggestion) return [] as string[];
    if (aiSuggestion.outline?.length) {
      return aiSuggestion.outline;
    }
    return aiSuggestion.blocks.map((block) => {
      const template =
        templateMetaSource.find((item) => item.templateId === block.blockType) ??
        templateMetaSource.find((item) => item.id === block.blockType);
      return template?.name ?? block.blockType;
    });
  }, [aiSuggestion, templateMetaSource]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    swipe_direction: 'vertical' as 'vertical' | 'horizontal',
    is_fullscreen: true,
    product_id: '',
    show_swipe_hint: false,
    fullscreen_media: false,
    floating_cta: false,
    visibility: 'private' as 'public' | 'limited' | 'private',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 商品一覧取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.list();
        const productsData = response.data?.products || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('商品一覧取得エラー:', error);
      }
    };

    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const field = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleWizardComplete = (result: AIGenerationResponse) => {
    // AI提案を保存
    setAiSuggestion(result);
    setShowWizard(false);
    
    // 提案されたタイトルをフォームに自動入力
    const heroBlock = result.blocks?.[0];
    const heroTitle = typeof heroBlock?.content?.title === 'string' ? heroBlock.content.title : '';
    if (heroTitle) {
      setFormData({
        ...formData,
        title: heroTitle,
        slug: heroTitle
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
      // 空文字列のproduct_idはnullに変換
      const payload = {
        ...formData,
        product_id: formData.product_id || null,
      };
      
      const response = await lpApi.create(payload);
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

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* AIウィザード */}
      {showWizard && (
        <AIWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
      )}

      <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              ダッシュボードに戻る
            </Link>
            <div className="text-lg font-semibold text-slate-900 tracking-[0.08em]">Ｄ－swipe</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
            <DocumentIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">新規LP作成</h1>
          <p className="text-slate-600">基本情報を入力してLPを作成します</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                LPタイトル <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="例: 新商品キャンペーン"
              />
              <p className="mt-1 text-sm text-slate-500">ダッシュボードに表示される名前です</p>
            </div>

            {/* スラッグ */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-2">
                スラッグ（URL） <span className="text-red-400">*</span>
              </label>
              <input
                id="slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="例: new-product-campaign"
              />
              <p className="mt-1 text-sm text-slate-500">
                公開URL: https://swipelaunch.com/lp/<span className="text-blue-500">{formData.slug || 'your-slug'}</span>
              </p>
            </div>

            {/* 公開範囲 */}
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-2">公開範囲</p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">公開（誰でもアクセス可能）</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="limited"
                    checked={formData.visibility === 'limited'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    限定公開（URLを知っている人だけ閲覧可能）
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">非公開（ダッシュボードのみ表示）</span>
                </label>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                限定公開を選択すると、保存後に限定URLが自動発行されます。
              </p>
            </div>

            {/* 商品選択 */}
            <div>
              <label htmlFor="product_id" className="block text-sm font-medium text-slate-700 mb-2">
                紐づける商品
              </label>
              <select
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">選択しない（後で設定可能）</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title || `商品ID: ${product.id}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-slate-500">
                CTAボタンから購入ページへ自動リンクされます
              </p>
            </div>

            {/* スワイプ方向 */}
            <div>
              <label htmlFor="swipe_direction" className="block text-sm font-medium text-slate-700 mb-2">
                スワイプ方向
              </label>
              <select
                id="swipe_direction"
                name="swipe_direction"
                value={formData.swipe_direction}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="vertical">縦スワイプ（↓）</option>
                <option value="horizontal">横スワイプ（→）</option>
              </select>
              <p className="mt-1 text-sm text-slate-500">ユーザーがLPをスワイプする方向を選択</p>
            </div>

            {/* フルスクリーン */}
            <div className="flex items-center">
              <input
                id="is_fullscreen"
                type="checkbox"
                name="is_fullscreen"
                checked={formData.is_fullscreen}
                onChange={handleChange}
                className="w-4 h-4 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="is_fullscreen" className="ml-2 text-sm text-slate-700">
                フルスクリーン表示
              </label>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '作成中...' : 'LP作成 →'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>

        {/* ヒント - AI提案がある場合 */}
        {aiSuggestion && (
          <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-start mb-4">
              <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <SparklesIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-emerald-700 font-semibold mb-1">AI提案</h3>
                <p className="text-emerald-600 text-sm">
                  テーマ: <span className="font-medium">{aiSuggestion.theme}</span>
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-slate-900 font-semibold">推奨構成:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                {outlinePreview.map((entry, index) => (
                  <li key={index}>{entry}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* ヒント */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <LightBulbIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-blue-700 font-semibold mb-1">次のステップ</h3>
              <p className="text-slate-600 text-sm">
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
