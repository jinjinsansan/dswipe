# 引き継ぎ書 — Momentum リデザイン（D-Swipe）

最終更新: 2026-06-10 / 作業ブランチ: `momentum-main`

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
