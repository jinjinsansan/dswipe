"use client";

import { create } from 'zustand';

import { accountShareApi, authApi } from '@/lib/api';
import type {
  AccountAccessibleOwner,
  AccountShareDelegateShare,
  AccountShareInviteRequest,
  AccountShareInviteResponse,
  AccountShareOwnerShare,
} from '@/types';
import { useAuthStore } from './authStore';

const SELECTED_OWNER_KEY = 'selected_owner_id';

interface AccountShareState {
  ownerShares: AccountShareOwnerShare[];
  delegateShares: AccountShareDelegateShare[];
  accessibleOwners: AccountAccessibleOwner[];
  selectedOwnerId: string | null;
  isLoadingOwners: boolean;
  inviteStatus: 'idle' | 'loading';
  fetchAccessibleOwners: () => Promise<void>;
  selectOwner: (ownerUserId: string) => Promise<void>;
  fetchOwnerShares: () => Promise<void>;
  fetchDelegateShares: () => Promise<void>;
  inviteDelegate: (payload: AccountShareInviteRequest) => Promise<AccountShareInviteResponse>;
  revokeShare: (shareId: string) => Promise<void>;
  reset: () => void;
}

export const useAccountShareStore = create<AccountShareState>((set, get) => ({
  ownerShares: [],
  delegateShares: [],
  accessibleOwners: [],
  selectedOwnerId: null,
  isLoadingOwners: false,
  inviteStatus: 'idle',

  async fetchAccessibleOwners() {
    set({ isLoadingOwners: true });
    try {
      const { data } = await accountShareApi.listAccessibleOwners();
      const owners = data.owners ?? [];
      let selectedOwnerId = get().selectedOwnerId;

      if (!selectedOwnerId) {
        const stored = localStorage.getItem(SELECTED_OWNER_KEY);
        if (stored && owners.some((owner) => owner.owner_user_id === stored)) {
          selectedOwnerId = stored;
        }
      }

      if (!selectedOwnerId && owners.length > 0) {
        selectedOwnerId = owners[0].owner_user_id;
      }

      if (selectedOwnerId && !owners.some((owner) => owner.owner_user_id === selectedOwnerId) && owners.length > 0) {
        selectedOwnerId = owners[0].owner_user_id;
      }

      const currentOwnerId = useAuthStore.getState().user?.id ?? null;
      set({ accessibleOwners: owners, selectedOwnerId });
      if (selectedOwnerId) {
        localStorage.setItem(SELECTED_OWNER_KEY, selectedOwnerId);
      }

      if (selectedOwnerId && currentOwnerId && selectedOwnerId !== currentOwnerId) {
        await get().selectOwner(selectedOwnerId);
      }
    } catch (error) {
      console.error('Failed to fetch accessible owners:', error);
      set({ accessibleOwners: [] });
    } finally {
      set({ isLoadingOwners: false });
    }
  },

  async selectOwner(ownerUserId: string) {
    const current = get().selectedOwnerId;
    if (current === ownerUserId) return;

    try {
      const { data } = await accountShareApi.createSession({ owner_user_id: ownerUserId });
      const authStore = useAuthStore.getState();
      authStore.setToken(data.access_token);
      authStore.setDelegateUserId(data.delegate_user_id ?? null);

      // Refresh user context based on new token
      const meResponse = await authApi.getMe();
      const updatedUser = meResponse.data;
      authStore.setUser(updatedUser);

      localStorage.setItem(SELECTED_OWNER_KEY, ownerUserId);
      set({ selectedOwnerId: ownerUserId });

      try {
        const { data } = await accountShareApi.listAccessibleOwners();
        set({ accessibleOwners: data.owners ?? [] });
      } catch (error) {
        console.error('Failed to refresh accessible owner list:', error);
      }
    } catch (error) {
      console.error('Failed to switch owner context:', error);
      throw error;
    }
  },

  async fetchOwnerShares() {
    try {
      const { data } = await accountShareApi.listOwnerShares();
      set({ ownerShares: data.shares ?? [] });
    } catch (error) {
      console.error('Failed to fetch owner shares:', error);
      set({ ownerShares: [] });
    }
  },

  async fetchDelegateShares() {
    try {
      const { data } = await accountShareApi.listDelegateShares();
      set({ delegateShares: data.shares ?? [] });
    } catch (error) {
      console.error('Failed to fetch delegate shares:', error);
      set({ delegateShares: [] });
    }
  },

  async inviteDelegate(payload) {
    set({ inviteStatus: 'loading' });
    try {
      const response = await accountShareApi.invite(payload);
      await get().fetchOwnerShares();
      return response.data;
    } finally {
      set({ inviteStatus: 'idle' });
    }
  },

  async revokeShare(shareId) {
    await accountShareApi.revoke(shareId);
    await Promise.all([get().fetchOwnerShares(), get().fetchAccessibleOwners()]);
  },

  reset() {
    set({
      ownerShares: [],
      delegateShares: [],
      accessibleOwners: [],
      selectedOwnerId: null,
      inviteStatus: 'idle',
      isLoadingOwners: false,
    });
    localStorage.removeItem(SELECTED_OWNER_KEY);
  },
}));
