'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Mousewheel, Keyboard, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  BoltIcon,
  SparklesIcon,
  ChartBarIcon,
  PencilSquareIcon,
  GlobeAltIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyYenIcon,
  CheckIcon,
  ArrowRightIcon,
  BellIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import './home.css';

const PHONE_SLIDES = [
  { bg: 'linear-gradient(170deg,#0b1f3a,#0e7490)', tag: '7-DAY CHALLENGE', h: ['7日間で', '集客が変わる'], p: 'SNSだけで月100リスト。' },
  { bg: 'linear-gradient(170deg,#1b3a61,#0b1f3a)', tag: 'こんな悩み', h: ['頑張っても', '伸びない…'], p: '投稿しても反応が薄い。' },
  { bg: 'linear-gradient(170deg,#0e7490,#0b1f3a)', tag: '特別オファー', h: ['いまだけ', '特別価格'], price: true },
  { bg: 'linear-gradient(170deg,#0284c7,#06b6d4)', tag: '今すぐ申し込む', h: ['未来を、', '前に進めよう'], p: '申し込む →' },
];

const PILLARS = [
  { icon: PencilSquareIcon, step: 'STEP 01', b: '作る', p: 'ノーコード＋AIでスワイプLP' },
  { icon: ChartBarIcon, step: 'STEP 02', b: '集める', p: '分析で集客を最適化' },
  { icon: GlobeAltIcon, step: 'STEP 03', b: '届ける', p: '公開・発見フィードで拡散' },
  { icon: UsersIcon, step: 'STEP 04', b: 'つながる', p: 'サロン・メンバーシップ' },
  { icon: CurrencyYenIcon, step: 'STEP 05', b: '稼ぐ', p: 'マーケット・ポイント決済' },
];

const NAV_LINKS = [
  { go: 1, label: 'D-Swipeとは' },
  { go: 2, label: '作る' },
  { go: 4, label: '届ける' },
  { go: 5, label: 'サロン' },
  { go: 7, label: '料金' },
];

function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="home-bl" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#fff" fillOpacity=".08" stroke="rgba(255,255,255,.2)" />
      <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#home-bl)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M25 20l6-5m-6 5l6 5" stroke="url(#home-bl)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [phoneIdx, setPhoneIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhoneIdx((i) => (i + 1) % PHONE_SLIDES.length), 2400);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => swiperRef.current?.slideTo(i);

  return (
    <div className="htop">
      {/* Fixed top nav */}
      <nav className="nav">
        <div className="nav-in">
          <button className="nav-logo" onClick={() => goTo(0)}>
            <BrandMark />
            <span>
              D<span style={{ color: 'var(--cyan-400)' }}>-</span>Swipe
            </span>
          </button>
          <div className="nav-links-wrap flex gap-0.5">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => goTo(l.go)}
                className="rounded-[9px] px-2.5 py-1.5 text-[13.5px] font-medium transition-colors hover:bg-white/10"
                style={{ color: 'var(--on-navy-muted)' }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            <Link href="/login" className="nav-login">
              ログイン
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      <Swiper
        direction="vertical"
        slidesPerView={1}
        speed={600}
        mousewheel={{ releaseOnEdges: true }}
        keyboard
        pagination={{ clickable: true }}
        modules={[Mousewheel, Keyboard, Pagination]}
        onSwiper={(s) => (swiperRef.current = s)}
        className="deck"
      >
        {/* 0 HERO */}
        <SwiperSlide className="vslide bg-hero">
          <div className="vslide-in">
            <div className="wrap">
              <div className="hero-grid">
                <div>
                  <span className="hero-eyebrow">
                    <BoltIcon />
                    作る・集める・届ける・つながる・稼ぐ
                  </span>
                  <h1 className="hero-h1">
                    スワイプで、
                    <br />
                    <span className="g">伝わる</span>。<span className="g">つながる</span>。
                  </h1>
                  <p className="s-sub sub-dark">
                    誰でも気軽にスワイプ型LPを作って集客。さらに公開・発見・サロンまで。情報発信のすべてが、D-Swipe ひとつで完結します。
                  </p>
                  <div className="hero-cta">
                    <Link href="/register" className="btn btn-primary btn-lg">
                      無料で始める
                      <ArrowRightIcon />
                    </Link>
                    <button
                      onClick={() => goTo(1)}
                      className="btn btn-lg"
                      style={{ background: 'rgba(255,255,255,.07)', color: '#fff', borderColor: 'rgba(255,255,255,.18)' }}
                    >
                      D-Swipeとは？
                    </button>
                  </div>
                </div>
                <div className="phone-stage">
                  <div className="phone-glow" />
                  <div className="phone">
                    <div className="phone-screen">
                      {PHONE_SLIDES.map((s, i) => (
                        <div key={i} className="pslide" style={{ background: s.bg, opacity: i === phoneIdx ? 1 : 0, transition: 'opacity .6s' }}>
                          <span className="tg">{s.tag}</span>
                          <h3>
                            {s.h[0]}
                            <br />
                            {s.h[1]}
                          </h3>
                          {s.price ? (
                            <div className="price">
                              <s>¥29,800</s>¥9,800
                            </div>
                          ) : (
                            s.p && <p>{s.p}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 1 PLATFORM OVERVIEW */}
        <SwiperSlide className="vslide bg-deep">
          <div className="vslide-in">
            <div className="wrap center">
              <span className="eyebrow-dark">What is D-Swipe</span>
              <h2 className="s-h">LPを作って終わり、じゃない。</h2>
              <p className="s-sub sub-dark">
                D-Swipe は「作る → 集める → 届ける → つながる → 稼ぐ」をひとつにした、スワイプ型のコンテンツ・プラットフォーム。LP作成ツールでありながら、note のような公開メディアでもあり、サロンの母艦にもなります。
              </p>
              <div className="pillars">
                {PILLARS.map(({ icon: Icon, step, b, p }) => (
                  <div key={step} className="pillar">
                    <span className="pi">
                      <Icon />
                    </span>
                    <div className="step">{step}</div>
                    <b>{b}</b>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 2 作る */}
        <SwiperSlide className="vslide bg-light">
          <div className="vslide-in">
            <div className="wrap two-col">
              <div>
                <span className="kover">
                  <PencilSquareIcon />
                  作る · CREATE
                </span>
                <h2 className="s-h">
                  スワイプLPを、
                  <br />
                  ドラッグとAIで。
                </h2>
                <p className="s-sub sub-light">
                  テンプレートにブロックを並べるだけ。AIが構成と文章を提案し、初めてでも数分で“読み進めたくなる”LPが完成します。
                </p>
                <div className="feat-bullets">
                  <Bullet icon={<SparklesIcon />} b="AI構成アシスト" p="商材を入力するだけで、ヒーロー〜CTAの構成を自動生成。" />
                  <Bullet icon={<PencilSquareIcon />} b="ドラッグ編集" p="ブロックを並べ替え、文言・画像を差し替え。即プレビュー。" />
                  <Bullet icon={<BoltIcon />} b="最短3分で公開" p="ワンクリックで公開し、専用URLを発行。" />
                </div>
              </div>
              <div className="phone-stage">
                <div className="phone" style={{ width: 200, height: 410 }}>
                  <div className="phone-screen">
                    <div className="pslide" style={{ background: 'radial-gradient(180px 130px at 70% 10%,rgba(34,211,238,.3),transparent 60%),linear-gradient(165deg,#0b1f3a,#0e7490)' }}>
                      <span className="tg">7-DAY CHALLENGE</span>
                      <h3>
                        7日間で
                        <br />
                        集客が変わる
                      </h3>
                      <p>SNSだけで月100リスト。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 3 集める */}
        <SwiperSlide className="vslide bg-canvas">
          <div className="vslide-in">
            <div className="wrap two-col">
              <div>
                <span className="kover">
                  <ChartBarIcon />
                  集める · GROW
                </span>
                <h2 className="s-h">
                  “なんとなく”を、
                  <br />
                  数字で終わらせる。
                </h2>
                <p className="s-sub sub-light">
                  スライドごとの離脱・CTA到達・売上をリアルタイムで可視化。どこを直せば伸びるかが、ひと目で分かります。
                </p>
                <div className="feat-bullets">
                  <Bullet icon={<ChartBarIcon />} b="ファネル可視化" p="どのスライドで離脱したかをステップ別に表示。" />
                  <Bullet icon={<ViewfinderCircleIcon />} b="CTAクリック率" p="最も効くオファー位置を発見できる。" />
                </div>
              </div>
              <div className="show-panel hide-sm">
                <div className="mini-kpis">
                  <div className="mini-kpi">
                    <div className="l">閲覧数</div>
                    <div className="v">24,180</div>
                  </div>
                  <div className="mini-kpi">
                    <div className="l">CTA率</div>
                    <div className="v">7.4%</div>
                  </div>
                  <div className="mini-kpi">
                    <div className="l">売上</div>
                    <div className="v">182K</div>
                  </div>
                </div>
                <div className="chart">
                  {[46, 62, 54, 78, 70, 92, 84].map((h, i) => (
                    <div key={i} className="bar" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>ファネル到達率</span>
                  <span className="badge badge-live">
                    <span className="dot" />
                    公開中
                  </span>
                </div>
                <div className="progress mt-2.5">
                  <span style={{ width: '74%' }} />
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 4 届ける */}
        <SwiperSlide className="vslide bg-light">
          <div className="vslide-in">
            <div className="wrap">
              <div className="center">
                <span className="kover">
                  <GlobeAltIcon />
                  届ける · PUBLISH
                </span>
                <h2 className="s-h">作ったLPが、見つかる場所。</h2>
                <p className="s-sub sub-light">
                  D-Swipe は note のような公開メディア。あなたのLPは発見フィードに並び、フォロー・スキで広がります。クリエイターページ <b style={{ color: 'var(--brand)' }}>/u/yourname</b> がそのまま“作品集”に。
                </p>
              </div>
              <div className="feed">
                <FeedCard bg="linear-gradient(150deg,#0b1f3a,#0e7490)" tag="マーケティング" title="7日間スワイプ集客チャレンジ" av="linear-gradient(135deg,#22d3ee,#0ea5e9)" name="山田 太郎" likes="1.2k" />
                <FeedCard bg="linear-gradient(150deg,#7c3aed,#0284c7)" tag="副業" title="副業ロードマップ無料配布" av="linear-gradient(135deg,#f59e0b,#ef4444)" name="佐藤 あや" likes="860" />
                <FeedCard bg="linear-gradient(150deg,#0e7490,#22d3ee)" tag="ライティング" title="売れる文章の作り方 講座" av="linear-gradient(135deg,#16a34a,#22d3ee)" name="鈴木 けん" likes="2.4k" />
              </div>
              <div className="feed-tags">
                <span className="feed-tag">
                  <b>#</b> 発見フィード
                </span>
                <span className="feed-tag">
                  <b>♡</b> スキで応援
                </span>
                <span className="feed-tag">
                  <b>+</b> フォロー
                </span>
                <span className="feed-tag">
                  <b>@</b> クリエイターページ
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 5 つながる */}
        <SwiperSlide className="vslide bg-canvas">
          <div className="vslide-in">
            <div className="wrap two-col">
              <div>
                <span className="kover">
                  <UsersIcon />
                  つながる · COMMUNITY
                </span>
                <h2 className="s-h">
                  ファンと、
                  <br />
                  続く関係を。
                </h2>
                <p className="s-sub sub-light">
                  単発で売って終わりではなく、月額メンバーシップでファンと継続的につながる。限定LP・限定コンテンツ・メンバー専用フィードで、あなたの“サロン”を運営できます。
                </p>
                <div className="feat-bullets">
                  <Bullet icon={<UsersIcon />} b="月額メンバーシップ" p="継続課金で安定した収益基盤を。" />
                  <Bullet icon={<BellIcon />} b="メンバー限定の配信" p="限定LP・お知らせをメンバーだけに届ける。" />
                </div>
              </div>
              <div className="salon-card">
                <div className="sc-top">
                  <div>
                    <div className="stier">MEMBERSHIP</div>
                    <div className="sname">あや’s 集客ラボ</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="sprice">
                      ¥2,980<small>/月</small>
                    </div>
                  </div>
                </div>
                <ul className="salon-perks">
                  <li>
                    <CheckIcon />
                    メンバー限定LP・テンプレ配布
                  </li>
                  <li>
                    <CheckIcon />
                    月2回のオンライン勉強会
                  </li>
                  <li>
                    <CheckIcon />
                    質問し放題のメンバーフィード
                  </li>
                </ul>
                <button className="btn btn-primary btn-block">サロンに参加する</button>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 6 稼ぐ */}
        <SwiperSlide className="vslide bg-light">
          <div className="vslide-in">
            <div className="wrap">
              <div className="center">
                <span className="kover">
                  <BuildingStorefrontIcon />
                  稼ぐ · MONETIZE
                </span>
                <h2 className="s-h">売る。受け取る。ぜんぶ内側で。</h2>
                <p className="s-sub sub-light">
                  作ったLPから商品を販売し、マーケットにも掲載。決済はポイントベースでシンプル。販売・購入・売上集計までプラットフォーム内で完結します。
                </p>
              </div>
              <div className="mkt">
                <MktCard bg="linear-gradient(150deg,#0b1f3a,#0e7490)" name="スワイプ集客マスター講座" price="9,800 P" />
                <MktCard bg="linear-gradient(150deg,#0284c7,#06b6d4)" name="LPテンプレート20選" price="3,500 P" />
                <MktCard bg="linear-gradient(150deg,#7c3aed,#0284c7)" name="ファネル設計シート" price="1,200 P" />
              </div>
              <div className="feed-tags">
                <span className="feed-tag">
                  <b>◆</b> ポイント決済
                </span>
                <span className="feed-tag">
                  <b>🛍</b> マーケット掲載
                </span>
                <span className="feed-tag">
                  <b>📈</b> 売上ダッシュボード
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 7 PRICING */}
        <SwiperSlide className="vslide bg-canvas">
          <div className="vslide-in">
            <div className="wrap">
              <div className="center">
                <span className="eyebrow">Pricing</span>
                <h2 className="s-h">まずは無料。伸びたら、ポイントで。</h2>
              </div>
              <div className="price-grid">
                <div className="card pcard">
                  <div className="pname">Free</div>
                  <div className="pp">¥0</div>
                  <div className="pl">まず試したい方に</div>
                  <ul>
                    <PriceLi>LP作成 無制限</PriceLi>
                    <PriceLi>公開・発見フィード掲載</PriceLi>
                    <PriceLi>基本アナリティクス</PriceLi>
                  </ul>
                  <Link href="/register" className="btn btn-secondary btn-block">
                    無料で始める
                  </Link>
                </div>
                <div className="card pcard feature">
                  <span className="pop">人気</span>
                  <div className="pname">Points 1,000</div>
                  <div className="pp">
                    ¥1,000<small> /1,000P</small>
                  </div>
                  <div className="pl">公開・AI生成・販売・サロンに</div>
                  <ul>
                    <PriceLi>AI構成アシスト</PriceLi>
                    <PriceLi>商品販売・サロン開設</PriceLi>
                    <PriceLi>詳細ファネル分析</PriceLi>
                    <PriceLi>独自URL・SEO設定</PriceLi>
                  </ul>
                  <Link href="/register" className="btn btn-primary btn-block">
                    ポイントを購入
                  </Link>
                </div>
                <div className="card pcard">
                  <div className="pname">Seller</div>
                  <div className="pp">手数料制</div>
                  <div className="pl">本格的に販売する方に</div>
                  <ul>
                    <PriceLi>商品管理ダッシュボード</PriceLi>
                    <PriceLi>マーケット優先掲載</PriceLi>
                    <PriceLi>売上・購入者の管理</PriceLi>
                  </ul>
                  <Link href="/register" className="btn btn-secondary btn-block">
                    販売者になる
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* 8 FINAL */}
        <SwiperSlide className="vslide bg-final">
          <div className="vslide-in">
            <div className="wrap center">
              <span className="eyebrow-dark">Get started</span>
              <h2 className="final-h">
                あなたの発信を、
                <br />
                ひとつの場所に。
              </h2>
              <p className="s-sub sub-dark">作って、集めて、届けて、つながって、稼ぐ。D-Swipe で、今すぐ無料で始めましょう。</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/register" className="btn btn-primary btn-lg" style={{ fontSize: 16, padding: '15px 30px' }}>
                  無料で始める
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* Fixed signup band */}
      <div className="signup-bar">
        <div className="signup-in">
          <div className="signup-msg">
            <strong>作る・届ける・つながる。ぜんぶ無料で始められる</strong>
            <span>
              <b>3分</b>で公開 · クレジットカード不要 · LP作成は無制限
            </span>
          </div>
          <Link href="/register" className="gbtn">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 00.96 4.95l3 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Googleで無料登録
          </Link>
        </div>
      </div>
    </div>
  );
}

function Bullet({ icon, b, p }: { icon: React.ReactNode; b: string; p: string }) {
  return (
    <div className="fb">
      <span className="c">{icon}</span>
      <div>
        <b>{b}</b>
        <p>{p}</p>
      </div>
    </div>
  );
}

function FeedCard({ bg, tag, title, av, name, likes }: { bg: string; tag: string; title: string; av: string; name: string; likes: string }) {
  return (
    <div className="fcard">
      <div className="ft" style={{ background: bg }}>
        <span className="tag">{tag}</span>
      </div>
      <div className="fb2">
        <div className="fttl">{title}</div>
        <div className="fmeta">
          <span className="fav" style={{ background: av }} />
          <span className="fname">{name}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted)' }}>
            <HeartIcon className="h-[13px] w-[13px]" style={{ color: '#f43f5e' }} />
            {likes}
          </span>
        </div>
      </div>
    </div>
  );
}

function MktCard({ bg, name, price }: { bg: string; name: string; price: string }) {
  return (
    <div className="pcard2">
      <div className="pt" style={{ background: bg }} />
      <div className="pbd">
        <div className="pn">{name}</div>
        <div className="pf">
          <span className="pp">{price}</span>
          <span className="pb">購入</span>
        </div>
      </div>
    </div>
  );
}

function PriceLi({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <CheckIcon />
      {children}
    </li>
  );
}
