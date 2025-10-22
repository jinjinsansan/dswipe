
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import AuthShell from '@/components/auth/AuthShell';

const GoogleSignInButton = dynamic(() => import('@/components/auth/GoogleSignInButton'), { ssr: false });

export default function RegisterPage() {
  return (
    <AuthShell
      cardTitle="Googleで新規登録"
      cardDescription="初回ログイン時にアカウントが自動的に作成されます。"
      helper={
        <span>
          既にアカウントをお持ちの方は{' '}
          <Link href="/login" className="font-semibold text-white hover:text-emerald-200">
            ログイン
          </Link>
        </span>
      }
      hero={{
        eyebrow: 'FOR INFO-PRENEUR',
        title: '狙ったマーケットへ、最短距離で届けるLP制作',
        description:
          'Ｄ－swipeに登録すると、テンプレート・分析・メディア管理が一体となったワークフローで高速に検証が回せます。',
        highlights: [
          { title: '数分でローンチ', description: 'テンプレート選択→AI生成→公開までをワンフローで完結。' },
          { title: '豊富なコンポーネント', description: '動画・証言・FAQなどコンバージョンに効く要素を自由に組み合わせ。' },
          { title: 'チームコラボレーション', description: '役割に応じた権限管理と共有リンクでスムーズに連携。' },
        ],
      }}
    >
      <GoogleSignInButton
        title="Googleで新規登録"
        description="初回ログイン時にアカウントが自動的に作成されます。"
      />
    </AuthShell>
  );
}
