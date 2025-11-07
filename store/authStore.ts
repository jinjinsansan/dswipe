import { create } from 'zustand';
import { User } from '@/types';
import { isAdminEmail } from '@/constants/admin';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  pointBalance: number;
  delegateUserId: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPointBalance: (balance: number) => void;
  setDelegateUserId: (delegateUserId: string | null) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isAdmin: false,
  pointBalance: 0,
  delegateUserId: null,
  
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isAdmin: isAdminEmail(user?.email),
    pointBalance: typeof user?.point_balance === 'number' ? user.point_balance : 0,
  }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    set({ token });
  },
  
  setPointBalance: (balance) => set({ pointBalance: balance }),

  setDelegateUserId: (delegateUserId) => {
    if (delegateUserId) {
      localStorage.setItem('delegate_user_id', delegateUserId);
    } else {
      localStorage.removeItem('delegate_user_id');
    }
    set({ delegateUserId });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('delegate_user_id');
    localStorage.removeItem('selected_owner_id');
    set({ user: null, token: null, isAuthenticated: false, pointBalance: 0, isAdmin: false, delegateUserId: null });
  },
  
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      const delegateUserId = localStorage.getItem('delegate_user_id');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({
            user,
            token,
            isAuthenticated: true,
            isInitialized: true,
            isAdmin: isAdminEmail(user?.email),
            pointBalance: typeof user?.point_balance === 'number' ? user.point_balance : 0,
            delegateUserId: delegateUserId || null,
          });
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('delegate_user_id');
          set({ isInitialized: true, isAdmin: false, pointBalance: 0 });
        }
      } else {
        set({ isInitialized: true, isAdmin: false, pointBalance: 0 });
      }
    }
  },
}));
