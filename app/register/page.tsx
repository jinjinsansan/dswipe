'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errorHandler';
import AuthLayout, { AuthTabs } from '@/components/auth/AuthLayout';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Button, Field, Select } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    userType: 'seller' as 'seller' | 'buyer',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        user_type: formData.userType,
      });

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
          はじめまして
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-2)' }}>
          無料でアカウントを作成しましょう
        </p>
      </div>

      <AuthTabs active="register" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'var(--danger-tint)', borderColor: '#fcc', color: 'var(--danger-ink)' }}
          >
            {error}
          </div>
        )}

        <Field label="ユーザータイプ" htmlFor="userType">
          <Select id="userType" name="userType" value={formData.userType} onChange={handleChange}>
            <option value="seller">Seller（販売者）</option>
            <option value="buyer">Buyer（購入者）</option>
          </Select>
        </Field>

        <Field label="メールアドレス" htmlFor="email">
          <div className="input-icon">
            <EnvelopeIcon />
            <input id="email" type="email" name="email" className="input" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
          </div>
        </Field>

        <Field label="ユーザー名" htmlFor="username">
          <div className="input-icon">
            <UserIcon />
            <input id="username" type="text" name="username" className="input" value={formData.username} onChange={handleChange} required placeholder="username" />
          </div>
        </Field>

        <Field label="パスワード" htmlFor="password">
          <div className="input-icon">
            <LockClosedIcon />
            <input id="password" type="password" name="password" className="input" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
        </Field>

        <Field label="パスワード（確認）" htmlFor="confirmPassword">
          <div className="input-icon">
            <LockClosedIcon />
            <input id="confirmPassword" type="password" name="confirmPassword" className="input" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
          </div>
        </Field>

        <Button type="submit" size="lg" block disabled={isLoading} className="mt-1">
          {isLoading ? '登録中...' : '無料で登録する'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
        または
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
      </div>

      <GoogleSignInButton redirectPath="/dashboard" />

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-2)' }}>
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>
          ログイン
        </Link>
      </p>

      <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted)' }}>
        <ArrowLeftIcon className="h-4 w-4" />
        ホームに戻る
      </Link>
    </AuthLayout>
  );
}
