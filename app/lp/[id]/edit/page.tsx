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
          
          const aiResult = JSON.parse(aiDataStr);
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
    // orderプロパティを再計算
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    setBlocks(updatedBlocks);
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
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header - Simplified */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 h-14 flex-shrink-0">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors text-sm font-light"
            >
              ← 戻る
            </Link>
            <div className="w-px h-4 bg-gray-800"></div>
            <div className="text-sm font-light text-white/90">{lp.title}</div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Status */}
            <span className={`px-2 py-1 text-xs rounded font-light ${
              lp.status === 'published'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-700/50 text-gray-400'
            }`}>
              {lp.status === 'published' ? '公開中' : '下書き'}
            </span>

            {/* Public URL (if published) */}
            {lp.status === 'published' && (
              <>
                <a
                  href={`/view/${lp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-light text-blue-400 hover:text-blue-300 border border-gray-800 rounded transition-colors"
                >
                  プレビュー
                </a>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/view/${lp.slug}`;
                    navigator.clipboard.writeText(url);
                    alert('URLをコピーしました！');
                  }}
                  className="px-3 py-1.5 text-xs font-light text-gray-400 hover:text-white border border-gray-800 rounded transition-colors"
                  title="公開URLをコピー"
                >
                  URLコピー
                </button>
              </>
            )}

            {/* Publish Button (if draft) */}
            {lp.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="px-3 py-1.5 text-xs font-light bg-green-600/90 text-white rounded hover:bg-green-600 transition-colors"
              >
                公開
              </button>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-light bg-blue-600/90 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Left: Block List */}
        <div className="w-64 bg-gray-800/30 border-r border-gray-800 overflow-hidden flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="w-full px-3 py-2 bg-blue-600/90 text-white text-sm font-light rounded hover:bg-blue-600 transition-colors"
            >
              + ブロック追加
            </button>
          </div>

          {/* Block List */}
          <div className="p-2 flex-1 overflow-y-auto">
            {blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm font-light">
                ブロックを追加してください
              </div>
            ) : (
              <div className="space-y-1">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    draggable
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
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-3 rounded cursor-move transition-colors ${
                      selectedBlockId === block.id
                        ? 'bg-blue-600/20 border border-blue-600/50'
                        : 'bg-gray-800/50 border border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-light text-gray-400">#{index + 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                    <div className="text-sm font-light text-white/90">{block.blockType}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 bg-white overflow-y-auto">
          <DraggableBlockEditor
            blocks={blocks}
            onUpdateBlock={() => {}}
            onDeleteBlock={() => {}}
            onReorderBlocks={handleReorderBlocks}
            isEditing={false}
            onSelectBlock={setSelectedBlockId}
            selectedBlockId={selectedBlockId || undefined}
          />
        </div>

        {/* Right: Properties Panel */}
        <div className="w-96 bg-gray-800/30 border-l border-gray-800 overflow-hidden flex-shrink-0">
          {selectedBlockId ? (
            <PropertyPanel
              block={blocks.find(b => b.id === selectedBlockId) || null}
              onUpdateContent={handleUpdateSelectedBlock}
              onClose={() => setSelectedBlockId(null)}
              onGenerateAI={handleGenerateAI}
            />
          ) : (
            <div className="p-6 text-center text-gray-500 font-light text-sm">
              ブロックを選択して編集
            </div>
          )}
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
    </div>
  );
}
