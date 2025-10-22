'use client';

import React, { useState } from 'react';
import {
  AdjustmentsHorizontalIcon,
  ChartBarSquareIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { aiApi } from '@/lib/api';

interface Suggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  expected_impact: string;
}

interface AIImprovementPanelProps {
  lpId: string;
  analyticsData?: any;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

export default function AIImprovementPanel({ lpId, analyticsData, onApplySuggestion }: AIImprovementPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const response = await aiApi.improve({
        lp_id: lpId,
        analytics_data: analyticsData || {
          total_views: 100,
          cta_conversion_rate: 5.2,
          step_funnel: [
            { step: 1, views: 100, exits: 20 },
            { step: 2, views: 80, exits: 15 },
            { step: 3, views: 65, exits: 10 },
          ],
        },
      });

      setSuggestions(response.data.suggestions || []);
      setOverallScore(response.data.overall_score);
      setReasoning(response.data.reasoning);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '優先度: 高';
      case 'medium':
        return '優先度: 中';
      case 'low':
        return '優先度: 低';
      default:
        return priority;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-white">
            <ChartBarSquareIcon className="h-5 w-5" aria-hidden="true" />
            <h3 className="font-semibold text-lg">AI改善提案</h3>
          </div>
          <p className="text-gray-400 text-sm mt-1">分析データに基づいた最適化提案</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              分析中...
            </span>
          ) : (
            'AI分析開始'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {overallScore !== null && (
        <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-white">
                <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                <h4 className="font-semibold">総合スコア</h4>
              </div>
              <p className="text-gray-400 text-sm">{reasoning}</p>
            </div>
            <div className="text-5xl font-bold text-white">
              {overallScore}
              <span className="text-2xl text-gray-400">/100</span>
            </div>
          </div>
        </div>
      )}

      {suggestions.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-white font-semibold">改善提案</h4>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg border border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(suggestion.priority)}`}>
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {getPriorityLabel(suggestion.priority)}
                </span>
                <span className="text-xs text-gray-500">{suggestion.type}</span>
              </div>

              <h5 className="text-white font-semibold mb-2">{suggestion.issue}</h5>
              <p className="text-gray-400 text-sm mb-3">{suggestion.suggestion}</p>

              {suggestion.expected_impact && (
                <div className="bg-green-500/10 border border-green-500/30 rounded px-3 py-2 mb-3">
                  <div className="text-green-400 text-xs font-semibold mb-1">期待される効果</div>
                  <div className="text-green-300 text-sm">{suggestion.expected_impact}</div>
                </div>
              )}

              {onApplySuggestion && (
                <button
                  onClick={() => onApplySuggestion(suggestion)}
                  className="w-full px-4 py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  この提案を適用
                </button>
              )}
            </div>
          ))}
        </div>
      ) : !isAnalyzing && (
        <div className="text-center py-8">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/70">
            <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-gray-400 text-sm">AI分析を実行すると、LPの改善提案が表示されます</p>
        </div>
      )}
    </div>
  );
}
