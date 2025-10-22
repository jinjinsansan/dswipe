'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const GoogleSignInButton = dynamic(() => import('@/components/auth/GoogleSignInButton'), { ssr: false });

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-semibold text-slate-900 tracking-[0.08em]">Ｄ－swipe</h1>
          <p className="text-slate-600">Googleアカウントでログインしてください</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <GoogleSignInButton />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
