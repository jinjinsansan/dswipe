'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface AIWizardProps {
  onComplete: (result: any) => void;
  onSkip: () => void;
}

export default function AIWizard({ onComplete, onSkip }: AIWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    business: '',
    target: '',
    goal: '',
    description: '',
  });

  const questions = [
    {
      step: 1,
      question: 'どんなLPを作りますか？',
      field: 'business',
      options: [
        { value: '美容・化粧品', label: '💄 美容・化粧品', icon: '💄' },
        { value: '健康・サプリ', label: '💊 健康・サプリ', icon: '💊' },
        { value: '食品・飲料', label: '🍽️ 食品・飲料', icon: '🍽️' },
        { value: '教育・スクール', label: '📚 教育・スクール', icon: '📚' },
        { value: 'IT・SaaS', label: '💻 IT・SaaS', icon: '💻' },
        { value: 'その他', label: '🎯 その他', icon: '🎯' },
      ],
    },
    {
      step: 2,
      question: '誰に向けたLPですか？',
      field: 'target',
      options: [
        { value: '10-20代', label: '👦 10-20代', icon: '👦' },
        { value: '30-40代', label: '👨 30-40代', icon: '👨' },
        { value: '50代以上', label: '👴 50代以上', icon: '👴' },
        { value: '法人', label: '🏢 法人', icon: '🏢' },
        { value: '性別問わず', label: '👥 性別問わず', icon: '👥' },
      ],
    },
    {
      step: 3,
      question: 'ゴールは何ですか？',
      field: 'goal',
      options: [
        { value: '商品購入', label: '🛒 商品購入', icon: '🛒' },
        { value: '資料請求', label: '📄 資料請求', icon: '📄' },
        { value: '問い合わせ', label: '💬 問い合わせ', icon: '💬' },
        { value: 'メール登録', label: '📧 メール登録', icon: '📧' },
        { value: 'セミナー申込', label: '🎓 セミナー申込', icon: '🎓' },
      ],
    },
  ];

  const currentQuestion = questions[step - 1];

  const handleOptionClick = (value: string) => {
    setFormData({ ...formData, [currentQuestion.field]: value });
    
    // 自動的に次のステップに進む（step 4まで）
    if (step < 4) {
      setTimeout(() => setStep(step + 1), 300);
    }
  };

  const handleGenerateLP = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/ai/wizard', formData);
      onComplete(response.data);
    } catch (error) {
      console.error('AI生成エラー:', error);
      alert('AI生成に失敗しました。スキップして手動で作成してください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-gray-700">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">🤖 AIアシスタント</h2>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              スキップ
            </button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 質問 */}
        {step <= 3 ? (
          <div>
            <h3 className="text-2xl font-semibold text-white mb-8">
              {currentQuestion.question}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    formData[currentQuestion.field as keyof typeof formData] === option.value
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.icon}</div>
                  <div className="text-white font-semibold">{option.label.replace(option.icon, '').trim()}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              商品・サービスについて教えてください
            </h3>
            <p className="text-gray-400 mb-6">
              簡単に説明してください。AIが魅力的な見出しや構成を提案します。
            </p>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="例：30代女性向けのアンチエイジング美容液。天然成分100%で肌に優しく、シワやたるみに効果的です。"
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleGenerateLP}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    AI生成中...
                  </span>
                ) : (
                  '🚀 AIにLP構成を提案してもらう'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        {step <= 3 && step > 1 && (
          <div className="mt-8">
            <button
              onClick={() => setStep(step - 1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 前の質問に戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
