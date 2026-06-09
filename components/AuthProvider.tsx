'use client';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (googleClientId && googleClientId.trim().length > 0) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    );
  }

  return <>{children}</>;
}
