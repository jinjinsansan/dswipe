'use client';

import TopHeroBlock from '@/components/blocks/TopHeroBlock';
import TopInlineCTABlock from '@/components/blocks/TopInlineCTABlock';
import TopFAQBlock from '@/components/blocks/TopFAQBlock';
import TopGuaranteeBlock from '@/components/blocks/TopGuaranteeBlock';
import type {
  HeroBlockContent,
  InlineCTABlockContent,
  FAQBlockContent,
  GuaranteeBlockContent,
} from '@/types/templates';

const heroContent: HeroBlockContent = {
  tagline: 'AI Launch Suite',
  highlightText: 'たった5分でLP公開',
  title: '誰でもノーコードでレスポンシブLPを作成',
  subtitle:
    'ヒアリングに答えるだけでAIがコピー、構成、デザインを自動生成。すべてのデバイスで美しく表示される最新のLPテンプレートを提供します。',
  buttonText: '無料で試す',
  buttonUrl: '#',
  secondaryButtonText: '導入事例を見る',
  secondaryButtonUrl: '#',
  textColor: '#F8FAFC',
  accentColor: '#38BDF8',
  overlayColor: '#0B1120',
  backgroundColor: '#020617',
  buttonColor: '#22D3EE',
  secondaryButtonColor: '#F8FAFC',
  backgroundVideoUrl: '',
};

const inlineCTAContent: InlineCTABlockContent = {
  eyebrow: '限定ウェビナー',
  title: '公開前のUIを全部見せます',
  subtitle:
    '複雑なデバイス調整を自動化するデザインシステムの作り方を、実際の画面遷移とソースコードを交えて解説します。',
  buttonText: '視聴登録する',
  buttonUrl: '#',
  textColor: '#0F172A',
  accentColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  buttonColor: '#2563EB',
};

const faqContent: FAQBlockContent = {
  title: 'よくある質問',
  subtitle: '導入前によくいただく疑問をまとめました。',
  items: [
    {
      question: 'レスポンシブ調整は自動で反映されますか？',
      answer:
        'ブロックごとに流体タイポグラフィと共通レイアウトスケールを適用しているため、任意のデバイス幅で自然にリサイズされます。',
    },
    {
      question: 'Playwright のスクリーンショット差分はどこで確認できますか？',
      answer:
        'CI 上でビジュアルリグレッションを実行し、差分があれば Playwright Report としてダウンロード可能です。',
    },
  ],
  backgroundColor: '#0F172A',
  textColor: '#F8FAFC',
  accentColor: '#38BDF8',
};

const guaranteeContent: GuaranteeBlockContent = {
  badgeText: '安心保証',
  title: '30日間の全額返金保証付き',
  subtitle:
    'まずは本番運用に投入してフィードバックを蓄積してください。期待した結果が得られなければメール一本で返金いたします。',
  guaranteeDetails:
    '使い方が不安な方にはオンボーディングセッションとテンプレート最適化を無料で提供。運営チームがローンチ初日から伴走します。',
  bulletPoints: [
    '専任カスタマーサクセスがメトリクスを追跡',
    'UI 崩れを検知する Playwright ワークフロー付き',
    'Chromatic レポートで差分を即レビュー',
  ],
  backgroundColor: '#020617',
  textColor: '#F8FAFC',
  accentColor: '#34D399',
};

export default function PreviewClient() {
  return (
    <main className="flex flex-col gap-16 bg-slate-900 pb-24">
      <TopHeroBlock content={heroContent} />
      <TopInlineCTABlock content={inlineCTAContent} />
      <TopFAQBlock content={faqContent} />
      <TopGuaranteeBlock content={guaranteeContent} />
    </main>
  );
}
