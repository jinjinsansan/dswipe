'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPDetail } from '@/types';
import { BlockType, BlockContent, TemplateBlock } from '@/types/templates';
import { getTemplateById } from '@/lib/templates';
import TemplateSelector from '@/components/TemplateSelector';
import BlockEditor from '@/components/BlockEditor';
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
  const lpId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [blocks, setBlocks] = useState<LPBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

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
      
      // ステップデータをブロックに変換
      // TODO: バックエンドAPIがcontent_dataをサポートしたら、そこから読み込む
      const convertedBlocks: LPBlock[] = response.data.steps.map((step: any, index: number) => ({
        id: step.id,
        blockType: 'hero-1' as BlockType, // デフォルト
        content: {
          title: 'タイトル',
          subtitle: 'サブタイトル',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
        },
        order: index,
      }));
      
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
    try {
      // TODO: バックエンドAPIにcontent_dataを送信
      // 現在は仮のロジック
      console.log('Saving blocks:', blocks);
      
      alert('保存しました！（デモ）');
    } catch (err: any) {
      alert(err.response?.data?.detail || '保存に失敗しました');
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
              {/* 編集/プレビュー切替 */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isEditing
                    ? 'bg-gray-700 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isEditing ? '✏️ 編集モード' : '👁️ プレビューモード'}
              </button>

              {/* ステータス */}
              <span className={`px-3 py-1 text-sm rounded-full ${
                lp.status === 'published'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {lp.status === 'published' ? '公開中' : '下書き'}
              </span>

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
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ツールバー */}
        {isEditing && (
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
              ブロックをクリックして編集 | 左側のボタンで並び替え・削除
            </p>
          </div>
        )}

        {/* ブロックエディタ */}
        <div className={`${isEditing ? 'max-w-7xl mx-auto' : 'max-w-full'}`}>
          <BlockEditor
            blocks={blocks}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onMoveBlock={handleMoveBlock}
            isEditing={isEditing}
          />
        </div>

        {/* ヒント */}
        {isEditing && blocks.length > 0 && (
          <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-2xl mr-3">💡</div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">編集のヒント</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• テキストをクリックして直接編集できます</li>
                  <li>• 左側のボタンでブロックを並び替えたり削除したりできます</li>
                  <li>• プレビューモードで実際の表示を確認できます</li>
                  <li>• 保存を忘れずに！</li>
                </ul>
              </div>
            </div>
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
    </div>
  );
}
