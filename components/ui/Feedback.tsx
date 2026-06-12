'use client';

/* アプリ共通のフィードバック基盤(Momentumデザイン)。
   OSネイティブの alert()/confirm() を置き換える。
   - toast.success/error/info: 非ブロッキング通知(自動消滅)
   - appConfirm(): Promise<boolean> を返す確認モーダル(confirm()のドロップイン代替)
   FeedbackHost を app/layout.tsx に1つだけマウントして使う。 */

import { useEffect } from 'react';
import { create } from 'zustand';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  /** トースト内に表示するアクションボタン(「元に戻す」等) */
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 破壊的操作は赤ボタンにする */
  danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

interface FeedbackState {
  toasts: ToastItem[];
  confirmRequest: ConfirmRequest | null;
  pushToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  dismissToast: (id: number) => void;
  openConfirm: (request: ConfirmRequest) => void;
  settleConfirm: (confirmed: boolean) => void;
}

let toastSeq = 0;

const useFeedbackStore = create<FeedbackState>((set, get) => ({
  toasts: [],
  confirmRequest: null,
  pushToast: (type, message, options) => {
    const id = ++toastSeq;
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-2),
        { id, type, message, actionLabel: options?.actionLabel, onAction: options?.onAction },
      ],
    }));
    // アクション付き(undo等)は猶予を長めに取る
    const ttl = options?.actionLabel ? 7000 : type === 'error' ? 6000 : 4000;
    setTimeout(() => get().dismissToast(id), ttl);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  openConfirm: (request) => {
    // 多重要求は前のものをキャンセル扱いで解決
    const prev = get().confirmRequest;
    if (prev) prev.resolve(false);
    set({ confirmRequest: request });
  },
  settleConfirm: (confirmed) => {
    const request = get().confirmRequest;
    if (request) request.resolve(confirmed);
    set({ confirmRequest: null });
  },
}));

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    useFeedbackStore.getState().pushToast('success', message, options),
  error: (message: string, options?: ToastOptions) =>
    useFeedbackStore.getState().pushToast('error', message, options),
  info: (message: string, options?: ToastOptions) =>
    useFeedbackStore.getState().pushToast('info', message, options),
};

export const appConfirm = (options: ConfirmOptions): Promise<boolean> =>
  new Promise((resolve) => {
    useFeedbackStore.getState().openConfirm({ ...options, resolve });
  });

const TOAST_STYLES: Record<ToastType, { box: string; icon: typeof CheckCircleIcon; iconColor: string }> = {
  success: { box: 'border-emerald-200 bg-white', icon: CheckCircleIcon, iconColor: 'text-emerald-500' },
  error: { box: 'border-red-200 bg-white', icon: ExclamationTriangleIcon, iconColor: 'text-red-500' },
  info: { box: 'border-sky-200 bg-white', icon: InformationCircleIcon, iconColor: 'text-sky-500' },
};

export function FeedbackHost() {
  const toasts = useFeedbackStore((state) => state.toasts);
  const confirmRequest = useFeedbackStore((state) => state.confirmRequest);
  const dismissToast = useFeedbackStore((state) => state.dismissToast);
  const settleConfirm = useFeedbackStore((state) => state.settleConfirm);

  useEffect(() => {
    if (!confirmRequest) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') settleConfirm(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmRequest, settleConfirm]);

  return (
    <>
      {/* トースト */}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[110] flex flex-col items-center gap-2 px-4">
        {toasts.map((item) => {
          const style = TOAST_STYLES[item.type];
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_40px_-18px_rgba(11,31,58,0.45)] ${style.box}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.iconColor}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium leading-snug text-slate-800 whitespace-pre-line">{item.message}</p>
              {item.actionLabel && item.onAction ? (
                <button
                  type="button"
                  onClick={() => {
                    item.onAction?.();
                    dismissToast(item.id);
                  }}
                  className="flex-shrink-0 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                >
                  {item.actionLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                className="rounded p-0.5 text-slate-400 transition hover:text-slate-600"
                aria-label="閉じる"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 確認モーダル */}
      {confirmRequest ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b1f3a]/45 px-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) settleConfirm(false);
          }}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-navy-900">{confirmRequest.title}</h3>
            {confirmRequest.message ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{confirmRequest.message}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settleConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {confirmRequest.cancelLabel ?? 'キャンセル'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => settleConfirm(true)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px ${
                  confirmRequest.danger ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
                style={
                  confirmRequest.danger
                    ? undefined
                    : { backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' }
                }
              >
                {confirmRequest.confirmLabel ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
