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
  CurrencyDollarIcon,
  BoltIcon,
  ShieldCheckIcon,
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
                    className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-2xl border-2 border-white hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105"
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
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden px-4 py-8">
            <div className="w-full max-w-4xl mx-auto text-center">
              <div>
                <p className="text-sm sm:text-lg text-slate-600 mb-3 sm:mb-5 font-light">
                  縦長のHPは読者には一切読まれていません。
                </p>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold mb-6 sm:mb-8 text-slate-900 leading-tight">
                  スワイプ型LPは縦長LPと比べて<br />
                  ３倍離脱されない分析結果があります
                </h2>
                
                <div className="relative max-w-2xl mx-auto">
                  <div className="relative bg-white rounded-2xl p-6 sm:p-10 md:p-12 shadow-2xl border-4 border-blue-600">
                    <p className="text-slate-700 text-lg sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3">
                      コンバージョン率は
                    </p>
                    <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600">
                      縦長LPの３倍増
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド3: 価格比較 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-4 py-8">
            <div className="w-full max-w-5xl mx-auto text-center">
              <div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4 text-slate-900 leading-tight">
                  スワイプ型LP作成は初心者には難しい
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 font-light mb-6 sm:mb-10">
                  大手企業がサービスを提供しているが<br />
                  <span className="text-red-600 font-medium">非常に高額</span>
                </p>

                <div className="space-y-4 max-w-2xl mx-auto mb-6">
                  <div className="bg-white border-2 border-red-300 rounded-xl p-4 shadow-sm">
                    <p className="text-sm sm:text-base font-medium text-slate-600 mb-2">大手企業スワイプ型LP作成サービス</p>
                    <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1">
                      ¥50,000
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-light">月額50000円以上〜</p>
                  </div>

                  <div className="relative bg-white rounded-2xl p-6 sm:p-10 md:p-12 shadow-2xl border-4 border-blue-600">
                    <p className="text-slate-700 text-lg sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3">
                      D-swipe
                    </p>
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-blue-600 mb-2">
                      ¥0
                    </div>
                    <p className="text-base sm:text-lg md:text-xl text-slate-700 font-medium">何個作成しても無料</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド4: 差別化 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden px-4 py-8">
            <div className="w-full max-w-4xl mx-auto text-center">
              <div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-slate-900 leading-tight">
                  他社との決定的な違い
                </h2>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="bg-white border-2 border-red-300 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <XMarkIcon className="w-5 h-5 text-white stroke-[2.5]" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-red-700">他社サービス</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-start gap-2">
                        <XMarkIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 stroke-[2]" />
                        <p className="text-xs sm:text-sm text-slate-700">ほとんど画像をスワイプ型にしている</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <XMarkIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 stroke-[2]" />
                        <p className="text-xs sm:text-sm text-slate-700">１ページごとに画像を作成する手間</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <XMarkIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 stroke-[2]" />
                        <p className="text-xs sm:text-sm text-slate-700">スワイプの感触もゴツゴツ</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-2xl p-6 sm:p-10 md:p-12 shadow-2xl border-4 border-blue-600">
                    <p className="text-slate-700 text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                      D-swipe
                    </p>
                    <div className="space-y-3 sm:space-y-4 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <p className="text-base sm:text-lg md:text-xl text-slate-700 font-semibold">画像も対応</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <p className="text-base sm:text-lg md:text-xl text-slate-700 font-semibold">AIアシスタントが５分で基礎を作成</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <p className="text-base sm:text-lg md:text-xl text-slate-700 font-semibold">Webサイト感がそのままスワイプ型へ</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <p className="text-base sm:text-lg md:text-xl text-slate-700 font-semibold">スワイプ時の感触も◎</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド5: 販売者メリット1 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-50 overflow-hidden px-4 py-8">
            <div className="w-full max-w-3xl mx-auto text-center">
              <div>
                <p className="text-xs sm:text-sm text-blue-600 font-bold mb-2 sm:mb-3 uppercase tracking-wider">SELLER BENEFITS</p>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-slate-900">
                  販売者側メリット
                </h2>

                <div className="relative bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border-4 border-blue-600">
                  <div className="space-y-4 sm:space-y-5 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">無料で無制限にLP作成</h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">いくつ作っても完全無料</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">有料・無料NOTE記事作成</h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">記事型コンテンツも販売可能</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">サブスクリプション商材も販売可能</h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">月額課金型の商品も対応</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">使用料は半永久無料</h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">月額費用・初期費用なし</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CurrencyDollarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">10日間おきにUSDTでお支払い</h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">手数料は業界最安の7.5%のみ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド6: 販売者メリット2 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-cyan-50 to-blue-50 overflow-hidden px-4 py-8">
            <div className="w-full max-w-4xl mx-auto text-center">
              <div>
                <p className="text-xs sm:text-sm text-cyan-600 font-bold mb-2 sm:mb-3 uppercase tracking-wider">SELLER BENEFITS 2</p>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-slate-900">
                  やることはシンプル
                </h2>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-md">
                        1
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">スワイプLPかNOTEを作成</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium text-left pl-13 sm:pl-15">AIアシスタントで5分で完成</p>
                  </div>

                  <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-md">
                        2
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">宣伝するだけ</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium text-left pl-13 sm:pl-15">マーケットエリアからもお客様が流入</p>
                  </div>

                  <div className="relative bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border-4 border-blue-600">
                    <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                      <ShieldCheckIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 stroke-[2.5]" />
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">審査なし・即宣伝可能</h3>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl text-slate-700 font-semibold">デジタルコンテンツに煩わしい審査なし</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド7: 購入者メリット */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-amber-50 overflow-hidden px-4 py-8">
            <div className="w-full max-w-3xl mx-auto text-center">
              <div>
                <p className="text-xs sm:text-sm text-slate-900 font-bold mb-2 sm:mb-3 uppercase tracking-wider">BUYER BENEFITS</p>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-slate-900">
                  購入者側メリット
                </h2>

                <div className="relative bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border-4 border-blue-600">
                  <div className="space-y-4 sm:space-y-5 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <BoltIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">登録はわずか30秒</h3>
                        <p className="text-xs sm:text-sm text-slate-700 font-bold">すぐに購入開始</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CreditCardIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">決済方法が豊富</h3>
                        <p className="text-xs sm:text-sm text-slate-700 font-bold">クレカ・USDT対応</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <SparklesIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">あらゆるジャンルデジタル商材を選べる</h3>
                        <p className="text-xs sm:text-sm text-slate-700 font-bold">豊富なラインナップ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <RocketLaunchIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1">デジタルコンテンツを即座に購入</h3>
                        <p className="text-xs sm:text-sm text-slate-700 font-bold">待ち時間なし</p>
                      </div>
                    </div>
                  </div>
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
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
              <div
                className="space-y-8"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-pure-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)' }}>
                  <span className="block mb-2">このページも</span>
                  <span className="block">LPエディタで作成</span>
                </h2>

                <p className="text-xl sm:text-2xl md:text-3xl text-pure-white font-bold leading-relaxed drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 0 15px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.7)' }}>
                  あなたが見ているこのTOPページ自体が<br />
                  <span className="font-bold">LPエディタの実力の証明</span>です
                </p>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-sky-300/80 text-pure-white rounded-lg font-medium text-lg shadow-xl hover:bg-sky-300 hover:scale-105 transition-all"
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
