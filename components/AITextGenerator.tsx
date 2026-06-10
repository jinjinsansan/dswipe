'use client';

import React, { useState } from 'react';
import { aiApi } from '@/lib/api';

interface AITextGeneratorProps {
  type: 'headline' | 'subtitle' | 'description' | 'cta';
  context: {
    product?: string;
    target?: string;
    business?: string;
    goal?: string;
    headline?: string;
    features?: string[];
  };
  onSelect: (text: string) => void;
  onClose: () => void;
}

export default function AITextGenerator({ type, context, onSelect, onClose }: AITextGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const typeLabels = {
    headline: '見出し',
    subtitle: 'サブタイトル',
    description: '説明文',
    cta: 'CTAボタン文言',
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await aiApi.generateText({
        type,
        context,
        options: { count: 5 },
      });
      setSuggestions(response.data.generated_text);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">🤖 AI文章生成</h2>
            <p className="text-slate-500 text-sm mt-1">{typeLabels[type]}を生成します</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* コンテキスト表示 */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-slate-900 font-semibold mb-3">コンテキスト情報</h3>
          <div className="space-y-2 text-sm">
            {context.product && (
              <div className="flex gap-2">
                <span className="text-slate-500">商品・サービス:</span>
                <span className="text-slate-900">{context.product}</span>
              </div>
            )}
            {context.business && (
              <div className="flex gap-2">
                <span className="text-slate-500">業種:</span>
                <span className="text-slate-900">{context.business}</span>
              </div>
            )}
            {context.target && (
              <div className="flex gap-2">
                <span className="text-slate-500">ターゲット:</span>
                <span className="text-slate-900">{context.target}</span>
              </div>
            )}
            {context.goal && (
              <div className="flex gap-2">
                <span className="text-slate-500">目的:</span>
                <span className="text-slate-900">{context.goal}</span>
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-6">
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-slate-500 mb-6">
                AIが魅力的な{typeLabels[type]}を生成します
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    生成中...
                  </span>
                ) : (
                  '✨ AI生成開始'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-slate-900 font-semibold mb-4">生成された候補（クリックして選択）</h3>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(suggestion);
                    onClose();
                  }}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-500 rounded-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-slate-500 text-xs mb-1">候補 {index + 1}</div>
                      <div className="text-slate-900 group-hover:text-blue-400 transition-colors">
                        {suggestion}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                🔄 別の候補を生成
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-slate-500 text-xs text-center">
            💡 気に入った文章を選択すると、自動的に適用されます
          </p>
        </div>
      </div>
    </div>
  );
}
