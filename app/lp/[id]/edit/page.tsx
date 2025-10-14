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
import RealtimeHints from '@/components/RealtimeHints';
import AIImprovementPanel from '@/components/AIImprovementPanel';
import { PageLoader, EditorSkeleton } from '@/components/LoadingSpinner';
import { convertAIResultToBlocks } from '@/lib/aiToBlocks';
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
  const { isAuthenticated } = useAuthStore();
  
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [blocks, setBlocks] = useState<LPBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGeneratorConfig, setAiGeneratorConfig] = useState<any>(null);
  const [showAIImprovement, setShowAIImprovement] = useState(false);

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
      
      // AI提案がクエリパラメータにある場合は、それをブロックに変換
      const aiParam = searchParams.get('ai');
      if (aiParam && response.data.steps.length === 0) {
        try {
          const aiResult = JSON.parse(decodeURIComponent(aiParam));
          const aiBlocks = convertAIResultToBlocks(aiResult);
          setBlocks(aiBlocks);
          // URLからAIパラメータを削除
          router.replace(`/lp/${lpId}/edit`);
          return;
        } catch (e) {
          console.error('AI結果のパースエラー:', e);
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
    setBlocks(blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          content: {
            ...block.content,
            [field]: value,
          },
        };
      }
      return block;
    }));
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleReorderBlocks = (reorderedBlocks: LPBlock[]) => {
    setBlocks(reorderedBlocks);
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
      // 既存のステップを更新 + 新規ステップを作成
      for (const block of blocks) {
        const stepData = {
          step_order: block.order,
          image_url: 'imageUrl' in block.content ? (block.content as any).imageUrl || '/placeholder.jpg' : '/placeholder.jpg',
          block_type: block.blockType,
          content_data: block.content as unknown as Record<string, unknown>,
        };

        if (block.id.startsWith('ai-block-') || block.id.startsWith('block-')) {
          // 新規ブロック（まだDBに保存されていない）
          await lpApi.addStep(lpId, stepData);
        } else {
          // 既存ブロック（DBに保存済み）
          await lpApi.updateStep(lpId, block.id, stepData);
        }
      }
      
      alert('保存しました！');
      // ページを再読み込みして最新データを取得
      fetchLP();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                SwipeLaunch
              </Link>
              <div className="text-sm text-gray-400">
                編集中: <span className="text-white">{lp.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* ビューモード切替 */}
              <div className="flex gap-2 bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ✏️ 編集
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${
                    viewMode === 'split'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ 分割
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  👁️ プレビュー
                </button>
              </div>

              {/* AI改善パネル切替 */}
              <button
                onClick={() => setShowAIImprovement(!showAIImprovement)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  showAIImprovement
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                🤖 AI改善
              </button>

              {/* ステータスと公開URL */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  lp.status === 'published'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {lp.status === 'published' ? '公開中' : '下書き'}
                </span>
                
                {lp.status === 'published' && (
                  <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
                    <a
                      href={`/view/${lp.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      🔗 公開URL
                    </a>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/view/${lp.slug}`;
                        navigator.clipboard.writeText(url);
                        alert('URLをコピーしました！');
                      }}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      title="URLをコピー"
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>

              {/* 保存ボタン */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '💾 保存'}
              </button>

              {/* 公開ボタン */}
              {lp.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  🚀 公開
                </button>
              )}

              {/* 戻る */}
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← 戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${viewMode === 'split' ? 'h-[calc(100vh-80px)]' : ''}`}>
        {error && (
          <div className="mb-4 mx-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 分割ビュー */}
        {viewMode === 'split' ? (
          <div className="flex h-full">
            {/* 左側: エディタ */}
            <div className="w-1/2 border-r border-gray-700 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">エディタ</h2>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  + ブロック追加
                </button>
              </div>

              {/* リアルタイムヒント */}
              <div className="mb-4">
                <RealtimeHints
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  lpData={lp}
                />
              </div>

              {/* AI改善パネル */}
              {showAIImprovement && (
                <div className="mb-4">
                  <AIImprovementPanel lpId={lpId} />
                </div>
              )}

              <DraggableBlockEditor
                blocks={blocks}
                onUpdateBlock={handleUpdateBlock}
                onDeleteBlock={handleDeleteBlock}
                onReorderBlocks={handleReorderBlocks}
                isEditing={true}
                onSelectBlock={setSelectedBlockId}
                selectedBlockId={selectedBlockId || undefined}
              />
            </div>

            {/* 右側: プレビュー & プロパティ */}
            <div className="w-1/2 overflow-y-auto">
              {/* プロパティパネル */}
              {selectedBlockId && (
                <div className="sticky top-0 z-10 p-4 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
                  <PropertyPanel
                    block={blocks.find(b => b.id === selectedBlockId) || null}
                    onUpdateContent={handleUpdateSelectedBlock}
                    onClose={() => setSelectedBlockId(null)}
                    onGenerateAI={handleGenerateAI}
                  />
                </div>
              )}

              {/* プレビュー */}
              <div className="bg-white">
                <DraggableBlockEditor
                  blocks={blocks}
                  onUpdateBlock={() => {}}
                  onDeleteBlock={() => {}}
                  onReorderBlocks={() => {}}
                  isEditing={false}
                />
              </div>
            </div>
          </div>
        ) : (
          /* 単一ビュー（編集 or プレビュー） */
          <div className="container mx-auto px-4 py-8">
            {viewMode === 'edit' && (
              <div className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold text-lg">ブロック編集</h2>
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
                  >
                    + ブロック追加
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  ドラッグして並び替え | ブロックをクリックして選択
                </p>
              </div>
            )}

            <div className={`${viewMode === 'edit' ? 'max-w-7xl mx-auto' : 'max-w-full bg-white'}`}>
              <DraggableBlockEditor
                blocks={blocks}
                onUpdateBlock={handleUpdateBlock}
                onDeleteBlock={handleDeleteBlock}
                onReorderBlocks={handleReorderBlocks}
                isEditing={viewMode === 'edit'}
                onSelectBlock={setSelectedBlockId}
                selectedBlockId={selectedBlockId || undefined}
              />
            </div>

            {/* プロパティパネル（編集モード時） */}
            {viewMode === 'edit' && selectedBlockId && (
              <div className="fixed right-4 top-24 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
                <PropertyPanel
                  block={blocks.find(b => b.id === selectedBlockId) || null}
                  onUpdateContent={handleUpdateSelectedBlock}
                  onClose={() => setSelectedBlockId(null)}
                  onGenerateAI={handleGenerateAI}
                />
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
