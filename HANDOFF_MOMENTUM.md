# D-Swipe 開発引き継ぎ書（完全版）

最終更新: 2026-06-12 / 新しいClaudeセッションはまずこのファイルを読むこと。
Momentumリデザイン Phase1〜19 すべて main へマージ済・本番反映済。

---

## 1. TL;DR（現在地）

- **D-Swipe** = スワイプ型LP作成SaaS（d-swipe.com）。LP作成/公開、有料Swipeコラム(note)、オンラインサロン、ポイント決済、マーケットを持つ。
- **2026-06-10〜12 に「Momentum」デザインへの全面リデザイン＋リリース前UX総点検を完了**。全65ページ、LPエディタ、noteエディタ、購入フロー、ブランド資産まで刷新済み。
- 作業ブランチは都度 `momentum-phaseN-*` を main から切る。**mainへのマージはユーザーの「マージしましょう」承認後**（本番障害のホットフィックスのみ即マージ可）。
- リリース直前の状態。残課題は §8（すべて任意・低優先度）。

## 2. リポジトリとインフラ（因果: どこを直すと何が変わるか）

| 対象 | 場所 | デプロイ |
|---|---|---|
| フロントエンド | このリポジトリ（github.com/jinjinsansan/dswipe） | **Vercel**。main へ push で自動デプロイ。確認は `https://api.github.com/repos/jinjinsansan/dswipe/commits/<sha>/status` をポーリング（vercel コンテキストが success になるまで） |
| バックエンド (FastAPI) | `E:\dev\Cusor\lp`（github.com/jinjinsansan/swipelaunch、本体は `backend/`） | **VPS 220.158.22.14**（Renderは廃止済み）。`/opt/dswipe-backend` は**gitリポジトリではない**ファイルコピー運用。手順: ①ローカルでcommit+push（正本維持） ②VPS上で `.bak-日付` バックアップ ③scpで差し替え ④`./venv/bin/python -m py_compile` ⑤`systemctl restart dswipe-backend`。**再起動後約30秒はnginxが502を返す（正常）** |
| BE SSH | `ssh -i E:\dev\Cusor\lp\dswipe.pem root@220.158.22.14` | WindowsはpemのACLが緩いと拒否される → `$env:TEMP` にコピーして `icacls <pem> /inheritance:r /grant:r USER:R` |
| API仕様の真実 | https://api.d-swipe.com/openapi.json | **推測せずここを参照**（メモリ backend-openapi.md） |
| DB | Supabase（BE経由でアクセス） | — |

- フロントのスタック: Next.js 16.0.7 (App Router, Turbopack), React 19, Tailwind v4, next-intl(ja/en), Zustand, Tiptap v2.27系, Swiper, Heroicons。
- 決済: ポイント（内部）+ 日本円はONE.lat（外部チェックアウト）。JPYC決済フロントは**実装しない方針**（ユーザー明言、メモリ jpyc-deferred.md）。

## 3. Momentum デザインシステム

- 出典: `design_handoff_dswipe/`（**gitignore済・ローカルのみ**。モックHTML群 `D-Swipe *.html`、`c-system/*.css`、`editor/editor-blocks.jsx|editor-ui.jsx|editor.css`、README §5画面対応表/§7重要修正）。
- ライト基調。カードは白、キャンバスは `#f4f8fd`。**chrome（サイドバー/帯）はネイビー `#0b1f3a`/`#122c4d`**。
- アクセント: sky/cyan。solid `#0284c7`、グラデ `linear-gradient(135deg,#0ea5e9,#06b6d4)`（= `lib/momentum.ts` の `GRAD_BRAND`）、ハイライト `#22d3ee`。
- フォント Noto Sans JP（+Roboto）。アイコンは Heroicons 線画。**絵文字禁止**。
- @themeトークン（globals.css）: navy-900/navy-800/ink-soft/canvas/line-soft/tint-border/brand-tint(#e9f6fe)/on-navy/on-navy-muted。※`brand-tint` は既存 `--color-surface-tint`(白)との衝突回避名。
- ロゴ正規マーク: ネイビー角丸(rx11)+グラデ「D」ストローク+二重シェブロン（`components/DSwipeLogo.tsx`、app/icon.svg、og-default.svg で共通）。
- 背景プリセット6種（TOPページ品質のグラデ）: `lib/backgroundPresets.ts`（navy/cyan/teal/deep/aurora/light、mock BG_PRESETS移植）。

## 4. フェーズ履歴（時系列・因果関係つき）

各行: **きっかけ → 対応 → 結果**。コミットはmainのマージコミット。

| Phase | きっかけ（原因） | 対応（結果） | main / タグ |
|---|---|---|---|
| 1 | リデザイン開始。※当初 `redesign-momentum` ブランチで作業したが**668コミット遅れの古い土台**だったため破棄し、`momentum-main` でやり直した | ネイビーサイドバー/全画面シアン化/ログイン刷新/HomeSwiper。7観点診断97点で本番マージ | `ea22844` |
| 2 | マージ後「TOP以外ほぼ旧デザイン」と指摘 → 調査の結果**深掘り済みは8画面のみ**が原因 | 残り全画面（サロン/messages/settings/note/admin等）をモック準拠化。全65ページ完了 | `11a7f21` |
| 3-4b | 「LPエディタの素材が旧のまま」指摘 | 素材色→ブロックレンダラー本体(sc-*移植)→旧素材~100種を**非表示で温存**（削除は破壊的とのユーザー方針。`lib/templates.ts` の `LIBRARY_EXTRA_VISIBLE_IDS` で個別復活可）。手書き風も非表示 | `3c66d9d`,`fe078a7`,`98b99b0` / pre-phase3-materials, pre-phase4-blocks |
| 5-8 | 「全てを実装しないと完成しない、1つずつ」 | AIウィザード刷新→エディタ3ペイン化→LP一式テンプレ4種(`lib/lpPresets.ts`)→素材ピッカー強化 | `8c7d286`,`24c1df2`,`7d9aed0`,`d88fa8c` |
| 9 | 「フッターの常駐帯をユーザーLPにも」 | footerCtaConfig.alwaysVisible + 帯デザインTOP品質化。**ただしBEが保存時に捨てていたことがPhase16後に発覚（下記）** | `bc82037` |
| 10 | 構造負債の根治依頼 | `.text-white` remap除去（~460箇所移行、**以後 text-white は標準どおり白**）+ hex458箇所の@themeトークン化 | `a8792e6` |
| 11-12 | 「noteエディタがnote.comと違って使いにくい」+スクショ3枚で徹底比較指摘 | NoteComposer新設（create/edit統一・自動保存・公開シート）+ NoteRichEditorをnote.com UXパリティ化。ホットフィックス2件: ①note型updateに content_blocks を送るとBE拒否→update時はrich_contentのみ送る ②＋ボタンで全画面クラッシュ→**TiptapのBubbleMenuがDOMを移動しReactのinsertBeforeアンカーを壊す**→常設ホストdivでラップ | `cc40b79`,`75e399f` / pre-phase11-noteeditor, pre-phase12-editor-ux |
| 13 | 「プレビューの文字が巨大」 | vw基準clamp()が原因→CSS変数固定の暫定対応（後にPhase15で根治し削除） | `53cfd2f` |
| 14 | 「ファビコンとローディングが旧デザイン」 | icon.svg/DSwipeLogo/PageLoader(33ページ使用)/NextTopLoader/og-default.svg を新デザイン化 | `43306c4` |
| 15 | 「それでも文字が大きい。実機の視覚サイズにして」 | **プレビューをiframe実機ビューポート化**（`components/editor/PreviewFrame.tsx`）。モバイル375px原寸/PC1280px等比縮小。sm:ブレークポイント含め実機完全一致 | `5412b75` |
| 16 | 「TOPページと同じ品質でユーザーがLPを作れるように」+「ヘッダー帯・フッター帯も」 | 背景プリセット6種+PropertyPanelスウォッチ/LP一式プリセットのグラデ化/**ヘッダー帯新設**（footer_cta_config JSON内の headerBar に格納=BEスキーマ変更不要）/フッター帯の既定をTOP登録バンド品質に自動アップグレード | `a327a95` / pre-phase16-lpquality |
| 16後 障害 | ユーザー作成LPで「帯が出ない」 | **原因はBEの `_normalize_footer_cta_config` ホワイトリスト**が headerBar/footerEnabled/**alwaysVisible(Phase9から！)** を黙って破棄 → BE修正(swipelaunch `0155b33`)+VPS反映。**教訓: footer_cta_config に新キーを足したら backend/app/routes/lp.py のホワイトリストも必ず更新** | BE da6fae9 まで |
| 17 | 「モバイルで帯がコンテンツに被る」（スクショ） | ヘッダー帯時 paddingTop 60px / フッター帯(常駐or最終)時 paddingBottom 128px をスライド内側に確保（全画面ヒーローはTOP同様オーバーレイのまま除外）。スライド背面色をプリセットグラデに統一 | `f51e225` |
| 18 | 「リリース前なので徹底的に調べて」→ 3監査（公開ページ実機巡回+作成者フロー+購入者フロー） | **`components/ui/Feedback.tsx` 新設（toast+appConfirm）**→ユーザー向け全画面のalert/confirm約60箇所を置換。購入行き止まり解消（ポイント購入導線/checkoutReturn→完了ページに戻るボタン/ログイン後復帰）。**DSwipeLogoのSVGグラデID衝突修正**（モバイルで黒四角になっていた）。モバイルヘッダー崩れ修正。LP not-found画面刷新。エディタ未保存離脱警告。BE: 存在しないslugが500→404 | `ee1367d` / pre-phase18-ux |
| 19 | 残課題の上位を消化 | エディタ空状態オンボーディング/ブロック削除undo（toastにactionLabel機構追加）/モバイルタブ4等分化/決済再確認可視化/「ボタン未設定」バッジ/サロンdl修正/notes言語セレクタ重複削除 | `945deeb` |

## 5. 重要な技術知識・罠（新セッション必読）

### コード規約・必須事項
- **alert()/confirm() 禁止** → `components/ui/Feedback.tsx` の `toast.success/error/info(message, {actionLabel?, onAction?})` と `await appConfirm({title, message?, confirmLabel?, danger?})` を使う。`FeedbackHost` は app/layout.tsx にマウント済み。
- **footer_cta_config に新キーを追加するとき**は、BE `backend/app/routes/lp.py` の `FOOTER_CTA_ALLOWED_KEYS` / `HEADER_BAR_ALLOWED_KEYS` にも追加（さもないと保存時に黙って消える）。LPステップの content_data は濾過なし。
- **supabase-py の `.single()` は0件で例外を投げて500になる** → `.limit(1)` + 空チェックで404を返すパターンを使う。
- **SVGグラデーションのidをコンポーネントで共有しない** → display:none のインスタンス内の定義が参照され描画されない（黒い四角）。`useId()` で一意化する。
- **ReactイベントはiframeBoundaryを越えない** → iframe内に描画するときは createPortal ではなく iframe内に `createRoot` で独立ルートを作る（親Contextに依存しないコンポーネント限定）。PreviewFrame.tsx 参照。
- **TiptapのBubbleMenuは自分のDOMを移動させる** → 隣接する条件付きJSXのReact挿入アンカーが壊れ insertBefore NotFoundError → 常設ホストdivでラップする。@tiptap/* はバージョンを2.27系に揃えて維持。
- **note(リッチ)記事のupdate**は `rich_content` のみ送る（content_blocks を含めるとBEが拒否）。
- ブロックの背景: `lib/blockBackground.ts` が `backgroundPreset`(グラデ) > backgroundColor(単色) > 画像 の優先で解決。PropertyPanelでカスタム単色を選ぶとプリセットは解除される。

### 検証手法（確立済みパターン）
- 型/ビルド: `npx tsc --noEmit` → `npm run build`。**Google Fontsのfetchフレークで稀にビルド/devが失敗**→リトライ、devは再起動。ビルドが削除済みページの生成型で失敗したら `.next` を削除。
- 実描画検証: DashboardLayout配下はSSRがローダーのみ返すため**HTML文字列検査は不可**。Playwright（`npx playwright` 利用可能）で実ブラウザ確認する。認証必須のコンポーネントは `app/dev-*-test/page.tsx` の一時ページを作って検証し、**コミット前に必ず削除**（スクリプトは scripts/ に一時作成→削除）。
- dev環境: `next.config.ts` の turbopack.root 固定、`i18n/routing.ts` の defaultLocale:'ja' は削除しないこと（devで全ページ500になる）。
- サブエージェントは過去セッションで Edit/Write 権限拒否の実績あり → 調査・設計のみ任せ、適用は親で行う。

### マージ&デプロイの作法
1. main から `momentum-phaseN-*` ブランチ、大きい変更は `pre-phaseN-*` タグを main に打って origin へ push。
2. 実装 → tsc → build → （必要なら一時ページ+Playwright実証）→ ブランチ push → ユーザーに報告。
3. **ユーザーの「マージしましょう」を待つ**（本番が壊れている時のホットフィックスのみ即マージ）。
4. `git merge --no-ff` → main で build 再確認 → push → GitHub commit status API で vercel=success を確認（background poll）。
5. HANDOFF_MOMENTUM.md とメモリ（redesign-momentum.md 等）を更新して docs コミット。

### 復旧タグ一覧（origin push済）
pre-phase3-materials / pre-phase4-blocks / pre-phase6-editor / pre-phase11-noteeditor / pre-phase12-editor-ux / pre-phase16-lpquality / pre-phase18-ux。戻し方は `git revert -m 1 <merge-sha>` 推奨。

## 6. 主要ファイルマップ

| 役割 | ファイル |
|---|---|
| デザイン定数 | `lib/momentum.ts`（GRAD_BRAND/NAVY_CARD_BG/HEAD_BG/サムネfallback） |
| 背景プリセット | `lib/backgroundPresets.ts` |
| ブロック背景解決 | `lib/blockBackground.ts` |
| フィードバック基盤 | `components/ui/Feedback.tsx`（toast/appConfirm/FeedbackHost） |
| ロゴ | `components/DSwipeLogo.tsx`（app/icon.svg, public/og-default.svg と同一マーク） |
| ローディング | `components/LoadingSpinner.tsx`（PageLoader=33ページで使用） |
| LPエディタ | `app/lp/[id]/edit/page.tsx`（**約3,700行・分割は残課題**）+ `components/PropertyPanel.tsx`（同・約3,000行） |
| 実機プレビュー | `components/editor/PreviewFrame.tsx`（iframe+独立Reactルート） |
| ブロック素材 | `lib/templates.ts`（表示制御）/ `lib/templates.data.ts`（データ）/ `components/blocks/Top*Block.tsx`（レンダラー、エディタと公開LPで共有） |
| LP一式テンプレ | `lib/lpPresets.ts`（sessionStorage `lpPresetBlocks` + ?preset=true でエディタへ） |
| 公開LPビューワー | `app/view/[slug]/LPViewerClient.tsx`（共有 `/view/share/[token]` も同じコンポーネント）。ヘッダー帯/フッター帯/購入モーダルもここ |
| noteエディタ | `components/note/NoteComposer.tsx`（create/edit統一）+ `NoteRichEditor.tsx`（Tiptap） + `lib/noteBlocksToRich.ts`（classic→rich変換） |
| LP設定の型 | `types/index.ts`（FooterCTAConfig: alwaysVisible/footerEnabled/headerBar） |

## 7. データフローの要点

- LP保存: エディタ → `lpApi.update`（タイトル/設定/footer_cta_config）+ `lpApi.updateBlocks`（ステップ一括）。footer_cta_config はBEでホワイトリスト正規化される（§5）。
- ヘッダー帯/フッター帯: `footer_cta_config` JSON 内（headerBar はネスト、footerEnabled=false でヘッダーのみ運用。既存LPは未定義=従来互換でフッター表示）。
- 決済戻り導線: 決済開始時に `sessionStorage['dswipe:checkoutReturn'] = {url, title}` → `/orders/complete` が読んで「購入したページに戻る」を表示。
- AIウィザード/テンプレ→エディタ: sessionStorage（`aiSuggestion`+?ai=true / `lpPresetBlocks`+?preset=true）。**リロードで消える脆弱性あり（残課題）**。
- ログイン復帰: `redirectToLogin(router)` が現在URLを `/login?redirect=` に載せ、GoogleSignInButton がログイン後に復帰させる。

## 8. 残課題（すべて任意）

| 優先 | 内容 |
|---|---|
| 中 | `app/admin/*` の alert/confirm 約30箇所（運営専用のため残置。置換は Feedback.tsx で機械的に可能） |
| 中 | 巨大ファイル分割: `app/lp/[id]/edit/page.tsx` / `components/PropertyPanel.tsx` |
| 低 | AIウィザード/テンプレの sessionStorage 渡しがリロードで消える |
| 低 | 売上テーブルのモバイル横スクロールヒント / 「メニュー」アコーディオンの中身予告（i18n対応要） |
| 低 | 商品詳細APIに lp_slug がない（BE）/ terms・privacy・tokusho の文言再確認 |
| ユーザー作業 | notes一覧の旧ブルー巨大「D」サムネ = 公式note記事「D-swipe簡易版マニュアル」のアイキャッチ画像。記事編集で差し替え |

## 9. 歴史的経緯（なぜこうなったか）

- 初期セッションは誤って `jpyc-payment-integration`（mainから668コミット遅れ・2025-10-18分岐）上で `redesign-momentum` を構築してしまった。mainは既にNext16・65ページの成熟版だったため、**redesign-momentum はマージ禁止・参照のみ**として破棄し、`momentum-main`（origin/main から分岐）で再構築した。`backup/old-local-main` はローカルmainが化石化していた時の退避。
- Vercelプレビューが見えなかった問題（解決済）: 旧ブランチの脆弱Next検出ブロック+Deployment ProtectionのSSOが原因だった。本番(d-swipe.com=main)は無関係。
- `.text-white` remap（globals.cssでtext-whiteをダーク色に再マップするハック）はPhase1〜9の間に多数の白文字バグ（補償リスト外の色で不可視化）を生み、Phase10で**完全除去**した。現在 text-white は素のTailwind。`text-pure-white` は無害なエイリアスとして残存。

---

このファイルと併せて、Claudeのメモリ（`redesign-momentum.md` / `backend-vps-deploy.md` / `backend-openapi.md` / `jpyc-deferred.md`）も参照のこと。
