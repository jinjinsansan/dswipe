'use client';

import React, { useState, useEffect } from 'react';
import { BlockType, BlockContent } from '@/types/templates';

interface Hint {
  id: string;
  type: 'tip' | 'warning' | 'success' | 'ai';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface RealtimeHintsProps {
  blocks: Array<{
    id: string;
    blockType: BlockType;
    content: BlockContent;
    order: number;
  }>;
  selectedBlockId: string | null;
  lpData?: any;
  onApplyHint?: (hintId: string) => void;
}

export default function RealtimeHints({ blocks, selectedBlockId, lpData, onApplyHint }: RealtimeHintsProps) {
  const [hints, setHints] = useState<Hint[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // ヒントを生成
    const generatedHints = generateHints(blocks, selectedBlockId, lpData);
    setHints(generatedHints);
  }, [blocks, selectedBlockId, lpData]);

  const generateHints = (
    blocks: Array<{ id: string; blockType: BlockType; content: BlockContent; order: number }>,
    selectedBlockId: string | null,
    lpData?: any
  ): Hint[] => {
    const hints: Hint[] = [];

    // ブロック数が少ない場合
    if (blocks.length === 0) {
      hints.push({
        id: 'no-blocks',
        type: 'tip',
        title: 'ブロックを追加しましょう',
        message: 'テンプレートライブラリから最適なブロックを選んで、魅力的なLPを作成しましょう。',
      });
    }

    if (blocks.length > 0 && blocks.length < 3) {
      hints.push({
        id: 'few-blocks',
        type: 'tip',
        title: 'もう少しコンテンツを追加',
        message: '効果的なLPには通常5-10個のブロックが必要です。価格表やお客様の声を追加してみましょう。',
      });
    }

    // ヒーローブロックがない場合
    const hasHero = blocks.some(b => b.blockType.startsWith('hero'));
    if (blocks.length > 0 && !hasHero) {
      hints.push({
        id: 'no-hero',
        type: 'warning',
        title: 'ヒーローブロックがありません',
        message: 'LPの最初にヒーローブロックを配置すると、訪問者の注意を引きやすくなります。',
      });
    }

    // CTAブロックがない場合
    const hasCTA = blocks.some(b => b.blockType.startsWith('cta'));
    if (blocks.length > 2 && !hasCTA) {
      hints.push({
        id: 'no-cta',
        type: 'warning',
        title: 'CTAブロックがありません',
        message: 'コンバージョンを高めるため、明確なCTAブロックを追加しましょう。',
      });
    }

    // 社会的証明がない場合
    const hasTestimonial = blocks.some(b => b.blockType.startsWith('testimonial'));
    if (blocks.length > 3 && !hasTestimonial) {
      hints.push({
        id: 'no-testimonial',
        type: 'tip',
        title: 'お客様の声を追加しませんか？',
        message: '社会的証明は信頼性を高め、コンバージョン率を向上させます。',
      });
    }

    // 選択されたブロックに関するヒント
    if (selectedBlockId) {
      const selectedBlock = blocks.find(b => b.id === selectedBlockId);
      if (selectedBlock) {
        const blockHints = getBlockSpecificHints(selectedBlock);
        hints.push(...blockHints);
      }
    }

    // ブロックの順序に関するヒント
    if (blocks.length > 0) {
      const firstBlock = blocks[0];
      const lastBlock = blocks[blocks.length - 1];

      if (!firstBlock.blockType.startsWith('hero')) {
        hints.push({
          id: 'first-not-hero',
          type: 'tip',
          title: '最初のブロックの最適化',
          message: 'LPの最初はヒーローブロックにすると、訪問者の関心を引きやすくなります。',
        });
      }

      if (!lastBlock.blockType.startsWith('cta')) {
        hints.push({
          id: 'last-not-cta',
          type: 'tip',
          title: '最後にCTAを配置',
          message: 'LPの最後はCTAブロックで締めくくると、行動を促しやすくなります。',
        });
      }
    }

    return hints.slice(0, 3); // 最大3つまで表示
  };

  const getBlockSpecificHints = (block: { blockType: BlockType; content: BlockContent }): Hint[] => {
    const hints: Hint[] = [];
    const content = block.content as any;

    // タイトルが短すぎる/長すぎる
    if (content.title) {
      const titleLength = content.title.length;
      if (titleLength < 10) {
        hints.push({
          id: 'title-too-short',
          type: 'tip',
          title: 'タイトルが短いです',
          message: 'もう少し詳しいタイトルにすると、メッセージが伝わりやすくなります。AI生成を試してみましょう。',
        });
      } else if (titleLength > 60) {
        hints.push({
          id: 'title-too-long',
          type: 'warning',
          title: 'タイトルが長すぎます',
          message: '60文字以内に収めると、読みやすくなります。',
        });
      }
    }

    // ボタンテキストがない
    if (block.blockType.startsWith('cta') && (!content.buttonText || content.buttonText.length < 3)) {
      hints.push({
        id: 'no-button-text',
        type: 'warning',
        title: 'ボタン文言を設定してください',
        message: '明確なアクションを促す文言を設定しましょう。例：「今すぐ始める」「無料で試す」',
      });
    }

    // 価格表にプランが少ない
    if (block.blockType.startsWith('pricing') && content.plans && content.plans.length < 2) {
      hints.push({
        id: 'few-pricing-plans',
        type: 'tip',
        title: '複数プランの提示',
        message: '2-3つのプランを提示すると、ユーザーが選びやすくなります。',
      });
    }

    // FAQが少ない
    if (block.blockType.startsWith('faq') && content.faqs && content.faqs.length < 3) {
      hints.push({
        id: 'few-faqs',
        type: 'tip',
        title: 'FAQを追加',
        message: '最低3-5個のFAQを用意すると、不安や疑問を解消しやすくなります。',
      });
    }

    return hints;
  };

  if (hints.length === 0 || isDismissed) {
    return null;
  }

  const getHintIcon = (type: Hint['type']) => {
    switch (type) {
      case 'tip':
        return '💡';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'ai':
        return '🤖';
      default:
        return '💡';
    }
  };

  const getHintColor = (type: Hint['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/50 text-green-400';
      case 'ai':
        return 'bg-purple-500/10 border-purple-500/50 text-purple-400';
      default:
        return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div className="space-y-3">
      {hints.map((hint) => (
        <div
          key={hint.id}
          className={`rounded-lg border p-4 ${getHintColor(hint.type)}`}
        >
          <div className="flex items-start">
            <div className="text-2xl mr-3">{getHintIcon(hint.type)}</div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{hint.title}</h4>
              <p className="text-sm opacity-90">{hint.message}</p>
              {hint.action && (
                <button
                  onClick={hint.action.onClick}
                  className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  {hint.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-white transition-colors ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
