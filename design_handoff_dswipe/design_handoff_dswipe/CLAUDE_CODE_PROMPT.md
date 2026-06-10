# Claude Code 用プロンプト（貼り付け用）

以下をそのまま Claude Code に渡してください。`design_handoff_dswipe/` 一式（`README.md` ＋ `D-Swipe *.html` ＋ `c-system/*.css` ＋ `editor/*`）をリポジトリに置いた状態で実行します。

---

あなたは D-Swipe（Next.js 15 / React 19 / TypeScript / Tailwind CSS v4 / Zustand / TanStack Query / Swiper / dnd-kit / @heroicons/react）のシニア・フロントエンドエンジニアです。`design_handoff_dswipe/` にある **HTMLデザインリファレンス**（高精細プロトタイプ）を、既存コードベースの流儀で忠実に実装してください。

## 厳守
- **API契約・型・ルーティング・Zustandストア・ビジネスロジックは変更しない**。変更はUI/レイアウト/スタイル/UX/コンポーネント構造に限定。
- `next.config` の `ignoreBuildErrors` は false のまま、`npm run build` が型チェック有効で成功すること。
- デザインは **Momentum**（ライト基調＋ネイビーのクローム＋シアン/スカイのアクセント、Noto Sans JP、線画アイコン、絵文字なし）で統一。トークンは `README.md §4` の `@theme` を `app/globals.css` に定義。
- 完全レスポンシブ（375/768/1280）、アクセシビリティ AA（コントラスト・フォーカスリング・aria・キーボード）。

## 進め方（この順で、各段階でレビュー可能な差分に）
1. **基盤**：`app/globals.css` に Momentum トークンを `@theme` で定義し、共通コンポーネント（`components/ui/`：Button/Input/Card/Badge/Sidebar/Topbar/Segmented/Switch/KPI 等）を `c-system/components.css` を参照して整備。Noto Sans JP をロード。
2. **認証＋ダッシュボード**：`/login`・`/register`（分割画面）、`/dashboard`（ネイビーサイドバー＋KPI＋LPグリッド、`navLinks.tsx` の Heroicons を使用、絵文字を全廃）。
3. **公開LPビューの品質修正（最重要）**：`LPViewerClient.tsx` のスライドを `README.md §7-1` の安全レイアウト（`grid` + `align-content:safe center` + 計測した固定ヘッダー/CTA高さで余白予約 + 見出し `clamp()`）に。`fullscreen_media` 時の中央寄せ×overflow hidden を廃止。これで端末・文章量に依らず文字が切れないこと。
4. **LPエディタ**：`/lp/[id]/edit` を3ペイン（フィルムストリップ＋実機プレビュー＋プロパティ）へ。巨大な `page.tsx`(148KB)・`PropertyPanel.tsx`(131KB) はブロック単位に分割。`TemplateSelector` をブロックライブラリ（種類×変種）＋完成テンプレ（`lib/templates` に「LP一式」追加）に強化。`MediaLibraryModal` にストック素材＋9:16自動フィットを追加。
5. **公開/プラットフォーム**：`/`（`HomeSwiper` 全9枚スワイプ）、発見フィード、`/u/[username]`、サロン、`/products`(公開マーケット)＋`/products/[id]`、`/checkout/quick`＋購入完了。
6. **note統合**：`note/create` と `note/[id]/edit` を **単一エディタコンポーネント**に統合（create/edit はモード差）、`NoteEditor`/`NoteRichEditor` の二者択一を廃止。`/note`（一覧）・`/notes/[slug]`（公開＋ペイウォール）。
7. **管理スイート**：`admin/page.tsx`(214KB) を概要・ユーザー・売上・出金・メッセージ・ポイント・設定の7画面に分割（`D-Swipe Admin*.html`）。
8. **その他**：`/messages`、アカウント設定（言語 JA/EN 切替）、`/line/bonus`、`/lp/[id]/analytics`（ファネル）。
9. **クリーンアップ**：`*_old`（`analytics-simple/page_old.tsx`、`AIWizard_old.tsx` 等）を削除、分析を1系統に統一、既定 `COLOR_THEMES` を Momentum に置換（高彩度テーマは強調用に残す）。

## 各画面の作法
- 対応表は `README.md §5`。該当 `.html` をブラウザ/エディタで開き、**正確な色(hex)・タイポ・余白・角丸・影・文言・hover/focus・モーダル/トグル等の挙動**を読み取って React で再現。HTMLはコピペせず、既存の型・API・コンポーネント規約に合わせて実装。
- 各段階完了ごとに `npm run build` が通ることを確認し、差分を提示してレビューを受けてください。

まず **1.基盤** から着手し、`app/globals.css` のトークンと `components/ui/` の最小コンポーネント、Noto Sans JP のロードを実装して差分を見せてください。
