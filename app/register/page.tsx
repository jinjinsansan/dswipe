

'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import AuthShell from '@/components/auth/AuthShell';

const GoogleSignInButton = dynamic(() => import('@/components/auth/GoogleSignInButton'), { ssr: false });

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') ?? undefined;
  const loginHref = useMemo(() => {
    if (!redirectParam) {
      return '/login';
    }
    return `/login?redirect=${encodeURIComponent(redirectParam)}`;
  }, [redirectParam]);

  return (
    <AuthShell
      cardTitle="Googleで新規登録"
      cardDescription="初回ログイン時にアカウントが自動的に作成されます。"
      helper={
        <span>
          既にアカウントをお持ちの方は{' '}
          <Link href={loginHref} className="font-bold text-blue-600 hover:text-cyan-500 underline">
            ログイン
          </Link>
        </span>
      }
      hero={{
        eyebrow: 'FOR INFO-PRENEUR',
        title: 'デジタルコンテンツ特化型LP作成プラットフォーム',
        description:
          'Ｄ－swipeに登録すると、テンプレート・分析・メディア管理が一体となったワークフローで高速に検証が回せます。',
        highlights: [
          { title: '数分でローンチ', description: 'テンプレート選択→AI生成→公開までをワンフローで完結。' },
          { title: '豊富なコンポーネント', description: '動画・証言・FAQなどコンバージョンに効く要素を自由に組み合わせ。' },
          { title: '即座に収益化', description: '決済機能標準搭載で公開と同時に販売開始。手数料はフラットな10%。' },
        ],
      }}
    >
      <GoogleSignInButton
        redirectPath={redirectParam}
        title="Googleで新規登録"
        description="初回ログイン時にアカウントが自動的に作成されます。"
      />
    </AuthShell>
  );
}
