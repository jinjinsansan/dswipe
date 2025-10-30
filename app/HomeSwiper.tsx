'use client';

import AutoPlayVideo from '@/components/AutoPlayVideo';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard, EffectCreative } from 'swiper/modules';
import { motion } from 'framer-motion';
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
    <div className="h-screen w-full bg-white overflow-hidden">
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
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            <div className="absolute inset-0 opacity-10">
              <AutoPlayVideo
                className="absolute inset-0 w-full h-full object-cover"
                src="/videos/pixta.mp4"
              />
            </div>
            
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 sm:mb-8 leading-tight">
                  <span className="text-slate-900">
                    情報には鮮度がある
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700">
                    ５分でLP公開
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-slate-700 mb-10 sm:mb-16 font-semibold">
                  スワイプ型LP作成プラットフォームで<br className="hidden sm:inline" />
                  今すぐデジタルコンテンツを販売
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <Link
                    href="/register"
                    className="group relative px-10 py-6 sm:px-12 sm:py-7 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <SparklesIcon className="w-7 h-7" />
                      無料で始める
                      <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="px-10 py-6 sm:px-12 sm:py-7 bg-white text-blue-600 border-3 border-blue-600 rounded-2xl font-bold text-xl hover:bg-blue-50 hover:shadow-xl transition-all"
                  >
                    ログイン
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド2: 360%上昇 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-lg sm:text-xl text-slate-600 mb-6 font-medium">
                  縦長のHPは読者には一切読まれていません。
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-slate-900 leading-tight">
                  スワイプ型LPにすることで<br />
                  <span className="text-blue-600">伝えたいことがダイレクトに伝わります</span>
                </h2>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-100 rounded-3xl blur-3xl opacity-50" />
                  <div className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-3xl p-12 sm:p-16 shadow-2xl">
                    <p className="text-white text-xl sm:text-2xl font-semibold mb-4">
                      コンバージョン率
                    </p>
                    <div className="text-8xl sm:text-9xl md:text-[12rem] font-black text-white mb-4">
                      360<span className="text-7xl sm:text-8xl">%</span>
                    </div>
                    <p className="text-white text-2xl sm:text-3xl font-bold">
                      上昇
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド3: 価格比較 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden px-6 py-12">
            <div className="w-full max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                  スワイプ型LP作成は<br className="sm:hidden" />初心者には難しい
                </h2>
                <p className="text-xl sm:text-2xl text-slate-700 font-medium">
                  大手企業がサービスを提供しているが<br />
                  <span className="text-red-600 font-bold">非常に高額</span>
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* 大手企業 */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border-4 border-slate-300 rounded-3xl p-8 shadow-xl"
                >
                  <p className="text-2xl font-bold text-slate-700 mb-6">大手企業</p>
                  <div className="text-6xl font-black text-red-600 mb-2">
                    ¥50,000
                  </div>
                  <p className="text-xl text-slate-600 font-semibold">月額〜</p>
                </motion.div>

                {/* D-swipe */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 border-4 border-blue-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12">
                    <span className="text-2xl font-black text-slate-900">NEW</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-6">D-swipe</p>
                  <div className="text-6xl font-black text-white mb-2">
                    ¥0
                  </div>
                  <p className="text-xl text-white font-bold">何個作成しても無料</p>
                </motion.div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド4: 差別化 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  他社との決定的な違い
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* 他社 */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-100 border-3 border-slate-300 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <XMarkIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">他社サービス</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-lg text-slate-700">ほとんど画像をスワイプ型にしている</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-lg text-slate-700">１ページごとに画像を作成する手間</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <XMarkIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <p className="text-lg text-slate-700">スワイプの感触もゴツゴツ</p>
                    </div>
                  </div>
                </motion.div>

                {/* D-swipe */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 border-3 border-blue-700 rounded-2xl p-8 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">D-swipe</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <p className="text-lg text-white font-semibold">画像も対応</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <p className="text-lg text-white font-semibold">AIアシスタントが５分で基礎を作成</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <p className="text-lg text-white font-semibold">Webサイト感がそのままスワイプ型へ</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                      <p className="text-lg text-white font-semibold">スワイプ時の感触も◎</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド5: 販売者メリット1 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <p className="text-lg text-blue-600 font-bold mb-4">SELLER BENEFITS</p>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                  販売者側メリット
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-blue-200"
              >
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">無料で無制限にLP作成</h3>
                      <p className="text-lg text-slate-600">いくつ作っても完全無料</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">有料・無料NOTE記事作成</h3>
                      <p className="text-lg text-slate-600">記事型コンテンツも販売可能</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">使用料は半永久無料</h3>
                      <p className="text-lg text-slate-600">月額費用・初期費用なし</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">10日間おきにUSDTでお支払い</h3>
                      <p className="text-lg text-slate-600">手数料は業界最安の7.5%のみ</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド6: 販売者メリット2 */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-white overflow-hidden px-6 py-12">
            <div className="w-full max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <p className="text-lg text-blue-600 font-bold mb-4">SELLER BENEFITS 2</p>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900">
                  やることはシンプル
                </h2>
              </motion.div>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-blue-600">
                      1
                    </div>
                    <h3 className="text-3xl font-bold text-white">スワイプLPかNOTEを作成</h3>
                  </div>
                  <p className="text-xl text-white font-medium">AIアシスタントで5分で完成</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-purple-600">
                      2
                    </div>
                    <h3 className="text-3xl font-bold text-white">宣伝するだけ</h3>
                  </div>
                  <p className="text-xl text-white font-medium">マーケットエリアからもお客様が流入</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 shadow-xl text-center"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <ShieldCheckIcon className="w-12 h-12 text-white" />
                    <h3 className="text-3xl font-bold text-white">審査なし・即宣伝可能</h3>
                  </div>
                  <p className="text-xl text-white font-medium">デジタルコンテンツに煩わしい審査なし</p>
                </motion.div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド7: 購入者メリット */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 overflow-hidden px-6 py-12">
            <div className="w-full max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <p className="text-lg text-purple-600 font-bold mb-4">BUYER BENEFITS</p>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900">
                  購入者側メリット
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BoltIcon className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">登録はわずか30秒</h3>
                  <p className="text-lg text-slate-600 text-center">すぐに購入開始</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCardIcon className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">決済方法が豊富</h3>
                  <p className="text-lg text-slate-600 text-center">クレカ・USDT対応</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SparklesIcon className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">様々なポイント獲得企画</h3>
                  <p className="text-lg text-slate-600 text-center">お得に購入可能</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RocketLaunchIcon className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">デジタルコンテンツを即座に購入</h3>
                  <p className="text-lg text-slate-600 text-center">待ち時間なし</p>
                </motion.div>
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
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/95 to-slate-100/95" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="text-slate-900">このページも</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700">
                    LPエディタで作成
                  </span>
                </h2>

                <p className="text-2xl sm:text-3xl md:text-4xl text-slate-800 font-bold leading-relaxed">
                  あなたが見ている<br className="sm:hidden" />このTOPページ自体が
                  <br />
                  <span className="text-blue-600">LPエディタの実力の証明</span>です
                </p>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 px-12 py-7 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all"
                >
                  <RocketLaunchIcon className="w-8 h-8" />
                  今すぐエディタを試す
                  <ArrowRightIcon className="w-7 h-7" />
                </Link>
              </motion.div>
            </div>
          </div>
        </SwiperSlide>

        {/* スライド9: 最終CTA */}
        <SwiperSlide>
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 overflow-hidden px-6 py-12">
            <div className="w-full max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight text-white">
                  たった５分で
                  <br />
                  あなたのLPが完成
                </h2>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-4 px-14 py-8 bg-white text-blue-600 rounded-3xl font-black text-3xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all"
                >
                  <SparklesIcon className="w-10 h-10" />
                  今すぐ無料で始める
                  <ArrowRightIcon className="w-9 h-9" />
                </Link>

                <p className="mt-8 text-xl text-white font-semibold">
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
