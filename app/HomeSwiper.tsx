'use client';

import AutoPlayVideo from '@/components/AutoPlayVideo';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard, EffectCreative } from 'swiper/modules';
import {
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

const serifFont = '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "Times New Roman", serif';

export default function HomeSwiper() {
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

  return (
    <div className="h-screen w-full bg-white overflow-hidden" style={{ fontFamily: serifFont }}>
      <Swiper
        direction="vertical"
        slidesPerView={1}
        speed={280}
        touchRatio={1.5}
        threshold={8}
        resistance={true}
        resistanceRatio={0.85}
        effect="creative"
        creativeEffect={{
          prev: {
            translate: [0, '-8%', 0],
            scale: 0.98,
            opacity: 0.92,
          },
          next: {
            translate: [0, '100%', 0],
          },
        }}
        mousewheel={{ 
          releaseOnEdges: true, 
          forceToAxis: true, 
          sensitivity: 1,
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
        modules={[Pagination, Mousewheel, Keyboard, EffectCreative]}
        onSlideChange={handleSlideChange}
        onTouchStart={() => triggerHapticFeedback('light')}
        className="h-full w-full"
      >
        {/* スライド1: Hero */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden bg-white">
            <div className="absolute inset-0">
              <AutoPlayVideo
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/hero-keyboard-2.mp4"
              />
            </div>
            
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 leading-tight text-white drop-shadow-2xl">
                  <span className="block mb-2">
                    情報には鮮度がある
                  </span>
                  <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                    ５分でLP公開
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 sm:mb-12 font-light drop-shadow-lg">
                  スワイプ型LP作成プラットフォームで<br className="hidden sm:inline" />
                  今すぐデジタルコンテンツを販売
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/register"
                    className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-slate-900/90 backdrop-blur-sm text-white rounded-lg font-medium text-lg shadow-xl hover:bg-slate-900 transition-all hover:scale-105"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      無料で始める
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="px-8 py-4 sm:px-10 sm:py-5 bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-200 rounded-lg font-medium text-lg hover:bg-white hover:shadow-xl transition-all"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド2: 360%上昇 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto text-center">
              <div>
                <p className="text-base sm:text-lg text-slate-600 mb-5 font-light">
                  縦長のHPは読者には一切読まれていません。
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 text-slate-900 leading-tight">
                  スワイプ型LPにすることで<br />
                  <span className="text-slate-700">伝えたいことがダイレクトに伝わります</span>
                </h2>
                
                <div className="relative max-w-2xl mx-auto">
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 sm:p-12 shadow-xl border border-slate-700/30">
                    <p className="text-white/80 text-lg sm:text-xl font-light mb-3">
                      コンバージョン率
                    </p>
                    <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-3">
                      360<span className="text-5xl sm:text-6xl">%</span>
                    </div>
                    <p className="text-white text-xl sm:text-2xl font-light">
                      上昇
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド3: 価格比較 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-5xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-slate-900 leading-tight">
                  スワイプ型LP作成は初心者には難しい
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 font-light">
                  大手企業がサービスを提供しているが<br />
                  <span className="text-red-600 font-medium">非常に高額</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                  <p className="text-lg font-medium text-slate-600 mb-4">大手企業</p>
                  <div className="text-5xl font-bold text-red-600 mb-2">
                    ¥50,000
                  </div>
                  <p className="text-base text-slate-500 font-light">月額〜</p>
                </div>

                <div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute -top-2 -right-2 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12">
                    <span className="text-sm font-bold text-slate-900">NEW</span>
                  </div>
                  <p className="text-lg font-medium text-white/80 mb-4">D-swipe</p>
                  <div className="text-5xl font-bold text-white mb-2">
                    ¥0
                  </div>
                  <p className="text-base text-white/70 font-light">何個作成しても無料</p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド4: 差別化 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                  他社との決定的な違い
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="bg-white border border-slate-200 rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                      <XMarkIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-800">他社サービス</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <XMarkIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-sm text-slate-600 font-light">ほとんど画像をスワイプ型にしている</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XMarkIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-sm text-slate-600 font-light">１ページごとに画像を作成する手間</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XMarkIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-sm text-slate-600 font-light">スワイプの感触もゴツゴツ</p>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-lg font-medium text-white">D-swipe</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-white/80 font-light">画像も対応</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-white/80 font-light">AIアシスタントが５分で基礎を作成</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-white/80 font-light">Webサイト感がそのままスワイプ型へ</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-white/80 font-light">スワイプ時の感触も◎</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド5: 販売者メリット1 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-3xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <p className="text-sm text-slate-500 font-light mb-3 uppercase tracking-wider">SELLER BENEFITS</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                  販売者側メリット
                </h2>
              </div>

              <div
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-8 shadow-sm border border-slate-200"
              >
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">無料で無制限にLP作成</h3>
                      <p className="text-sm text-slate-600 font-light">いくつ作っても完全無料</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">有料・無料NOTE記事作成</h3>
                      <p className="text-sm text-slate-600 font-light">記事型コンテンツも販売可能</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">使用料は半永久無料</h3>
                      <p className="text-sm text-slate-600 font-light">月額費用・初期費用なし</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">10日間おきにUSDTでお支払い</h3>
                      <p className="text-sm text-slate-600 font-light">手数料は業界最安の7.5%のみ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド6: 販売者メリット2 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <p className="text-sm text-slate-500 font-light mb-3 uppercase tracking-wider">SELLER BENEFITS 2</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                  やることはシンプル
                </h2>
              </div>

              <div className="space-y-6">
                <div
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-lg font-bold text-white">
                      1
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">スワイプLPかNOTEを作成</h3>
                  </div>
                  <p className="text-base text-slate-600 font-light">AIアシスタントで5分で完成</p>
                </div>

                <div
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-lg font-bold text-white">
                      2
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">宣伝するだけ</h3>
                  </div>
                  <p className="text-base text-slate-600 font-light">マーケットエリアからもお客様が流入</p>
                </div>

                <div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg text-center border border-slate-700"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                    <h3 className="text-2xl font-semibold text-white">審査なし・即宣伝可能</h3>
                  </div>
                  <p className="text-base text-white/80 font-light">デジタルコンテンツに煩わしい審査なし</p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド7: 購入者メリット */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <p className="text-sm text-slate-500 font-light mb-3 uppercase tracking-wider">BUYER BENEFITS</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                  購入者側メリット
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-sm border border-slate-200"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BoltIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">登録はわずか30秒</h3>
                  <p className="text-sm text-slate-600 text-center font-light">すぐに購入開始</p>
                </div>

                <div
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-sm border border-slate-200"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCardIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">決済方法が豊富</h3>
                  <p className="text-sm text-slate-600 text-center font-light">クレカ・USDT対応</p>
                </div>

                <div
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-sm border border-slate-200"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">様々なポイント獲得企画</h3>
                  <p className="text-sm text-slate-600 text-center font-light">お得に購入可能</p>
                </div>

                <div
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-sm border border-slate-200"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RocketLaunchIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">デジタルコンテンツを即座に購入</h3>
                  <p className="text-sm text-slate-600 text-center font-light">待ち時間なし</p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド8: エディタ証明 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <AutoPlayVideo
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/hero-keyboard.mp4"
              />
            </div>
            
            <div className="absolute inset-0 bg-white/90" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
              <div
                className="space-y-8"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
                  <span className="block mb-2">このページも</span>
                  <span className="block">LPエディタで作成</span>
                </h2>

                <p className="text-xl sm:text-2xl md:text-3xl text-slate-700 font-light leading-relaxed">
                  あなたが見ているこのTOPページ自体が<br />
                  <span className="font-medium">LPエディタの実力の証明</span>です
                </p>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-lg font-medium text-lg shadow-xl hover:bg-slate-800 hover:scale-105 transition-all"
                >
                  <RocketLaunchIcon className="w-6 h-6" />
                  今すぐエディタを試す
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド9: ビデオ背景映像 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <AutoPlayVideo
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/hero-running-man.mp4"
              />
            </div>
            
            <div className="absolute inset-0 bg-white/85" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
              <div
                className="space-y-6"
              >
                <h2 className="text-4xl sm:text-5xl font-semibold leading-tight text-slate-900">
                  <span className="block mb-2">ビデオ背景映像ページも</span>
                  <span className="block">ご用意しております</span>
                </h2>

                <p className="text-2xl sm:text-3xl text-slate-700 font-light leading-relaxed">
                  スワイプ型LPで<br />
                  <span className="font-medium">動くビデオ背景</span>
                </p>

                <div className="inline-block bg-white/90 backdrop-blur-sm rounded-xl px-8 py-5 shadow-lg border border-slate-200">
                  <p className="text-lg sm:text-xl text-slate-700 font-light">
                    このページも走る男のビデオ背景で作成
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド10: 手書き風テンプレート */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-5xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-6">
                  手書き風も完備
                </h2>
                <p className="text-xl sm:text-2xl text-slate-600 font-light">
                  手書き風のテンプレートもご用意
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                <div
                  className="bg-white rounded-xl p-5 shadow-md border-3 border-slate-800"
                  style={{ fontFamily: "'Architects Daughter', cursive" }}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-800">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full border-2 border-slate-800"></div>
                      <div className="w-2 h-2 rounded-full border-2 border-slate-800"></div>
                      <div className="w-2 h-2 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="flex-1 border-2 border-slate-800 rounded-full px-2 py-0.5 text-xs">
                      手書き風LP
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <h3 className="text-2xl font-black mb-3 text-slate-900">
                      手書き風ヒーロー
                    </h3>
                    <p className="text-base text-slate-700 mb-4 font-light">
                      親しみやすいデザインで<br />
                      読者の心をつかむ
                    </p>
                    <div className="inline-block px-5 py-2 border-3 border-slate-800 bg-white font-bold text-base">
                      今すぐチェック
                    </div>
                  </div>
                </div>

                <div
                  className="bg-white rounded-xl p-5 shadow-md border-3 border-slate-800"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-800">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full border-2 border-slate-800"></div>
                      <div className="w-2 h-2 rounded-full border-2 border-slate-800"></div>
                      <div className="w-2 h-2 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="flex-1 border-2 border-slate-800 rounded-full px-2 py-0.5 text-xs">
                      手書き風LP
                    </div>
                  </div>
                  
                  <div className="py-5 space-y-3">
                    <div className="border-2 border-slate-800 rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="24" height="24" viewBox="0 0 60 60" className="flex-shrink-0">
                          <path d="M30,10 L35,25 L50,25 L38,35 L43,50 L30,40 L17,50 L22,35 L10,25 L25,25 Z" stroke="#000" strokeWidth="2" fill="none" />
                        </svg>
                        <h4 className="text-base font-bold">特徴1</h4>
                      </div>
                      <p className="text-xs text-slate-700 font-light">手書き風の温かみあるデザイン</p>
                    </div>
                    
                    <div className="border-2 border-slate-800 rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="24" height="24" viewBox="0 0 60 60" className="flex-shrink-0">
                          <circle cx="30" cy="30" r="20" stroke="#000" strokeWidth="2" fill="none" />
                        </svg>
                        <h4 className="text-base font-bold">特徴2</h4>
                      </div>
                      <p className="text-xs text-slate-700 font-light">親しみやすく読みやすい</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="text-center mt-10"
              >
                <div className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl shadow-lg">
                  <p className="text-lg font-medium">
                    全10種類の手書き風テンプレートを完備
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド11: 最終CTA */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto text-center">
              <div
              >
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-8 leading-tight text-white">
                  たった５分で
                  <br />
                  あなたのLPが完成
                </h2>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-xl font-semibold text-2xl shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all"
                >
                  <SparklesIcon className="w-8 h-8" />
                  今すぐ無料で始める
                  <ArrowRightIcon className="w-7 h-7" />
                </Link>

                <p className="mt-6 text-base text-white/80 font-light">
                  クレジットカード不要・いつでも解約可能
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
