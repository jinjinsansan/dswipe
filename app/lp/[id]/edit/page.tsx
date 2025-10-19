'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPDetail } from '@/types';
import { BlockType, BlockContent, TemplateBlock } from '@/types/templates';
import TemplateSelector from '@/components/TemplateSelector';
import DraggableBlockEditor from '@/components/DraggableBlockEditor';
import PropertyPanel from '@/components/PropertyPanel';
import AITextGenerator from '@/components/AITextGenerator';
import ColorThemeGenerator from '@/components/ColorThemeGenerator';
import { PageLoader, EditorSkeleton } from '@/components/LoadingSpinner';
import { convertAIResultToBlocks } from '@/lib/aiToBlocks';
import { applyThemeShadesToBlock } from '@/lib/themeApplier';
import type { AIGenerationResponse } from '@/types/api';
import type { ColorShades } from '@/lib/colorGenerator';

// モバイル用タブ型定義
type TabType = 'blocks' | 'preview' | 'properties';
// UUID生成のヘルパー関数
function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface LPBlock {
  id: string;
  blockType: BlockType;
  content: BlockContent;
  order: number;
}

export default function EditLPNewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lpId = params.id as string;
  const { isAuthenticated, isInitialized } = useAuthStore();
  
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [blocks, setBlocks] = useState<LPBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGeneratorConfig, setAiGeneratorConfig] = useState<any>(null);
  const [lpTitle, setLpTitle] = useState('');
  const [lpSettings, setLpSettings] = useState({
    showSwipeHint: false,
    fullscreenMedia: false,
    floatingCta: true,
  });
  const [metaSettings, setMetaSettings] = useState({
    title: '',
    description: '',
    imageUrl: '',
    siteName: '',
  });
  const [mobileTab, setMobileTab] = useState<TabType>('preview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showColorGenerator, setShowColorGenerator] = useState(false);
  const [customThemeShades, setCustomThemeShades] = useState<ColorShades | null>(null);
  const [customThemeHex, setCustomThemeHex] = useState<string>('#DC2626');

  useEffect(() => {
    // 初期化が完了するまで待つ
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchLP();
  }, [isAuthenticated, isInitialized, lpId]);

  const fetchLP = async () => {
    try {
      const response = await lpApi.get(lpId);
      setLp(response.data);
      setLpTitle(response.data.title || '');
      setLpSettings({
        showSwipeHint: Boolean(response.data.show_swipe_hint),
        fullscreenMedia: Boolean(response.data.fullscreen_media),
        floatingCta: true,
      });
      setMetaSettings({
        title: response.data.meta_title ?? '',
        description: response.data.meta_description ?? '',
        imageUrl: response.data.meta_image_url ?? '',
        siteName: response.data.meta_site_name ?? '',
      });

      // カスタムテーマを復元
      if (response.data.custom_theme_hex) {
        setCustomThemeHex(response.data.custom_theme_hex);
      }
      if (response.data.custom_theme_shades) {
        setCustomThemeShades(response.data.custom_theme_shades as unknown as ColorShades);
      }
      
      // AI提案がsessionStorageにある場合は、それをブロックに変換
      const aiParam = searchParams.get('ai');
      if (aiParam === 'true' && response.data.steps.length === 0) {
        try {
          const aiDataStr = sessionStorage.getItem('aiSuggestion');
          if (!aiDataStr) {
            console.error('❌ AI提案データがsessionStorageにありません');
            setIsLoading(false);
            return;
          }
          
          const aiResult = JSON.parse(aiDataStr) as AIGenerationResponse;
          // 使用後は削除
          sessionStorage.removeItem('aiSuggestion');
          
          console.log('🤖 AI提案を適用中...');
          const aiBlocks = convertAIResultToBlocks(aiResult);
          console.log('📦 Converted to blocks:', aiBlocks);
          
          if (aiBlocks.length === 0) {
            console.error('❌ No blocks generated from AI result');
            setIsLoading(false);
            return;
          }
          
          // AI提案から生成したブロックをDBに保存
          console.log('💾 Saving AI-generated blocks to database...');
          let savedCount = 0;
          let failedCount = 0;
          
          for (const block of aiBlocks) {
            try {
              const stepData = {
                step_order: block.order,
                image_url: 'imageUrl' in block.content ? (block.content as any).imageUrl || '/placeholder.jpg' : '/placeholder.jpg',
                block_type: block.blockType,
                content_data: block.content as unknown as Record<string, unknown>,
              };
              await lpApi.addStep(lpId, stepData);
              savedCount++;
              console.log(`✅ Saved block ${savedCount}/${aiBlocks.length}:`, block.blockType);
            } catch (blockError: any) {
              failedCount++;
              console.error(`❌ Failed to save block ${block.blockType}:`, blockError.response?.data || blockError.message);
            }
          }
          
          console.log(`✅ AI blocks saved: ${savedCount} succeeded, ${failedCount} failed`);
          
          // URLからAIパラメータを削除して再読み込み
          router.replace(`/lp/${lpId}/edit`);
          // 保存したブロックを再読み込み
          setTimeout(() => fetchLP(), 100);
          return;
        } catch (e: any) {
          console.error('❌ AI結果の処理エラー:', e);
          console.error('エラー詳細:', e.message, e.stack);
          const errorMsg = e.response?.data?.detail || e.message || 'AI提案の適用に失敗しました';
          setError(errorMsg);
          alert(`エラー: ${errorMsg}\n\n一部のブロックがスキップされた可能性があります。続行しますか？`);
        }
      }
      
      // ステップデータをブロックに変換
      const convertedBlocks: LPBlock[] = response.data.steps.map((step: any) => {
        // content_dataが存在すれば使用、なければデフォルト
        let content: BlockContent;
        if (step.content_data && Object.keys(step.content_data).length > 0) {
          content = step.content_data as BlockContent;
        } else {
          // 旧形式（image_urlのみ）の場合のフォールバック
          content = {
            title: 'タイトルを入力',
            subtitle: 'サブタイトルを入力',
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
            imageUrl: step.image_url,
          } as any;
        }

        return {
          id: step.id,
          blockType: (step.block_type || 'hero-1') as BlockType,
          content,
          order: step.step_order,
        };
      });
      
      setBlocks(convertedBlocks);
    } catch (err) {
      setError('LPの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = (template: TemplateBlock) => {
    const newBlock: LPBlock = {
      id: generateId(),
      blockType: template.templateId,
      content: { ...template.defaultContent },
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (blockId: string, field: string, value: any) => {
    const setNestedValue = (content: BlockContent, path: string, newValue: any): BlockContent => {
      if (!path.includes('.')) {
        return {
          ...content,
          [path]: newValue,
        };
      }

      const segments = path.split('.');
      const cloned = structuredClone(content) as Record<string, any>;
      let cursor: any = cloned;

      for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i];
        const nextKey = segments[i + 1];

        if (Array.isArray(cursor)) {
          const index = Number(key);
          if (!cursor[index]) {
            cursor[index] = /^\d+$/.test(nextKey) ? [] : {};
          }
          cursor = cursor[index];
        } else {
          if (!(key in cursor) || cursor[key] == null) {
            cursor[key] = /^\d+$/.test(nextKey) ? [] : {};
          }
          cursor = cursor[key];
        }
      }

      const lastKey = segments[segments.length - 1];
      if (Array.isArray(cursor)) {
        cursor[Number(lastKey)] = newValue;
      } else {
        cursor[lastKey] = newValue;
      }

      return cloned as BlockContent;
    };

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          content: setNestedValue(block.content, field, value),
        };
      }),
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleReorderBlocks = (reorderedBlocks: LPBlock[]) => {
    // orderプロパティを再計算
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    setBlocks(updatedBlocks);
  };

  const handleApplyTheme = async (shades: ColorShades, hex: string) => {
    // テーマシェードを保存
    setCustomThemeShades(shades);
    setCustomThemeHex(hex);
    
    // ブロックタイプによってカラー適用するかを判定
    const colorableBlockTypes = [
      'hero-1', 'hero-2', 'hero-3', 'hero-aurora',
      'text-img-1', 'text-img-2', 'text-img-3',
      'pricing-1', 'pricing-2', 'pricing-3',
      'testimonial-1', 'testimonial-2', 'testimonial-3',
      'faq-1', 'faq-2',
      'features-1', 'features-2', 'features-aurora',
      'cta-1', 'cta-2', 'cta-3',
      'stats-1', 'timeline-1', 'team-1',
      'countdown-1', 'special-price-1', 'bonus-list-1',
      'guarantee-1', 'problem-1', 'before-after-1',
      'author-profile-1', 'urgency-1', 'scarcity-1', 'sticky-cta-1',
      'comparison-1', 'logo-grid-1'
    ];
    
    // 11段階のシェードをブロックごとに適用
    setBlocks((prev) =>
      prev.map((block) => {
        // テキストを持つブロックのみカラー適用
        if (colorableBlockTypes.includes(block.blockType)) {
          return applyThemeShadesToBlock(block, shades);
        }
        // 画像オンリーのブロック（image-1, gallery, video等）はスキップ
        return block;
      }),
    );

    // テーマを LP に保存
    try {
      const lpUpdateResponse = await lpApi.update(lpId, {
        custom_theme_hex: hex,
        custom_theme_shades: shades as unknown as Record<string, string>,
      });
      
      if (lpUpdateResponse.data) {
        setLp((prev) =>
          prev
            ? {
                ...prev,
                custom_theme_hex: hex,
                custom_theme_shades: shades as unknown as Record<string, string>,
              }
            : prev
        );
        console.log('✅ テーマが正常に保存されました');
        console.log('📊 11段階のシェードを全ブロックに適用しました');
      }
    } catch (err: any) {
      console.error('❌ テーマ保存エラー:', err);
      const errorDetail = err?.response?.data?.detail || err?.message || '不明なエラー';
      setError(`テーマの保存に失敗しました: ${errorDetail}`);
    }
  };

  const handleUpdateSelectedBlock = (field: string, value: any) => {
    if (!selectedBlockId) return;
    handleUpdateBlock(selectedBlockId, field, value);
  };

  const handleGenerateAI = (type: 'headline' | 'subtitle' | 'description' | 'cta', field: string) => {
    if (!selectedBlockId) return;
    
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) return;

    // AI生成のコンテキストを作成
    const context = {
      product: lp?.title,
      headline: 'title' in block.content ? (block.content as any).title : undefined,
      business: 'LP作成',
      target: '一般ユーザー',
      goal: 'コンバージョン',
    };

    setAiGeneratorConfig({ type, field, context });
    setShowAIGenerator(true);
  };

  const handleAITextSelect = (text: string) => {
    if (!selectedBlockId || !aiGeneratorConfig) return;
    handleUpdateBlock(selectedBlockId, aiGeneratorConfig.field, text);
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    // スワップ
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    // orderを再計算
    newBlocks.forEach((block, idx) => {
      block.order = idx;
    });

    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const orderedBlocks = blocks.map((block, index) => ({
        ...block,
        order: index,
      }));

      const normalizeMetaValue = (value: string) => {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      // LP本体の表示設定を更新
      const lpUpdateResponse = await lpApi.update(lpId, {
        title: lpTitle.trim() || undefined,
        show_swipe_hint: lpSettings.showSwipeHint,
        fullscreen_media: lpSettings.fullscreenMedia,
        floating_cta: true,
        meta_title: normalizeMetaValue(metaSettings.title),
        meta_description: normalizeMetaValue(metaSettings.description),
        meta_image_url: normalizeMetaValue(metaSettings.imageUrl),
        meta_site_name: normalizeMetaValue(metaSettings.siteName),
        custom_theme_hex: customThemeHex,
        custom_theme_shades: customThemeShades as unknown as Record<string, string> | null,
      });
      setLp((prev) =>
        prev
          ? {
              ...prev,
              ...lpUpdateResponse.data,
            }
          : prev
      );

      const latestStepsResponse = await lpApi.get(lpId);
      const latestSteps = latestStepsResponse.data?.steps ?? [];

      // 既存ステップを一度全削除してから最新順序で再作成
      if (latestSteps.length > 0) {
        for (const step of latestSteps) {
          await lpApi.deleteStep(lpId, step.id);
        }
      }

      const recreatedBlocks: LPBlock[] = [];
      for (const block of orderedBlocks) {
        const stepData = {
          step_order: block.order,
          image_url: 'imageUrl' in block.content ? (block.content as any).imageUrl || '/placeholder.jpg' : '/placeholder.jpg',
          block_type: block.blockType,
          content_data: block.content as unknown as Record<string, unknown>,
        };

        const response = await lpApi.addStep(lpId, stepData);
        const createdStep = response?.data;
        recreatedBlocks.push({
          ...block,
          id: createdStep?.id ?? block.id,
          order: stepData.step_order,
        });
      }
      
      alert('保存しました！');
      setBlocks(recreatedBlocks);
      // ページを再読み込みして最新データを取得
      await fetchLP();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || '保存に失敗しました';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSaving(false);
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
    return <PageLoader />;
  }

  if (!lp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">LPが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 h-14 flex-shrink-0">
        <div className="h-full px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link 
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-medium"
            >
              ← 戻る
            </Link>
            <div className="text-xs sm:text-sm font-semibold text-white truncate">{lp.title}</div>
          </div>

          {/* Right: Actions */}
          {/* Desktop Actions - Full Menu */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs rounded font-semibold ${
              lp.status === 'published'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              {lp.status === 'published' ? '公開中' : '下書き'}
            </span>

            {lp.status === 'published' && (
              <>
                <a
                  href={`/view/${lp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-blue-300 hover:text-blue-200 border border-gray-800 rounded transition-colors"
                >
                  プレビュー
                </a>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/view/${lp.slug}`;
                    navigator.clipboard.writeText(url);
                    alert('URLをコピーしました！');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white border border-gray-800 rounded transition-colors"
                  title="公開URLをコピー"
                >
                  URLコピー
                </button>
              </>
            )}

            {lp.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="px-3 py-1.5 text-xs font-semibold bg-green-600/90 text-white rounded hover:bg-green-600 transition-colors"
              >
                公開
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600/90 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>

          {/* Mobile Actions - Always Visible */}
          <div className="flex lg:hidden items-center gap-1.5 flex-shrink-0">
            {/* Quick Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
              title="保存"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
            </button>

            {/* Quick Publish Button */}
            {lp.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="p-2 text-green-400 hover:text-green-300 transition-colors"
                title="公開"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="メニュー"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Modal */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/50">
              <h3 className="text-white font-semibold">メニュー</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Status Display */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 text-sm">ステータス</span>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  lp.status === 'published'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {lp.status === 'published' ? '公開中' : '下書き'}
                </span>
              </div>

              {/* Primary Actions */}
              <div className="space-y-3 pt-2">
                {/* Save Button */}
                <button
                  onClick={() => {
                    handleSave();
                    setShowMobileMenu(false);
                  }}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  </svg>
                  {isSaving ? '保存中...' : '💾 保存'}
                </button>

                {/* Publish/Preview Button */}
                {lp.status === 'draft' && (
                  <button
                    onClick={() => {
                      handlePublish();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    🚀 公開
                  </button>
                )}
                {lp.status === 'published' && (
                  <a
                    href={`/view/${lp.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    👁️ プレビュー
                  </a>
                )}
              </div>

              {/* Secondary Actions */}
              {lp.status === 'published' && (
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/view/${lp.slug}`;
                      navigator.clipboard.writeText(url);
                      alert('URLをコピーしました！');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition-colors min-h-[44px] flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.586 4.586a2 2 0 112.828 2.828l-.793.793-2.828-2.829.793-.793zM12.539 12.539L9.404 9.404m9.146-5.404a2 2 0 010 2.828l-.793.793m2.828 2.828a4 4 0 01-5.656 0l-4-4a4 4 0 015.656-5.656l1.102 1.101m-.758 4.899a2 2 0 001.768-3.468A2 2 0 0014 6l1.586 1.586" />
                    </svg>
                    🔗 URLをコピー
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - 3 Column Layout (Desktop) / Tab-based Layout (Mobile) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* モバイル用タブ */}
        <div className="lg:hidden flex-shrink-0 border-b border-gray-800 bg-gray-900/50">
          <div className="flex gap-1 px-2 py-2 overflow-x-auto">
            <button
              onClick={() => setMobileTab('blocks')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'blocks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              📋 ブロック
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              👁️ プレビュー
            </button>
            <button
              onClick={() => setMobileTab('properties')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'properties'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              ⚙️ 設定
            </button>
          </div>
        </div>

        {/* Left: Block List */}
        <div className={`flex-col min-h-0 bg-gray-800/30 border-gray-800 overflow-hidden flex ${
          mobileTab === 'blocks' ? 'flex' : 'hidden lg:flex'
        } flex-shrink-0 w-full lg:w-64 lg:border-r border-b lg:border-b-0`}>
          <div className="py-3 lg:py-3 border-b border-gray-800">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="w-full px-3 py-2.5 lg:py-2 bg-blue-600/90 text-white text-sm font-semibold hover:bg-blue-600 transition-colors min-h-[44px] lg:min-h-auto"
            >
              + ブロック追加
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {/* モバイルではLP設定とSNSメタ情報を非表示 */}
            <div className="hidden lg:block py-3 border-b border-gray-800 space-y-3 bg-gray-900/20 flex-shrink-0">
              <h4 className="text-xs font-bold text-gray-300 tracking-wide">LP設定</h4>

              <button
                onClick={() => setShowColorGenerator(true)}
                className="w-full px-3 py-2.5 lg:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded font-semibold text-sm min-h-[44px] lg:min-h-auto transition-colors"
              >
                🎨 テーマカラー生成
              </button>

              <label className="flex items-start gap-3 cursor-pointer lg:gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 lg:h-4 lg:w-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                  checked={lpSettings.showSwipeHint}
                  onChange={(e) =>
                    setLpSettings((prev) => ({ ...prev, showSwipeHint: e.target.checked }))
                  }
                />
                <div>
                  <p className="text-sm lg:text-xs text-white font-semibold">スワイプアニメーション</p>
                  <p className="text-xs lg:text-[11px] text-gray-400">1枚目に指アイコンでスワイプを促します</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer lg:gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 lg:h-4 lg:w-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                  checked={lpSettings.fullscreenMedia}
                  onChange={(e) =>
                    setLpSettings((prev) => ({ ...prev, fullscreenMedia: e.target.checked }))
                  }
                />
                <div>
                  <p className="text-sm lg:text-xs text-white font-semibold">メディアの全画面表示</p>
                  <p className="text-xs lg:text-[11px] text-gray-400">画像やHTMLをブラウザ全体に広げます</p>
                </div>
              </label>

              <div className="pt-4 mt-4 border-t border-gray-800 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-gray-300 tracking-wide uppercase">LP名</h5>
                  <p className="text-[11px] text-gray-500 mt-1">ダッシュボードに表示されるLP名を設定できます。</p>
                </div>
                <input
                  type="text"
                  value={lpTitle}
                  onChange={(e) => setLpTitle(e.target.value)}
                  placeholder="LP名（例：春の新商品キャンペーン）"
                  className="w-full px-3 py-2.5 lg:py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-gray-800 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-gray-300 tracking-wide uppercase">SNSメタ情報</h5>
                  <p className="text-[11px] text-gray-500 mt-1">LINEやSNSで共有した際のタイトル・説明・画像を指定できます。</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={metaSettings.title}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="OGPタイトル（例：〇〇講座 特設LP）"
                    className="w-full px-3 py-2.5 lg:py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                  />
                  <textarea
                    value={metaSettings.description}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="OGPディスクリプション（120文字程度の紹介文）"
                    rows={3}
                    className="w-full px-3 py-2.5 lg:py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <input
                    type="text"
                    value={metaSettings.imageUrl}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="OGP画像URL（1200x630推奨）"
                    className="w-full px-3 py-2.5 lg:py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                  />
                  <input
                    type="text"
                    value={metaSettings.siteName}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    placeholder="サイト名（例：ABC情報局）"
                    className="w-full px-3 py-2.5 lg:py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  未入力の場合はD-swipeのデフォルト情報が使用されます。空欄にして保存するとリセットできます。
                </p>
              </div>
            </div>

            {/* Block List - モバイルではブロック一覧のみ */}
            <div className={`py-3 lg:py-4 flex-1 min-h-0 ${mobileTab === 'blocks' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm font-medium">
                  ブロックを追加してください
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable
                      onClick={() => {
                        // モバイル表示ではブロッククリック時に自動的に設定タブに切り替え
                        if (window.innerWidth < 1024) {
                          setMobileTab('properties');
                        }
                        setSelectedBlockId(block.id);
                      }}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/html', block.id);
                        (e.target as HTMLElement).style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        (e.target as HTMLElement).style.opacity = '1';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/html');
                        const draggedIndex = blocks.findIndex(b => b.id === draggedId);
                        const targetIndex = index;

                        if (draggedIndex !== targetIndex) {
                          const newBlocks = [...blocks];
                          const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
                          newBlocks.splice(targetIndex, 0, draggedBlock);
                          handleReorderBlocks(newBlocks);
                        }
                      }}
                      className={`w-full p-3 lg:p-3.5 cursor-move transition-colors min-h-[56px] lg:min-h-[64px] flex items-center ${
                        selectedBlockId === block.id
                          ? 'bg-blue-600/20 border-l-2 border-blue-600'
                          : 'bg-gray-800/50 border-l border-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <span className="text-base font-bold text-blue-300 flex-shrink-0">#{index + 1}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-base font-semibold text-white truncate">{block.blockType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Preview */}
        <div className={`flex-1 min-w-0 bg-white overflow-y-auto flex flex-col ${
          mobileTab === 'preview' ? 'lg:flex' : 'hidden lg:flex'
        }`}>
          <DraggableBlockEditor
            blocks={blocks}
            onUpdateBlock={() => {}}
            onDeleteBlock={() => {}}
            onReorderBlocks={handleReorderBlocks}
            isEditing={false}
            onSelectBlock={setSelectedBlockId}
            selectedBlockId={selectedBlockId || undefined}
            withinEditor
          />
        </div>

        {/* Right: Properties Panel (Desktop) / Bottom Drawer (Mobile) */}
        {/* デスクトップ表示 */}
        <div className={`hidden lg:flex w-96 bg-gray-800/30 border-l border-gray-800 overflow-hidden flex-shrink-0 flex-col`}>
          {selectedBlockId ? (
            <PropertyPanel
              block={blocks.find(b => b.id === selectedBlockId) || null}
              onUpdateContent={handleUpdateSelectedBlock}
              onClose={() => setSelectedBlockId(null)}
              onGenerateAI={handleGenerateAI}
            />
          ) : (
            <div className="p-6 text-center text-gray-400 font-medium text-sm">
              ブロックを選択して編集
            </div>
          )}
        </div>

        {/* モバイル表示: Settings タブ (LP設定 + SNSメタ情報 + ブロック編集) */}
        <div className={`flex-col min-h-0 bg-gray-800/30 border-t border-gray-800 lg:hidden overflow-hidden flex ${
          mobileTab === 'properties' ? 'flex' : 'hidden'
        }`}>
          <div className="overflow-y-auto flex-1 min-h-0">
            {/* LP設定 + SNSメタ情報 */}
            <div className="px-3 py-3 border-b border-gray-800 space-y-3 bg-gray-900/20">
              <h4 className="text-xs font-bold text-gray-300 tracking-wide">LP設定</h4>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                  checked={lpSettings.showSwipeHint}
                  onChange={(e) =>
                    setLpSettings((prev) => ({ ...prev, showSwipeHint: e.target.checked }))
                  }
                />
                <div>
                  <p className="text-sm text-white font-semibold">スワイプアニメーション</p>
                  <p className="text-xs text-gray-400">1枚目に指アイコンでスワイプを促します</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                  checked={lpSettings.fullscreenMedia}
                  onChange={(e) =>
                    setLpSettings((prev) => ({ ...prev, fullscreenMedia: e.target.checked }))
                  }
                />
                <div>
                  <p className="text-sm text-white font-semibold">メディアの全画面表示</p>
                  <p className="text-xs text-gray-400">画像やHTMLをブラウザ全体に広げます</p>
                </div>
              </label>

              <div className="pt-4 mt-4 border-t border-gray-800 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-gray-300 tracking-wide uppercase">LP名</h5>
                  <p className="text-[11px] text-gray-500 mt-1">ダッシュボードに表示されるLP名を設定できます。</p>
                </div>
                <input
                  type="text"
                  value={lpTitle}
                  onChange={(e) => setLpTitle(e.target.value)}
                  placeholder="LP名（例：春の新商品キャンペーン）"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-gray-800 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-gray-300 tracking-wide uppercase">SNSメタ情報</h5>
                  <p className="text-[11px] text-gray-500 mt-1">LINEやSNSで共有した際のタイトル・説明・画像を指定できます。</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={metaSettings.title}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="OGPタイトル（例：〇〇講座 特設LP）"
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  />
                  <textarea
                    value={metaSettings.description}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="OGPディスクリプション（120文字程度の紹介文）"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <input
                    type="text"
                    value={metaSettings.imageUrl}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="OGP画像URL（1200x630推奨）"
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  />
                  <input
                    type="text"
                    value={metaSettings.siteName}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    placeholder="サイト名（例：ABC情報局）"
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  未入力の場合はD-swipeのデフォルト情報が使用されます。空欄にして保存するとリセットできます。
                </p>
              </div>
            </div>

            {/* ブロック編集パネル */}
            {selectedBlockId && (
              <div className="border-t border-gray-800">
                <PropertyPanel
                  block={blocks.find(b => b.id === selectedBlockId) || null}
                  onUpdateContent={handleUpdateSelectedBlock}
                  onClose={() => setSelectedBlockId(null)}
                  onGenerateAI={handleGenerateAI}
                />
              </div>
            )}
          </div>
        </div>
      </main>



      {/* テンプレート選択モーダル */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleAddTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* AI文章生成モーダル */}
      {showAIGenerator && aiGeneratorConfig && (
        <AITextGenerator
          type={aiGeneratorConfig.type}
          context={aiGeneratorConfig.context}
          onSelect={handleAITextSelect}
          onClose={() => {
            setShowAIGenerator(false);
            setAiGeneratorConfig(null);
          }}
        />
      )}

      {/* カラーテーマジェネレーターモーダル */}
      {showColorGenerator && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl my-8">
            <ColorThemeGenerator
              onApply={handleApplyTheme}
              onClose={() => setShowColorGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
