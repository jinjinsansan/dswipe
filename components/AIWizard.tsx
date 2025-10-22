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
  GiftIcon,
  ShieldCheckIcon,
  TrophyIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { AIWizardRequest, AIGenerationResponse } from '@/types/api';
import { aiApi } from '@/lib/api';

type ThemeKey =
  | 'urgent_red'
  | 'energy_orange'
  | 'gold_premium'
  | 'power_blue'
  | 'passion_pink';

interface Bonus {
  title: string;
  description: string;
  value: string;
}

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
    // ステップ1-3: 基本情報
    business: '',
    target: '',
    goal: '',
    
    // ステップ4: 商品詳細
    productName: '',
    description: '',
    format: '',
    duration: '',
    transformation: '',
    
    // ステップ5: 価格とオファー
    originalPrice: '',
    specialPrice: '',
    deadline: '',
    callToAction: '',
    scarcity: '',
    
    // ステップ6: 特典と保証
    bonuses: [] as Bonus[],
    guaranteeHeadline: '',
    guaranteeDescription: '',
    
    // ステップ7: 実績と権威
    authorName: '',
    authorTitle: '',
    authorBio: '',
    achievements: [] as string[],
  });

  // タイマーとプログレスバー
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    
    if (isLoading) {
      setElapsedTime(0);
      setProgress(0);
      
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + (100 / 30);
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [isLoading]);

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

  const handleOptionClick = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (step < 7) {
      setTimeout(() => setStep((prev) => Math.min(prev + 1, 7)), 300);
    }
  };

  const handleAddBonus = () => {
    setFormData(prev => ({
      ...prev,
      bonuses: [...prev.bonuses, { title: '', description: '', value: '' }]
    }));
  };

  const handleRemoveBonus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBonus = (index: number, field: keyof Bonus, value: string) => {
    setFormData(prev => ({
      ...prev,
      bonuses: prev.bonuses.map((bonus, i) => 
        i === index ? { ...bonus, [field]: value } : bonus
      )
    }));
  };

  const handleAddAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAchievement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? value : achievement
      )
    }));
  };

  const handleGenerateLP = async () => {
    setIsLoading(true);
    try {
      const payload: AIWizardRequest = {
        business: formData.business,
        target: formData.target,
        goal: formData.goal,
        theme: themeKey,
        product: {
          name: formData.productName || formData.business || 'AIランディングページ',
          description: formData.description,
          format: formData.format || undefined,
          duration: formData.duration || undefined,
          transformation: formData.transformation || undefined,
        },
        audience: {
          persona: formData.target,
          desired_outcome: formData.goal,
        },
        offer: {
          price: (formData.originalPrice || formData.specialPrice) ? {
            original: formData.originalPrice || undefined,
            special: formData.specialPrice || undefined,
            deadline: formData.deadline || undefined,
          } : undefined,
          bonuses: formData.bonuses.filter(b => b.title).map(b => ({
            title: b.title,
            description: b.description || undefined,
            value: b.value || undefined,
          })),
          guarantee: (formData.guaranteeHeadline || formData.guaranteeDescription) ? {
            headline: formData.guaranteeHeadline || undefined,
            description: formData.guaranteeDescription || undefined,
          } : undefined,
          call_to_action: formData.callToAction || '今すぐ申し込む',
          scarcity: formData.scarcity || undefined,
        },
        proof: (formData.authorName || formData.achievements.length > 0) ? {
          authority_name: formData.authorName || undefined,
          authority_title: formData.authorTitle || undefined,
          authority_bio: formData.authorBio || undefined,
          achievements: formData.achievements.filter(a => a) || undefined,
        } : undefined,
      };

      const response = await aiApi.wizard(payload);
      const data = response.data as AIGenerationResponse;
      
      if (!data.blocks || data.blocks.length === 0) {
        throw new Error('AI生成でブロックが生成されませんでした');
      }
      
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onComplete(data);
    } catch (error: any) {
      console.error('❌ AI生成エラー:', error);
      const message = error?.message || error?.response?.data?.detail || 'Unknown error';
      alert(`AI生成に失敗しました: ${message}\n\nスキップして手動で作成してください。`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    // ステップ1: ジャンル選択
    if (step === 1) {
      const options = [
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
      ];

      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-5">
            どんな情報商材を販売しますか？
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick('business', option.value)}
                  className={`p-4 rounded-lg border transition-all text-left flex items-start gap-3 ${
                    formData.business === option.value
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-white/90 text-sm font-light leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ステップ2: ターゲット選択
    if (step === 2) {
      const options = [
        { value: '20-30代男性（独身・会社員）', label: '20-30代男性（会社員）', icon: UserIcon },
        { value: '30-40代男性（既婚・経営者志向）', label: '30-40代男性（経営者志向）', icon: BriefcaseIcon },
        { value: '20-30代女性（副業・美容志向）', label: '20-30代女性（副業・美容）', icon: UserCircleIcon },
        { value: '30-50代女性（主婦・在宅ワーク）', label: '30-50代女性（在宅ワーク）', icon: UserGroupIcon },
        { value: '学生・フリーター（〜20代）', label: '学生・フリーター層', icon: AcademicCapIcon },
        { value: '50代以上（老後・資産形成）', label: '50代以上（資産形成）', icon: UserGroupIcon },
      ];

      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-5">
            メインターゲットは誰ですか？
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick('target', option.value)}
                  className={`p-4 rounded-lg border transition-all text-left flex items-start gap-3 ${
                    formData.target === option.value
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-white/90 text-sm font-light leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ステップ3: 目標選択
    if (step === 3) {
      const options = [
        { value: '高額商品購入（10万円以上）', label: '高額商品購入（10万円以上）', icon: ShoppingBagIcon },
        { value: '中価格帯購入（3-10万円）', label: '中価格帯購入（3-10万円）', icon: CreditCardIcon },
        { value: '低価格入門（〜3万円）', label: '低価格入門（〜3万円）', icon: TicketIcon },
        { value: '無料オファー（メルマガ・LINE）', label: '無料オファー（メルマガ・LINE）', icon: EnvelopeIcon },
        { value: 'ウェビナー・説明会申込', label: 'ウェビナー・説明会申込', icon: VideoCameraIcon },
        { value: '無料相談・個別面談', label: '無料相談・個別面談', icon: PhoneIcon },
      ];

      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-5">
            どんなアクションが欲しいですか？
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick('goal', option.value)}
                  className={`p-4 rounded-lg border transition-all text-left flex items-start gap-3 ${
                    formData.goal === option.value
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-white/90 text-sm font-light leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ステップ4: 商品詳細
    if (step === 4) {
      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-2">
            商品・サービスについて教えてください
          </h3>
          <p className="text-gray-500 text-xs font-light mb-4">
            商品名、内容、提供形式、期間、得られる変化などを記入してください。
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">商品・サービス名 *</label>
              <input
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：売上を3倍にするLP構築マスター講座"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">商品説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-20 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white/90 text-sm font-light placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                placeholder="例：初心者でも90日で成果が出る実践型カリキュラム。動画講義、個別サポート、テンプレート付き。"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">提供形式</label>
                <input
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                  placeholder="例：オンライン動画講座"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">期間・サポート</label>
                <input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                  placeholder="例：90日間+個別サポート"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">得られる変化・約束</label>
              <input
                value={formData.transformation}
                onChange={(e) => setFormData({ ...formData, transformation: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：売上を3倍にし、時間も半分に"
              />
            </div>
          </div>
        </div>
      );
    }

    // ステップ5: 価格とオファー
    if (step === 5) {
      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-2">
            価格とオファー内容を教えてください
          </h3>
          <p className="text-gray-500 text-xs font-light mb-4">
            通常価格、特別価格、締切、CTAボタンのテキストを設定してください。
          </p>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">通常価格（円）</label>
                <input
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                  placeholder="298000"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">特別価格（円）*</label>
                <input
                  value={formData.specialPrice}
                  onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value })}
                  className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                  placeholder="98000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">申込締切</label>
              <input
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：12月31日23:59まで"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">CTAボタンのテキスト</label>
              <input
                value={formData.callToAction}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="今すぐ申し込む"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">限定性・緊急性の訴求</label>
              <input
                value={formData.scarcity}
                onChange={(e) => setFormData({ ...formData, scarcity: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：残り5名様限定"
              />
            </div>
          </div>
        </div>
      );
    }

    // ステップ6: 特典と保証
    if (step === 6) {
      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-2">
            特典と保証を設定してください
          </h3>
          <p className="text-gray-500 text-xs font-light mb-4">
            申込特典のボーナスと、返金保証の内容を設定してください。
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 flex items-center justify-between">
                <span>申込特典（ボーナス）</span>
                <button
                  type="button"
                  onClick={handleAddBonus}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  特典を追加
                </button>
              </label>
              
              <div className="space-y-2">
                {formData.bonuses.map((bonus, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <input
                        value={bonus.title}
                        onChange={(e) => handleUpdateBonus(index, 'title', e.target.value)}
                        className="flex-1 rounded border border-gray-700/60 bg-gray-800/50 px-2 py-1 text-xs text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                        placeholder="特典タイトル"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBonus(index)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      value={bonus.description}
                      onChange={(e) => handleUpdateBonus(index, 'description', e.target.value)}
                      className="w-full rounded border border-gray-700/60 bg-gray-800/50 px-2 py-1 text-xs text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      placeholder="説明"
                    />
                    <input
                      value={bonus.value}
                      onChange={(e) => handleUpdateBonus(index, 'value', e.target.value)}
                      className="w-full rounded border border-gray-700/60 bg-gray-800/50 px-2 py-1 text-xs text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      placeholder="価値（例：29800円相当）"
                    />
                  </div>
                ))}
                
                {formData.bonuses.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-2">特典を追加してください</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">返金保証の見出し</label>
              <input
                value={formData.guaranteeHeadline}
                onChange={(e) => setFormData({ ...formData, guaranteeHeadline: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：30日間 全額返金保証"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">保証内容の説明</label>
              <textarea
                value={formData.guaranteeDescription}
                onChange={(e) => setFormData({ ...formData, guaranteeDescription: e.target.value })}
                className="w-full h-16 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white/90 text-sm font-light placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                placeholder="例：30日以内にご満足いただけなければ、理由を問わず全額返金いたします。"
              />
            </div>
          </div>
        </div>
      );
    }

    // ステップ7: 実績と権威
    if (step === 7) {
      return (
        <div>
          <h3 className="text-base font-light text-white/95 mb-2">
            講師・監修者の情報を教えてください
          </h3>
          <p className="text-gray-500 text-xs font-light mb-4">
            権威性と信頼性を高めるための情報を記入してください。（任意）
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">講師・監修者名</label>
              <input
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：山田太郎"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">肩書き・実績</label>
              <input
                value={formData.authorTitle}
                onChange={(e) => setFormData({ ...formData, authorTitle: e.target.value })}
                className="w-full rounded-lg border border-gray-700/60 bg-gray-800/50 px-3 py-2 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                placeholder="例：マーケティングコンサルタント"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">プロフィール・経歴</label>
              <textarea
                value={formData.authorBio}
                onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                className="w-full h-20 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white/90 text-sm font-light placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                placeholder="例：15年以上のLP制作実績。累計3,200社のマーケティング支援を担当。"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 flex items-center justify-between">
                <span>主な実績</span>
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  実績を追加
                </button>
              </label>
              
              <div className="space-y-2">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={achievement}
                      onChange={(e) => handleUpdateAchievement(index, e.target.value)}
                      className="flex-1 rounded border border-gray-700/60 bg-gray-800/50 px-2 py-1 text-xs text-white/90 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      placeholder="例：累計3,200社のマーケティング支援"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {formData.achievements.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-2">実績を追加してください</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const canProceed = () => {
    if (step === 1) return !!formData.business;
    if (step === 2) return !!formData.target;
    if (step === 3) return !!formData.goal;
    if (step === 4) return !!formData.productName;
    if (step === 5) return !!formData.specialPrice;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900/95 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
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
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500/80' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 質問コンテンツ */}
        {renderStep()}

        {/* ナビゲーション */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-800/50 text-white/90 text-sm font-light rounded-lg hover:bg-gray-800 transition-colors"
            >
              ← 戻る
            </button>
          )}
          
          <div className="flex-1">
            {step < 7 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="w-full px-4 py-2 bg-blue-600/90 text-white text-sm font-light rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ →
              </button>
            ) : (
              <button
                onClick={handleGenerateLP}
                disabled={isLoading || !canProceed()}
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
            )}
            
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
    </div>
  );
}
