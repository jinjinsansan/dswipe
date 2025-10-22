'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import AuthShell from '@/components/auth/AuthShell';

const GoogleSignInButton = dynamic(() => import('@/components/auth/GoogleSignInButton'), { ssr: false });

export default function LoginPage() {
  return (
    <AuthShell
      cardTitle="ログイン"
      cardDescription="Googleアカウントでログインしてください"
      helper={
        <span>
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="font-semibold text-white hover:text-emerald-200">
            新規登録
          </Link>
        </span>
      }
      hero={{
        eyebrow: 'SWIPE LP PLATFORM',
        title: '引き込むスワイプ体験で、ファン化を加速させる',
        description:
          'Ｄ－swipeは情報商材インフォプレナー向けに最適化されたフローで、LP制作から分析までを一気通貫で支援します。',
        highlights: [
          { title: '高速な構成生成', description: 'ターゲットに響くコピーと構成をAIが瞬時にサジェスト。' },
          { title: 'エモーショナルな演出', description: '動画と演出が一体となったヒーロー体験で興味を最大化。' },
          { title: 'コンバージョン学習', description: '計測データを蓄積し、成果に直結する改善サイクルを構築。' },
        ],
      }}
    >
      <GoogleSignInButton />
    </AuthShell>
  );
}
