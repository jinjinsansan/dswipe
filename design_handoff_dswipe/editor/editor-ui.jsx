/* global React, SlideRenderer, BLOCK_DEFS, BLOCK_NAME, BG_ORDER, BG_PRESETS, EdIco, ED_ICONS */
// D-Swipe LP Editor — UI components.
// Exports: EdHeader, Filmstrip, DeviceStage, PropertyPanel, TemplateModal, ThemeModal

const I = ED_ICONS;

function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs><linearGradient id="edlg" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#0ea5e9" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0b1f3a" />
      <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#edlg)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M25 20l6-5m-6 5l6 5" stroke="url(#edlg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------- header ----------
function EdHeader({ title, onTitle, status, saved, onSave, onPublish, onPreview, onMenu }) {
  return (
    <header className="ed-head">
      <a className="ed-back" href="D-Swipe Dashboard.html"><EdIco d={I.chevL} /><span>戻る</span></a>
      <div className="ed-title">
        <Logo />
        <input value={title} onChange={(e) => onTitle(e.target.value)} aria-label="LPタイトル" />
      </div>
      <div className="spacer"></div>
      <div className="ed-actions">
        <span className={"badge " + (status === "published" ? "badge-live" : "badge-draft")}>
          {status === "published" ? <span className="dot"></span> : null}{status === "published" ? "公開中" : "下書き"}
        </span>
        <span className="ed-saved"><span className="dotg"></span>{saved ? "保存済み" : "未保存"}</span>
        <button className="btn btn-secondary btn-sm" onClick={onPreview}><EdIco d={I.target} />プレビュー</button>
        {status === "draft"
          ? <button className="btn btn-navy btn-sm" onClick={onPublish}>公開する</button>
          : null}
        <button className="btn btn-primary btn-sm" onClick={onSave}>保存</button>
        <button className="btn btn-secondary btn-sm mob-only" onClick={onMenu} aria-label="パネル" style={{ display: "none" }}><EdIco d={I.layout} /></button>
      </div>
    </header>
  );
}

// ---------- filmstrip (left) ----------
function Filmstrip({ slides, selId, onSelect, onAdd, onDelete, onDup, onReorder, mob }) {
  const [dragId, setDragId] = React.useState(null);
  return (
    <aside className={"ed-rail" + (mob ? " mob" : "")}>
      <div className="rail-top">
        <div className="lbl">スライド · {slides.length}枚</div>
        <button className="btn btn-primary btn-sm add-block" onClick={onAdd}><EdIco d={I.plus} sw={2.4} />ブロックを追加</button>
      </div>
      <div className="rail-scroll">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={"slide-item" + (s.id === selId ? " sel" : "") + (s.id === dragId ? " drag" : "")}
            draggable
            onClick={() => onSelect(s.id)}
            onDragStart={(e) => { setDragId(s.id); e.dataTransfer.effectAllowed = "move"; }}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (dragId && dragId !== s.id) onReorder(dragId, s.id); setDragId(null); }}
          >
            <span className="slide-num">{i + 1}</span>
            <div className="thumb"><div className="scale-wrap"><SlideRenderer type={s.type} content={s.content} /></div></div>
            <div className="slide-meta">
              <span className="grip" onClick={(e) => e.stopPropagation()}><EdIco d={I.grip} /></span>
              <div className="nm">{BLOCK_NAME[s.type] || s.type}</div>
              <div className="ty">スライド {i + 1}</div>
            </div>
            <div className="slide-tools" onClick={(e) => e.stopPropagation()}>
              <button title="複製" onClick={() => onDup(s.id)}><EdIco d={I.copy} /></button>
              <button className="del" title="削除" onClick={() => onDelete(s.id)}><EdIco d={I.trash} /></button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ---------- device stage (center) ----------
function DeviceStage({ slides, selId, onSelect, swipeDir, onSwipeDir }) {
  const idx = Math.max(0, slides.findIndex((s) => s.id === selId));
  const cur = slides[idx];
  const go = (d) => { const n = idx + d; if (n >= 0 && n < slides.length) onSelect(slides[n].id); };
  return (
    <section className="ed-stage">
      <div className="stage-bar">
        <div className="stage-seg" role="tablist" aria-label="スワイプ方向">
          <button className={swipeDir === "vertical" ? "on" : ""} onClick={() => onSwipeDir("vertical")}><EdIco d={I.vert} />縦</button>
          <button className={swipeDir === "horizontal" ? "on" : ""} onClick={() => onSwipeDir("horizontal")}><EdIco d={I.horiz} />横</button>
        </div>
        <span className="stage-counter"><b>{idx + 1}</b> / {slides.length}</span>
      </div>
      <div className="stage-body">
        <button className="nav-btn" onClick={() => go(-1)} disabled={idx === 0} aria-label="前へ"><EdIco d={I.chevL} sw={2.2} /></button>
        <div className="device">
          <div className="device-screen">
            <div className="device-notch"></div>
            {cur ? <SlideRenderer type={cur.type} content={cur.content} /> : null}
            <div className="device-dots" style={swipeDir === "horizontal" ? { right: "auto", bottom: 10, top: "auto", left: "50%", transform: "translateX(-50%)", flexDirection: "row" } : null}>
              {slides.map((s, i) => <i key={s.id} className={i === idx ? "on" : ""} style={i === idx && swipeDir === "horizontal" ? { width: 16, height: 5 } : null}></i>)}
            </div>
          </div>
        </div>
        <button className="nav-btn" onClick={() => go(1)} disabled={idx === slides.length - 1} aria-label="次へ"><EdIco d={I.chevR} sw={2.2} /></button>
      </div>
    </section>
  );
}

// ---------- AI suggestions ----------
const AI_SUGS = {
  headline: ["たった7日で、集客が“仕組み”に変わる", "もう投稿で消耗しない。スワイプLPで集める", "凡人がリスト30件を集めた、再現性の型"],
  subtitle: ["SNSだけで月100リスト。再現性のある導線を、スワイプ1本で。", "「なんとなく投稿」を卒業。データで伸ばすLPの作り方。", "初心者でも3分。AIが構成を提案、あなたは埋めるだけ。"],
  description: ["3日目で初めてのリストが30件。やってよかったです。", "半信半疑でしたが、いまは毎週LPを出せています。", "型に沿うだけで、自分の言葉が“売れる文章”に変わりました。"],
  cta: ["今すぐ無料で始める", "先着50名に申し込む", "まずはLPを作ってみる"],
};

// ---------- property panel (right) ----------
const SCHEMA = {
  hero: [
    { k: "eyebrow", l: "アイブロウ", kind: "text" },
    { k: "headline", l: "見出し", kind: "text", ai: "headline" },
    { k: "sub", l: "サブコピー", kind: "textarea", ai: "subtitle" },
    { k: "name", l: "著者名", kind: "text" },
    { k: "role", l: "肩書き", kind: "text" },
  ],
  problem: [{ k: "lead", l: "問いかけ", kind: "text", ai: "headline" }],
  benefit: [
    { k: "eyebrow", l: "アイブロウ", kind: "text" },
    { k: "heading", l: "見出し", kind: "text", ai: "headline" },
  ],
  testimonial: [
    { k: "quote", l: "引用コメント", kind: "textarea", ai: "description" },
    { k: "name", l: "お名前", kind: "text" },
    { k: "role", l: "属性・実績", kind: "text" },
  ],
  offer: [
    { k: "scarcity", l: "限定性", kind: "text" },
    { k: "heading", l: "見出し", kind: "text" },
    { k: "priceWas", l: "通常価格 (P)", kind: "text" },
    { k: "priceNow", l: "特別価格 (P)", kind: "text" },
    { k: "guarantee", l: "保証・特典", kind: "text" },
  ],
  cta: [
    { k: "headline", l: "見出し", kind: "text", ai: "headline" },
    { k: "sub", l: "サブコピー", kind: "textarea" },
    { k: "button", l: "ボタン文言", kind: "text", ai: "cta" },
  ],
  faq: [{ k: "heading", l: "見出し", kind: "text" }],
};

function Field({ f, value, onChange, aiOpen, setAiOpen }) {
  const open = aiOpen === f.k;
  return (
    <div className="pfield" style={{ position: "relative" }}>
      <div className="pfield-top">
        <label>{f.l}</label>
        {f.ai ? (
          <button className="ai-btn" onClick={() => setAiOpen(open ? null : f.k)}><EdIco d={I.sparkAi} />AI生成</button>
        ) : null}
      </div>
      {f.kind === "textarea"
        ? <textarea className="ptext" value={value || ""} onChange={(e) => onChange(f.k, e.target.value)} />
        : <input className="pinput" value={value || ""} onChange={(e) => onChange(f.k, e.target.value)} />}
      {open ? (
        <div className="ai-pop" style={{ top: "100%", left: 0, right: 0, marginTop: 6 }}>
          <div className="h"><EdIco d={I.sparkAi} />AIの提案 — 選んで反映</div>
          {(AI_SUGS[f.ai] || []).map((s, i) => (
            <button className="ai-opt" key={i} onClick={() => { onChange(f.k, s); setAiOpen(null); }}>{s}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PropertyPanel({ slide, onChange, onClose, mob }) {
  const [aiOpen, setAiOpen] = React.useState(null);
  React.useEffect(() => { setAiOpen(null); }, [slide && slide.id]);

  if (!slide) {
    return (
      <aside className={"ed-props" + (mob ? " mob" : "")}>
        <div className="props-empty">
          <span className="ic"><EdIco d={I.layout} /></span>
          <b>スライドを選択</b>
          <p>左のフィルムストリップからスライドを選ぶと、ここで文言・色を編集できます。</p>
        </div>
      </aside>
    );
  }
  const fields = SCHEMA[slide.type] || [];
  const c = slide.content;
  const set = (k, v) => onChange(slide.id, k, v);
  const setItem = (i, patch) => { const items = c.items.map((it, j) => j === i ? (typeof it === "string" ? patch : { ...it, ...patch }) : it); onChange(slide.id, "items", items); };
  const addItem = () => { const blank = slide.type === "problem" ? "新しい項目" : slide.type === "faq" ? { q: "質問", a: "回答" } : { title: "見出し", desc: "説明" }; onChange(slide.id, "items", [...(c.items || []), blank]); };
  const delItem = (i) => onChange(slide.id, "items", c.items.filter((_, j) => j !== i));

  return (
    <aside className={"ed-props" + (mob ? " mob" : "")}>
      <div className="props-head">
        <div><div className="t">{BLOCK_NAME[slide.type]}</div><div className="ty">ブロックを編集</div></div>
        <button className="props-x" onClick={onClose} aria-label="閉じる"><EdIco d={I.x} sw={2.2} /></button>
      </div>
      <div className="props-scroll">
        <div className="pgroup">
          <div className="pgroup-h">コンテンツ</div>
          {fields.map((f) => <Field key={f.k} f={f} value={c[f.k]} onChange={set} aiOpen={aiOpen} setAiOpen={setAiOpen} />)}
        </div>

        {c.items ? (
          <div className="pgroup">
            <div className="pfield-top"><div className="pgroup-h">項目 · {c.items.length}</div><button className="ai-btn" onClick={addItem}><EdIco d={I.plus} sw={2.4} />追加</button></div>
            {c.items.map((it, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 11, border: "1px solid var(--line)", borderRadius: 11, background: "var(--surface-2)" }}>
                <div className="pfield-top"><label>項目 {i + 1}</label><button className="props-x" style={{ width: 22, height: 22 }} onClick={() => delItem(i)}><EdIco d={I.trash} /></button></div>
                {typeof it === "string"
                  ? <input className="pinput" value={it} onChange={(e) => setItem(i, e.target.value)} />
                  : slide.type === "faq"
                    ? <React.Fragment>
                        <input className="pinput" value={it.q} onChange={(e) => setItem(i, { q: e.target.value })} placeholder="質問" />
                        <textarea className="ptext" style={{ minHeight: 48 }} value={it.a} onChange={(e) => setItem(i, { a: e.target.value })} placeholder="回答" />
                      </React.Fragment>
                    : <React.Fragment>
                        <input className="pinput" value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="見出し" />
                        <input className="pinput" value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} placeholder="説明" />
                      </React.Fragment>}
              </div>
            ))}
          </div>
        ) : null}

        <div className="pgroup">
          <div className="pgroup-h">背景スタイル</div>
          <div className="bg-swatches">
            {BG_ORDER.map((k) => (
              <button key={k} className={"bg-sw" + (c.bg === k ? " on" : "")} style={{ background: BG_PRESETS[k].css }} onClick={() => set("bg", k)} aria-label={k} title={k}></button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ---------- template modal ----------
function TemplateModal({ onPick, onClose }) {
  return (
    <div className="ed-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div><h2>ブロックを追加</h2><p>テンプレートを選ぶと、最後にスライドが追加されます</p></div>
          <button className="props-x" onClick={onClose}><EdIco d={I.x} sw={2.2} /></button>
        </div>
        <div className="modal-body">
          <div className="tpl-grid">
            {BLOCK_DEFS.map((b) => (
              <button className="tpl" key={b.type} onClick={() => onPick(b)}>
                <span className="tpl-ic"><EdIco d={b.icon} /></span>
                <b>{b.name}</b>
                <span>{b.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- theme modal ----------
const THEMES = [
  { hex: "#0284c7", ramp: ["#e9f6fe", "#7dd3fc", "#0ea5e9", "#0284c7", "#0b1f3a"] },
  { hex: "#06b6d4", ramp: ["#ecfeff", "#67e8f9", "#22d3ee", "#06b6d4", "#0e5063"] },
  { hex: "#16a34a", ramp: ["#dcfce7", "#86efac", "#22c55e", "#16a34a", "#14532d"] },
  { hex: "#f59e0b", ramp: ["#fef3c7", "#fcd34d", "#f59e0b", "#d97706", "#78350f"] },
  { hex: "#e11d48", ramp: ["#ffe4e6", "#fda4af", "#fb7185", "#e11d48", "#881337"] },
  { hex: "#7c3aed", ramp: ["#ede9fe", "#c4b5fd", "#a78bfa", "#7c3aed", "#3b0764"] },
];
function ThemeModal({ current, onApply, onClose }) {
  const [sel, setSel] = React.useState(current || THEMES[0].hex);
  const ramp = (THEMES.find((t) => t.hex === sel) || THEMES[0]).ramp;
  return (
    <div className="ed-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <div><h2>テーマカラー生成</h2><p>基調色を選ぶと11段階のシェードを全スライドに適用します</p></div>
          <button className="props-x" onClick={onClose}><EdIco d={I.x} sw={2.2} /></button>
        </div>
        <div className="modal-body">
          <div className="pgroup-h" style={{ marginBottom: 4 }}>基調色</div>
          <div className="theme-row">
            {THEMES.map((t) => (
              <button key={t.hex} className={"theme-chip" + (sel === t.hex ? " on" : "")} style={{ background: t.hex }} onClick={() => setSel(t.hex)} aria-label={t.hex}></button>
            ))}
          </div>
          <div className="pgroup-h" style={{ margin: "20px 0 4px" }}>生成シェード（プレビュー）</div>
          <div className="theme-ramp">{ramp.map((c, i) => <span key={i} style={{ background: c }}></span>)}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button className="btn btn-primary" onClick={() => onApply(sel)}>このテーマを適用</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EdHeader, Filmstrip, DeviceStage, PropertyPanel, TemplateModal, ThemeModal });
