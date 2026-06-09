'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useAuthStore } from '@/store/authStore';

interface GoogleSignInButtonProps {
  redirectPath?: string;
  title?: string;
  description?: string;
}

export default function GoogleSignInButton({
  redirectPath = '/dashboard',
  title,
  description,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(googleClientId && googleClientId.trim().length > 0);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google認証トークンを取得できませんでした。');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await authApi.loginWithGoogle(credentialResponse.credential);
      const { access_token, user } = data;

      setToken(access_token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      router.push(redirectPath);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Google認証に失敗しました。時間をおいて再度お試しください。');
  };

  if (!isConfigured) {
    // Client ID 未設定時は何も表示しない（メール/パスワードのみで運用可能）
    return null;
  }

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="space-y-2 text-center">
          {title && <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      )}

      <div className={`flex justify-center ${isLoading ? 'pointer-events-none opacity-70' : ''}`}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} shape="pill" theme="filled_blue" size="large" text="continue_with" width="280" />
      </div>

      {isLoading && (
        <p className="text-center text-sm text-slate-500">Googleアカウントを検証中です…</p>
      )}

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
