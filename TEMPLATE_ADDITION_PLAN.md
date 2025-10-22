# テンプレート追加計画書

## 現状分析

### 問題
AIが11ブロック全て生成しているが、8ブロックのテンプレート定義が`lib/templates.ts`に不足しているため、フロントエンドで表示されない。

### 既に完成しているもの
✅ **全てのReactコンポーネント** (`components/blocks/`)
- CountdownBlock.tsx
- ProblemBlock.tsx
- BeforeAfterBlock.tsx
- SpecialPriceBlock.tsx
- BonusListBlock.tsx
- GuaranteeBlock.tsx
- AuthorProfileBlock.tsx
- ScarcityBlock.tsx

✅ **BlockRendererの登録** (全ブロック対応済み)
✅ **TypeScript型定義** (全ブロックの型定義済み)
✅ **バックエンドAI生成ロジック** (OpenAI統合済み)

### 不足しているもの
❌ **lib/templates.ts内のテンプレート定義**（8個）

---

## 実装計画

### Phase 1: テンプレート定義追加（8個）

各ブロックタイプに対して、**5つのテーマバリエーション**を作成：
- urgent_red（緊急レッド）: 投資・FX・副業
- energy_orange（エネルギーオレンジ）: ダイエット・筋トレ
- gold_premium（ゴールドプレミアム）: 高額商品
- power_blue（パワーブルー）: 学習・資格
- passion_pink（パッションピンク）: 恋愛・美容

**合計**: 8ブロック × 5テーマ = 40テンプレート定義

---

## ブロック別デフォルトコンテンツ設計

### 1. countdown-1（カウントダウンタイマー）

**目的**: 申込締切の緊急性を訴求

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'urgent_red',
  backgroundColor: '#111116',
  textColor: '#F8FAFC',
  title: '⏰ 申込締切まで残りわずか！',
  targetDate: '2024-12-31T23:59:59Z', // 3日後
  urgencyText: '今すぐ申し込まないと、この価格では二度と手に入りません',
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: false,
}
```

**レスポンシブ対応**:
- モバイル: タイマー数字 4xl (36px)、パディング 4
- デスクトップ: タイマー数字 6xl (60px)、パディング 6
- 固定高さなし、コンテンツに応じて自動調整

---

### 2. problem-1（問題提起リスト）

**目的**: ターゲットの悩みを言語化し共感を生む

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'power_blue',
  backgroundColor: '#0B1120',
  textColor: '#E2E8F0',
  accentColor: '#60A5FA',
  title: 'こんなお悩みはありませんか？',
  subtitle: '多くの方が直面する現実',
  problems: [
    '情報が多すぎて何から手を付ければ良いか分からない',
    '独学では再現性が低く、成果が安定しない',
    '時間も広告費も投入したのに売上が伸び悩んでいる',
    '魅力的なコピーを書けず申し込みにつながらない',
    'ローンチのたびに徹夜続きで疲弊してしまう',
  ],
}
```

**レスポンシブ対応**:
- モバイル: 縦1列、各項目に✓アイコン、パディング16px
- デスクトップ: 2列グリッド、gap-6
- 最小高さ設定なし、問題数に応じて伸縮

---

### 3. before-after-1（ビフォーアフター比較）

**目的**: 導入前後の変化を可視化

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'energy_orange',
  backgroundColor: '#1A1207',
  textColor: '#FFEAD5',
  accentColor: '#F97316',
  title: '導入前と導入後の変化',
  beforeTitle: '導入前',
  beforeText: '時間も労力も投資したのに成果が出ない状態',
  afterTitle: '導入後',
  afterText: '売上と時間の両立が実現、安定して月商300万円',
}
```

**レスポンシブ対応**:
- モバイル: 縦積み、矢印↓で区切り
- タブレット以上: 横並び2列、矢印→で区切り
- カード高さは自動調整（min-height不使用）

---

### 4. special-price-1（特別価格表示）

**目的**: 今申し込む価値と金銭的魅力を最大化

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'gold_premium',
  backgroundColor: '#120D03',
  textColor: '#FDE68A',
  accentColor: '#F59E0B',
  title: '今だけの特別オファー',
  subtitle: '申込者限定で特別価格をご用意しました',
  originalPrice: '298,000円',
  specialPrice: '98,000円',
  discountBadge: '67% OFF',
  buttonText: '今すぐ申し込む',
  features: [
    '個別チャットサポート30日',
    '週次グループ講義',
    '成果保証付き',
    '返金保証30日',
  ],
}
```

**レスポンシブ対応**:
- モバイル: 価格は大きく表示（text-5xl）、特典リストは縦積み
- デスクトップ: 価格 text-7xl、特典2列グリッド
- カード内のコンテンツはpaddingで余裕を持たせる

---

### 5. bonus-list-1（特典リスト）

**目的**: 申込特典の価値を可視化

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'urgent_red',
  backgroundColor: '#111116',
  textColor: '#F8FAFC',
  accentColor: '#F97316',
  title: '申込者限定の豪華特典',
  subtitle: '即実践できる特典で成果までの距離を一気に縮めます',
  bonuses: [
    {
      title: '特典1: ローンチテンプレート集',
      description: '過去200件の実績から厳選した鉄板構成',
      value: '29,800円相当',
    },
    {
      title: '特典2: AIコピーライティングツール',
      description: '見出しから本文まで瞬時に生成',
      value: '50,000円相当',
    },
    {
      title: '特典3: 個別コンサル30分',
      description: '戦略設計を1対1でサポート',
      value: '30,000円相当',
    },
  ],
  totalValue: '合計109,800円相当',
}
```

**レスポンシブ対応**:
- モバイル: 縦1列、各特典カードに余裕のあるpadding
- タブレット: 2列グリッド
- デスクトップ: 3列グリッド
- カードの高さは内容に応じて自動調整

---

### 6. guarantee-1（返金保証）

**目的**: リスクを取り除き申込ハードルを下げる

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'power_blue',
  backgroundColor: '#0B1120',
  textColor: '#E2E8F0',
  accentColor: '#60A5FA',
  title: '安心の保証制度',
  subtitle: '結果が出るまで伴走するリスクゼロの仕組み',
  guaranteeType: '30日間 全額返金保証',
  description: '条件なしでご満足いただけなければ、申請だけでご返金いたします。',
  badgeText: 'リスクゼロ',
}
```

**レスポンシブ対応**:
- 全デバイス: 中央寄せ、最大幅800px
- シールドアイコン大きく表示
- テキストは読みやすい行間（leading-relaxed）

---

### 7. author-profile-1（講師・監修者プロフィール）

**目的**: 誰が提供しているかを明確にし信頼性を訴求

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'gold_premium',
  backgroundColor: '#120D03',
  textColor: '#FDE68A',
  accentColor: '#F59E0B',
  name: '山田 太郎',
  title: 'マーケティングコンサルタント / 情報商材プロデューサー',
  bio: '15年以上のLP制作実績を持ち、累計3,200社のマーケティング支援を担当。特に情報商材分野では平均CVR2.3倍改善を実現。',
  achievements: [
    '累計3,200社のマーケティング支援',
    '平均CVR 2.3倍改善',
    '大手企業・著名講師のプロジェクトを多数監修',
  ],
  signatureText: '山田太郎',
  imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
}
```

**レスポンシブ対応**:
- モバイル: 写真上、テキスト下の縦配置
- デスクトップ: 写真左、テキスト右の横配置
- 写真は円形クリップ、モバイル120px、デスクトップ180px

---

### 8. scarcity-1（残席・限定性）

**目的**: 残席や限定性を明示し今申し込まない理由を無くす

**デフォルトコンテンツ**:
```typescript
{
  themeKey: 'urgent_red',
  backgroundColor: '#111116',
  textColor: '#F8FAFC',
  accentColor: '#F97316',
  title: '残席状況のご案内',
  message: '募集枠が埋まり次第、予告なく終了します。',
  remainingCount: 3,
  totalCount: 30,
}
```

**レスポンシブ対応**:
- プログレスバーで残席を視覚化
- モバイル: 数字大きく（text-6xl）
- デスクトップ: 数字超大（text-8xl）
- アニメーション: pulse効果で緊急性を演出

---

## レスポンシブ対応の統一ルール

### ブレークポイント
```css
mobile: 0-767px
tablet: 768px-1023px
desktop: 1024px+
```

### 余白ルール
- **コンテナ**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **セクション縦余白**: `py-12 md:py-16 lg:py-20`
- **カード内余白**: `p-6 md:p-8 lg:p-10`

### テキストサイズ
- **見出し**: `text-3xl md:text-4xl lg:text-5xl`
- **サブタイトル**: `text-lg md:text-xl lg:text-2xl`
- **本文**: `text-base md:text-lg`

### グリッド
- **モバイル**: `grid-cols-1`
- **タブレット**: `md:grid-cols-2`
- **デスクトップ**: `lg:grid-cols-3` (3列の場合)

### 固定高さ禁止
- `height`、`min-height`は使用しない
- コンテンツ量に応じて自動伸縮
- `overflow: hidden`は極力避ける

---

## 実装手順

### ステップ1: 型定義確認
✅ 完了（全ブロックの型定義済み）

### ステップ2: コンポーネント確認
✅ 完了（全ブロックのReactコンポーネント実装済み）

### ステップ3: テンプレート定義追加
📝 **今回実施**

`lib/templates.ts`の`INFO_PRODUCT_BLOCKS`配列に、8ブロック × 5テーマ = 40個のテンプレート定義を追加

### ステップ4: デプロイ前テスト
- ローカルで各ブロックをプレビュー
- モバイル（375px）、タブレット（768px）、デスクトップ（1280px）で表示確認
- コンテンツが長い場合の動作確認（切れていないか）

### ステップ5: デプロイ
- コミット & プッシュ
- Vercelで自動デプロイ
- 本番でAIウィザードをテスト

---

## 成功基準

✅ **AI生成で11ブロック全て表示される**
✅ **全デバイスで表示崩れがない**
✅ **コンテンツの長短に関わらず切れない**
✅ **既存の3ブロックと統一されたデザイン**
✅ **5つのテーマカラーが正しく適用される**

---

## リスクと対策

### リスク1: テンプレート定義の構造ミス
**対策**: 既存のhero-aurora、testimonial-1を参考に、同じ構造で作成

### リスク2: 型定義との不一致
**対策**: TypeScript型チェックで事前検証（npm run build）

### リスク3: レスポンシブ崩れ
**対策**: 既存コンポーネントは既に修正済みなので、デフォルトコンテンツのみ調整

---

## 所要時間見積もり

- テンプレート定義作成: 60分（8ブロック × 5テーマ）
- ビルドテスト: 5分
- ローカルプレビュー: 15分
- デプロイ & 本番テスト: 10分

**合計**: 約90分

---

## 開始承認待ち

この計画でよろしければ、実装を開始します。
