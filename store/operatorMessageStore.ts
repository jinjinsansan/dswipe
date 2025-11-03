import { create } from 'zustand';

interface OperatorMessageState {
  unreadCount: number;
  lastFetchedAt: number | null;
  setUnreadCount: (count: number, fetchedAt?: number) => void;
  adjustUnread: (delta: number) => void;
}

export const useOperatorMessageStore = create<OperatorMessageState>((set) => ({
  unreadCount: 0,
  lastFetchedAt: null,
  setUnreadCount: (count, fetchedAt = Date.now()) =>
    set(() => ({
      unreadCount: Math.max(0, count),
      lastFetchedAt: fetchedAt,
    })),
  adjustUnread: (delta) =>
    set((state) => {
      const next = Math.max(0, state.unreadCount + delta);
      return { unreadCount: next };
    }),
}));
