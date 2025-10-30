'use client';

import AutoPlayVideo from '@/components/AutoPlayVideo';
import { useState } from 'react';
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
      title: '業界最安7.5%の手数料',
      description: '売上が発生したときだけ 7.5% をお支払い。高い利益率を維持したまま拡張できます。',
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
      question: '手数料7.5%は本当ですか？他に費用はかかりますか？',
      answer: '本当です。売上の7.5%のみで、月額料金や初期費用は一切ありません。売上がゼロなら支払いもゼロです。'
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
              <AutoPlayVideo
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/pixta.mp4"
              />
            </div>
            
            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            
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
                  スワイプ型LP作成プラットフォームで、<br className="hidden sm:inline" />今すぐデジタルコンテンツを販売
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
                    className="px-6 py-3 sm:px-10 sm:py-5 bg-white/90 backdrop-blur-sm text-blue-600 border-2 border-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white hover:shadow-xl transition-all"
                  >
                    ログイン
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド2: Pain Points */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden px-3 sm:px-4 py-4 sm:py-6">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-xs uppercase tracking-widest text-cyan-400 mb-1 sm:mb-2 font-semibold">Pain Points</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    こんな課題、
                  </span>
                  <br className="sm:hidden" />
                  <span className="text-white">ありませんか？</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 max-h-[75vh] overflow-y-auto px-1">
                {painPoints.map((point, index) => {
                  const Icon = point.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-slate-200 rounded-lg p-2.5 sm:p-3 hover:border-red-300 hover:shadow-xl transition-all shadow-md"
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500 mb-1.5 sm:mb-2" />
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mb-1">{point.title}</h3>
                      <p className="text-xs text-slate-600 leading-snug">{point.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド3: Solution */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden px-3 sm:px-4 py-4 sm:py-6">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-xs uppercase tracking-widest text-purple-400 mb-1 sm:mb-2 font-semibold">Solution</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    全ての課題を
                  </span>
                  <br className="sm:hidden" />
                  <span className="text-white">一気に解決</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 max-h-[75vh] overflow-y-auto px-1">
                {solutionHighlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-purple-200 rounded-lg p-2.5 sm:p-3 hover:border-purple-300 hover:shadow-xl transition-all shadow-md"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{item.label}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-700 leading-snug">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド4: 審査なし即スタート */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 overflow-hidden px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full max-w-5xl mx-auto text-center max-h-[90vh] overflow-y-auto px-2">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="pb-4"
              >
                <p className="text-xs sm:text-sm uppercase tracking-widest text-cyan-400 mb-2 sm:mb-3 font-semibold">No Review Required</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                    審査なし
                  </span>
                  <br className="hidden sm:inline" />
                  <span className="text-white">今すぐ始める</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white font-semibold mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900/60 backdrop-blur-sm rounded-lg inline-block">
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
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド5: FAQ */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 overflow-hidden px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <div className="w-full max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-indigo-400 mb-2 sm:mb-4 font-semibold">FAQ</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
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
                    className="bg-white border-2 border-indigo-200 rounded-lg sm:rounded-xl overflow-hidden shadow-md"
                  >
                    <button
                      onClick={() => setSelectedFaq(index)}
                      className={`w-full text-left px-4 py-3 sm:px-6 sm:py-4 transition-all ${
                        selectedFaq === index 
                          ? 'bg-indigo-100 text-slate-800' 
                          : 'bg-transparent text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base md:text-lg font-semibold pr-4">{item.question}</span>
                        <ChevronDownIcon 
                          className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform text-slate-600 ${
                            selectedFaq === index ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {selectedFaq === index && (
                      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-indigo-50 border-t-2 border-indigo-200">
                        <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド6: 料金プラン */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-10">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-purple-400 mb-2 sm:mb-4 font-semibold">Pricing</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                  シンプルな料金体系
                </h2>
                <p className="text-base sm:text-lg text-white font-semibold">
                  月額費用ゼロ。売れた分だけの手数料のみ。
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 sm:p-8 border-3 border-purple-400 shadow-2xl"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-5 py-2 rounded-full text-sm sm:text-base font-bold shadow-lg">
                    完全無料で開始
                  </div>
                  
                  <div className="text-center mb-5">
                    <div className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 mb-2">
                      ¥0
                    </div>
                    <p className="text-base sm:text-lg text-slate-600 font-semibold">月額費用・初期費用すべて無料</p>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-md border-2 border-purple-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">どれだけLPを作成しても無料</h4>
                        <p className="text-xs sm:text-sm text-slate-600">無制限にランディングページを作成。AIアシスタントも使い放題。</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-md border-2 border-purple-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">どれだけ商材を販売しても無料</h4>
                        <p className="text-xs sm:text-sm text-slate-600">販売数に制限なし。決済機能・SSL・ドメインすべて込み。</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-md border-2 border-purple-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">必要なのは売れた時のわずかな手数料のみ</h4>
                        <p className="text-xs sm:text-sm text-slate-600">決済手数料 7.5% だけ。売上がなければ費用ゼロ。</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="block w-full text-center px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      今すぐ無料で始める
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド7: お客様の声 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 overflow-hidden px-3 sm:px-4 py-4 sm:py-6">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-xs uppercase tracking-widest text-cyan-400 mb-1 sm:mb-2 font-semibold">Testimonials</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3">
                  お客様の声
                </h2>
                <p className="text-sm sm:text-base text-white font-bold px-4 py-2 bg-slate-900/50 backdrop-blur-sm rounded-lg inline-block">
                  実際に成果を出しているユーザーの声をご紹介
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-[75vh] overflow-y-auto px-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-xl border-2 border-cyan-200"
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-base sm:text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm leading-snug mb-2">
                      「５分でLPが完成するというのは本当でした。AIが提案してくれる文章がそのまま使えるレベルで、初月から売上が3倍になりました。」
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      A
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-xs sm:text-sm">デジタルコンテンツ販売 / Aさん</div>
                      <div className="text-slate-600 text-xs">月商300万円達成</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-xl border-2 border-cyan-200"
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-base sm:text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm leading-snug mb-2">
                      「外注費が月30万かかっていたLPを自社で作れるようになり、コストを90%削減。しかもスピードが10倍速くなりました。」
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      B
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-xs sm:text-sm">マーケティング会社 / Bさん</div>
                      <div className="text-slate-600 text-xs">コスト90%削減</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-xl border-2 border-cyan-200"
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-base sm:text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm leading-snug mb-2">
                      「デザインの知識がなくても、テンプレートを選ぶだけでプロ並みのLPが作れます。決済機能も標準搭載で楽でした。」
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      C
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-xs sm:text-sm">コンテンツクリエイター / Cさん</div>
                      <div className="text-slate-600 text-xs">初月から売上発生</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-xl border-2 border-cyan-200"
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-base sm:text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm leading-snug mb-2">
                      「審査なしですぐに始められるのが最高。思いついたアイデアを即座に形にして、市場の反応を見られます。」
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      D
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-xs sm:text-sm">オンライン講師 / Dさん</div>
                      <div className="text-slate-600 text-xs">週1ペースでローンチ</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド8: 主要機能 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden px-3 sm:px-4 py-4 sm:py-6">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-xs uppercase tracking-widest text-blue-400 mb-1 sm:mb-2 font-semibold">Features</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3">
                  充実の機能で
                  <br className="sm:hidden" />
                  即座に販売開始
                </h2>
                <p className="text-sm sm:text-base text-white font-bold px-4 py-2 bg-slate-900/50 backdrop-blur-sm rounded-lg inline-block">
                  必要な機能がすべて揃っています
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 max-h-[75vh] overflow-y-auto px-1">
                {[
                  { Icon: SparklesIcon, gradient: 'from-purple-500 to-pink-500', title: 'AIアシスタント', description: 'ヒアリングから自動でLP構成を生成。コピーライティングも提案します。' },
                  { Icon: BoltIcon, gradient: 'from-yellow-500 to-orange-500', title: '５分で公開', description: 'テンプレート選択から公開まで最短５分。スピードが競争力になります。' },
                  { Icon: CreditCardIcon, gradient: 'from-green-500 to-emerald-500', title: '決済機能標準搭載', description: '様々な決済機能連携。カード・銀行・コンビニ払いに対応。' },
                  { Icon: ShieldCheckIcon, gradient: 'from-blue-500 to-cyan-500', title: 'SSL・セキュリティ完備', description: 'ドメイン取得からSSL設定まで自動。セキュリティ対策も万全。' },
                  { Icon: ChartBarIcon, gradient: 'from-indigo-500 to-purple-500', title: '詳細な分析機能', description: '閲覧数・CTAクリック・コンバージョンを可視化。改善サイクルを回せます。' },
                  { Icon: DevicePhoneMobileIcon, gradient: 'from-pink-500 to-rose-500', title: 'スマホ最適化', description: 'スワイプ型UIでモバイルファーストな体験。離脱率を大幅に削減。' },
                ].map((feature, index) => {
                  const IconComponent = feature.Icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-2 sm:p-2.5 shadow-xl border-2 border-blue-200 hover:border-blue-400 transition-all"
                    >
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-1.5 shadow-lg`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 sm:mb-1 leading-tight">{feature.title}</h3>
                      <p className="text-xs text-slate-600 leading-tight">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド9: エディタ実力証明（ビデオ背景ヒーロー） */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            {/* ビデオ背景 */}
            <div className="absolute inset-0">
              <AutoPlayVideo
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/hero-keyboard.mp4"
              />
            </div>
            
            {/* より濃いグラデーションオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/93 to-purple-900/95 pointer-events-none" />
            
            {/* コンテンツ */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/30 border-2 border-cyan-400/70 rounded-full shadow-lg">
                  <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                  <span className="text-cyan-200 text-sm sm:text-base font-bold tracking-wide">EDITOR POWER</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight drop-shadow-2xl">
                  <span className="text-white">このページも<br className="sm:hidden" /></span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
                    LPエディタで作成
                  </span>
                </h2>

                <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-white font-semibold leading-relaxed max-w-3xl mx-auto drop-shadow-lg px-4">
                  あなたが今見ている<br className="sm:hidden" />このTOPページ自体が、
                  <br />
                  <span className="text-cyan-300">LPエディタの<br className="sm:hidden" />実力の証明</span>です。
                </p>

                <div className="flex justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 sm:px-12 sm:py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-cyan-400/60 hover:scale-105 transition-all"
                  >
                    <RocketLaunchIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    今すぐエディタを試す
                    <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                </div>

                <div className="pt-4">
                  <p className="text-sm sm:text-base md:text-lg text-slate-200 font-medium bg-slate-800/50 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 inline-block border border-white/20 max-w-2xl">
                    プログラミング知識不要・<br className="sm:hidden" />デザインツール不要
                    <br />
                    <span className="text-cyan-300">ブラウザだけで、<br className="sm:hidden" />このクオリティのLPが完成</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド10: 最終CTA - リスクゼロ + 3ステップ */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 overflow-hidden px-4 sm:px-6 py-6 sm:py-8">
            <div className="w-full max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-6 sm:mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border-2 border-green-400/50 rounded-full mb-3 sm:mb-4 shadow-lg">
                  <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                  <span className="text-green-200 text-xs sm:text-sm font-bold">リスクゼロ保証</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 leading-tight">
                  <span className="text-white">たった５分で</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
                    あなたのLPが完成
                  </span>
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-2 sm:mb-3 font-semibold">
                  初期費用¥0・月額費用¥0・クレジットカード不要
                </p>
                <p className="text-sm sm:text-base text-white">
                  売上がなければ支払いもゼロ。完全ノーリスクで始められます。
                </p>
              </motion.div>

              {/* 3ステップ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform shadow-2xl">
                    <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-cyan-500 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg">
                      1
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xl">
                        <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">無料登録</h3>
                        <p className="text-xs text-slate-600 leading-tight">
                          メールアドレスだけで30秒で登録完了
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform shadow-2xl">
                    <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg">
                      2
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xl">
                        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">AI自動生成</h3>
                        <p className="text-xs text-slate-600 leading-tight">
                          質問に答えるだけでLPが自動完成
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform shadow-2xl">
                    <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-purple-500 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg">
                      3
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xl">
                        <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">即座に公開</h3>
                        <p className="text-xs text-slate-600 leading-tight">
                          ワンクリックで公開、すぐに販売開始
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* メインCTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-2xl font-black text-lg sm:text-xl md:text-2xl shadow-2xl hover:shadow-cyan-400/60 hover:scale-105 transition-all"
                >
                  <SparklesIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                  今すぐ無料で始める
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
                
                <p className="mt-4 text-xs sm:text-sm text-white">
                  クレジットカード不要・いつでも解約可能
                </p>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
