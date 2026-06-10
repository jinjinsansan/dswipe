/* global React */
// D-Swipe LP Editor — slide renderer + block definitions.
// Renders a slide (block) at 300×620 logical size from a `content` object.
// Exports to window: SlideRenderer, BLOCK_DEFS, BG_PRESETS, EdIco, ED_ICONS.

const ED_ICONS = {
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  chart: "M3 3v18h18 M7 15l3-4 3 3 4-6",
  spark: "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z",
  check: "M4 12l5 5L20 6",
  x: "M6 6l12 12M18 6L6 18",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  target: "M12 4a8 8 0 100 16 8 8 0 000-16z M12 8a4 4 0 100 8 4 4 0 000-8z",
  mail: "M3 5h18v14H3z M4 7l8 6 8-6",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16 M9 7V5h6v2 M6 7l1 13h10l1-13",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  sparkAi: "M12 3l1.4 4L17 8l-3.6 1L12 13l-1.4-4L7 8l3.6-1z M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z",
  chevL: "M15 5l-7 7 7 7",
  chevR: "M9 5l7 7-7 7",
  vert: "M12 4v16M7 15l5 5 5-5",
  horiz: "M4 12h16M15 7l5 5-5 5",
  palette: "M12 3a9 9 0 100 18 2.5 2.5 0 002.5-2.5c0-.7-.3-1.3-.7-1.7a1 1 0 01.7-1.7H17a4 4 0 004-4c0-3.9-4-7.1-9-7.1z",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
  layout: "M3 4h18v16H3z M3 9h18 M9 9v11",
  type: "M5 6h14M12 6v12M9 18h6",
  image: "M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6",
};

function EdIco({ d, sw = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const BG_PRESETS = {
  navy:   { css: "radial-gradient(360px 220px at 70% 12%, rgba(34,211,238,.3), transparent 60%), linear-gradient(165deg,#0b1f3a 0%,#0e5d80 130%)", light: false },
  cyan:   { css: "linear-gradient(150deg,#0284c7,#06b6d4)", light: false },
  teal:   { css: "linear-gradient(170deg,#0e7490,#0b1f3a)", light: false },
  deep:   { css: "linear-gradient(170deg,#111a2e,#0b1220)", light: false },
  aurora: { css: "radial-gradient(280px 200px at 50% 0%, rgba(245,158,11,.2), transparent 60%), linear-gradient(170deg,#0b1f3a,#07142a)", light: false },
  light:  { css: "#f4f8fd", light: true },
};
const BG_ORDER = ["navy", "cyan", "teal", "deep", "aurora", "light"];

function bgStyle(key) { return (BG_PRESETS[key] || BG_PRESETS.navy); }

// ---- the renderer ----
function SlideRenderer({ type, content }) {
  const c = content || {};
  const bg = bgStyle(c.bg);
  const cls = "sc" + (bg.light ? " light" : "");
  const style = { background: bg.css };

  if (type === "hero") {
    return (
      <div className={cls} style={style}><div className="sc-pad sc-hero">
        <span className="sc-eyebrow">{c.eyebrow}</span>
        <h1>{c.headline}</h1>
        <p>{c.sub}</p>
        {(c.name || c.role) && (
          <div className="by"><div className="av">{(c.name || "·").slice(0, 1)}</div><div><b>{c.name}</b><span>{c.role}</span></div></div>
        )}
      </div></div>
    );
  }
  if (type === "problem") {
    return (
      <div className={cls} style={style}><div className="sc-pad sc-problem">
        <div className="lead">{c.lead}</div>
        <ul>{(c.items || []).map((t, i) => (
          <li key={i}><span className="x"><EdIco d={ED_ICONS.x} sw={2.4} /></span>{t}</li>
        ))}</ul>
      </div></div>
    );
  }
  if (type === "benefit") {
    const ic = [ED_ICONS.bolt, ED_ICONS.chart, ED_ICONS.spark];
    return (
      <div className={cls} style={style}><div className="sc-pad sc-benefit">
        <span className="sc-eyebrow">{c.eyebrow}</span>
        <h2>{c.heading}</h2>
        <div className="bl">{(c.items || []).map((b, i) => (
          <div className="b" key={i}><span className="bi"><EdIco d={ic[i % 3]} /></span><div><b>{b.title}</b><p>{b.desc}</p></div></div>
        ))}</div>
      </div></div>
    );
  }
  if (type === "testimonial") {
    return (
      <div className={cls} style={style}><div className="sc-pad sc-testi">
        <div className="qm">&ldquo;</div>
        <div className="stars">★★★★★</div>
        <blockquote>{c.quote}</blockquote>
        <div className="who"><div className="av">{(c.name || "·").slice(0, 1)}</div><div><b>{c.name}</b><span>{c.role}</span></div></div>
      </div></div>
    );
  }
  if (type === "offer") {
    return (
      <div className={cls} style={style}><div className="sc-pad sc-offer">
        <span className="scar"><span className="d"></span>{c.scarcity}</span>
        <h2>{c.heading}</h2>
        <div className="price"><s>通常 {c.priceWas} P</s><div className="big">{c.priceNow}<span className="p"> P</span></div></div>
        <div className="guar"><EdIco d={ED_ICONS.shield} />{c.guarantee}</div>
      </div></div>
    );
  }
  if (type === "cta") {
    return (
      <div className={cls} style={style}><div className="sc-pad sc-cta">
        <h2>{c.headline}</h2>
        <p>{c.sub}</p>
        <div className="b">{c.button}</div>
      </div></div>
    );
  }
  if (type === "faq") {
    return (
      <div className={cls} style={style}><div className="sc-pad sc-faq">
        <h2>{c.heading}</h2>
        <div className="qa">{(c.items || []).map((it, i) => (
          <div className="item" key={i}><div className="q"><span className="mk">Q</span>{it.q}</div><div className="a">{it.a}</div></div>
        ))}</div>
      </div></div>
    );
  }
  return <div className={cls} style={style}><div className="sc-pad" /></div>;
}

// ---- block definitions (template picker + defaults) ----
const BLOCK_DEFS = [
  { type: "hero", name: "ヒーロー", icon: ED_ICONS.layout, desc: "1枚目の主役。見出しと著者", make: () => ({
    bg: "navy", eyebrow: "7-DAY CHALLENGE", headline: "7日間で、集客が変わる。",
    sub: "SNSだけで月100リスト。再現性のある集客導線を、スワイプ1本で。",
    name: "山田 太郎", role: "マーケティング講師" }) },
  { type: "problem", name: "課題提起", icon: ED_ICONS.x, desc: "共感を生む悩みリスト", make: () => ({
    bg: "deep", lead: "こんな悩み、ありませんか？",
    items: ["毎日投稿しても反応が薄い", "LPの作り方が分からない", "どこを直せば売れるのか不明"] }) },
  { type: "benefit", name: "ベネフィット", icon: ED_ICONS.spark, desc: "得られる価値を3点で", make: () => ({
    bg: "cyan", eyebrow: "WHAT YOU GET", heading: "このチャレンジで手に入るもの",
    items: [
      { title: "最短3分のLP量産術", desc: "テンプレに沿って入力するだけ" },
      { title: "数字で改善する型", desc: "離脱とCTA到達で勝ち筋を発見" },
      { title: "7日間の伴走サポート", desc: "つまずいてもすぐ質問できる" },
    ] }) },
  { type: "testimonial", name: "お客様の声", icon: ED_ICONS.chart, desc: "実績・信頼の引用", make: () => ({
    bg: "teal", quote: "3日目で初めてのリストが30件。半信半疑だった自分が、いまは毎週LPを出しています。",
    name: "佐藤 あや", role: "受講3週間 / 副業コーチ" }) },
  { type: "offer", name: "オファー", icon: ED_ICONS.bolt, desc: "価格・限定・保証", make: () => ({
    bg: "aurora", scarcity: "先着50名 — 残り 12 名", heading: "いまだけ、特別価格",
    priceWas: "29,800", priceNow: "9,800", guarantee: "14日間の返金保証つき" }) },
  { type: "cta", name: "CTA", icon: ED_ICONS.target, desc: "行動を促すボタン", make: () => ({
    bg: "cyan", headline: "未来を、前に進めよう", sub: "ボタンひとつで決済完了。すぐにスタート。", button: "今すぐ申し込む" }) },
  { type: "faq", name: "よくある質問", icon: ED_ICONS.type, desc: "不安を解消するQ&A", make: () => ({
    bg: "navy", heading: "よくある質問",
    items: [
      { q: "初心者でも大丈夫？", a: "はい。テンプレートとAIで迷わず作れます。" },
      { q: "返金はできますか？", a: "14日間の返金保証があるので安心です。" },
    ] }) },
];

const BLOCK_NAME = Object.fromEntries(BLOCK_DEFS.map((b) => [b.type, b.name]));

Object.assign(window, { SlideRenderer, BLOCK_DEFS, BLOCK_NAME, BG_PRESETS, BG_ORDER, EdIco, ED_ICONS });
