'use client';

import React, { useMemo, useState } from 'react';
import {
  AcademicCapIcon,
  BanknotesIcon,
  BoltIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  HeartIcon,
  LightBulbIcon,
  PencilSquareIcon,
  PhoneIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TicketIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import type { AIGenerationRequest, AIGenerationResponse } from '@/types/api';

type ThemeKey =
  | 'urgent_red'
  | 'energy_orange'
  | 'gold_premium'
  | 'power_blue'
  | 'passion_pink';

interface AIWizardProps {
  onComplete: (result: AIGenerationResponse) => void;
  onSkip: () => void;
}

export default function AIWizard({ onComplete, onSkip }: AIWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    productName: '',
    business: '',
    target: '',
    goal: '',
    description: '',
  });

  // タイマーとプログレスバー
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    
    if (isLoading) {
      setElapsedTime(0);
      setProgress(0);
      
      // 秒数カウント
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      // プログレスバー（推定30秒で100%）
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95; // 95%で止める
          return prev + (100 / 30); // 30秒で100%
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [isLoading]);

  const questions = [
    {
      step: 1,
      question: 'どんな情報商材を販売しますか？',
      field: 'business',
      options: [
        { value: '投資・FX・仮想通貨', label: '投資・FX・仮想通貨', icon: BanknotesIcon },
        { value: 'ダイエット・筋トレ', label: 'ダイエット・筋トレ', icon: BoltIcon },
        { value: '副業・ビジネス', label: '副業・ビジネス', icon: BriefcaseIcon },
        { value: '英語・資格学習', label: '英語・資格学習', icon: AcademicCapIcon },
        { value: '恋愛・モテ術', label: '恋愛・モテ術', icon: HeartIcon },
        { value: 'SNS・集客・マーケティング', label: 'SNS・集客', icon: DevicePhoneMobileIcon },
        { value: '転売・物販・せどり', label: '転売・物販', icon: BuildingStorefrontIcon },
        { value: 'ライティング・Webスキル', label: 'ライティング・Webスキル', icon: PencilSquareIcon },
        { value: '自己啓発・コーチング', label: '自己啓発・コーチング', icon: LightBulbIcon },
        { value: 'その他ノウハウ', label: 'その他', icon: SparklesIcon },
      ],
    },
    {
      step: 2,
      question: 'メインターゲットは誰ですか？',
      field: 'target',
      options: [
        { value: '20-30代男性（独身・会社員）', label: '20-30代男性（会社員）', icon: UserIcon },
        { value: '30-40代男性（既婚・経営者志向）', label: '30-40代男性（経営者志向）', icon: BriefcaseIcon },
        { value: '20-30代女性（副業・美容志向）', label: '20-30代女性（副業・美容）', icon: UserCircleIcon },
        { value: '30-50代女性（主婦・在宅ワーク）', label: '30-50代女性（在宅ワーク）', icon: UserGroupIcon },
        { value: '学生・フリーター（〜20代）', label: '学生・フリーター層', icon: AcademicCapIcon },
        { value: '50代以上（老後・資産形成）', label: '50代以上（資産形成）', icon: UserGroupIcon },
      ],
    },
    {
      step: 3,
      question: 'どんなアクションが欲しいですか？',
      field: 'goal',
      options: [
        { value: '高額商品購入（10万円以上）', label: '高額商品購入（10万円以上）', icon: ShoppingBagIcon },
        { value: '中価格帯購入（3-10万円）', label: '中価格帯購入（3-10万円）', icon: CreditCardIcon },
        { value: '低価格入門（〜3万円）', label: '低価格入門（〜3万円）', icon: TicketIcon },
        { value: '無料オファー（メルマガ・LINE）', label: '無料オファー（メルマガ・LINE）', icon: EnvelopeIcon },
        { value: 'ウェビナー・説明会申込', label: 'ウェビナー・説明会申込', icon: VideoCameraIcon },
        { value: '無料相談・個別面談', label: '無料相談・個別面談', icon: PhoneIcon },
      ],
    },
  ];

  const currentQuestion = questions[step - 1];

  const themeKey = useMemo<ThemeKey>(() => {
    switch (formData.business) {
      case '投資・FX・仮想通貨':
      case '副業・ビジネス':
      case 'SNS・集客・マーケティング':
      case '転売・物販・せどり':
        return 'urgent_red';
      case 'ダイエット・筋トレ':
        return 'energy_orange';
      case '英語・資格学習':
      case 'ライティング・Webスキル':
        return 'power_blue';
      case '恋愛・モテ術':
        return 'passion_pink';
      case '自己啓発・コーチング':
        return 'gold_premium';
      default:
        return 'urgent_red';
    }
  }, [formData.business]);

  const handleOptionClick = (value: string) => {
    setFormData((prev) => ({ ...prev, [currentQuestion.field]: value }));

    if (step < 4) {
      setTimeout(() => setStep((prev) => Math.min(prev + 1, 4)), 300);
    }
  };

  const handleGenerateLP = async () => {
    setIsLoading(true);
    try {
      const keyBenefits = formData.description
        .split(/[\n\r。.、・\.]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .slice(0, 6);

      const payload: AIGenerationRequest = {
        theme: themeKey,
        product: {
          name: formData.productName || formData.business || 'AIランディングページ',
          description: formData.description,
          category: formData.business || undefined,
          keyBenefits: keyBenefits.length ? keyBenefits : undefined,
        },
        audience: {
          persona: formData.target || undefined,
          desiredOutcome: formData.goal || undefined,
        },
        goals: formData.goal ? [formData.goal] : undefined,
      };

      const response = await fetch('/api/ai/generate-lp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || 'AI生成に失敗しました');
      }

      const data = (await response.json()) as AIGenerationResponse;
      console.log('AI Response:', data);
      
      if (!data.blocks || data.blocks.length === 0) {
        throw new Error('AI生成でブロックが生成されませんでした');
      }
      
      // 完了時にプログレスを100%に
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300)); // 0.3秒待つ
      
      onComplete(data);
    } catch (error: any) {
      console.error('❌ AI生成エラー:', error);
      const message = error?.message || 'Unknown error';
      alert(`AI生成に失敗しました: ${message}\nスキップして手動で作成してください。`);
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
              {currentQuestion.options.map((option) => {
                const Icon = option.icon;
                return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`p-4 rounded-lg border transition-all text-left flex items-start gap-3 ${
                    formData[currentQuestion.field as keyof typeof formData] === option.value
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-white/90 text-sm font-light leading-tight">{option.label}</span>
                </button>
              );})}
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
            <input
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="mb-3 w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              placeholder="例：AIローンチ加速プログラム"
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-28 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white/90 text-sm font-light placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
              placeholder="例：30代女性向けのアンチエイジング美容液。天然成分100%で肌に優しく、シワやたるみに効果的です。"
            />
            <p className="text-xs text-gray-500 mb-3">選択テーマ: <span className="text-gray-300">{themeKey}</span></p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-gray-800/50 text-white/90 text-sm font-light rounded-lg hover:bg-gray-800 transition-colors"
              >
                ← 戻る
              </button>
              <div className="flex-1">
                <button
                  onClick={handleGenerateLP}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600/90 text-white text-sm font-light rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      生成中... {elapsedTime}秒
                    </span>
                  ) : (
                    'AI構成を生成'
                  )}
                </button>
                {isLoading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-light text-gray-500">進行状況</span>
                      <span className="text-xs font-light text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500/80 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
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
