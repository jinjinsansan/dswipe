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
