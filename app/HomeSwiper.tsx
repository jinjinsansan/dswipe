'use client';

import { useEffect, useState } from 'react';
import AutoPlayVideo from '@/components/AutoPlayVideo';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { Pagination, Mousewheel, Keyboard, EffectCreative } from 'swiper/modules';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  AtSymbolIcon,
  BellIcon,
  BoltIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyYenIcon,
  HashtagIcon,
  MapIcon,
  PencilSquareIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UsersIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

/* Momentum top page — mock: design_handoff_dswipe/D-Swipe Top (Swipe).html
   9 slides: hero / overview / 作る / 集める / 届ける / つながる / 稼ぐ / 料金 / final */

const NAVY_HERO =
  'radial-gradient(1100px 560px at 78% 0%, rgba(14,116,144,.9) 0%, transparent 55%), linear-gradient(160deg, rgba(11,31,58,.92), rgba(15,44,82,.88) 60%, rgba(11,39,66,.93))';
const NAVY_DEEP =
  'radial-gradient(800px 520px at 50% -10%, #0e7490 0%, transparent 58%), linear-gradient(160deg, #081428, #0b1f3a 70%, #081428)';
const NAVY_FINAL =
  'radial-gradient(900px 460px at 50% 0%, #0e7490 0%, transparent 60%), linear-gradient(150deg, #0b1f3a, #0f2c52)';
const GRAD_BRAND = 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)';

/* §7 safe layout: center when content fits, top-align + scroll when it
   overflows — padding reserves room for the fixed nav and signup band. */
const SLIDE_INNER =
  'h-full overflow-y-auto grid [align-content:safe_center] justify-items-center px-5 sm:px-6 pt-[84px] pb-[104px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold text-pure-white transition-all shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)] hover:-translate-y-px';

const PHONE_SLIDES = [
  {
    bg: 'linear-gradient(170deg,#0b1f3a,#0e7490)',
    tag: '7-DAY CHALLENGE',
    title: ['7日間で', '集客が変わる'],
    body: 'SNSだけで月100リスト。',
  },
  {
    bg: 'linear-gradient(170deg,#1b3a61,#0b1f3a)',
    tag: 'こんな悩み',
    title: ['頑張っても', '伸びない…'],
    body: '投稿しても反応が薄い。',
  },
  {
    bg: 'linear-gradient(170deg,#0e7490,#0b1f3a)',
    tag: '特別オファー',
    title: ['いまだけ', '特別価格'],
    price: true,
  },
  {
    bg: 'linear-gradient(170deg,#0284c7,#06b6d4)',
    tag: '今すぐ申し込む',
    title: ['未来を、', '前に進めよう'],
    cta: true,
  },
];

const PILLARS = [
  { icon: PencilSquareIcon, step: 'STEP 01', title: '作る', desc: 'ノーコード＋AIでスワイプLP' },
  { icon: ChartBarIcon, step: 'STEP 02', title: '集める', desc: '分析で集客を最適化' },
  { icon: MapIcon, step: 'STEP 03', title: '届ける', desc: '公開・発見フィードで拡散' },
  { icon: UsersIcon, step: 'STEP 04', title: 'つながる', desc: 'サロン・メンバーシップ' },
  { icon: CurrencyYenIcon, step: 'STEP 05', title: '稼ぐ', desc: 'マーケット・ポイント決済' },
];

const FEED_CARDS = [
  {
    thumb: 'linear-gradient(150deg,#0b1f3a,#0e7490)',
    tag: 'マーケティング',
    title: '7日間スワイプ集客チャレンジ',
    avatar: 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
    name: '山田 太郎',
    likes: '1.2k',
  },
  {
    thumb: 'linear-gradient(150deg,#7c3aed,#0284c7)',
    tag: '副業',
    title: '副業ロードマップ無料配布',
    avatar: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    name: '佐藤 あや',
    likes: '860',
  },
  {
    thumb: 'linear-gradient(150deg,#0e7490,#22d3ee)',
    tag: 'ライティング',
    title: '売れる文章の作り方 講座',
    avatar: 'linear-gradient(135deg,#16a34a,#22d3ee)',
    name: '鈴木 けん',
    likes: '2.4k',
  },
];

const MARKET_CARDS = [
  { thumb: 'linear-gradient(150deg,#0b1f3a,#0e7490)', name: 'スワイプ集客マスター講座', price: '9,800 P' },
  { thumb: 'linear-gradient(150deg,#0284c7,#06b6d4)', name: 'LPテンプレート20選', price: '3,500 P' },
  { thumb: 'linear-gradient(150deg,#7c3aed,#0284c7)', name: 'ファネル設計シート', price: '1,200 P' },
];

const NAV_LINKS: Array<{ label: string; slide: number }> = [
  { label: 'D-Swipeとは', slide: 1 },
  { label: '作る', slide: 2 },
  { label: '届ける', slide: 4 },
  { label: 'サロン', slide: 5 },
  { label: '料金', slide: 7 },
];

function Kover({ icon: Icon, children, dark = false }: { icon: typeof BoltIcon; children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold tracking-wide rounded-full px-3.5 py-1.5 border whitespace-nowrap ${
        dark ? 'text-cyan-300 bg-cyan-400/10 border-cyan-400/25' : 'text-sky-600 bg-sky-50 border-sky-200'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}

function FeatBullet({ icon: Icon, title, desc }: { icon: typeof BoltIcon; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-[30px] h-[30px] rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
        <Icon className="w-[17px] h-[17px]" />
      </span>
      <div>
        <b className="text-[15px] text-[#0b1f3a]">{title}</b>
        <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeedTag({ icon: Icon, children }: { icon: typeof BoltIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-[#e2ebf6] rounded-full px-3.5 py-1.5">
      <Icon className="w-3.5 h-3.5 text-sky-600" />
      {children}
    </span>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 00.96 4.95l3 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export default function HomeSwiper() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phoneIndex, setPhoneIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPhoneIndex((i) => (i + 1) % PHONE_SLIDES.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(patterns[style]);
    }
  };

  const handleSlideChange = (s: SwiperType) => {
    setActiveIndex(s.activeIndex);
    if (s.previousIndex !== s.activeIndex) {
      triggerHapticFeedback('light');
    }
  };

  const goTo = (i: number) => swiper?.slideTo(i);

  return (
    <div className="h-screen w-full bg-[#07142a] overflow-hidden">
      {/* fixed top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[rgba(11,31,58,.82)] backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-6 h-full flex items-center gap-4">
          <button type="button" onClick={() => goTo(0)} className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-pure-white whitespace-nowrap">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="dswipe-nav-logo" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="38" height="38" rx="11" fill="#fff" fillOpacity=".08" stroke="rgba(255,255,255,.2)" />
              <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#dswipe-nav-logo)" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M25 20l6-5m-6 5l6 5" stroke="url(#dswipe-nav-logo)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            D<span className="text-cyan-400">-</span>Swipe
          </button>
          <div className="hidden md:flex gap-0.5 ml-1.5">
            {NAV_LINKS.map((l) => (
              <button
                key={l.slide}
                type="button"
                onClick={() => goTo(l.slide)}
                className={`text-[13.5px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeIndex === l.slide ? 'text-pure-white bg-white/10' : 'text-[#9fb4d0] hover:text-pure-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Link href="/login" className="text-[13.5px] font-semibold text-[#e7f0fb] px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              ログイン
            </Link>
            <Link href="/register" className={`${BTN_PRIMARY} text-[13px] px-4 py-2`} style={{ background: GRAD_BRAND }}>
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

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
          prev: { translate: [0, '-20%', -1], scale: 0.95, opacity: 0.8 },
          next: { translate: [0, '100%', 0] },
        }}
        mousewheel={{ releaseOnEdges: true, forceToAxis: true, sensitivity: 0.8 }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        pagination={{ clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }}
        modules={[Pagination, Mousewheel, Keyboard, EffectCreative]}
        onSwiper={setSwiper}
        onSlideChange={handleSlideChange}
        onTouchStart={() => triggerHapticFeedback('light')}
        className="h-full w-full"
        style={{
          '--swiper-pagination-color': '#22d3ee',
          '--swiper-pagination-bullet-inactive-color': '#94a3b8',
          '--swiper-pagination-bullet-inactive-opacity': '0.55',
          '--swiper-pagination-right': '14px',
        } as React.CSSProperties}
      >
        {/* 0 HERO */}
        <SwiperSlide>
          <div className="relative h-full w-full overflow-hidden text-pure-white">
            <div className="absolute inset-0">
              <AutoPlayVideo className="absolute inset-0 w-full h-full object-cover opacity-40" src="/videos/hero-keyboard-2.mp4" />
              <div className="absolute inset-0" style={{ background: NAVY_HERO }} />
            </div>
            <div className={`relative z-10 ${SLIDE_INNER} w-full`}>
              <div className="w-full max-w-[1120px] grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-12 items-center">
                <div className="text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 text-[12.5px] font-bold text-cyan-300 bg-cyan-400/10 border border-cyan-400/25 rounded-full px-3.5 py-1.5">
                    <BoltIcon className="w-[15px] h-[15px]" />
                    作る・集める・届ける・つながる・稼ぐ
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight leading-[1.1] mt-5 text-pure-white">
                    スワイプで、
                    <br />
                    <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">伝わる</span>。
                    <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">つながる</span>。
                  </h1>
                  <p className="text-[15.5px] leading-relaxed text-[#bcd3ee] mt-4 max-w-[48ch] mx-auto lg:mx-0">
                    誰でも気軽にスワイプ型LPを作って集客。さらに公開・発見・サロンまで。情報発信のすべてが、D-Swipe ひとつで完結します。
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center lg:justify-start mt-7">
                    <Link href="/register" className={`${BTN_PRIMARY} text-[15px] px-7 py-3.5`} style={{ background: GRAD_BRAND }}>
                      無料で始める
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="inline-flex items-center justify-center rounded-xl font-bold text-[15px] px-7 py-3.5 bg-white/[.07] text-pure-white border border-white/20 hover:bg-white/15 transition-colors"
                    >
                      D-Swipeとは？
                    </button>
                  </div>
                </div>
                <div className="hidden sm:flex justify-center relative">
                  <div className="absolute inset-[12%_16%] blur-[38px]" style={{ background: 'radial-gradient(circle, rgba(6,182,212,.4), transparent 70%)' }} />
                  <div className="relative z-[1] w-[200px] h-[408px] lg:w-[240px] lg:h-[490px] bg-[#0b1220] rounded-[38px] p-[9px] shadow-[0_40px_90px_-30px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.06)]">
                    <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-white">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[22px] bg-[#0b1220] rounded-b-[13px] z-[12]" />
                      <div
                        className="absolute inset-0 transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(.5,.05,.2,1)]"
                        style={{ transform: `translateY(${-phoneIndex * 100}%)` }}
                      >
                        {PHONE_SLIDES.map((p, i) => (
                          <div
                            key={i}
                            className="absolute left-0 right-0 h-full flex flex-col justify-end px-[18px] pt-6 pb-7 text-pure-white"
                            style={{ top: `${i * 100}%`, background: p.bg }}
                          >
                            <span className="text-[10px] font-bold tracking-[.14em] uppercase opacity-85">{p.tag}</span>
                            <h3 className="text-[22px] font-extrabold tracking-tight leading-tight mt-2">
                              {p.title[0]}
                              <br />
                              {p.title[1]}
                            </h3>
                            {p.body && <p className="text-xs leading-relaxed mt-2 opacity-90">{p.body}</p>}
                            {p.price && (
                              <div className="text-[32px] font-extrabold tracking-tight mt-3">
                                <s className="text-sm font-semibold opacity-60 mr-2">¥29,800</s>¥9,800
                              </div>
                            )}
                            {p.cta && <div className="mt-3.5 text-center bg-white text-[#0b1f3a] font-extrabold text-[13px] py-[11px] rounded-xl">申し込む →</div>}
                          </div>
                        ))}
                      </div>
                      <div className="absolute right-[9px] top-1/2 -translate-y-1/2 flex flex-col gap-[5px] z-[12]">
                        {PHONE_SLIDES.map((_, i) => (
                          <i key={i} className={`w-[5px] rounded-full ${i === phoneIndex ? 'h-4 bg-white' : 'h-[5px] bg-white/45'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 1 PLATFORM OVERVIEW */}
        <SwiperSlide>
          <div className="h-full w-full text-pure-white" style={{ background: NAVY_DEEP }}>
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px] text-center">
                <p className="text-[12.5px] font-bold tracking-[.14em] uppercase text-cyan-300">What is D-Swipe</p>
                <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5">LPを作って終わり、じゃない。</h2>
                <p className="text-[15.5px] leading-relaxed text-[#bcd3ee] mt-3.5 max-w-[54ch] mx-auto">
                  D-Swipe は「作る → 集める → 届ける → つながる → 稼ぐ」をひとつにした、スワイプ型のコンテンツ・プラットフォーム。LP作成ツールでありながら、note のような公開メディアでもあり、サロンの母艦にもなります。
                </p>
                <div className="flex gap-2 sm:gap-3 mt-8 justify-center flex-wrap items-stretch">
                  {PILLARS.map((p) => (
                    <div key={p.step} className="flex-1 min-w-[130px] sm:min-w-[158px] max-w-[200px] bg-white/5 border border-white/10 rounded-[18px] px-3 py-4 sm:px-4 sm:py-5 text-center">
                      <span className="w-[46px] h-[46px] rounded-[14px] mx-auto flex items-center justify-center shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)]" style={{ background: GRAD_BRAND }}>
                        <p.icon className="w-6 h-6 text-pure-white" />
                      </span>
                      <div className="text-[11px] font-extrabold tracking-[.12em] text-cyan-300 mt-3.5">{p.step}</div>
                      <b className="block text-[15px] text-pure-white mt-1.5">{p.title}</b>
                      <p className="hidden sm:block text-[11.5px] text-[#9fb4d0] mt-1.5 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 2 作る */}
        <SwiperSlide>
          <div className="h-full w-full bg-white text-[#1f2c3d]">
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px] grid lg:grid-cols-2 gap-7 lg:gap-12 items-center">
                <div>
                  <Kover icon={PencilSquareIcon}>作る · CREATE</Kover>
                  <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5 text-[#0b1f3a]">
                    スワイプLPを、
                    <br />
                    ドラッグとAIで。
                  </h2>
                  <p className="text-[15.5px] leading-relaxed text-slate-600 mt-3.5">
                    テンプレートにブロックを並べるだけ。AIが構成と文章を提案し、初めてでも数分で“読み進めたくなる”LPが完成します。
                  </p>
                  <div className="flex flex-col gap-3.5 mt-6">
                    <FeatBullet icon={SparklesIcon} title="AI構成アシスト" desc="商材を入力するだけで、ヒーロー〜CTAの構成を自動生成。" />
                    <FeatBullet icon={PencilSquareIcon} title="ドラッグ編集" desc="ブロックを並べ替え、文言・画像を差し替え。即プレビュー。" />
                    <FeatBullet icon={BoltIcon} title="最短3分で公開" desc="ワンクリックで公開し、専用URLを発行。" />
                  </div>
                </div>
                <div className="hidden lg:flex gap-3 items-center justify-center">
                  <div className="flex flex-col gap-2">
                    {[
                      { bg: 'linear-gradient(160deg,#0b1f3a,#0e7490)', on: true },
                      { bg: 'linear-gradient(160deg,#111a2e,#0b1220)', on: false },
                      { bg: '#e9f6fe', on: false },
                      { bg: 'linear-gradient(160deg,#0e7490,#0b1f3a)', on: false },
                    ].map((t, i) => (
                      <div
                        key={i}
                        className={`w-[46px] h-[92px] rounded-lg border border-[#e2ebf6] shadow-sm ${t.on ? 'outline outline-2 outline-sky-600' : ''}`}
                        style={{ background: t.bg }}
                      />
                    ))}
                  </div>
                  <div className="w-[168px] h-[344px] bg-[#0b1220] rounded-[28px] p-[7px] shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]">
                    <div
                      className="w-full h-full rounded-[22px] overflow-hidden flex flex-col justify-end px-4 pb-[18px] text-pure-white"
                      style={{ background: 'radial-gradient(180px 130px at 70% 10%, rgba(34,211,238,.3), transparent 60%), linear-gradient(165deg,#0b1f3a,#0e7490)' }}
                    >
                      <span className="text-[9px] font-bold tracking-[.14em] opacity-85">7-DAY CHALLENGE</span>
                      <div className="text-xl font-extrabold tracking-tight leading-tight mt-2">
                        7日間で
                        <br />
                        集客が変わる
                      </div>
                      <div className="text-[11px] opacity-90 mt-2 leading-relaxed">SNSだけで月100リスト。</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 3 集める */}
        <SwiperSlide>
          <div className="h-full w-full bg-[#f4f8fd] text-[#1f2c3d]">
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px] grid lg:grid-cols-2 gap-7 lg:gap-12 items-center">
                <div>
                  <Kover icon={ChartBarIcon}>集める · GROW</Kover>
                  <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5 text-[#0b1f3a]">
                    “なんとなく”を、
                    <br />
                    数字で終わらせる。
                  </h2>
                  <p className="text-[15.5px] leading-relaxed text-slate-600 mt-3.5">
                    スライドごとの離脱・CTA到達・売上をリアルタイムで可視化。どこを直せば伸びるかが、ひと目で分かります。
                  </p>
                  <div className="flex flex-col gap-3.5 mt-6">
                    <FeatBullet icon={ChartBarIcon} title="ファネル可視化" desc="どのスライドで離脱したかをステップ別に表示。" />
                    <FeatBullet icon={ViewfinderCircleIcon} title="CTAクリック率" desc="最も効くオファー位置を発見できる。" />
                  </div>
                </div>
                <div className="hidden lg:block bg-white border border-[#e2ebf6] rounded-[28px] shadow-[0_2px_5px_rgba(11,31,58,.05),0_22px_44px_-24px_rgba(2,132,199,.34)] p-[22px]">
                  <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                    {[
                      { l: '閲覧数', v: '24,180' },
                      { l: 'CTA率', v: '7.4%' },
                      { l: '売上', v: '182K P' },
                    ].map((k) => (
                      <div key={k.l} className="bg-[#f4f8fd] border border-[#e2ebf6] rounded-xl p-3">
                        <div className="text-[10.5px] font-semibold text-slate-500">{k.l}</div>
                        <div className="text-xl font-extrabold text-[#0b1f3a] tracking-tight mt-0.5 tabular-nums">{k.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-[124px] flex items-end gap-2 p-2.5 bg-[#f4f8fd] border border-[#e2ebf6] rounded-xl">
                    {[46, 62, 54, 78, 70, 92, 84].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-[5px]" style={{ height: `${h}%`, background: GRAD_BRAND }} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">ファネル到達率</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      公開中
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 rounded-full bg-[#e9f6fe] overflow-hidden">
                    <span className="block h-full rounded-full" style={{ width: '74%', background: GRAD_BRAND }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 4 届ける */}
        <SwiperSlide>
          <div className="h-full w-full bg-white text-[#1f2c3d]">
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px]">
                <div className="text-center">
                  <Kover icon={MapIcon}>届ける · PUBLISH</Kover>
                  <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5 text-[#0b1f3a]">作ったLPが、見つかる場所。</h2>
                  <p className="text-[15.5px] leading-relaxed text-slate-600 mt-3.5 max-w-[54ch] mx-auto">
                    D-Swipe は note のような公開メディア。あなたのLPは発見フィードに並び、フォロー・スキで広がります。クリエイターページ <b className="text-sky-600">/u/yourname</b> がそのまま“作品集”に。
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mt-6">
                  {FEED_CARDS.map((c, i) => (
                    <div key={c.title} className={`bg-white border border-[#e2ebf6] rounded-2xl overflow-hidden shadow-sm text-left ${i === 2 ? 'hidden sm:block' : ''}`}>
                      <div className="h-[88px] relative" style={{ background: c.thumb }}>
                        <span className="absolute top-2 left-2 text-[10px] font-bold text-pure-white bg-[rgba(11,31,58,.5)] backdrop-blur-[4px] px-2 py-[3px] rounded-full">{c.tag}</span>
                      </div>
                      <div className="p-3">
                        <div className="text-[13px] font-bold text-[#0b1f3a] leading-snug">{c.title}</div>
                        <div className="flex items-center gap-[7px] mt-2.5">
                          <span className="w-[22px] h-[22px] rounded-full flex-shrink-0" style={{ background: c.avatar }} />
                          <span className="text-[11px] text-slate-500">{c.name}</span>
                          <span className="ml-auto text-[11px] text-slate-500 flex items-center gap-[3px]">
                            <HeartIcon className="w-[13px] h-[13px] text-rose-500" />
                            {c.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-center flex-wrap mt-5">
                  <FeedTag icon={HashtagIcon}>発見フィード</FeedTag>
                  <FeedTag icon={HeartIcon}>スキで応援</FeedTag>
                  <FeedTag icon={PlusIcon}>フォロー</FeedTag>
                  <FeedTag icon={AtSymbolIcon}>クリエイターページ</FeedTag>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 5 つながる */}
        <SwiperSlide>
          <div className="h-full w-full bg-[#f4f8fd] text-[#1f2c3d]">
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px] grid lg:grid-cols-2 gap-7 lg:gap-12 items-center">
                <div>
                  <Kover icon={UsersIcon}>つながる · COMMUNITY</Kover>
                  <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5 text-[#0b1f3a]">
                    ファンと、
                    <br />
                    続く関係を。
                  </h2>
                  <p className="text-[15.5px] leading-relaxed text-slate-600 mt-3.5">
                    単発で売って終わりではなく、月額メンバーシップでファンと継続的につながる。限定LP・限定コンテンツ・メンバー専用フィードで、あなたの“サロン”を運営できます。
                  </p>
                  <div className="flex flex-col gap-3.5 mt-6">
                    <FeatBullet icon={UsersIcon} title="月額メンバーシップ" desc="継続課金で安定した収益基盤を。" />
                    <FeatBullet icon={BellIcon} title="メンバー限定の配信" desc="限定LP・お知らせをメンバーだけに届ける。" />
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-pure-white shadow-[0_2px_5px_rgba(11,31,58,.05),0_22px_44px_-24px_rgba(2,132,199,.34)]" style={{ background: 'linear-gradient(160deg,#0b1f3a,#0f2c52)' }}>
                  <div className="absolute -right-20 -top-20 w-[220px] h-[220px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,.22), transparent 65%)' }} />
                  <div className="relative z-[1] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold tracking-wide text-cyan-300">MEMBERSHIP</div>
                      <div className="text-[19px] font-extrabold mt-1">あや’s 集客ラボ</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-extrabold tracking-tight">
                        ¥2,980<small className="text-[13px] text-[#9fb4d0] font-semibold">/月</small>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-[1] flex items-center mt-4">
                    {[
                      { c: 'linear-gradient(135deg,#22d3ee,#0ea5e9)', t: 'A' },
                      { c: 'linear-gradient(135deg,#f59e0b,#ef4444)', t: 'K' },
                      { c: 'linear-gradient(135deg,#16a34a,#22d3ee)', t: 'M' },
                      { c: 'linear-gradient(135deg,#7c3aed,#0284c7)', t: 'T' },
                    ].map((m, i) => (
                      <span
                        key={m.t}
                        className={`w-[34px] h-[34px] rounded-full border-2 border-[#0b1f3a] flex items-center justify-center text-xs font-bold text-[#042032] ${i > 0 ? '-ml-2' : ''}`}
                        style={{ background: m.c }}
                      >
                        {m.t}
                      </span>
                    ))}
                    <span className="ml-3 text-[12.5px] text-[#9fb4d0]">+ 248名が参加中</span>
                  </div>
                  <ul className="relative z-[1] mt-4 mb-5 flex flex-col gap-2.5">
                    {['メンバー限定LP・テンプレ配布', '月2回のオンライン勉強会', '質問し放題のメンバーフィード'].map((perk) => (
                      <li key={perk} className="flex gap-2 text-[13px] items-start text-[#dbe8f7]">
                        <CheckIcon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 stroke-2" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link href="/salons" className={`${BTN_PRIMARY} relative z-[1] w-full text-sm px-5 py-3`} style={{ background: GRAD_BRAND }}>
                    サロンに参加する
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 6 稼ぐ */}
        <SwiperSlide>
          <div className="h-full w-full bg-white text-[#1f2c3d]">
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px]">
                <div className="text-center">
                  <Kover icon={ShoppingBagIcon}>稼ぐ · MONETIZE</Kover>
                  <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5 text-[#0b1f3a]">売る。受け取る。ぜんぶ内側で。</h2>
                  <p className="text-[15.5px] leading-relaxed text-slate-600 mt-3.5 max-w-[54ch] mx-auto">
                    作ったLPから商品を販売し、マーケットにも掲載。決済はポイントベースでシンプル。販売・購入・売上集計までプラットフォーム内で完結します。
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mt-6">
                  {MARKET_CARDS.map((c, i) => (
                    <div key={c.name} className={`bg-white border border-[#e2ebf6] rounded-2xl shadow-sm overflow-hidden text-left ${i === 2 ? 'hidden sm:block' : ''}`}>
                      <div className="h-[78px]" style={{ background: c.thumb }} />
                      <div className="p-[13px]">
                        <div className="text-[13px] font-bold text-[#0b1f3a] leading-snug">{c.name}</div>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-sm font-extrabold text-sky-600 tabular-nums">{c.price}</span>
                          <span className="text-[11px] font-bold text-pure-white rounded-lg px-2.5 py-[5px]" style={{ background: GRAD_BRAND }}>
                            購入
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-center flex-wrap mt-5">
                  <FeedTag icon={SparklesIcon}>ポイント決済</FeedTag>
                  <FeedTag icon={ShoppingBagIcon}>マーケット掲載</FeedTag>
                  <FeedTag icon={ArrowTrendingUpIcon}>売上ダッシュボード</FeedTag>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 7 PRICING */}
        <SwiperSlide>
          <div className="h-full w-full bg-[#f4f8fd] text-[#1f2c3d]">
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px]">
                <div className="text-center">
                  <p className="text-[12.5px] font-bold tracking-[.14em] uppercase text-sky-600">Pricing</p>
                  <h2 className="text-[27px] sm:text-4xl font-extrabold tracking-tight leading-tight mt-3.5 text-[#0b1f3a]">まずは無料。伸びたら、ポイントで。</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-7">
                  {[
                    {
                      name: 'Free',
                      price: '¥0',
                      unit: '',
                      lead: 'まず試したい方に',
                      perks: ['LP作成 無制限', '公開・発見フィード掲載', '基本アナリティクス'],
                      cta: '無料で始める',
                      href: '/register',
                      feature: false,
                    },
                    {
                      name: 'Points 1,000',
                      price: '¥1,000',
                      unit: ' /1,000P',
                      lead: '公開・AI生成・販売・サロンに',
                      perks: ['AI構成アシスト', '商品販売・サロン開設', '詳細ファネル分析', '独自URL・SEO設定'],
                      cta: 'ポイントを購入',
                      href: '/register',
                      feature: true,
                    },
                    {
                      name: 'Seller',
                      price: '手数料制',
                      unit: '',
                      lead: '本格的に販売する方に',
                      perks: ['商品管理ダッシュボード', 'マーケット優先掲載', '売上・購入者の管理'],
                      cta: '販売者になる',
                      href: '/register',
                      feature: false,
                    },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className={`relative bg-white rounded-2xl p-6 flex-col ${
                        p.feature
                          ? 'flex border-[1.5px] border-sky-600 shadow-[0_2px_5px_rgba(11,31,58,.05),0_22px_44px_-24px_rgba(2,132,199,.34)]'
                          : 'hidden sm:flex border border-[#e2ebf6] shadow-sm'
                      }`}
                    >
                      {p.feature && (
                        <span className="absolute -top-[11px] left-6 text-[11px] font-extrabold text-pure-white px-[11px] py-1 rounded-full shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)]" style={{ background: GRAD_BRAND }}>
                          人気
                        </span>
                      )}
                      <div className="text-[15px] font-bold text-[#0b1f3a]">{p.name}</div>
                      <div className="mt-3 text-[32px] font-extrabold text-[#0b1f3a] tracking-tight">
                        {p.price}
                        {p.unit && <small className="text-sm font-semibold text-slate-500">{p.unit}</small>}
                      </div>
                      <div className="text-[12.5px] text-slate-500 mt-0.5">{p.lead}</div>
                      <ul className="mt-4 mb-5 flex flex-col gap-2 flex-1">
                        {p.perks.map((perk) => (
                          <li key={perk} className="flex gap-2 text-[13px] text-[#1f2c3d] items-start">
                            <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 stroke-2" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                      {p.feature ? (
                        <Link href={p.href} className={`${BTN_PRIMARY} w-full text-sm px-5 py-3`} style={{ background: GRAD_BRAND }}>
                          {p.cta}
                        </Link>
                      ) : (
                        <Link
                          href={p.href}
                          className="inline-flex items-center justify-center w-full rounded-xl font-bold text-sm px-5 py-3 bg-white text-[#0b1f3a] border border-[#e2ebf6] hover:bg-slate-50 transition-colors"
                        >
                          {p.cta}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 8 FINAL */}
        <SwiperSlide>
          <div className="h-full w-full text-pure-white" style={{ background: NAVY_FINAL }}>
            <div className={SLIDE_INNER}>
              <div className="w-full max-w-[1120px] text-center">
                <p className="text-[12.5px] font-bold tracking-[.14em] uppercase text-cyan-300">Get started</p>
                <h2 className="text-3xl sm:text-5xl lg:text-[44px] font-extrabold tracking-tight leading-[1.12] mt-3.5 text-pure-white">
                  あなたの発信を、
                  <br />
                  ひとつの場所に。
                </h2>
                <p className="text-[15.5px] leading-relaxed text-[#bcd3ee] mt-3.5 max-w-[54ch] mx-auto">
                  作って、集めて、届けて、つながって、稼ぐ。D-Swipe で、今すぐ無料で始めましょう。
                </p>
                <div className="mt-7 flex gap-3 justify-center flex-wrap">
                  <Link href="/register" className={`${BTN_PRIMARY} text-base px-8 py-4`} style={{ background: GRAD_BRAND }}>
                    無料で始める
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* swipe hint (slide 0 only) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 bottom-[104px] z-40 flex flex-col items-center gap-1.5 text-white/90 pointer-events-none transition-opacity duration-500 ${
          activeIndex === 0 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-[38px] h-[38px] rounded-full border-[1.5px] border-white/50 flex items-center justify-center animate-bounce">
          <ChevronDownIcon className="w-[18px] h-[18px]" />
        </span>
        <span className="text-xs font-semibold tracking-wide">スワイプで進む</span>
      </div>

      {/* fixed signup band */}
      <div className="fixed left-0 right-0 bottom-0 z-[60] border-t border-cyan-400/30 shadow-[0_-12px_34px_-14px_rgba(0,0,0,.55)]" style={{ background: 'linear-gradient(160deg,#0b1f3a,#0f2c52)' }}>
        <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-4 px-5 sm:px-6 py-[11px]">
          <div>
            <strong className="block text-pure-white text-[14.5px] font-bold tracking-tight">作る・届ける・つながる。ぜんぶ無料で始められる</strong>
            <span className="hidden sm:inline-block text-[#9fb4d0] text-xs mt-0.5">
              <b className="text-cyan-300">3分</b>で公開 · クレジットカード不要 · LP作成は無制限
            </span>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 text-sm font-bold text-[#1f2c3d] bg-white rounded-xl px-5 py-[11px] whitespace-nowrap shadow-[0_10px_26px_-10px_rgba(0,0,0,.5)] hover:-translate-y-px transition-transform"
          >
            <GoogleGlyph />
            Googleで無料登録
          </Link>
        </div>
      </div>
    </div>
  );
}
