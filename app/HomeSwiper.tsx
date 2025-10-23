'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard, FreeMode, EffectCreative } from 'swiper/modules';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ClockIcon,
  CreditCardIcon,
  BoltIcon,
  CheckCircleIcon,
  ChartBarIcon,
  PaintBrushIcon,
  PhotoIcon,
  DevicePhoneMobileIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CurrencyYenIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/effect-creative';

export default function HomeSwiper() {
  const [selectedFaq, setSelectedFaq] = useState<number>(0);

  // ハプティックフィードバック
  const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(patterns[style]);
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    if (swiper.previousIndex !== swiper.activeIndex) {
      triggerHapticFeedback('light');
    }
  };

  const painPoints = [
    {
      icon: PaintBrushIcon,
      title: 'デザイン設計に時間を奪われる',
      description: 'LPの構成やビジュアルをゼロから整えるのは非効率で、差別化にも限界があります。',
    },
    {
      icon: GlobeAltIcon,
      title: 'ドメイン・サーバー整備が面倒',
      description: '取得・設定・SSL対応まで社内で段取りを組む必要があり、初動が遅れます。',
    },
    {
      icon: CreditCardIcon,
      title: '決済機能の実装ハードル',
      description: '安全な決済フローを自前で準備するには高い技術コストとセキュリティの知見が求められます。',
    },
    {
      icon: CurrencyYenIcon,
      title: '販売手数料がかさむ',
      description: '既存プラットフォームの高い手数料に依存すると利益率が大幅に削られます。',
    },
    {
      icon: ClockIcon,
      title: 'スピード感が阻害される',
      description: 'ローンチに至るまでの調整項目が多く、旬な情報を届けるタイミングを逃してしまいます。',
    },
  ];

  const solutionHighlights = [
    {
      icon: BoltIcon,
      label: 'Speed',
      title: 'LP作成がわずか５分',
      description: 'AIアシスタントがヒアリングしながら最適な構成を即時生成。試作品づくりの時間を大幅に短縮します。',
    },
    {
      icon: ShieldCheckIcon,
      label: 'Security',
      title: 'ドメイン・SSL完備',
      description: '煩雑なドメイン取得やSSL設定は不要。企業水準のセキュリティで即日運用が可能です。',
    },
    {
      icon: CreditCardIcon,
      label: 'Payment',
      title: 'ポイント決済を標準搭載',
      description: 'カード・銀行振込・コンビニ決済をカバー。自社での PCI DSS 対応は不要です。',
    },
    {
      icon: CurrencyYenIcon,
      label: 'Profit',
      title: '業界最安3%の手数料',
      description: '売上が発生したときだけ 3% をお支払い。高い利益率を維持したまま拡張できます。',
    },
    {
      icon: RocketLaunchIcon,
      label: 'Launch',
      title: '審査なしで即リリース',
      description: '社内承認を待つことなく、その日のうちにローンチ。旬な情報発信に対応します。',
    },
  ];

  const faqItems = [
    {
      question: '本当に５分でLP作成できますか？',
      answer: 'はい。AIの質問に答えるだけで構成案とコピーまで自動生成されます。画像や細かな文言を調整しても 5〜10 分程度で公開できます。'
    },
    {
      question: '審査は本当にありませんか？',
      answer: 'ありません。アカウント登録直後からLP作成・公開が可能です。プロダクトの鮮度を損ないません。'
    },
    {
      question: '手数料3%は本当ですか？他に費用はかかりますか？',
      answer: '本当です。売上の3%のみで、月額料金や初期費用は一切ありません。売上がゼロなら支払いもゼロです。'
    },
    {
      question: 'スマホ対応していますか？',
      answer: '完全対応しています。スワイプ型UIはスマホで最も快適に動作するよう設計されており、PC・タブレットでも同じ体験を提供します。'
    },
  ];

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
      <Swiper
        direction="vertical"
        slidesPerView={1}
        speed={350}
        touchRatio={1.8}
        threshold={3}
        shortSwipes={true}
        longSwipes={true}
        longSwipesRatio={0.25}
        resistance={true}
        resistanceRatio={0.65}
        touchStartPreventDefault={false}
        simulateTouch={true}
        followFinger={true}
        touchStartForcePreventDefault={false}
        
        freeMode={{
          enabled: false,
          momentum: true,
          momentumRatio: 0.8,
          momentumVelocityRatio: 0.8,
          sticky: true,
        }}
        
        watchSlidesProgress={true}
        
        effect="creative"
        creativeEffect={{
          prev: {
            translate: [0, '-20%', -1],
            scale: 0.95,
            opacity: 0.8,
          },
          next: {
            translate: [0, '100%', 0],
          },
        }}
        
        mousewheel={{ 
          releaseOnEdges: true, 
          forceToAxis: true, 
          sensitivity: 0.8,
          thresholdDelta: 10,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        modules={[Pagination, Mousewheel, Keyboard, FreeMode, EffectCreative]}
        onSlideChange={handleSlideChange}
        onTouchStart={() => triggerHapticFeedback('light')}
        className="h-full w-full"
      >
        {/* スライド1: Hero */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            {/* 背景ビデオ */}
            <div className="absolute inset-0">
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/pixta.mp4" type="video/mp4" />
              </video>
            </div>
            
            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* コンテンツ */}
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                    情報には鮮度がある。
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                    ５分でLP公開。
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 drop-shadow-lg px-2 sm:px-4">
                  スワイプ型LP作成プラットフォームで、<br className="hidden sm:inline" />今すぐ情報商材を販売
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/register"
                    className="group relative px-6 py-3 sm:px-10 sm:py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all overflow-hidden hover:scale-105 transform"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      無料で始める
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="px-6 py-3 sm:px-10 sm:py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all"
                  >
                    ログイン
                  </Link>
                </div>
              </motion.div>
              
              {/* スクロールヒント */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60 animate-bounce">
                <span className="text-xs sm:text-sm mb-2">スワイプ</span>
                <ChevronDownIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド2: Pain Points */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 overflow-hidden px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-blue-600 mb-2 sm:mb-4 font-semibold">Pain Points</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    こんな課題、
                  </span>
                  <br className="sm:hidden" />
                  <span className="text-slate-800">ありませんか？</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto px-2">
                {painPoints.map((point, index) => {
                  const Icon = point.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-300 hover:shadow-xl transition-all shadow-md"
                    >
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-500 mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{point.title}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">{point.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド3: Solution */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 overflow-hidden px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-emerald-600 mb-2 sm:mb-4 font-semibold">Solution</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    全ての課題を
                  </span>
                  <br className="sm:hidden" />
                  <span className="text-slate-800">一気に解決</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto px-2">
                {solutionHighlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-emerald-300 hover:shadow-xl transition-all shadow-md"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl shadow-md">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider">{item.label}</span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{item.title}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド4: 審査なし即スタート */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 overflow-hidden px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full max-w-5xl mx-auto text-center max-h-[90vh] overflow-y-auto px-2">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="pb-4"
              >
                <p className="text-xs sm:text-sm uppercase tracking-widest text-pink-600 mb-2 sm:mb-3 font-semibold">No Review Required</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                    審査なし
                  </span>
                  <br className="hidden sm:inline" />
                  <span className="text-slate-800">今すぐ始める</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-700 mb-6 sm:mb-8 px-2 sm:px-4">
                  プラットフォームの承認待ちは一切不要。<br className="hidden sm:inline" />
                  登録後すぐにLP作成・商品販売・宣伝を開始できます。
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 max-w-4xl mx-auto">
                  <div className="bg-white border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-blue-300 hover:shadow-xl transition-all shadow-md">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                      <RocketLaunchIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2">LP作成</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      登録後すぐにLP作成開始。<br />
                      AIアシスタントで５分で完成。
                    </p>
                  </div>
                  
                  <div className="bg-white border-2 border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-emerald-300 hover:shadow-xl transition-all shadow-md">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                      <CreditCardIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2">商品登録</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      審査待ち不要。<br />
                      自由に商品を登録して即販売開始。
                    </p>
                  </div>
                  
                  <div className="bg-white border-2 border-pink-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-pink-300 hover:shadow-xl transition-all shadow-md">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                      <ChartBarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2">即宣伝開始</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      承認待ちなし。<br />
                      公開URLをすぐにシェアして販売。
                    </p>
                  </div>
                </div>
                
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-2xl hover:scale-105 transition-transform"
                >
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  今すぐ無料で始める
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド5: FAQ */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 overflow-hidden px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <div className="w-full max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-amber-600 mb-2 sm:mb-4 font-semibold">FAQ</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-3 sm:mb-4">
                  よくある質問
                </h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto px-2">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border-2 border-amber-200 rounded-lg sm:rounded-xl overflow-hidden shadow-md"
                  >
                    <button
                      onClick={() => setSelectedFaq(index)}
                      className={`w-full text-left px-4 py-3 sm:px-6 sm:py-4 transition-all ${
                        selectedFaq === index 
                          ? 'bg-amber-100 text-slate-800' 
                          : 'bg-transparent text-slate-700 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base md:text-lg font-semibold pr-4">{item.question}</span>
                        <ChevronDownIcon 
                          className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform ${
                            selectedFaq === index ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {selectedFaq === index && (
                      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-amber-50 border-t-2 border-amber-200">
                        <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド6: 最終CTA */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 overflow-hidden px-4 sm:px-6 md:px-8">
            <div className="w-full max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600">
                    今すぐ始めよう
                  </span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 sm:mb-12 px-2 sm:px-4">
                  情報には鮮度がある。５分でLPを公開して、今すぐ販売を開始。
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
                  <Link
                    href="/register"
                    className="group relative px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-cyan-500/50 transition-all overflow-hidden hover:scale-105 transform"
                  >
                    <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                      <SparklesIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                      無料で始める
                      <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600 mb-1 sm:mb-2">５分</div>
                    <div className="text-xs sm:text-sm text-slate-600">でLP公開</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">3%</div>
                    <div className="text-xs sm:text-sm text-slate-600">手数料のみ</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">¥0</div>
                    <div className="text-xs sm:text-sm text-slate-600">月額費用</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-600 mb-1 sm:mb-2">即日</div>
                    <div className="text-xs sm:text-sm text-slate-600">リリース</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
