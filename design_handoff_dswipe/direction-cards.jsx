/* global React */
// D-Swipe — three design-direction identity cards.
// Each renders inside a DCArtboard. Styling tokens come from directions.css
// via the .dir-a / .dir-b / .dir-c root class.

// ---- heroicons-style outline icons (stroke 1.6, round) ----
const ic = {
  chart: "M3 3v18h18 M7 15l3-4 3 3 4-6",
  plus: "M12 5v14 M5 12h14",
  store: "M4 9l1-4h14l1 4 M4 9v10h16V9 M4 9h16 M9 19v-5h6v5",
  yen: "M12 12V8m0 4l-4-5m4 5l4-5m-7 7h6m-6 3h6M12 12v6",
  photo: "M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6",
  spark: "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z",
  cursor: "M5 4l14 7-6 1.5L11 19z",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z",
};
function Ico({ d, sw = 1.7 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ---- per-direction logo marks ----
function LogoA() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lgA" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#38bdf8" /><stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#lgA)" />
      <rect x="11" y="9.5" width="18" height="21" rx="5" fill="#fff" opacity=".35" transform="rotate(8 20 20)" />
      <rect x="10" y="9" width="18" height="22" rx="5.5" fill="#fff" />
      <path d="M16 15.5h4.2c2.9 0 4.8 1.9 4.8 4.5s-1.9 4.5-4.8 4.5H16z" fill="#0284c7" />
    </svg>
  );
}
function LogoB() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill="#fff" stroke="#0e7490" strokeWidth="1.5" />
      <path d="M13 11h7.5C25.7 11 29 14.4 29 20s-3.3 9-8.5 9H13z" fill="none" stroke="#0891b2" strokeWidth="2.4" />
      <path d="M13 11v18" stroke="#0b0e14" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="13" cy="11" r="1.7" fill="#0891b2" />
      <circle cx="13" cy="29" r="1.7" fill="#0891b2" />
    </svg>
  );
}
function LogoC() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lgC" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#0ea5e9" /><stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0b1f3a" />
      <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#lgC)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M22 20l6-5m-6 5l6 5" stroke="url(#lgC)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
      <path d="M25 20l6-5m-6 5l6 5" stroke="url(#lgC)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Wordmark({ tone }) {
  return (
    <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.02em", color: "var(--ink)" }}>
      D<span style={{ color: "var(--primary-solid)" }}>-</span>Swipe
    </span>
  );
}

// ---- shared sub-blocks ----
function Swatches({ items }) {
  return (
    <div className="swatch-row">
      {items.map((s) => (
        <div className="swatch" key={s.name}>
          <div className="swatch-chip" style={{ background: s.bg, borderBottom: "1px solid var(--border)" }} />
          <div className="swatch-meta">
            <div className="swatch-name">{s.name}</div>
            <div className="swatch-hex">{s.hex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Block({ label, children }) {
  return (
    <div className="idc-block">
      <div className="idc-label">{label}</div>
      {children}
    </div>
  );
}

// ============================================================
function DirCard({ dir, eyebrow, Logo, name, tagline, swA, swB, primaryHex, specChips, navActive, extraNav, kbd }) {
  return (
    <div className={`id-card ${dir}`}>
      <div className="idc-head">
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 4 }}>
          <Logo />
          <Wordmark />
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "var(--primary-solid)", textTransform: "uppercase" }}>{eyebrow}</span>
        </div>
        <div className="idc-name">{name}</div>
        <div className="idc-tagline">{tagline}</div>
      </div>

      <div className="idc-body">
        <Block label="アクセント & サーフェス">
          <Swatches items={swA} />
          <Swatches items={swB} />
        </Block>

        <div className="idc-divider" />

        <Block label="タイポグラフィ — Noto Sans JP">
          <div className="type-spec">
            <div className="type-display">スワイプで、伝わる。</div>
            <div className="type-sub">ノーコード × AI で作る縦型LP</div>
            <div className="type-body">情報商材の販売者が、数分でスワイプ型ランディングページを公開。AIが構成を提案し、データで改善できる。可読性を最優先にした本文サイズ設計。</div>
            <div className="type-scale">
              <span><b>Display</b> 32/700</span>
              <span><b>Heading</b> 20/600</span>
              <span><b>Body</b> 14/400</span>
              <span><b>Caption</b> 12/500</span>
            </div>
          </div>
        </Block>

        <div className="idc-divider" />

        <Block label="ボタン & 入力">
          <div className="btn-row">
            <button className="btn btn-primary"><Ico d={ic.plus} sw={2} />新規LP作成</button>
            <button className="btn btn-secondary">プレビュー</button>
            <button className="btn btn-ghost">詳細</button>
          </div>
          <div className="field-wrap">
            <span className="field-label">メールアドレス</span>
            <input className="field is-focus" defaultValue="you@d-swipe.com" readOnly />
          </div>
        </Block>

        <div className="idc-divider" />

        <Block label="カード & バッジ">
          <div className="kpi">
            <div className="kpi-top">
              <span className="kpi-ico"><Ico d={ic.eye} /></span>
              <span className="kpi-cap">総閲覧数（今月）</span>
            </div>
            <span className="kpi-val">24,180</span>
            <span className="kpi-delta">▲ 18.2% 先月比</span>
          </div>
          <div className="badge-row">
            <span className="badge badge-live"><span className="badge-dot" />公開中</span>
            <span className="badge badge-draft">下書き</span>
            <span className="badge badge-pro">SELLER</span>
          </div>
        </Block>

        <div className="idc-divider" />

        <Block label="ナビゲーション">
          <div className="nav-demo">
            <div className={"nav-item" + (navActive === 0 ? " active" : "")}><Ico d={ic.chart} />ダッシュボード</div>
            <div className={"nav-item" + (navActive === 1 ? " active" : "")}><Ico d={ic.store} />マーケット</div>
            <div className={"nav-item" + (navActive === 2 ? " active" : "")}><Ico d={ic.spark} />AIアシスト</div>
          </div>
        </Block>

        <div style={{ marginTop: "auto", paddingTop: 4 }}>
          <div className="spec-row">
            {specChips.map((c, i) => <span className="spec-chip" key={i}>{c}</span>)}
            {kbd && <span className="kbd">⌘K</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DirA = () => (
  <DirCard
    dir="dir-a"
    eyebrow="A · Clarity"
    Logo={LogoA}
    name="Clarity — 静けさと余白"
    tagline="Stripe の上質さ。白を基調に、やわらかな影と広い余白で“信頼できる金融プロダクト”の落ち着きを出す。迷わせない、いちばん安全な王道。"
    swA={[
      { name: "Primary", hex: "#0EA5E9", bg: "#0ea5e9" },
      { name: "Hover", hex: "#0284C7", bg: "#0284c7" },
      { name: "Tint", hex: "#EFF8FF", bg: "#eff8ff" },
      { name: "Ink", hex: "#0F172A", bg: "#0f172a" },
    ]}
    swB={[
      { name: "Muted", hex: "#64748B", bg: "#64748b" },
      { name: "Surface", hex: "#FFFFFF", bg: "#ffffff" },
      { name: "Canvas", hex: "#F5F8FC", bg: "#f5f8fc" },
      { name: "Border", hex: "#E7EEF6", bg: "#e7eef6" },
    ]}
    navActive={0}
    specChips={["radius 16 / 10", "shadow: soft layered", "余白 generous", "pill badges"]}
  />
);

window.DirB = () => (
  <DirCard
    dir="dir-b"
    eyebrow="B · Precision"
    Logo={LogoB}
    name="Precision — 道具としての精度"
    tagline="Linear の緻密さ。1px のシャープな境界、小さめの角丸、高い情報密度。キーボード操作とデータ表示に強い“プロの編集ツール”の質感。"
    swA={[
      { name: "Primary", hex: "#0891B2", bg: "#0891b2" },
      { name: "Hover", hex: "#0E7490", bg: "#0e7490" },
      { name: "Tint", hex: "#ECFDFF", bg: "#ecfdff" },
      { name: "Ink", hex: "#0B0E14", bg: "#0b0e14" },
    ]}
    swB={[
      { name: "Muted", hex: "#6B7484", bg: "#6b7484" },
      { name: "Surface", hex: "#FFFFFF", bg: "#ffffff" },
      { name: "Canvas", hex: "#FBFCFD", bg: "#fbfcfd" },
      { name: "Border", hex: "#E4E8EE", bg: "#e4e8ee" },
    ]}
    navActive={1}
    specChips={["radius 10 / 8", "1px crisp borders", "tabular nums", "dense"]}
    kbd
  />
);

window.DirC = () => (
  <DirCard
    dir="dir-c"
    eyebrow="C · Momentum"
    Logo={LogoC}
    name="Momentum — 勢いと転換"
    tagline="紺のクローム × シアンのグラデーション。コンバージョンに効く力強さを、ライト基調の中で上品に。CTA は光るアクセント、見出しは大きく。"
    swA={[
      { name: "Primary", hex: "#0EA5E9→06B6D4", bg: "linear-gradient(135deg,#0ea5e9,#06b6d4)" },
      { name: "Solid", hex: "#0284C7", bg: "#0284c7" },
      { name: "Navy", hex: "#0B1F3A", bg: "#0b1f3a" },
      { name: "Tint", hex: "#E9F6FE", bg: "#e9f6fe" },
    ]}
    swB={[
      { name: "Muted", hex: "#5A6B82", bg: "#5a6b82" },
      { name: "Surface", hex: "#FFFFFF", bg: "#ffffff" },
      { name: "Canvas", hex: "#F4F8FD", bg: "#f4f8fd" },
      { name: "Border", hex: "#E2EBF6", bg: "#e2ebf6" },
    ]}
    navActive={2}
    specChips={["radius 20 / 13", "navy chrome", "gradient CTA + glow", "display 800"]}
  />
);
