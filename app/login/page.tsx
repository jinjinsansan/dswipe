'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errorHandler';
import AuthLayout, { AuthTabs } from '@/components/auth/AuthLayout';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Button, Field } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;

      setToken(access_token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          おかえりなさい
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-2)' }}>
          アカウントにログインして続けましょう
        </p>
      </div>

      <AuthTabs active="login" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'var(--danger-tint)', borderColor: '#fcc', color: 'var(--danger-ink)' }}
          >
            {error}
          </div>
        )}

        <Field label="メールアドレス" htmlFor="email">
          <div className="input-icon">
            <EnvelopeIcon />
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
        </Field>

        <Field label="パスワード" htmlFor="password">
          <div className="input-icon">
            <LockClosedIcon />
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
        </Field>

        <Button type="submit" size="lg" block disabled={isLoading} className="mt-1">
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
        または
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
      </div>

      <GoogleSignInButton redirectPath="/dashboard" />

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-2)' }}>
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="font-semibold" style={{ color: 'var(--brand)' }}>
          新規登録
        </Link>
      </p>

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1.5 text-sm"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        ホームに戻る
      </Link>
    </AuthLayout>
  );
}
