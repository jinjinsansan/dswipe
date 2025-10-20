import { create } from 'zustand';
import { User } from '@/types';
import { isAdminEmail } from '@/constants/admin';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isAdmin: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, isAdmin: isAdminEmail(user?.email) }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    set({ token });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true, isInitialized: true, isAdmin: isAdminEmail(user?.email) });
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          set({ isInitialized: true, isAdmin: false });
        }
      } else {
        set({ isInitialized: true, isAdmin: false });
      }
    }
  },
}));
