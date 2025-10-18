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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-2xl border border-white/10 bg-[#070b16]/95 shadow-[0_36px_120px_-60px_rgba(56,189,248,0.6)] flex flex-col">
        <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-3 sm:px-5 sm:px-6 py-3 sm:py-4 sm:py-5 border-b border-white/10 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.32em] text-blue-200/80 mb-1">AI Assistant</p>
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate">🤖 AI文章生成</h2>
            <p className="text-xs text-gray-400 mt-1">{typeLabels[type]}を生成します</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition flex-shrink-0 ml-2"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* Context Info */}
        <div className="relative px-3 sm:px-5 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <h3 className="text-white text-sm font-semibold mb-2 sm:mb-3">コンテキスト情報</h3>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            {context.product && (
              <div className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">商品・サービス:</span>
                <span className="text-white truncate">{context.product}</span>
              </div>
            )}
            {context.business && (
              <div className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">業種:</span>
                <span className="text-white truncate">{context.business}</span>
              </div>
            )}
            {context.target && (
              <div className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">ターゲット:</span>
                <span className="text-white truncate">{context.target}</span>
              </div>
            )}
            {context.goal && (
              <div className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">目的:</span>
                <span className="text-white truncate">{context.goal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="relative flex-1 overflow-y-auto min-h-0 px-3 sm:px-5 sm:px-6 py-4 sm:py-5 sm:py-6">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">✨</div>
              <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
                AIが魅力的な{typeLabels[type]}を生成します
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    生成中...
                  </>
                ) : (
                  '✨ AI生成開始'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-white text-sm font-semibold mb-3 sm:mb-4">生成された候補（クリックして選択）</h3>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(suggestion);
                    onClose();
                  }}
                  className="group relative w-full text-left p-3 sm:p-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:border-blue-400/70 hover:bg-white/[0.05] transition-all hover:shadow-[0_20px_45px_-35px_rgba(59,130,246,0.65)]"
                >
                  <div className="absolute inset-x-0 -top-28 h-32 bg-gradient-to-br from-blue-500/25 via-transparent to-purple-500/25 blur-2xl opacity-0 transition group-hover:opacity-100" />
                  
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-400 text-[10px] sm:text-xs mb-1 uppercase tracking-wider">候補 {index + 1}</div>
                      <div className="text-white group-hover:text-blue-100 transition-colors text-sm sm:text-base break-words">
                        {suggestion}
                      </div>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-3 sm:mt-4 px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 別の候補を生成
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-white/10 bg-white/5 px-3 sm:px-5 sm:px-6 py-2.5 sm:py-3.5 text-center text-[10px] sm:text-[11px] sm:text-xs text-gray-400 flex-shrink-0">
          <span className="font-medium text-white/80">💡 ヒント:</span> <span className="hidden sm:inline">気に入った文章を選択すると、自動的に適用されます</span><span className="sm:hidden">タップで適用</span>
        </div>
      </div>
    </div>
  );
}
