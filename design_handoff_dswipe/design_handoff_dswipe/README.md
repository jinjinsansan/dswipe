# Handoff: D-Swipe フルUIリデザイン（Design System「Momentum」）

> このフォルダ／ZIPは **設計リファレンス** です。中の `.html` は「最終的な見た目と挙動を示す高精細プロトタイプ」であり、**そのまま本番にコピーするコードではありません**。あなた（Claude Code）のタスクは、これらの HTML デザインを **既存の D-Swipe コードベース（Next.js 15 / React 19 / TypeScript / Tailwind CSS v4）の流儀で忠実に再現** することです。API契約・型・ルーティング・状態管理（Zustand/TanStack Query）は変更しないでください。変更は UI / レイアウト / スタイル / UX / コンポーネント構造に限定します。

---

## 1. Overview

D-Swipe（情報商材向けのスワイプ型LP作成 SaaS ＋ note的プラットフォーム ＋ サロン ＋ マーケット）の **全画面リデザイン**。
課題は「認証ダークとダッシュボードのトーン不統一」「デザインシステム不在の場当たり実装」「ユーザーが作るLPの低品質（文字切れ等）」「note記事エディタが2種類で使いにくい」「管理画面の肥大化（`admin/page.tsx` 214KB）」。

これらを **単一のデザインシステム「Momentum」（一貫したライト基調＋ネイビーのクローム＋シアン/スカイのアクセント、Noto Sans JP）** で統一しました。

## 2. Fidelity

**High-fidelity（hifi）**。色・タイポ・余白・角丸・影・インタラクションまで確定値。ピクセル単位で再現してください。アイコンは線画（`@heroicons/react/24/outline` 相当）に統一し、**絵文字は使わない**（旧実装の `📊➕❌` は廃止）。

## 3. 技術前提 / 厳守事項

- Next.js 15（App Router, Turbopack）/ React 19 / TypeScript / **Tailwind CSS v4**
- 状態: Zustand / 取得: TanStack Query + axios / スワイプ: Swiper / D&D: dnd-kit / アイコン: @heroicons/react
- バックエンドは別サービス。**API契約・データ型・ビジネスロジック・ルーティング・ストアは変更しない**
- 日本語UIを維持（多言語 EN/JA 切替は `Account Settings` に設計あり）
- `next.config` の `ignoreBuildErrors` は false のまま、`npm run build` が型チェック有効で成功すること
- 完全レスポンシブ（375 / 768 / 1280）、アクセシビリティ（コントラスト比 AA、フォーカスリング、aria、キーボード操作）

## 4. デザインシステム「Momentum」— Tailwind v4 トークン

`app/globals.css` の `@theme` に下記を定義（既存の散在トークンは置き換え）。CSS変数の実体は本ZIPの `c-system/tokens.css` / `components.css` / `app.css` / `admin.css` を参照。

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* brand (シアン→アクアのグラデが主役) */
  --color-brand: #0284c7;          /* sky-600 solid / リンク / フォーカス */
  --color-brand-strong: #0369a1;
  --color-cyan-400: #22d3ee;
  --color-cyan-500: #06b6d4;
  --color-sky-500: #0ea5e9;
  /* gradient: linear-gradient(135deg,#0ea5e9,#06b6d4) */

  /* navy chrome (サイドバー / 暗い面 / フッター) */
  --color-navy-900: #0b1f3a;
  --color-navy-800: #122c4d;
  --color-navy-700: #1b3a61;

  /* neutrals (cool slate) */
  --color-ink: #0b1f3a;            /* 見出し（ネイビーインク） */
  --color-text: #1f2c3d;           /* 本文 */
  --color-muted: #64748b;          /* キャプション */
  --color-faint: #94a3b8;          /* プレースホルダ/無効 */
  --color-line: #e2ebf6;           /* 罫線 */
  --color-line-2: #eef3f9;
  --color-canvas: #f4f8fd;         /* アプリ背景 */
  --color-surface: #ffffff;        /* カード */
  --color-surface-2: #f8fafc;
  --color-surface-tint: #e9f6fe;   /* ブランドの薄塗り */
  --color-tint-border: #bfe6fb;

  /* semantic */
  --color-success: #16a34a;  /* tint #dcfce7 ink #15803d */
  --color-warning: #d97706;  /* tint #fef3c7 ink #b45309 */
  --color-danger:  #dc2626;  /* tint #fee2e2 ink #b91c1c */

  /* radius */
  --radius-md: 12px;     /* 入力 */
  --radius-lg: 13px;     /* ボタン */
  --radius-card: 20px;   /* カード */
  --radius-xl: 16px; --radius-3xl: 28px;

  /* type */
  --font-sans: "Noto Sans JP", system-ui, sans-serif;
}

/* utilities */
@utility bg-brand-grad { background-image: linear-gradient(135deg,#0ea5e9,#06b6d4); }
@utility shadow-glow { box-shadow: 0 10px 26px -8px rgba(6,182,212,.55); }
```

**影**：`--sh-xs/sm/md/card/glow`（淡い投影＋ブランド色のグロウ）。**タイポスケール**：display 36–48/800・h1 30/700・h2 24/700・h3 20/600・body 14–16/400(行間1.75)・caption 12/500・micro 11/700(letter-spacing .14em uppercase)。**余白**：4pxグリッド（Tailwind標準）。

### 共通コンポーネント（`components/ui/` に集約推奨）
`btn`（primary=グラデ＋グロウ / secondary / navy / ghost / danger、sm/lg）、`input/select/textarea`（12px角丸・フォーカス3pxリング）、`card`（20px角丸・淡影）、`kpi`、`badge`（live/draft/seller/pro/warn/danger）、`chip`、ネイビー`sidebar`（active=シアン左罫＋薄塗り）、`topbar`、`avatar`、`segmented`、`switch`、`progress`、`points`ピル。フル定義は `c-system/components.css`。

## 5. 画面インベントリ（HTMLファイル → 実ルート/コンポーネント）

| デザインファイル | 実ルート / 対応 | 要点 |
|---|---|---|
| `D-Swipe Design System.html` | （仕様） | トークン・タイポ・コンポーネントの一覧。実装の基準 |
| `D-Swipe Top (Swipe).html` | `/`（`HomeSwiper.tsx`） | **採用版**。全9枚の縦スワイプLP（作る→集める→届ける→繋がる→稼ぐ）。安全レイアウト必須（§7） |
| `D-Swipe Top (Landing).html` | `/`（代替） | スクロール版＋常時表示の登録帯 |
| `D-Swipe Public LP View.html` | `/view/[slug]`（`LPViewerClient.tsx`） | 購入者向けスワイプLP。**文字切れ根治（§7）**＋下部固定CTA＋ペイウォール＋購入モーダル |
| `D-Swipe Login.html` | `/login`・`/register` | 分割画面（ネイビー左＋白フォーム右）。ログイン/登録トグル |
| `D-Swipe Dashboard.html` | `/dashboard` | ネイビーサイドバー＋KPI＋LPグリッド。**絵文字→Heroicons**。`navLinks.tsx` を使用 |
| `D-Swipe LP Editor.html` | `/lp/[id]/edit` | 3ペイン（フィルムストリップ＋実機プレビュー＋プロパティ）。スワイプ編集UX |
| `D-Swipe Analytics.html` | `/lp/[id]/analytics` | KPI＋スワイプファネル（スライド別到達率）＋流入元＋CTA別。**analytics-simple/page_old は削除し1本化** |
| `D-Swipe Points.html` | `/points/purchase` | 残高＋パッケージ＋決済手段＋履歴 |
| `D-Swipe Products Manage.html` | `/products/manage` | 商品テーブル＋作成/編集モーダル |
| `D-Swipe Marketplace.html` | `/products`（公開マーケット） | 検索/カテゴリ/並び替え＋商品カード。※現状 `/products` が実質「管理」になっている不整合を是正 |
| `D-Swipe Product Detail.html` | `/products/[id]` | 販売者→プロフィール、数量、購入モーダル |
| `D-Swipe Discover.html` | 発見フィード（公開） | LP一覧・スキ・フォロー・人気クリエイター |
| `D-Swipe Creator Profile.html` | `/u/[username]` | note的作品集（LP/商品/サロンのタブ・フォロー） |
| `D-Swipe Salon.html` | サロン詳細（メンバー向け） | フィード/限定コンテンツ/概要・メンバーシップカード |
| `D-Swipe Note Editor.html` | `/note/create`＋`/note/[id]/edit`（**統合**） | **統一エディタ**。執筆キャンバス＋＋メニュー挿入＋有料ライン＋公開サイドシート＋AI。`NoteEditor`/`NoteRichEditor` の二者択一を廃止し1コンポーネントに |
| `D-Swipe Note List.html` | `/note` | 記事カード一覧 |
| `D-Swipe Note Article.html` | `/notes/[slug]` | 公開記事＋有料ペイウォール |
| `D-Swipe Templates.html` | テンプレギャラリー | 完成形LPテンプレ（チャレンジ/講座/セールス/サロン）。`lib/templates` に「LP一式」テンプレを追加 |
| `D-Swipe Block Library.html` | ブロック選択UX | 種類×レイアウト変種。`TemplateSelector` 強化 |
| `D-Swipe AI Create.html` | AI生成フロー | 入力→構成提案→実機プレビュー→エディタ |
| `D-Swipe Asset Picker.html` | `MediaLibraryModal` 拡張 | ストック素材＋9:16自動フィット＋セーフエリア |
| `D-Swipe Checkout.html` | `/checkout/quick` | 支払い方法（ポイント/カード/JPYC）＋注文サマリー |
| `D-Swipe Purchase Success.html` | `/notes/[slug]/purchase/success` 等 | 完了・領収書・視聴導線 |
| `D-Swipe Account Settings.html` | アカウント設定 | プロフィール/通知/セキュリティ/**言語(JA/EN)** |
| `D-Swipe Messages.html` | `/messages`（`MessagesClient.tsx`） | 会話一覧＋スレッド |
| `D-Swipe LINE Bonus.html` | `/line/bonus` | 友だち追加特典 |
| `D-Swipe Admin*.html`（7枚） | `/admin/*` | 概要・ユーザー・売上・出金・メッセージ・ポイント・設定。**214KBの単一ページを役割別7画面に分割** |

各HTMLは右パネルで挙動も実装済み（タブ・モーダル・トグル・スワイプ・フィルタ等）。コードを開いて挙動・文言・正確な値を読み取ってください。

## 6. 共有CSS（実体）

`c-system/tokens.css`（変数）/ `components.css`（共通UI）/ `app.css`（ダッシュボード系シェル：サイドバー・トップバー・KPI・チャート・ファネル・テーブル・ドロワー）/ `admin.css`（管理スイート共通）/ `editor/editor.css`（LPエディタ＋スライド・ブロック）。これらを Tailwind v4 のレイヤー/コンポーネントへ落とし込むか、`@theme` + ユーティリティ＋少数のコンポーネントクラスとして移植してください。

## 7. 最重要の修正・リファクタ（品質に直結）

1. **スワイプLPの文字切れ根治**：スライドは「収まる時は中央／溢れる時は上揃え＋スクロール」。
   - スクロール領域を直接 flex 中央寄せにしない（上端がヘッダー裏に隠れる既知バグ）。
   - 推奨：`display:grid; align-content:safe center; overflow-y:auto;` ＋ 固定ヘッダー/CTAの実寸を計測して `padding-top/bottom`（`--nav-h`/`--cta-h`）で予約。`box-sizing:border-box`。
   - 見出しは `clamp()` で上限化。`fullscreen_media` 時の `overflow-hidden`＋中央寄せをやめる。`LPViewerClient.tsx` のスライドラッパに適用。
2. **note エディタ統合**：`note/create`(70KB)＋`note/[id]/edit`(74KB) の重複と、ブロック型/リッチ型の二者択一を廃止 → **単一エディタコンポーネント**（create/edit はモード差）。
3. **管理画面分割**：`admin/page.tsx`(214KB) を役割別7画面へ（本ZIPの `D-Swipe Admin*.html` 構成）。
4. **重複/旧版の削除**：`lp/[id]/analytics-simple/page_old.tsx`、`AIWizard_old.tsx` 等の `*_old` を削除。分析は1系統に。
5. **巨大ファイルの分割**：`lp/[id]/edit/page.tsx`(148KB)・`PropertyPanel.tsx`(131KB) をブロック単位に分割。
6. **素材ライブラリ**：`MediaLibraryModal` にストック画像/グラデ/アイコンを追加し、選択時に 9:16 自動フィット＋セーフエリア表示。
7. **配色刷新**：`COLOR_THEMES`（urgent_red/energy_orange 等の高彩度）と絵文字を既定から外し、Momentum を既定に。高彩度は「強調用」として残す。テーマカラー生成は11段階シェードで全ブロック一括適用。

## 8. インタラクション/状態（抜粋）
- 共通：モーダル/サイドシート（scrim＋transform）、トグルスイッチ、segmented、フィルタchip、ライク（カウント±）、フォロー（トグル）。
- LPエディタ：スライド選択→中央実機＆右パネル同期、テキスト編集ライブ反映、フィルムストリップD&D並べ替え、＋メニュー挿入、縦/横スワイプ切替。
- 公開LP/テンプレ：縦スワイプ（ホイール/ドラッグ/キー/ドット）、端認識ホイール。
- AI生成：入力→生成アニメ→構成提案→実機プレビュー。

## 9. アセット
画像は使用していません（グラデのプレースホルダ）。本番ではユーザー素材＋ストックライブラリ（§7-6）。ロゴは「D」のネイビー角丸＋右向き二重シェブロン（スワイプの暗喩）＋ワードマーク `D-Swipe`（`-` はブランド色）。SVGは各HTML内に実装あり。

## 10. ファイル一覧
ルート直下の `D-Swipe *.html`（全画面）、`c-system/*.css`（共有スタイル）、`editor/*.{css,jsx}`（LPエディタ）、`direction-cards.jsx`/`design-canvas.jsx`（方向性比較）。`CLAUDE_CODE_PROMPT.md` に貼り付け用プロンプトを同梱。
