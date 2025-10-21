'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ClockIcon, 
  CreditCardIcon, 
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  PaintBrushIcon,
  PhotoIcon,
  DevicePhoneMobileIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CurrencyYenIcon,
  ArrowRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // アニメーション設定
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== 1. ヒーローセクション（ビデオ背景） ===== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* ビデオ背景（仮：グラデーション） */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
          {/* TODO: 実際のビデオを用意したら以下を有効化 */}
          {/* <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40">
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video> */}
        </div>
        
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* コンテンツ */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              情報には鮮度がある。<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                1分でLP公開。
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-12">
              スワイプ型LP作成プラットフォーム<br className="md:hidden" />で、今すぐ情報商材を販売
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transform"
              >
                無料で始める →
              </Link>
              <Link
                href="/login"
                className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all font-bold text-lg"
              >
                ログイン
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-300">
              クレジットカード不要・30秒で開始
            </p>
          </motion.div>
          
          {/* スクロールヒント */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDownIcon className="w-8 h-8 text-white/60" />
          </motion.div>
        </div>
      </section>

      {/* ===== 2. 問題提起セクション ===== */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              従来のLP作成、<br className="md:hidden" />こんな悩みありませんか？
            </h2>
            <p className="text-lg text-slate-600">
              情報には鮮度がありスピードが求められるにも関わらず...
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: PaintBrushIcon, text: 'デザインを\n考えないといけない', color: 'red' },
              { icon: ShieldCheckIcon, text: 'ドメインを\n取得しないといけない', color: 'orange' },
              { icon: CreditCardIcon, text: '決済機能を\nつけないといけない', color: 'amber' },
              { icon: CurrencyYenIcon, text: '手数料が\n高いサイトが多い', color: 'rose' },
              { icon: ClockIcon, text: 'すぐに販売したいのに\n準備に時間がかかる', color: 'red' },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`bg-white p-8 rounded-2xl border-2 border-${item.color}-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-100/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`} />
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-xl bg-${item.color}-50 mb-4`}>
                    <XCircleIcon className={`w-8 h-8 text-${item.color}-600`} />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 3. ソリューションセクション ===== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                D-swipe
              </span>
              なら、すべて解決
            </h2>
            <p className="text-lg text-slate-600">
              面倒な準備は一切不要。今すぐ始められます。
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: BoltIcon, title: 'LP作成がわずか1分', desc: 'AIが質問に答えるだけで自動生成', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
              { icon: ShieldCheckIcon, title: 'ドメイン不要', desc: '専用URLを即座に発行', color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
              { icon: CreditCardIcon, title: 'ポイント決済機能付き', desc: '複雑な決済設定は不要', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
              { icon: CurrencyYenIcon, title: '手数料最安値', desc: '業界最安3%の手数料', color: 'green', gradient: 'from-green-500 to-green-600' },
              { icon: RocketLaunchIcon, title: '即座に情報商材を販売可能', desc: '審査なし・待ち時間ゼロ', color: 'orange', gradient: 'from-orange-500 to-orange-600' },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.gradient} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 4. 数字で見るD-swipe ===== */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              数字で見るD-swipe
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { number: '10,000+', label: '作成LP数', icon: ChartBarIcon },
              { number: '1.2分', label: '平均制作時間', icon: ClockIcon },
              { number: '3%', label: '業界最安手数料', icon: CurrencyYenIcon },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-6xl md:text-7xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-xl text-blue-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5. 機能詳細セクション（左右交互） ===== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              圧倒的な使いやすさ
            </h2>
            <p className="text-lg text-slate-600">
              初心者でもプロ級のLPが作れる4つの理由
            </p>
          </motion.div>

          {/* 機能1: AIでLP自動生成 */}
          <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold text-sm mb-6">
                <SparklesIcon className="w-5 h-5" />
                AI自動生成
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                AIの質問に答えると<br />基本的な型を作ってくれる
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                商品名、ターゲット、訴求ポイントを入力するだけで、AIが最適なLP構成を自動生成。デザインの知識は一切不要です。
              </p>
              <ul className="space-y-3">
                {['3つの質問に答えるだけ', '業界特化のテンプレート', '心理学に基づいた構成'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <SparklesIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-sm">AI生成デモGIF</p>
              </div>
            </div>
          </motion.div>

          {/* 機能2: カラー&文字カスタマイズ */}
          <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 md:order-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <PaintBrushIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-sm">カラーカスタマイズGIF</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-semibold text-sm mb-6">
                <PaintBrushIcon className="w-5 h-5" />
                完全カスタマイズ
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                カラーや文字も<br />自由自在にカスタマイズ
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                ブランドカラーに合わせた配色、フォント選択、レイアウト調整まで。直感的なエディタで思い通りのデザインに。
              </p>
              <ul className="space-y-3">
                {['ワンクリックでカラーテーマ変更', '11段階のシェード自動生成', 'リアルタイムプレビュー'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircleIcon className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 機能3: 画像アップロード */}
          <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-semibold text-sm mb-6">
                <PhotoIcon className="w-5 h-5" />
                簡単操作
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                お持ちの画像で<br />すぐにLP作成可能
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                ドラッグ&ドロップで画像をアップロード。メディアライブラリで一元管理。複数のLPで使い回しも簡単。
              </p>
              <ul className="space-y-3">
                {['ドラッグ&ドロップ対応', 'メディアライブラリで一元管理', '画像の差し替えも瞬時'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <PhotoIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-sm">画像アップロードGIF</p>
              </div>
            </div>
          </motion.div>

          {/* 機能4: スライド型LP */}
          <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <DevicePhoneMobileIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-sm">スワイプアニメーションGIF</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-semibold text-sm mb-6">
                <DevicePhoneMobileIcon className="w-5 h-5" />
                高訴求力
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                最も訴求効果が高い<br />スライド型LP
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                ストーリー展開でユーザーを惹きつける縦・横スワイプ対応LP。SNSネイティブ世代に最適化された体験を提供。
              </p>
              <ul className="space-y-3">
                {['縦・横スワイプ対応', 'モバイルファースト設計', '平均滞在時間2.5倍'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircleIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 6. LPギャラリーセクション ===== */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              こんなLPが作れます
            </h2>
            <p className="text-lg text-slate-300">
              カラフルで目を引く、プロフェッショナルなランディングページ
            </p>
          </motion.div>

          {/* ギャラリーグリッド */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'ビジネスコース', color: 'from-blue-500 to-blue-700', category: 'ビジネス' },
              { title: '美容サロン', color: 'from-pink-500 to-rose-700', category: '美容' },
              { title: 'オンライン講座', color: 'from-purple-500 to-purple-700', category: '教育' },
              { title: '不動産投資', color: 'from-green-500 to-green-700', category: '投資' },
              { title: 'フィットネス', color: 'from-orange-500 to-orange-700', category: '健康' },
              { title: 'コンサルティング', color: 'from-indigo-500 to-indigo-700', category: 'コンサル' },
            ].map((lp, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-2xl"
              >
                <div className={`aspect-[9/16] bg-gradient-to-br ${lp.color} p-8 flex flex-col justify-between`}>
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-semibold mb-4">
                      {lp.category}
                    </span>
                    <h4 className="text-2xl font-bold text-white">
                      {lp.title}
                    </h4>
                  </div>
                  <div className="text-white/70 text-sm">
                    タップして詳細を見る →
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 7. お客様の声セクション ===== */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              お客様の声
            </h2>
            <p className="text-lg text-slate-600">
              多くの方にご利用いただいています
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { name: '田中 健太', role: '情報商材クリエイター', comment: '今までWordPressで作っていましたが、D-swipeに変えてから作成時間が1/10に。審査待ちもないのでスピード勝負の情報商材に最適です。', rating: 5 },
              { name: '佐藤 美咲', role: 'オンラインコーチ', comment: 'デザインの知識がなくても、AIが自動で作ってくれるので助かっています。スワイプ型なので、スマホユーザーの反応が特に良いです。', rating: 5 },
              { name: '山田 太郎', role: 'デジタルマーケター', comment: '手数料3%は業界最安値。他社だと10%以上取られるので、利益率が全然違います。複数のLPを運用するなら圧倒的にお得。', rating: 5 },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  {testimonial.comment}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 8. スピード重視セクション（4ステップフロー） ===== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              煩わしい審査は一切なし
            </h2>
            <p className="text-lg text-slate-600">
              D-swipeはスピード重視。今すぐ販売を開始できます。
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="relative"
          >
            {/* フローチャート */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* 接続線（デスクトップのみ） */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 -translate-y-1/2 -z-10" />
              
              {[
                { step: '01', title: 'アカウント登録', desc: '30秒で完了', icon: ShieldCheckIcon, color: 'blue' },
                { step: '02', title: 'LP作成', desc: '1分で生成', icon: SparklesIcon, color: 'purple' },
                { step: '03', title: '集客＆宣伝', desc: 'URLを共有', icon: RocketLaunchIcon, color: 'pink' },
                { step: '04', title: '売上', desc: '即日入金可能', icon: CurrencyYenIcon, color: 'green' },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="relative"
                >
                  <div className={`bg-white p-6 rounded-2xl border-2 border-${step.color}-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 relative z-10`}>
                    <div className={`inline-flex w-full justify-center p-4 rounded-xl bg-gradient-to-br from-${step.color}-400 to-${step.color}-600 mb-4 shadow-lg`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className={`text-4xl font-bold text-${step.color}-600 mb-2 text-center`}>
                      {step.step}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2 text-center">
                      {step.title}
                    </h4>
                    <p className="text-slate-600 text-center">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="text-center mt-12">
            <p className="text-xl font-semibold text-slate-900 mb-2">
              あらゆる業者、法人、個人問わずお使いいただけます
            </p>
            <p className="text-slate-600">
              審査なし・待ち時間ゼロ・今すぐスタート
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== 9. FAQセクション ===== */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              よくある質問
            </h2>
            <p className="text-lg text-slate-600">
              お客様からよく寄せられる質問にお答えします
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              { q: '本当に1分でLP作成できますか？', a: 'はい、可能です。AIの質問に答えるだけで基本的なLP構成が完成します。その後、画像やテキストのカスタマイズを含めても5-10分程度で完成します。' },
              { q: '審査は本当にありませんか？', a: 'はい、一切ございません。アカウント登録後、すぐにLP作成と公開が可能です。スピード重視のため、煩わしい審査プロセスは設けておりません。' },
              { q: '手数料3%は本当ですか？他に費用はかかりますか？', a: '販売手数料は3%のみです。月額費用、初期費用、ドメイン費用などは一切かかりません。売上が発生した場合のみ、3%の手数料をいただきます。' },
              { q: 'どのような商材を販売できますか？', a: '情報商材全般に対応しています。オンライン講座、電子書籍、コンサルティング、会員制コンテンツなど、デジタルコンテンツであれば幅広く販売可能です。' },
              { q: 'スマホでも作成できますか？', a: 'はい、スマホ・タブレットからもLPの作成と編集が可能です。レスポンシブデザインに完全対応しており、デバイスを問わず快適にご利用いただけます。' },
              { q: '決済方法は何が使えますか？', a: 'ポイント制を採用しています。購入者はクレジットカード、銀行振込、コンビニ決済でポイントをチャージし、そのポイントで商材を購入します。販売者への入金は月末締め翌月払いです。' },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-slate-900 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDownIcon 
                    className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 10. 最終CTAセクション ===== */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              まずは無料で<br />試してみませんか？
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              クレジットカード不要・30秒で開始・審査なし
            </p>
            
            <div className="max-w-md mx-auto">
              <Link
                href="/register"
                className="block w-full px-12 py-6 bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:shadow-2xl transition-all font-bold text-2xl shadow-xl hover:scale-105 transform"
              >
                無料で始める
              </Link>
              <p className="mt-6 text-sm text-blue-100">
                既にアカウントをお持ちの方は{' '}
                <Link href="/login" className="text-white underline hover:text-blue-200">
                  ログイン
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== フッター ===== */}
      <footer className="py-8 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 D-swipe. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Backend API:{' '}
            <a 
              href="https://swipelaunch-backend.onrender.com/docs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              API Documentation
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
