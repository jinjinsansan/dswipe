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
      question: 'どんな情報商材を販売しますか？',
      field: 'business',
      options: [
        { value: '投資・FX・仮想通貨', label: '💰 投資・FX・仮想通貨', icon: '💰' },
        { value: 'ダイエット・筋トレ', label: '💪 ダイエット・筋トレ', icon: '💪' },
        { value: '副業・ビジネス', label: '💼 副業・ビジネス', icon: '💼' },
        { value: '英語・資格学習', label: '📚 英語・資格学習', icon: '📚' },
        { value: '恋愛・モテ術', label: '❤️ 恋愛・モテ術', icon: '❤️' },
        { value: 'SNS・集客・マーケティング', label: '📱 SNS・集客', icon: '📱' },
        { value: '転売・物販・せどり', label: '🏪 転売・物販', icon: '🏪' },
        { value: 'ライティング・Webスキル', label: '✍️ ライティング', icon: '✍️' },
        { value: '自己啓発・コーチング', label: '🧠 自己啓発', icon: '🧠' },
        { value: 'その他ノウハウ', label: '🎯 その他', icon: '🎯' },
      ],
    },
    {
      step: 2,
      question: 'メインターゲットは誰ですか？',
      field: 'target',
      options: [
        { value: '20-30代男性（独身・会社員）', label: '👨 20-30代男性', icon: '👨' },
        { value: '30-40代男性（既婚・経営者志向）', label: '👔 30-40代男性', icon: '👔' },
        { value: '20-30代女性（副業・美容志向）', label: '👩 20-30代女性', icon: '👩' },
        { value: '30-50代女性（主婦・在宅ワーク）', label: '👩‍💼 30-50代女性', icon: '👩‍💼' },
        { value: '学生・フリーター（〜20代）', label: '🎓 学生層', icon: '🎓' },
        { value: '50代以上（老後・資産形成）', label: '👴 シニア層', icon: '👴' },
      ],
    },
    {
      step: 3,
      question: 'どんなアクションが欲しいですか？',
      field: 'goal',
      options: [
        { value: '高額商品購入（10万円以上）', label: '💎 高額商品購入', icon: '💎' },
        { value: '中価格帯購入（3-10万円）', label: '💳 中価格帯購入', icon: '💳' },
        { value: '低価格入門（〜3万円）', label: '🎫 低価格入門', icon: '🎫' },
        { value: '無料オファー（メルマガ・LINE）', label: '📧 無料登録', icon: '📧' },
        { value: 'ウェビナー・説明会申込', label: '🎥 ウェビナー', icon: '🎥' },
        { value: '無料相談・個別面談', label: '☎️ 無料相談', icon: '☎️' },
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
      console.log('🚀 Sending to AI:', formData);
      const response = await api.post('/ai/wizard', formData);
      console.log('🎉 AI Response:', response.data);
      
      if (!response.data || !response.data.structure) {
        throw new Error('AI結果にstructureがありません');
      }
      
      onComplete(response.data);
    } catch (error: any) {
      console.error('❌ AI生成エラー:', error);
      console.error('エラー詳細:', error.response?.data);
      alert(`AI生成に失敗しました: ${error.message || 'Unknown error'}\nスキップして手動で作成してください。`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900/95 rounded-lg p-6 max-w-2xl w-full border border-gray-700/50 shadow-2xl">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-light text-white/90">AIアシスタント</h2>
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-400 transition-colors text-sm font-light"
            >
              スキップ →
            </button>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500/80' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 質問 */}
        {step <= 3 ? (
          <div>
            <h3 className="text-base font-light text-white/95 mb-5">
              {currentQuestion.question}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    formData[currentQuestion.field as keyof typeof formData] === option.value
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                  }`}
                >
                  <div className="text-xl mb-1.5">{option.icon}</div>
                  <div className="text-white/90 text-sm font-light">{option.label.replace(option.icon, '').trim()}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-light text-white/95 mb-2">
              商品・サービスについて教えてください
            </h3>
            <p className="text-gray-500 text-xs font-light mb-4">
              簡単に説明してください。AIが魅力的な見出しや構成を提案します。
            </p>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-28 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white/90 text-sm font-light placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
              placeholder="例：30代女性向けのアンチエイジング美容液。天然成分100%で肌に優しく、シワやたるみに効果的です。"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-gray-800/50 text-white/90 text-sm font-light rounded-lg hover:bg-gray-800 transition-colors"
              >
                ← 戻る
              </button>
              <button
                onClick={handleGenerateLP}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600/90 text-white text-sm font-light rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    生成中...
                  </span>
                ) : (
                  'AI構成を生成'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        {step <= 3 && step > 1 && (
          <div className="mt-5">
            <button
              onClick={() => setStep(step - 1)}
              className="text-gray-500 hover:text-gray-400 transition-colors text-sm font-light"
            >
              ← 前の質問に戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
