'use client';

import { useMemo, useState } from 'react';

import { useAccountShareStore } from '@/store/accountShareStore';

interface AccountSwitcherProps {
  className?: string;
  buttonClassName?: string;
}

function ownerLabel(owner: { owner_username?: string | null; owner_email?: string | null; owner_user_id: string; is_self: boolean }) {
  if (owner.owner_username) {
    return owner.owner_username;
  }
  if (owner.owner_email) {
    return owner.owner_email;
  }
  return owner.owner_user_id;
}

export function AccountSwitcher({ className = '', buttonClassName = '' }: AccountSwitcherProps) {
  const owners = useAccountShareStore((state) => state.accessibleOwners);
  const selectedOwnerId = useAccountShareStore((state) => state.selectedOwnerId);
  const selectOwner = useAccountShareStore((state) => state.selectOwner);
  const isLoading = useAccountShareStore((state) => state.isLoadingOwners);
  const [isSwitching, setIsSwitching] = useState(false);

  const options = useMemo(() => owners.map((owner) => ({ ...owner, label: ownerLabel(owner) })), [owners]);

  if (!selectedOwnerId || options.length <= 1) {
    return null;
  }

  const handleChange = async (ownerUserId: string) => {
    if (ownerUserId === selectedOwnerId) {
      return;
    }
    setIsSwitching(true);
    try {
      await selectOwner(ownerUserId);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-slate-500">アカウント切替</span>
      <div className="relative w-full sm:w-48">
        <select
          value={selectedOwnerId}
          onChange={(event) => handleChange(event.target.value)}
          disabled={isLoading || isSwitching}
          className={`w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100 ${buttonClassName}`}
        >
          {options.map((option) => (
            <option key={option.owner_user_id} value={option.owner_user_id}>
              {option.label}
              {option.is_self ? '（自分）' : ''}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
          ▼
        </span>
      </div>
    </div>
  );
}
