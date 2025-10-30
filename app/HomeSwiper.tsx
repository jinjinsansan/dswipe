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
        speed={350}
        touchRatio={1.8}
        threshold={3}
        resistance={true}
        resistanceRatio={0.65}
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
                  スワイプ型LPにすることで
                  <span className="text-slate-700">伝えたいことがダイレクトに伝わります</span>
                </h2>
                
                <div className="relative max-w-2xl mx-auto">
                  <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 sm:p-12 shadow-xl border border-blue-200">
                    <p className="text-slate-700 text-base sm:text-lg font-light mb-4 leading-relaxed">
                      縦長LPと比べて<br />
                      スワイプ型LPは読み飛ばしされにくく<br />
                      離脱されにくい
                    </p>
                    <div className="border-t-2 border-blue-300 my-4"></div>
                    <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2">
                      コンバージョン率は
                    </p>
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-blue-600 mb-2">
                      縦長LPの3倍UP
                    </div>
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
                  <p className="text-lg font-medium text-slate-600 mb-4">大手企業スワイプ型LP作成サービス</p>
                  <div className="text-5xl font-bold text-red-600 mb-2">
                    ¥50,000
                  </div>
                  <p className="text-base text-slate-500 font-light">月額50000円以上〜</p>
                </div>

                <div
                  className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-800 rounded-xl p-6 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute -top-2 -right-2 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12">
                    <span className="text-sm font-bold text-slate-900">NEW</span>
                  </div>
                  <p className="text-lg font-medium text-white/90 mb-4">D-swipe</p>
                  <div className="text-5xl font-bold text-white mb-2">
                    ¥0
                  </div>
                  <p className="text-base text-white/80 font-light">何個作成しても無料</p>
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
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-slate-900 to-blue-600 leading-tight">
                  他社との決定的な違い
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="bg-gradient-to-br from-red-50 to-orange-50 border-3 border-red-400 rounded-xl p-6 shadow-xl relative"
                >
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <XMarkIcon className="w-10 h-10 text-white stroke-[3]" />
                  </div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                      <XMarkIcon className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                    <p className="text-xl font-bold text-red-700">他社サービス</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2 border-l-4 border-red-500">
                      <XMarkIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-slate-800 font-medium">ほとんど画像をスワイプ型にしている</p>
                    </div>
                    <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2 border-l-4 border-red-500">
                      <XMarkIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-slate-800 font-medium">１ページごとに画像を作成する手間</p>
                    </div>
                    <div className="flex items-start gap-2 bg-white/70 rounded-lg p-2 border-l-4 border-red-500">
                      <XMarkIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-slate-800 font-medium">スワイプの感触もゴツゴツ</p>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 border-3 border-blue-800 rounded-xl p-6 shadow-2xl relative"
                >
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-10 h-10 text-blue-900 stroke-[3]" />
                  </div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircleIcon className="w-6 h-6 text-blue-900 stroke-[3]" />
                    </div>
                    <p className="text-xl font-bold text-white drop-shadow-md">D-swipe</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2 border-l-4 border-green-400">
                      <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-white font-semibold">画像も対応</p>
                    </div>
                    <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2 border-l-4 border-green-400">
                      <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-white font-semibold">AIアシスタントが５分で基礎を作成</p>
                    </div>
                    <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2 border-l-4 border-green-400">
                      <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-white font-semibold">Webサイト感がそのままスワイプ型へ</p>
                    </div>
                    <div className="flex items-start gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2 border-l-4 border-green-400">
                      <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-sm text-white font-semibold">スワイプ時の感触も◎</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド5: 販売者メリット1 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-50 overflow-hidden px-6 py-12">
            <div className="w-full max-w-3xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <p className="text-sm text-blue-600 font-bold mb-3 uppercase tracking-wider">SELLER BENEFITS</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  販売者側メリット
                </h2>
              </div>

              <div
                className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 rounded-2xl p-8 shadow-2xl border-3 border-slate-700 relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="space-y-5 relative z-10">
                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 border-green-400 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircleIcon className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">無料で無制限にLP作成</h3>
                      <p className="text-sm text-white/90 font-semibold">いくつ作っても完全無料</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 border-blue-400 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircleIcon className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">有料・無料NOTE記事作成</h3>
                      <p className="text-sm text-white/90 font-semibold">記事型コンテンツも販売可能</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 border-purple-400 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircleIcon className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">使用料は半永久無料</h3>
                      <p className="text-sm text-white/90 font-semibold">月額費用・初期費用なし</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 border-yellow-400 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <CurrencyDollarIcon className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">10日間おきにUSDTでお支払い</h3>
                      <p className="text-sm text-white/90 font-semibold">手数料は業界最安の7.5%のみ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド6: 販売者メリット2 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-cyan-50 to-blue-50 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
              <div
                className="text-center mb-10"
              >
                <p className="text-sm text-cyan-600 font-bold mb-3 uppercase tracking-wider">SELLER BENEFITS 2</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                  やることはシンプル
                </h2>
              </div>

              <div className="space-y-6">
                <div
                  className="bg-gradient-to-br from-blue-500 to-blue-600 border-3 border-blue-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 shadow-lg">
                      1
                    </div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">スワイプLPかNOTEを作成</h3>
                  </div>
                  <p className="text-base text-white/95 font-semibold relative z-10">AIアシスタントで5分で完成</p>
                </div>

                <div
                  className="bg-gradient-to-br from-cyan-500 to-teal-600 border-3 border-cyan-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-cyan-600 shadow-lg">
                      2
                    </div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">宣伝するだけ</h3>
                  </div>
                  <p className="text-base text-white/95 font-semibold relative z-10">マーケットエリアからもお客様が流入</p>
                </div>

                <div
                  className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl text-center border-3 border-indigo-800 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/30 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-center gap-3 mb-3 relative z-10">
                    <ShieldCheckIcon className="w-12 h-12 text-white stroke-[2.5]" />
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">審査なし・即宣伝可能</h3>
                  </div>
                  <p className="text-base text-white/95 font-semibold relative z-10">デジタルコンテンツに煩わしい審査なし</p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド7: 購入者メリット */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-amber-50 overflow-hidden px-4 py-8">
            <div className="w-full max-w-4xl mx-auto">
              <div
                className="text-center mb-6"
              >
                <p className="text-xs text-orange-600 font-bold mb-2 uppercase tracking-wider">BUYER BENEFITS</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
                  購入者側メリット
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 shadow-xl border-2 border-blue-700 relative overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
                    <BoltIcon className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 text-center drop-shadow-md relative z-10">登録はわずか30秒</h3>
                  <p className="text-xs text-white/95 text-center font-semibold relative z-10">すぐに購入開始</p>
                </div>

                <div
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 shadow-xl border-2 border-green-700 relative overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
                    <CreditCardIcon className="w-5 h-5 text-green-600 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 text-center drop-shadow-md relative z-10">決済方法が豊富</h3>
                  <p className="text-xs text-white/95 text-center font-semibold relative z-10">クレカ・USDT対応</p>
                </div>

                <div
                  className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl p-4 shadow-xl border-2 border-purple-700 relative overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
                    <SparklesIcon className="w-5 h-5 text-purple-600 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 text-center drop-shadow-md relative z-10">様々なポイント獲得企画</h3>
                  <p className="text-xs text-white/95 text-center font-semibold relative z-10">お得に購入可能</p>
                </div>

                <div
                  className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 shadow-xl border-2 border-orange-700 relative overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
                    <RocketLaunchIcon className="w-5 h-5 text-orange-600 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 text-center drop-shadow-md relative z-10">デジタルコンテンツを即座に購入</h3>
                  <p className="text-xs text-white/95 text-center font-semibold relative z-10">待ち時間なし</p>
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

        {/* スライド10: 手書き風テンプレート */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white overflow-hidden px-4 py-8">
            <div className="w-full max-w-5xl mx-auto">
              <div
                className="text-center mb-6"
              >
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
                  手書き風も完備
                </h2>
                <p className="text-base sm:text-xl text-slate-600 font-light">
                  手書き風のテンプレートもご用意
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3.5 max-w-4xl mx-auto">
                <div
                  className="bg-white rounded-xl p-3.5 shadow-md border-3 border-slate-800"
                  style={{ fontFamily: "'Architects Daughter', cursive" }}
                >
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b-2 border-slate-800">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-800"></div>
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-800"></div>
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="flex-1 border-2 border-slate-800 rounded-full px-1.5 py-0.5 text-[10px]">
                      手書き風LP
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <h3 className="text-xl font-black mb-2 text-slate-900">
                      手書き風ヒーロー
                    </h3>
                    <p className="text-sm text-slate-700 mb-3 font-light">
                      親しみやすいデザインで<br />
                      読者の心をつかむ
                    </p>
                    <div className="inline-block px-4 py-1.5 border-3 border-slate-800 bg-white font-bold text-sm">
                      今すぐチェック
                    </div>
                  </div>
                </div>

                <div
                  className="bg-white rounded-xl p-3.5 shadow-md border-3 border-slate-800"
                  style={{ fontFamily: "'Indie Flower', cursive" }}
                >
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b-2 border-slate-800">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-800"></div>
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-800"></div>
                      <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-800"></div>
                    </div>
                    <div className="flex-1 border-2 border-slate-800 rounded-full px-1.5 py-0.5 text-[10px]">
                      手書き風LP
                    </div>
                  </div>
                  
                  <div className="py-3.5 space-y-2">
                    <div className="border-2 border-slate-800 rounded-lg p-2 bg-white">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg width="18" height="18" viewBox="0 0 60 60" className="flex-shrink-0">
                          <path d="M30,10 L35,25 L50,25 L38,35 L43,50 L30,40 L17,50 L22,35 L10,25 L25,25 Z" stroke="#000" strokeWidth="2" fill="none" />
                        </svg>
                        <h4 className="text-base font-bold">特徴1</h4>
                      </div>
                      <p className="text-xs text-slate-700 font-light">手書き風の温かみあるデザイン</p>
                    </div>
                    
                    <div className="border-2 border-slate-800 rounded-lg p-2 bg-white">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg width="18" height="18" viewBox="0 0 60 60" className="flex-shrink-0">
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
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto text-center">
              <div
              >
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
                  たった5分で
                  <br />
                  あなたのLPが完成
                </h2>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all border border-blue-800"
                >
                  <RocketLaunchIcon className="w-5 h-5" />
                  D-swipeを始める
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>

                <p className="mt-6 text-sm text-slate-600 font-medium">
                  有料NOTE機能付き・商材審査なし・報酬支払はUSDT
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
