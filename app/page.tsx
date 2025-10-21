'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
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

export default function Home() {
  const [selectedFaq, setSelectedFaq] = useState<number>(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  
  // ビデオを10秒ごとに切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev === 0 ? 1 : 0));
    }, 10000); // 10秒ごとに切り替え
    
    return () => clearInterval(interval);
  }, []);

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

  const painPoints = [
    {
      icon: PaintBrushIcon,
      title: 'デザイン設計に時間を奪われる',
      description: 'LPの構成やビジュアルをゼロから整えるのは非効率で、差別化にも限界があります。',
      iconGradient: 'from-[#1f3a8a] via-[#1c2f63] to-[#0b152f]',
      shadowGlow: 'shadow-indigo-500/25'
    },
    {
      icon: GlobeAltIcon,
      title: 'ドメイン・サーバー整備が面倒',
      description: '取得・設定・SSL対応まで社内で段取りを組む必要があり、初動が遅れます。',
      iconGradient: 'from-[#0f3b3a] via-[#0b2d2c] to-[#061818]',
      shadowGlow: 'shadow-emerald-500/20'
    },
    {
      icon: CreditCardIcon,
      title: '決済機能の実装ハードル',
      description: '安全な決済フローを自前で準備するには高い技術コストとセキュリティの知見が求められます。',
      iconGradient: 'from-[#3b2468] via-[#2a1a4a] to-[#150d28]',
      shadowGlow: 'shadow-violet-500/25'
    },
    {
      icon: CurrencyYenIcon,
      title: '販売手数料がかさむ',
      description: '既存プラットフォームの高い手数料に依存すると利益率が大幅に削られます。',
      iconGradient: 'from-[#7a4312] via-[#4f2a0d] to-[#2b1607]',
      shadowGlow: 'shadow-amber-500/25'
    },
    {
      icon: ClockIcon,
      title: 'スピード感が阻害される',
      description: 'ローンチに至るまでの調整項目が多く、旬な情報を届けるタイミングを逃してしまいます。',
      iconGradient: 'from-[#3b2f55] via-[#251e39] to-[#120d1d]',
      shadowGlow: 'shadow-purple-500/20'
    }
  ];

  const solutionHighlights = [
    {
      icon: BoltIcon,
      label: 'Speed',
      title: 'LP作成がわずか1分',
      description: 'AIアシスタントがヒアリングしながら最適な構成を即時生成。試作品づくりの時間を大幅に短縮します。',
      cardClass: 'bg-gradient-to-br from-blue-50 via-white to-white border border-blue-100/60',
      iconClass: 'bg-gradient-to-br from-blue-600 to-indigo-500',
      accentClass: 'text-blue-600'
    },
    {
      icon: ShieldCheckIcon,
      label: 'Security',
      title: 'ドメイン・SSL完備',
      description: '煩雑なドメイン取得やSSL設定は不要。企業水準のセキュリティで即日運用が可能です。',
      cardClass: 'bg-gradient-to-br from-slate-50 via-white to-white border border-slate-200/70',
      iconClass: 'bg-gradient-to-br from-slate-900 to-slate-700',
      accentClass: 'text-slate-700'
    },
    {
      icon: CreditCardIcon,
      label: 'Payment',
      title: 'ポイント決済を標準搭載',
      description: 'カード・銀行振込・コンビニ決済をカバー。自社での PCI DSS 対応は不要です。',
      cardClass: 'bg-gradient-to-br from-purple-50 via-white to-white border border-purple-100/60',
      iconClass: 'bg-gradient-to-br from-purple-600 to-fuchsia-500',
      accentClass: 'text-purple-600'
    },
    {
      icon: CurrencyYenIcon,
      label: 'Profit',
      title: '業界最安3%の手数料',
      description: '売上が発生したときだけ 3% をお支払い。高い利益率を維持したまま拡張できます。',
      cardClass: 'bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100/60',
      iconClass: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      accentClass: 'text-emerald-600'
    },
    {
      icon: RocketLaunchIcon,
      label: 'Launch',
      title: '審査なしで即リリース',
      description: '社内承認を待つことなく、その日のうちにローンチ。旬な情報発信に対応します。',
      cardClass: 'bg-gradient-to-br from-orange-50 via-white to-white border border-orange-100/60',
      iconClass: 'bg-gradient-to-br from-orange-500 to-rose-500',
      accentClass: 'text-orange-600'
    }
  ];

  const statsMetrics = [
    {
      icon: ChartBarIcon,
      value: '10,000+',
      label: 'グループでのユーザー数',
      detail: 'Dグループはサービスを拡大します。'
    },
    {
      icon: ClockIcon,
      value: '1.2 分',
      label: '平均制作時間',
      detail: '入力から公開までの平均所要時間。最速 47 秒の事例も。'
    },
    {
      icon: CurrencyYenIcon,
      value: '3 %',
      label: '販売手数料',
      detail: '固定費ゼロ。売上が発生したタイミングのみ課金します。'
    }
  ];

  const featureTimeline = [
    {
      icon: SparklesIcon,
      tag: 'AI自動生成',
      title: 'ヒアリングに答えるだけで下地が完成',
      description: '商品概要・ターゲット・訴求ポイントを入力すると、AIが構成案をその場で提案。コピーも自動生成されるため、ゼロから書き起こす必要はありません。',
      bullets: [
        {
          title: 'ヒアリングオートメーション',
          description: '3ステップの質問フローで要件を抽出し、AIが瞬時に構成案を生成。',
          accent: {
            gradient: 'from-blue-500/18 via-blue-500/6 to-transparent',
            border: 'border-blue-400/25',
            text: 'text-blue-500'
          }
        },
        {
          title: 'リアルタイムプレビュー',
          description: '入力と同時にプレビューが更新され、認識合わせにかかる往復時間を削減します。',
          accent: {
            gradient: 'from-indigo-500/18 via-indigo-500/6 to-transparent',
            border: 'border-indigo-400/25',
            text: 'text-indigo-500'
          }
        },
        {
          title: 'ブランドトーン補正',
          description: '登録済みのブランドトーンを学習し、コピーと配色を企業基準に自動調整。',
          accent: {
            gradient: 'from-cyan-500/16 via-cyan-500/5 to-transparent',
            border: 'border-cyan-400/25',
            text: 'text-cyan-500'
          }
        }
      ]
    },
    {
      icon: PaintBrushIcon,
      tag: 'デザインコントロール',
      title: 'ブランドに合わせた演出を瞬時に反映',
      description: 'カラーパレット／タイポグラフィ／コンポーネントのレイアウトを自由に設定可能。全11段階のシェードが自動生成され、統一感あるトーンに仕上がります。',
      bullets: [
        {
          title: 'ライブスタイルガイド',
          description: '配色とタイポグラフィの更新が全セクションへ瞬時に反映され、ブランドの一貫性を保持。',
          accent: {
            gradient: 'from-violet-500/18 via-violet-500/6 to-transparent',
            border: 'border-violet-400/25',
            text: 'text-violet-500'
          }
        },
        {
          title: 'プレミアムブロック',
          description: 'CTAやカードなどの高品質コンポーネントをドラッグ＆ドロップで切り替え可能。',
          accent: {
            gradient: 'from-slate-600/16 via-slate-600/5 to-transparent',
            border: 'border-slate-400/25',
            text: 'text-slate-600'
          }
        },
        {
          title: 'アクセント自動展開',
          description: '選択したキーカラーから11段階のシェードを生成し、背景やボタンに最適化。',
          accent: {
            gradient: 'from-sky-500/18 via-sky-500/6 to-transparent',
            border: 'border-sky-400/25',
            text: 'text-sky-500'
          }
        }
      ]
    },
    {
      icon: PhotoIcon,
      tag: 'メディアライブラリ',
      title: '画像・動画アセットを一元管理',
      description: 'ドラッグ＆ドロップでアップロードすると、自動で複数デバイス向けに最適化。LP間での使い回しもライブラリからワンクリックです。',
      bullets: [
        {
          title: 'スマートアップロード',
          description: 'ファイル形式に応じた自動最適化とタグ付けで、管理コストを最小化します。',
          accent: {
            gradient: 'from-emerald-500/17 via-emerald-500/6 to-transparent',
            border: 'border-emerald-400/25',
            text: 'text-emerald-500'
          }
        },
        {
          title: 'バージョンタイムライン',
          description: '更新履歴と差し替え先を時系列で記録し、レビュー体制を可視化。',
          accent: {
            gradient: 'from-teal-500/17 via-teal-500/6 to-transparent',
            border: 'border-teal-400/25',
            text: 'text-teal-500'
          }
        },
        {
          title: '権限コントロール',
          description: 'メンバー種別ごとにアップロードや公開権限を細分化し、リスクを抑制。',
          accent: {
            gradient: 'from-slate-700/15 via-slate-700/5 to-transparent',
            border: 'border-slate-500/25',
            text: 'text-slate-600'
          }
        }
      ]
    },
    {
      icon: DevicePhoneMobileIcon,
      tag: 'スワイプ体験',
      title: 'SNSネイティブ世代に刺さる体験設計',
      description: '縦横のスワイプ操作に最適化したUX。シームレスなアニメーションとストーリーテリングで、平均滞在時間が 2.5 倍に伸びています。',
      bullets: [
        {
          title: '動線最適化',
          description: 'スワイプ方向ごとの導線をA/Bテストし、離脱率を継続的に改善します。',
          accent: {
            gradient: 'from-rose-500/19 via-rose-500/6 to-transparent',
            border: 'border-rose-400/25',
            text: 'text-rose-500'
          }
        },
        {
          title: 'マイクロインタラクション',
          description: 'スクロール量に応じたアニメーションとエフェクトでブランド体験を強調。',
          accent: {
            gradient: 'from-purple-500/18 via-purple-500/6 to-transparent',
            border: 'border-purple-400/25',
            text: 'text-purple-500'
          }
        },
        {
          title: '多端末レビューモード',
          description: 'iOS・Android・デスクトップのプレビューを並列表示し、体験を統一。',
          accent: {
            gradient: 'from-blue-500/18 via-blue-500/6 to-transparent',
            border: 'border-blue-400/25',
            text: 'text-blue-500'
          }
        }
      ]
    }
  ];

  const galleryShowcase = [
    {
      title: 'Executive Briefing',
      category: 'コンサル',
      palette: 'from-[#0F172A] via-[#1E3A8A] to-[#0F172A]',
      description: '企業トップ向けの戦略ブリーフィングLP。指標カードとKPIをガラス質感で配置し、上質なネイビーのグラデを基調にした構成。',
      heroImage: '/gallery/executive-briefing.jpg',
      stats: [
        { label: 'プロジェクト実績', value: '500+', accent: 'text-blue-200/90' },
        { label: '顧客満足度', value: '98%', accent: 'text-blue-200/90' }
      ]
    },
    {
      title: 'Luxe Beauty Retreat',
      category: '美容',
      palette: 'from-[#3B0764] via-[#BE123C] to-[#4C1D95]',
      description: '高級美容プロダクトの販売用LP。グロッシーなモジュールと限定プランバッジを持たせた、ローズ×パープルのラグジュアリーなトーン。',
      heroImage: '/gallery/luxe-beauty.jpg',
      collage: ['/gallery/luxe-beauty-treatment.jpg', '/gallery/luxe-beauty-massage.jpg', '/gallery/luxe-beauty-premium.jpg']
    },
    {
      title: 'Next-Growth Academy',
      category: '教育',
      palette: 'from-[#1E3A8A] via-[#6366F1] to-[#312E81]',
      description: '教育業界向けのアカデミーLP。学習ロードマップや講師紹介、成果指標をインジケーター付きで提示するリッチなレイアウト。',
      heroImage: '/gallery/next-growth.svg',
      stats: [{ label: '受講生', value: '50,000+', accent: 'text-indigo-100/90' }]
    },
    {
      title: 'Prime Investment Deck',
      category: '投資',
      palette: 'from-[#0F766E] via-[#10B981] to-[#0B4F46]',
      description: '投資家向けピッチデッキ。実績チャートやフィードバックをガラスカードで配置し、コンプライアンス情報を含んだ信頼重視のデザイン。',
      heroImage: '/gallery/digital-launch.jpg',
      stats: [{ label: '投資家評価', value: 'A+', accent: 'text-emerald-100/90' }]
    },
    {
      title: 'Momentum Fitness Lab',
      category: '健康',
      palette: 'from-[#9A3412] via-[#EA580C] to-[#7C2D12]',
      description: 'フィットネスブランドのオンラインラボ。トレーナー紹介とプログラム比較、スケジュールチップで構成するダイナミックな画面。',
      heroImage: '/gallery/momentum-fitness.jpg',
      stats: [{ label: '新規LP/日', value: '120', accent: 'text-amber-200/90' }]
    },
    {
      title: 'Digital Launch Studio',
      category: 'スタートアップ',
      palette: 'from-[#1E293B] via-[#334155] to-[#0F172A]',
      description: 'スタートアップの自動化プラットフォーム。製品UIを前面に出し、機能グリッドと自動化フロー図をハイライト。',
      heroImage: '/gallery/digital-launch.jpg',
      stats: [{ label: 'ARR', value: '¥1.2B', accent: 'text-cyan-200/90' }]
    }
  ];

  const testimonialVoices = [
    {
      name: '田中 健太',
      role: '情報商材クリエイター',
      comment: 'WordPress での制作から乗り換えて、ローンチまでのリードタイムが 1/10 に短縮されました。市場投入のスピード感が全く違います。'
    },
    {
      name: '佐藤 美咲',
      role: 'オンラインコーチ',
      comment: 'テキストもデザインもガイドしてくれるので、制作未経験でも安心。スマホからのコンバージョン率が顕著に向上しました。'
    },
    {
      name: '山田 太郎',
      role: 'デジタルマーケター',
      comment: '手数料 3% でこのクオリティは破格です。複数LPをA/Bテストする運用にベストフィットでした。'
    }
  ];

  const flowSteps = [
    {
      icon: ShieldCheckIcon,
      step: 'STEP 01',
      title: 'アカウント登録',
      meta: '30秒で完了',
      description: 'メールアドレスと基本情報だけでスタート。すぐに管理画面へアクセスできます。',
      accent: {
        ring: 'ring-1 ring-blue-400/30',
        icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
        text: 'text-blue-500'
      }
    },
    {
      icon: SparklesIcon,
      step: 'STEP 02',
      title: 'LP作成',
      meta: '平均1.2分',
      description: 'AIガイドに沿って入力するだけ。配色やイメージ画像も同時に設定できます。',
      accent: {
        ring: 'ring-1 ring-indigo-400/30',
        icon: 'bg-gradient-to-br from-indigo-500 to-purple-500',
        text: 'text-indigo-500'
      }
    },
    {
      icon: RocketLaunchIcon,
      step: 'STEP 03',
      title: '公開・集客',
      meta: 'URL即発行',
      description: '生成された専用URLをSNSやメールで共有。スワイプ体験で訴求力を高めます。',
      accent: {
        ring: 'ring-1 ring-rose-400/30',
        icon: 'bg-gradient-to-br from-rose-500 to-pink-500',
        text: 'text-rose-500'
      }
    },
    {
      icon: CurrencyYenIcon,
      step: 'STEP 04',
      title: '売上管理',
      meta: '即日入金対応',
      description: 'ポイント決済で売上を一元管理。売掛リスクなく収益化を加速します。',
      accent: {
        ring: 'ring-1 ring-emerald-400/30',
        icon: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        text: 'text-emerald-500'
      }
    }
  ];

  const faqItems = [
    {
      question: '本当に1分でLP作成できますか？',
      answer: 'はい。AIの質問に答えるだけで構成案とコピーまで自動生成されます。画像や細かな文言を調整しても 5〜10 分程度で公開できます。'
    },
    {
      question: '審査は本当にありませんか？',
      answer: 'ありません。アカウント登録直後からLP作成・公開が可能です。プロダクトの鮮度を損ないません。'
    },
    {
      question: '手数料3%は本当ですか？他に費用はかかりますか？',
      answer: '販売手数料は 3% のみです。月額費用・初期費用・ドメイン費用は一切不要で、売上が発生した時点のみ課金されます。'
    },
    {
      question: 'どのような商材を販売できますか？',
      answer: 'オンライン講座、電子書籍、コンサルティング、会員制コンテンツなど、デジタルコンテンツ全般にご利用いただけます。'
    },
    {
      question: 'スマホでも作成できますか？',
      answer: 'はい。スマホ・タブレットからも管理画面へアクセスでき、レスポンシブデザインに完全対応しています。'
    },
    {
      question: '決済方法は何が使えますか？',
      answer: 'ポイント制を採用しており、クレジットカード・銀行振込・コンビニ決済に対応。販売者への入金もスムーズです。'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ===== 1. ヒーローセクション（ビデオ背景） ===== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* ビデオ背景 - 2つを交互に表示 */}
        <div className="absolute inset-0 bg-slate-900">
          {/* ビデオ1 */}
          <video 
            key="video-1"
            autoPlay 
            loop 
            muted 
            playsInline 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentVideo === 0 ? 'opacity-40' : 'opacity-0'}`}
          >
            <source src="/videos/hero-bg-1.mp4" type="video/mp4" />
          </video>
          
          {/* ビデオ2 */}
          <video 
            key="video-2"
            autoPlay 
            loop 
            muted 
            playsInline 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentVideo === 1 ? 'opacity-40' : 'opacity-0'}`}
          >
            <source src="/videos/hero-bg-2.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/70" />
        
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
      <section className="relative py-20 bg-slate-50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-12">
            <motion.div {...fadeInUp} className="w-full lg:w-5/12">
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 h-full w-px bg-gradient-to-b from-blue-500/60 via-blue-500/20 to-transparent" />
                <p className="uppercase tracking-[0.35em] text-xs font-semibold text-slate-400 mb-6">
                  Pain Points
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-snug">
                  従来のLP制作では、<br className="md:hidden" />重要な瞬間を逃していませんか？
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  情報の鮮度が命であるにも関わらず、制作工程が複雑で時間ばかりが過ぎていく──。そんな課題を抱える企業が後を絶ちません。
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: '-100px' }}
              className="w-full lg:w-7/12 grid grid-cols-1 gap-6"
            >
              {painPoints.map((item, index) => (
                <motion.div key={item.title} variants={fadeInUp} className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                  <div className="relative rounded-2xl border border-slate-200/70 bg-white/95 p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_32px_70px_-35px_rgba(15,23,42,0.55)]">
                    <div className="flex items-start gap-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconGradient} text-white shadow-lg ${item.shadowGlow}`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[11px] tracking-[0.32em] uppercase text-slate-400">
                            ISSUE {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="h-px flex-1 bg-slate-200/70" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 3. ソリューションセクション ===== */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_60%)]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.2),transparent_65%)]" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, rgba(148,163,184,0.15) 1px, transparent 1px)', backgroundSize: '38px 38px' }} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="uppercase text-xs tracking-[0.4em] text-slate-400/80 mb-4">
                  Solution
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  <span className="text-slate-400">D-swipe</span>
                  <span className="ml-2 inline-block align-baseline">なら、すべて解決</span>
                </h2>
              </div>
              <div className="max-w-xl">
                <p className="text-slate-300 leading-relaxed border-l border-slate-700/70 pl-6">
                  LP制作の分断されたプロセスをシームレスに統合。設計・デザイン・決済・公開まで、ワンストップで完結する企業向けプラットフォームです。
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <motion.div
              {...fadeInUp}
              className="lg:col-span-3 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 p-8 md:p-10 backdrop-blur-xl shadow-[0px_40px_120px_-60px_rgba(8,47,73,0.9)]"
            >
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs tracking-[0.3em] uppercase mb-6">
                    Flagship
                  </div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-white leading-snug">
                    LP制作の初速を <span className="text-blue-200">AI</span> が引き上げる
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    情報入力から公開までの時間を最小化。AIによる構成生成とリアルタイムプレビューにより、意思決定を中断させません。
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <BoltIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-blue-200/80 mb-1">Speed</p>
                      <p className="text-white text-lg font-medium">LP作成がわずか1分</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      Q&A に回答するだけで構成案とコピーを同時生成
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      プレビューと編集が同一画面で完結
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 col-span-2">
                      生成結果はブランドトーンに合わせて自動補正
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="lg:col-span-2 grid grid-cols-1 gap-6"
            >
              {solutionHighlights.slice(1).map((item) => (
                <motion.div key={item.title} variants={fadeInUp} className={`rounded-3xl p-7 md:p-8 backdrop-blur-md shadow-[0px_24px_70px_-45px_rgba(15,23,42,0.65)] ${item.cardClass}`}>
                  <div className="flex items-start gap-6">
                    <div className={`h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center text-white shadow-lg ${item.iconClass}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs uppercase tracking-[0.32em] font-semibold ${item.accentClass} block mb-2`}>{item.label}</span>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 4. 数字で見るD-swipe ===== */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.25),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px)]" style={{ backgroundSize: '46px 46px' }} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-16">
            <div>
              <p className="uppercase text-xs tracking-[0.4em] text-slate-400/80 mb-4">Metrics</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                数字で見る <span className="text-emerald-300">D-swipe</span>
              </h2>
            </div>
            <p className="max-w-lg text-slate-300 leading-relaxed border-l border-emerald-500/20 pl-6">
              実際の導入企業・個人事業主の運用データにもとづく KPI。高速なローンチと高い利益率を両立します。
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-120px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {statsMetrics.map((metric) => (
              <motion.div
                key={metric.label}
                variants={fadeInUp}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-[0px_40px_120px_-60px_rgba(8,47,73,0.9)]"
              >
                <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-300/30 via-transparent to-transparent blur-3xl" />
                <div className="mb-6 inline-flex items-center gap-3 text-white/90">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/90">INSIGHT</span>
                </div>
                <div className="text-5xl md:text-6xl font-semibold text-white mb-3 tracking-tight drop-shadow-[0_10px_25px_rgba(16,185,129,0.35)]">
                  {metric.value}
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.42em] text-emerald-200/90 mb-4">
                  {metric.label}
                </p>
                <p className="text-sm text-white/90 leading-relaxed">
                  {metric.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5. 機能詳細セクション ===== */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-20">
            <div>
              <p className="uppercase text-xs tracking-[0.4em] text-slate-400 mb-4">Capabilities</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                圧倒的な使いやすさ
              </h2>
              <p className="text-lg text-slate-600 mt-4">
                初心者でもプロ級のLPが作れる4つの理由
              </p>
            </div>
            <div className="max-w-xl">
              <p className="text-slate-600 leading-relaxed border-l border-slate-200 pl-6">
                LP制作の全工程をワークフロー化し、迷いなく進行できるよう設計。各ステップで AI とエディタが伴走します。
              </p>
            </div>
          </motion.div>

          <div className="relative pl-6 md:pl-12">
            <div className="absolute left-3 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-slate-300/40 to-transparent" />
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: '-120px' }}
              className="space-y-12"
            >
              {featureTimeline.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="relative rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-[0px_30px_80px_-50px_rgba(15,23,42,0.45)]"
                >
                  <div className="absolute -left-5 md:-left-7 top-10 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="grid md:grid-cols-[minmax(220px,0.6fr)_1fr] gap-8 md:gap-12">
                    <div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 uppercase text-[11px] tracking-[0.32em] font-semibold mb-4">
                        {feature.tag}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-5 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="text-base text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {feature.bullets.map((bullet) => (
                        <div
                          key={bullet.title}
                          className={`group relative overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-500 bg-white/70 backdrop-blur-sm shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] ${bullet.accent.border}`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${bullet.accent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                          <div className="relative">
                            <span className={`text-[11px] uppercase tracking-[0.32em] font-semibold ${bullet.accent.text} block mb-2`}>{bullet.title}</span>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {bullet.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute left-2 md:left-5 top-10 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-blue-500/40 to-transparent" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 6. LPギャラリーセクション ===== */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px)]" style={{ backgroundSize: '48px 48px' }} />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-16">
            <div>
              <p className="uppercase text-xs tracking-[0.4em] text-slate-400/80 mb-4">Gallery</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                こんなLPが作れます
              </h2>
            </div>
            <p className="max-w-xl text-slate-300 leading-relaxed border-l border-blue-400/20 pl-6">
              企業ブランディングに寄り添ったプレミアムテンプレートをご用意。配色もタイポグラフィも自在に調整できます。
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {galleryShowcase.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
              className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_32px_90px_-50px_rgba(30,41,59,0.75)]"
              >
                <div className="relative aspect-[9/16] overflow-hidden">
                  {item.heroImage ? (
                    <Image
                      src={item.heroImage}
                      alt={`${item.title} showcase`}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(min-width: 1280px) 320px, (min-width: 1024px) 28vw, (min-width: 768px) 40vw, 100vw"
                      priority={item.title === 'Executive Briefing'}
                    />
                  ) : null}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.palette} opacity-45`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/30 to-transparent" />
                    <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_40%)]" />
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.14)_1px,transparent_1px)]" style={{ backgroundSize: '42px 42px' }} />
                  </div>
                  <div className="relative z-10 flex h-full flex-col p-8">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs uppercase tracking-[0.32em]">
                        {item.category}
                      </span>
                      <h4 className="text-2xl font-semibold text-white drop-shadow-md">
                        {item.title}
                      </h4>
                      <p className="text-sm text-white/75 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {item.collage?.length ? (
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {item.collage.slice(0, 3).map((src) => (
                          <div key={src} className="relative h-16 overflow-hidden rounded-xl border border-white/15 bg-white/10">
                            <Image src={src} alt={`${item.title} detail`} fill className="object-cover" sizes="96px" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {item.stats?.length ? (
                      <div className="mt-6 space-y-2">
                        {item.stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10/60 px-4 py-3 backdrop-blur-sm"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/60">
                                {stat.label}
                              </span>
                              <span className={`text-xl font-semibold text-white drop-shadow-sm ${stat.accent ?? ''}`}>
                                {stat.value}
                              </span>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between pt-8 text-white/80 text-sm font-medium">
                      <span>詳細を見る</span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 7. お客様の声セクション ===== */}
      <section className="relative py-24 bg-slate-50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-16">
            <div>
              <p className="uppercase text-xs tracking-[0.4em] text-slate-400 mb-4">Testimonials</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                お客様の声
              </h2>
            </div>
            <p className="max-w-lg text-slate-600 leading-relaxed border-l border-slate-200 pl-6">
              実際に成果を出しているクリエイター・マーケターの声をご紹介します。
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonialVoices.map((voice, index) => (
              <motion.div
                key={voice.name}
                variants={fadeInUp}
                className="relative rounded-3xl border border-slate-200 bg-white p-9 shadow-[0px_30px_90px_-60px_rgba(15,23,42,0.55)]"
              >
                <div className="absolute -top-7 left-10 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">“</span>
                </div>
                <div className="mt-7 text-xs uppercase tracking-[0.32em] text-blue-500/70 mb-5">
                  Voice {String(index + 1).padStart(2, '0')}
                </div>
                <p className="text-slate-700 leading-relaxed mb-10">
                  {voice.comment}
                </p>
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-700" />
                  <div>
                    <div className="text-base font-semibold text-slate-900">{voice.name}</div>
                    <div className="text-xs uppercase tracking-[0.28em] text-slate-400 mt-1">
                      {voice.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 8. スピード重視セクション（4ステップフロー） ===== */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-100 to-transparent" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <p className="uppercase text-xs tracking-[0.4em] text-slate-400 mb-4">Workflow</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                煩わしい審査は一切なし
              </h2>
            </div>
            <p className="max-w-xl text-slate-600 leading-relaxed border-l border-slate-200 pl-6">
              D-swipeはローンチスピードを最優先。仮説検証サイクルを止めずに次の打ち手へ進めます。
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-120px' }}
            className="relative"
          >
            <div className="hidden md:block absolute left-[10%] right-[10%] top-1/2 h-px bg-gradient-to-r from-blue-200 via-slate-200 to-emerald-200" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {flowSteps.map((step, index) => (
                <motion.div key={step.step} variants={fadeInUp} className="relative">
                  <div className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-[0px_24px_80px_-60px_rgba(15,23,42,0.55)] ${step.accent.ring}`}>
                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl text-white mb-6 ${step.accent.icon} shadow-lg shadow-slate-900/15`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <p className={`text-xs uppercase tracking-[0.32em] font-semibold mb-3 ${step.accent.text}`}>
                      {step.step}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {step.meta}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < flowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 translate-x-1/2 -translate-y-1/2">
                      <div className="h-12 w-12 rounded-full border border-slate-200 bg-white shadow-md flex items-center justify中心">
                        <ArrowRightIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-slate-200 bg-white shadow-sm">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-medium text-slate-600">
                法人・個人事業主・副業クリエイター問わずお使いいただけます。審査待ちなしで即日開始。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 9. FAQセクション ===== */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.1)_1px,transparent_1px)]" style={{ backgroundSize: '42px 42px' }} />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-16">
            <div className="max-w-md">
              <p className="uppercase text-xs tracking-[0.4em] text-blue-200/70 mb-4">FAQ</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                よくある質問
              </h2>
            </div>
            <p className="max-w-xl text-blue-100/80 leading-relaxed border-l border-blue-400/20 pl-6">
              導入前によくいただくご質問をまとめました。その他の疑問はサポートチームまでお気軽にご相談ください。
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-10">
            <motion.div
              {...fadeInUp}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.75)]"
            >
              <ul className="space-y-3 text-sm text-blue-100/80">
                {faqItems.map((item, index) => (
                  <li key={item.question}>
                    <button
                      onClick={() => setSelectedFaq(index)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${selectedFaq === index ? 'bg-white/15 text-white shadow-inner shadow-blue-500/10' : 'hover:bg-white/10'}`}
                    >
                      <span className="text-xs uppercase tracking-[0.3em] block mb-2">
                        Q{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-base font-medium leading-relaxed">
                        {item.question}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 md:p-10 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.75)]"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 text-blue-100/80 text-xs uppercase tracking-[0.32em] mb-6">
                Answer
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 leading-snug">
                {faqItems[selectedFaq].question}
              </h3>
              <p className="text-base text-blue-100/90 leading-relaxed">
                {faqItems[selectedFaq].answer}
              </p>
            </motion.div>
          </div>
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
      <footer className="relative bg-slate-950 text-slate-300 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px)]" style={{ backgroundSize: '44px 44px' }} />

        <div className="relative z-10">
          <div className="border-t border-white/10" />
          <div className="container mx-auto px-4 py-16 max-w-6xl grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs uppercase tracking-[0.32em]">
                D-swipe
              </div>
              <p className="text-lg text-slate-200 leading-relaxed">
                情報の鮮度を逃さない、企業向けスワイプ型LP作成プラットフォーム。
              </p>
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} D-swipe. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-white mb-4">Navigation</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">ダッシュボード</Link></li>
                <li><Link href="/lp/create" className="hover:text-white transition-colors">LPを作成</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">商品を管理</Link></li>
                <li><Link href="/points/purchase" className="hover:text-white transition-colors">ポイントを購入</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <a
                    href="https://swipelaunch-backend.onrender.com/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    API Documentation
                  </a>
                </li>
                <li><Link href="/login" className="hover:text白 transition-colors">ログイン</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">無料で始める</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10" />
          <div className="container mx-auto px-4 py-6 max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
            <span>特定商取引法に基づく表記 / プライバシーポリシー</span>
            <span>カスタマーサポート：support@d-swipe.jp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
