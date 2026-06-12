# 引き継ぎ書 — Momentum リデザイン（D-Swipe）

最終更新: 2026-06-12 / Phase1〜18すべて main へマージ済・本番反映済（Phase5以降の詳細はメモリ `redesign-momentum.md` とgitタグ `pre-phaseN-*` 参照）

## 0-h. Phase18（2026-06-12）— リリース前UX総点検

- **マージ**: main `ee1367d`（ブランチ `momentum-phase18-ux`）。**復旧タグ `pre-phase18-ux`**（= `bbabe45`、origin push済）。
- **共通基盤**: `components/ui/Feedback.tsx` 新設（zustandベースの `toast.success/error/info` + Promise型確認モーダル `appConfirm()`、`FeedbackHost` を app/layout.tsx にマウント）。**今後 alert()/confirm() は使わずこれを使うこと**。
- **購入フロー**: ポイント不足→`/points/purchase` 導線、決済遷移時に `sessionStorage['dswipe:checkoutReturn']` へ戻り先退避→ /orders/complete に「購入したページに戻る」、ログイン誘導はappConfirm（ログイン後は元ページ復帰=redirect機構は元から機能）、購入エラーはモーダル内表示。
- **バグ修正**: DSwipeLogoのグラデIDをuseIdで一意化（**SVGのIDを共有すると display:none インスタンスの定義を参照して描画されない**=モバイルで黒四角）。DashboardHeaderモバイル崩れ。LP not-found画面のライト化+導線。
- **エディタ**: dirtyトラッキング（suppressカウンタ方式: 初期ロード/保存後の状態同期コミット1回につき1消費）+ beforeunload + 「戻る」確認。
- **alert/confirm**: ユーザー向け全画面（37ファイル・約60箇所）置換済。**残置: app/admin/*（約30箇所、運営専用）**。
- **BE修正（VPS反映済）**: 存在しないslugで500→404（swipelaunch `da6fae9`。**supabaseの .single() は0件で例外**→ .limit(1) パターンを使う）。
- **残課題（任意）**: admin系alert、エディタ空状態ガイド、ブロック削除undo、モバイルエディタのタブ見切れヒント、サロン詳細の`<dl>`マークアップ、notes一覧の旧ロゴサムネは公式note記事のアイキャッチ画像（コンテンツ側）。

## 0-g. Phase16（2026-06-12）— TOPページ品質のユーザーLP（背景プリセット/ヘッダー帯/フッター帯強化）

- **マージ**: main `a327a95`（ブランチ `momentum-phase16`）。**復旧タグ `pre-phase16-lpquality`**（= main `366a905`、origin push済）。戻し方は revert -m 1 推奨。
- **背景プリセット6種**: `lib/backgroundPresets.ts`（mock editor-blocks.jsx BG_PRESETS移植: navy/cyan/teal/deep/aurora/light）。`BaseBlockContent.backgroundPreset` で指定、`lib/blockBackground.ts` が単色より優先して解決（画像背景・「なし」は尊重）。PropertyPanelの背景設定にスウォッチUI（選択で textColor/accentColor も推奨色に上書き、カスタム単色指定でプリセット解除）。
- **ヘッダー帯**: TOPページ固定ナビと同等（rgba(11,31,58,.82)+blur(16px)+ブランドグラデCTA）。**設定は `footer_cta_config` JSON内の `headerBar` に格納**（BE additionalProperties:true 確認済→スキーマ変更不要）。`footerEnabled` フラグ新設: false=ヘッダーのみ利用（既存LPは未定義=従来互換でフッター表示）。`headerBar.enabled === true` の場合のみ描画。エディタ設定タブ（desktop/mobile両方）に `HeaderBarSettingsSection` フォーム。
- **フッター帯の自動アップグレード**: 背景/ボタン色が既定値（#0B1F3A / #0284C7）のままの場合のみ、TOP登録バンドと同じ `linear-gradient(160deg,#0b1f3a,#0f2c52)`＋ブランドグラデボタンで描画。カスタム色は従来どおり。
- **LP一式プリセット**: 4種すべて近似単色→backgroundPresetグラデに差し替え（heroは従来どおり動画+オーバーレイでTOP同等）。
- **検証**: 一時ページ+Playwrightでnavy/auroraのradial-gradient適用・light単色・pageerrorなしを確認。ビルド時は`.next`の生成型に削除済みテストページが残ると失敗する→`.next`削除で解消。
- **Phase17ホットフィックス（2026-06-12, `f51e225`）**: 帯がスライド内容に被る問題を修正。ヘッダー帯有効時はスライド内側に paddingTop 60px、フッター帯（常駐 or 最終スライド）時は paddingBottom 128px を確保（全画面ヒーローはTOP同様オーバーレイのまま除外）。スライド背面色も backgroundPreset のグラデCSSに統一。本番でPlaywright実証済（アイブロー top=80px > 帯52px）。
- **本番障害と修正（2026-06-12）**: ユーザー作成LPでヘッダー帯/常駐表示が消える問題が発生。原因は**バックエンド（swipelaunchリポジトリ backend/app/routes/lp.py の `_normalize_footer_cta_config`）が footer_cta_config をホワイトリスト濾過**しており、`alwaysVisible`（Phase9!）/`footerEnabled`/`headerBar` を黙って破棄していたため。BE側ホワイトリストに3キー追加（headerBarはネスト専用リスト）し、VPS（220.158.22.14 の /opt/dswipe-backend、systemd `dswipe-backend`）へ scp+restart で反映（swipelaunch `0155b33`）。**教訓: footer_cta_config に新キーを足す時はBEホワイトリストも必ず更新**（背景プリセット等の content_data は濾過なし）。BE再起動は約30秒502になる。

## 0-f. Phase15（2026-06-12）— LPエディタプレビューのiframe実機ビューポート化

- **マージ**: main `5412b75`（ブランチ `momentum-phase15`、直前のmainは `3818978`。revert -m 1 で戻せる）
- **内容**: `components/editor/PreviewFrame.tsx` 新設。プレビューをiframe（独立ビューポート）で描画し、親headのCSSを複製（MutationObserverでHMR/遅延注入にも追従）、transformでステージに収める。モバイル=375px実機原寸（デバイス枠336→393px化）、PC=1280pxを等比縮小。vw基準clamp()も`sm:`ブレークポイントも実機と完全一致。
- **重要な実装知識**: ReactのイベントはルートコンテナへのDOM委譲のため**iframe境界を越えられない**。createPortalではなくiframe内に`createRoot`で独立ルートを生成する（DraggableBlockEditorは親Contextに依存しないため安全）。スクロール同期は iframe内の高さ100vhのdivをscrollContainerとして親の`previewScrollRef`に渡し既存ロジック互換。
- **後始末**: Phase13の暫定対応（globals.cssの`.editor-mobile-frame`変数固定）は削除済み。
- **検証**: 認証不要の一時ページ＋Playwrightで実描画確認（375px時44px/sm:非アクティブ、1280px時73.6px/sm:アクティブ、iframe内クリック正常）。

## 0-e. Phase14（2026-06-12）— ファビコン/ローディング/ロゴ/OGPの新デザイン化

- **マージ**: main `43306c4`（ブランチ `momentum-phase14`、直前のmainは `53cfd2f`。小規模のためタグなし、revert -m 1 で戻せる）
- **内容**: ①`app/icon.svg`（ファビコン）を旧ブルー四角D→Momentumロゴマーク（ネイビー角丸+グラデD+二重シェブロン、モック§9準拠） ②`components/DSwipeLogo.tsx` を同じ正規SVGマークに統一（ネイビーサイドバー上でも輪郭が出るよう白リング付き） ③`components/LoadingSpinner.tsx` の PageLoader（33ページで使用）を旧ダーク背景→ライトキャンバス+ロゴ+ブランドグラデのバーに刷新、Skeleton類もライト化 ④`app/layout.tsx` の NextTopLoader（ページ遷移バー）を #3b82f6→ブランドグラデ ⑤`public/og-default.svg`（OGP）を旧青紫→ネイビー+ロゴマーク
- **注意**: ファビコンはブラウザキャッシュが強い。確認はスーパーリロードで。

## 0-d. Phase4（2026-06-11〜）— ブロック素材そのものの新デザイン化

- **復旧ポイント**: git tag **`pre-phase4-blocks`**（= main `3c66d9d`、originにpush済み）。戻し方はPhase3と同様（revert -m 1 推奨）。
- **背景**: Phase3はモーダルのガワと素材の「色」のみ。素材の見た目本体は `components/blocks/Top*Block.tsx`（約15レンダラー、エディタプレビューと公開LP表示で共有）が旧デザインのまま。
- **スコープ**: ①レンダラーを ZIP `editor/editor.css` の sc-* デザインへ忠実移植（既存公開LPの描画も変わる — **ユーザー不在のため承認済み**） ②`editor-blocks.jsx` の7素材＋Block Library.html の変種を Momentum素材セットとして templates.data.ts に追加。手書き風(Handwritten*)シリーズは別アエステティックのため対象外。
- **対応表**: hero→sc-hero / problem→sc-problem / features(highlights)→sc-benefit / testimonials→sc-testi / pricing→sc-price・sc-offer / cta→sc-cta / faq→sc-faq / before_after→sc-compare / countdown→sc-count / guarantee→sc-guarantee。

## 0-c. Phase3（2026-06-11〜）— LP素材/ブロックライブラリのMomentum化

- **復旧ポイント**: git tag **`pre-phase3-materials`**（= main `11a7f21`、originにpush済み）。
  - 戻し方(安全・推奨): phase3のマージコミットを `git revert -m 1 <merge-sha>` してpush（履歴を保ったまま打ち消し）
  - 戻し方(完全巻き戻し): `git checkout main && git reset --hard pre-phase3-materials && git push --force-with-lease origin main`
- **スコープ**: ①`lib/templates.data.ts` のブロック素材色をMomentumパレットへ刷新＋`lib/templates.ts` COLOR_THEMES にMomentumテーマ追加・既定化（高彩度は強調用に残置） ②`components/TemplateSelector.tsx` を Block Library.html 準拠に。エディタ本体の3ペイン化は別フェーズ。
- **参照**: ZIP同梱 `design_handoff_dswipe/editor/editor-blocks.jsx`（BG_PRESETS 6種/ブロック定義）・`editor.css`・モック `D-Swipe Block Library.html`・`D-Swipe Templates.html`。
- **注意**: 保存済みLPはコンテンツ側に色を保持しているため既存LPへの影響なし。新規挿入ブロック/新規テーマ適用時のみ新配色。

## 0-b. Phase2（2026-06-11〜）— 残り画面のモック準拠化

phase1マージ後、本番確認で「TOP以外ほぼ旧デザイン」との指摘 → 調査の結果デプロイは正常で、
**深掘りリデザイン済みは8画面のみ**（残りは色置換+ネイビーサイドバーだけ）だったことが原因。
`momentum-phase2` ブランチ（origin/main から分岐）で以下を実施・push済み:

| コミット | 内容 |
|---|---|
| `0e1399d` | サロン全11ファイル: /salons・joined・all ヒーロー化、[id]/public をモック準拠(ダークメンバーシップカード)、管理サブナビsky化、bg-slate-900/bg-rose-600+text-white不可視バグ修正 |
| `6f1247c` | messages/settings/note一覧/note記事ペイウォール/products manage/checkout quick ヒーロー+グラデCTA化。emerald-600+text-whiteバグ一掃(note/orders/subscription) |
| `1c690d2` | lp/create ヒーロー化、LPエディタの green/red/slate-700+text-white 修正、AdminShell をネイビーサイドバー化(admin全7ページ波及)+admin系18箇所のtext-whiteバグ修正 |
| `1b44f43` | dev環境修正: next.config.ts に turbopack.root 固定、i18n/routing.ts の createNavigation に defaultLocale 追加(devで全ページ500だった潜在バグ) |

**教訓**: `.text-white` remapの補償リスト(globals.css ~L320-340)は blue/sky/cyan/特定500系/グラデのみ。
**emerald-600・red-600・amber-600・green-600・slate-700/900 等は対象外**なので、これらの上の白文字は必ず `text-pure-white`。

| `16643fe` | 仕上げ: profile/media/points履歴・サブスク/sales/purchases/line-bonus/u/[username] のヒーロー適用＋全体のtext-whiteバグ最終掃討(~40箇所)。**bg-slate-900はremapで白背景化する**ため text-pure-white と組むと白on白になる点に注意(実ネイビーは bg-[#0b1f3a] を使う) |

残り（任意）: Discover(フロント未実装機能)、@themeトークン化・remap根治等の負債(§7参照)。全65ページのMomentum化はこれで完了。

---

## 0. TL;DR（まず読む）

- **目的**: 本番 `main`（= d-swipe.com）を、Claudeデザインのハンドオフ「**Momentum**」に作り替える。
- **正しい作業ブランチ**: **`momentum-main`**（`origin/main` から分岐）。ここで作業する。
- **やってはいけない**: `redesign-momentum` ブランチを `main` にマージしてはいけない（後述・破壊的）。
- **現在の最大の詰まり**: Vercel のプレビューが `momentum-main` のコミットを反映していない（ユーザー画面で変化が見えない）。**コードの問題ではない**。ローカル `npm run dev` では新デザインが見える。
- **ローカル確認**: `E:\dev\Cusor\dswipe` は `momentum-main` チェックアウト済み。`npm run dev` → http://localhost:3000/login がネイビー分割画面なら正常。

---

## 1. 最重要の経緯（同じ過ちを繰り返さないため）

- このセッションは当初 `jpyc-payment-integration` ブランチ（= **`main` から668コミット遅れ・2025-10-18分岐の古いsubset**）で作業していた。
- そのため最初の「正常化」修正や、`redesign-momentum` ブランチ上の全リデザインは、**古い土台**に当ててしまった（＝大半が無駄/重複）。
- **`main` の実態**（調査で判明）:
  - **Next.js 16.0.7**、**65ページ**、React19、Tailwind v4。
  - **既にライトデザイン**（独自の637行 `globals.css`、type-scale完備）、Heroicons線画・絵文字なし、Noto Sans JP。
  - **HomeSwiper（縦スワイプのトップ）・salon・note・messages・多言語(en/ja)・拡張admin** など多数の機能を保有。
  - ハンドオフ「Momentum」は**この `main`** に対して作られていた。
- 結論: `redesign-momentum`（古いsubsetベース）は `main` へマージ不可（数百ファイル競合＋668コミット巻き戻しの恐れ）。**参照のみ。破棄してよい。**

---

## 2. ブランチ一覧

| ブランチ | 何か | 扱い |
|---|---|---|
| `main` (origin/main) | 本番。d-swipe.com。Next16・65ページ・独自ライトデザイン | **直接触らない**。完成後にマージ対象 |
| **`momentum-main`** | **今の作業ブランチ**。`origin/main`から分岐し Momentum化中 | ここで作業・push |
| `redesign-momentum` | 古い土台(jpyc)で作った旧リデザイン。668コミット遅れ | マージ禁止・参照のみ |
| `jpyc-payment-integration` | 古いsubset。session開始時のブランチ | 放置 |

---

## 3. Momentum デザイン定義

- 背景: ライト（`--color-surface-base` 系、`#f4f8fd`〜`#f8fafc`）。カードは白。
- **サイドバー/chrome: ネイビー `#0b1f3a`**（`--navy-900`）。
- **アクセント: シアン/スカイ**。solid = `#0284c7`(sky-600)、グラデ = `#0ea5e9→#06b6d4`、ハイライト = `#22d3ee`(cyan-400)/`#7fd6f0`。
- フォント: Noto Sans JP。アイコン: Heroicons 線画。**絵文字不可**。
- ハンドオフ実体（モックHTML）: `design_handoff_dswipe/`（**gitignore済・ローカルのみ**）。各画面 `D-Swipe *.html`。仕様書: `design_handoff_dswipe/design_handoff_dswipe/README.md`（§5画面対応表 / §7重要修正）。

---

## 4. `momentum-main` で完了済みの作業（push済み）

`main` はシェルが集約されているので、chrome変更が29ページに波及する。

| コミット | 内容 |
|---|---|
| `30693e8` | **#1 ネイビーサイドバー**: `globals.css` ブランド色→シアン＋ネイビートークン追加。`DashboardLayout.tsx` サイドバー白→ネイビー。`navLinks.tsx` の `getDashboardNavClasses`(desktop) と `getDashboardNavGroupMeta`(headingClass) をネイビー/シアン単色に上書き |
| `e4b3e99` | chore: `design_handoff_dswipe/`・`dswipe.zip` を `.gitignore` に追加しブランチ管理外へ |
| `b16f244` | **#2 全画面シアン化**: app/components 全体で `blue-*`→`sky-*`（80ファイル・約1438箇所） |
| `2d8ac99` | **#3 ログイン/登録刷新**: `components/auth/AuthShell.tsx` を「動画ダーク」→「ネイビーのブランドパネル左＋白フォーム右」に作り替え（モックLogin.html準拠） |

すべて **Next16 ローカルビルド成功（`npm run build` exit 0, 51ページ生成）**、`origin/momentum-main` に push 済み。**本番 `main` には未反映。**

---

## 5. Vercel プレビューの問題（解決済 2026-06-10）

- 原因は2つだった:
  1. 旧 `redesign-momentum` ブランチのデプロイが「Vulnerable version of Next.js detected」で**Vercelにブロック**されErrorを連発していた（momentum-main とは無関係のノイズ）。
  2. プレビューURL全体に **SSO保護**（Deployment Protection: `all_except_custom_domains`）がかかっており、未ログインだと401。
- 現状: `momentum-main@82a559a` のデプロイは **Ready** で `https://dswipe-git-momentum-main-goldbenchan-9860s-projects.vercel.app` にエイリアス済み。curl検証で `/login` が HTTP 200＋Momentumマーカー（`#0b1f3a` 等）を返すことを確認済み。
- 閲覧方法: **Protection Bypass for Automation** のシークレットを発行済み（`.vercel/bypass-secret.txt`、gitignore済・コミット禁止）。URL末尾に `?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true` を付けて開くと以後Cookieで閲覧可。もしくはVercelにログインした状態でプレビューURLを開く。
- シークレットの無効化: Vercel Dashboard → Project Settings → Deployment Protection → Protection Bypass for Automation で revoke 可能。本番（d-swipe.com = main）は無変更。

---

## 6. ローカルでの確認手順

```
cd E:\dev\Cusor\dswipe
# すでに momentum-main / 依存(Next16)インストール済み
npm run dev   # http://localhost:3000
```
- `/login` → ネイビー分割画面（動画なし）なら #3 OK
- `/` → シアン基調なら #2 OK
- ログイン後 `/dashboard` → サイドバーがネイビー＋選択中シアンなら #1 OK
- （注）セッション中、devサーバをbg起動済みの場合あり。`E:\dev\package-lock.json` を誤検出する警告が出るが無害。`next.config` に `turbopack.root` 設定で消せる。

---

## 7. 残作業（Momentum 完成まで）

`main` はページ本体が独自実装。色swap＋chromeだけでは「モックの完成形」には届かない。各ページをモックに寄せる必要がある。優先度順:

1. ~~トップ `app/HomeSwiper.tsx`~~ **済（commit `1ef8490`）**: モック準拠の9枚構成＋固定ネイビーナビ＋下部登録バンドに刷新。ヒーロー動画は薄く保持。Swiper機能（縦スワイプ/キーボード/触覚）維持。※globals.css に `.text-white{color:#0f172a!important}` の旧remapが残存するため、ネイビー上の白文字は `text-pure-white` を使うこと（他ページ移植時も同様の罠に注意）。
2. ~~ナビの多色 → 単色化~~ **済（commit `ff11785`）**: `navLinks.tsx` のグループ別配色を廃止し NAVY_DESKTOP_NAV / MOMENTUM_MOBILE_NAV の2セットに集約。`DashboardHeader.tsx` の MOBILE_GROUP_* も単色化（選択中は `bg-slate-900` がremapで白化していたバグも併せてネイビー+text-pure-whiteに修正）。※認証必須UIのため目視は未実施（ビルド型チェックのみ）。ログイン後のモバイルメニューを一度目視確認すること。
3. ページ本体のモック準拠化:
   - ~~マーケット `/products`~~ **済（`aa85713`）**: ネイビーヒーロー＋検索＋価格帯チップ＋ソートピル＋カード＋サイドバー。実データで目視確認済み。
   - ~~商品詳細 `/products/[id]`~~ **済（`96e002c`）**: ダーク全廃→ライトMomentum。購入ロジック不変。※詳細APIは認証必須のため未ログインだとエラーカード表示（既存仕様）。ログイン後の目視は未実施。
   - **注意: バックエンドCORSは `https://d-swipe.com` と `localhost:3000` のみ許可**。Vercelプレビューではデータ取得が常に失敗し空表示になる（コードの問題ではない）。データ込みの確認はローカル3000番で行う。
   - ~~ダッシュボード本体~~ **済（`cd0866e`）**: KPIストリップ(実データ)＋カード/ボタンのMomentum化。
   - ~~コラム一覧 /notes~~ **済（`4aab48a`）**: Note List.html準拠（ヒーロー＋横型カード＋サイドバー）。i18nキー4つ追加。
   - ~~LP分析 /lp/[id]/analytics~~ **済（`73f5882`）**: 独自ダークシェル廃止→DashboardLayoutに統合。
   - ~~紫/藍アクセント一掃~~ **済（`c735981`）**: 全16ファイルでpurple/indigo/pink→sky/cyan。
   - ~~points/purchase~~ **済（`5d09ae0`）**: 残高カードをネイビーグラデ化、購入CTAをグラデ化。
4. **仕上げ済（`5d09ae0`・`95160a6`）**:
   - **重大修正**: `.text-white` remapの白文字補償が `bg-blue-*` のみ対象で、#2のblue→sky置換以降 **bg-sky-600等の全ボタン(63ファイル)がダーク文字**になっていた → globals.cssの補償ルールに sky/cyan/グラデ要素を追加し一括修復。
   - ネイビーサイドバーのDSwipeロゴ「Swipe」が不可視（remap）だった件、ロゴDスクエア #3B82F6→#0284c7、StickySiteHeaderメニューボタン、注目バッジ統一、admin/tokushoの低コントラスト修正。
   - 公開6ページ（top/login/products/notes/terms/tokusho）で自動コントラスト監査済み（実描画の問題ゼロ）。
   - 残り（完全任意）: salon/adminのモックレイアウト深掘り。現状で全画面一貫済み。
5. **マージ前100点診断 済（`b6fa4f4`）**: 7観点マルチエージェントレビュー＋実測検証。重大修正=ログイン/登録の左パネル文字が remap で不可視だった件（実測 #0f172a→#ffffff に復旧）、サイドバーのユーザー名/ゲストログインボタン、KPI表記、価格帯フィルタの円建て混入。品質=lib/momentum.ts新設（グラデ/配色の一元化）、GROUP_ORDER共有、PhoneDemo分離（2.6s毎の全頁再描画解消）、page_old削除。
   **残存する既知の負債（マージ阻害ではない・将来課題）**: ①globals.cssの `.text-white`→ダーク remap本体（約380箇所が依存、補償ルールで運用中。根治は text-white 全面移行後に remap削除）②Momentum色のhexリテラル直書き約140箇所（@themeトークン化が本筋）③terms/privacy/tokusho はダーク語彙のままremap頼み ④商品詳細APIに lp_slug が無くLPリンクは常に非表示（バックエンド課題）
4. **DashboardHeader** トップバー（現状は白＝Momentumでも可）。アバター等の細部。
5. アクセシビリティ/コントラスト最終チェック（過去セッションで redesign-momentum 側はサブエージェント診断で詰めた。手法は流用可）。

> 進め方の推奨: ユーザーが「ローカルで新デザインが見える」と確認できてから、**目立つ画面（トップ→マーケット→ダッシュボード）順**に。各段階で `npm run build`（Next16・型チェック有効）を通す。

---

## 8. `main` のアーキテクチャ要点（編集時の地図）

- **共有シェル**: `components/dashboard/DashboardLayout.tsx`（サイドバー＋認証ガード＋残高取得）＋ `components/dashboard/DashboardHeader.tsx`（トップバー＋モバイルメニュー）。**29ページが `DashboardLayout` を使用**。
- **ナビ定義/配色**: `components/dashboard/navLinks.tsx`。`GROUP_META_CONFIG`（グループ別配色）、`getDashboardNavClasses`（#1でdesktopをネイビー上書き）、`getDashboardNavGroupMeta`、`getDashboardNavLinks`、`groupDashboardNavLinks`。
- **認証画面**: `components/auth/AuthShell.tsx`（login/register共有、#3でMomentum化済）。`GoogleSignInButton`。
- **トップ**: `app/page.tsx` → `app/HomeSwiper.tsx`（巨大・bespoke）。
- **i18n**: `next-intl`。`useTranslations`/`useLocale`。`app/en`・`app/ja` ルートあり。翻訳キーは `dashboard.navigation` 等。
- **globals.css**: 637行→（#1で）冒頭にMomentumトークン追加済。`:root` に `--navy-900/800/700`・`--on-navy`・`--on-navy-muted`・`--brand-cyan`・`--brand-cyan-soft` 追加済。ブランド `--color-brand-primary` を `#0284c7` 等へ変更済。LP viewer用ダークテーマ（`--viewer-*`）や `!important` のslate→light remap が存在。
- **ビルド**: `npm run build`（Next16・Turbopack）。CVE対象だった next@15.5.5 は main では無関係（16系）。

---

## 9. 注意・落とし穴

- **`main` に push しない**（本番反映は明示承認後にマージ）。push は常に `git push origin HEAD:momentum-main`。`momentum-main` は `origin/main` を upstream に持つため `git push` 単体は危険。
- `redesign-momentum` を `main` にマージしない。
- ローカル作業ツリーは `momentum-main`。`design_handoff_dswipe/` は未追跡で残存（gitignore済）。
- Windows/CRLF 警告は無害。
- 過去メモリ `redesign-momentum.md`（`C:\Users\USER\.claude\projects\E--dev-Cusor-dswipe\memory\`）に経緯あり。本書と併読。

---

## 10. 次の一手（推奨）

1. ユーザーに `localhost:3000/login` がネイビー分割画面か確認してもらう（コードが正しいことの確証）。
2. Vercel プレビューが `momentum-main` を反映しない件を解消（Vercel Deployments確認 / 設定）。
3. 反映できたら、トップ(HomeSwiper)→マーケット→ダッシュボード→note/salon… の順でモック準拠に。各段階 build。
4. 完成・目視OK後に、`momentum-main` → `main` を **PR経由でレビューしてマージ**（本番反映）。
