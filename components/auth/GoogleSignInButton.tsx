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
  title = 'Googleアカウントでログイン',
  description = '続行するにはGoogleアカウントでサインインしてください。'
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(googleClientId && googleClientId.trim().length > 0);
  const safeRedirectPath = redirectPath && redirectPath.startsWith('/') ? redirectPath : '/dashboard';

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google認証トークンを取得できませんでした。');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Google認証開始...');
      const { data } = await authApi.loginWithGoogle(credentialResponse.credential);
      console.log('✅ Google認証成功:', data);
      const { access_token, user } = data;

      setToken(access_token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      router.push(safeRedirectPath);
    } catch (err: unknown) {
      console.error('❌ Google認証エラー:', err);
      console.error('詳細:', {
        message: (err as any)?.message,
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status,
      });
      const errorMsg = getErrorMessage(err);
      setError(`${errorMsg} (詳細はコンソールを確認してください)`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Google認証に失敗しました。時間をおいて再度お試しください。');
  };

  if (!isConfigured) {
    return (
      <div className="space-y-4 text-center p-6 bg-red-50 border-2 border-red-200 rounded-xl">
        <h2 className="text-xl font-bold text-red-900">Google認証を設定してください</h2>
        <p className="text-sm text-red-700">
          管理者は <code className="font-mono text-xs bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> を設定の上、ページを再読み込みしてください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex justify-center ${isLoading ? 'pointer-events-none opacity-70' : ''}`}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} shape="pill" theme="filled_blue" size="large" text="continue_with" width="280" />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-slate-700">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Googleアカウントを検証中です…</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-center text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
