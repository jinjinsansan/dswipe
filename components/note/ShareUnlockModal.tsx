'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ShareToUnlockButton from './ShareToUnlockButton';

interface ShareUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteSlug: string;
  pricePoints: number;
  allowShareUnlock: boolean;
  isAuthenticated: boolean;
  onPurchase?: () => void;
}

export default function ShareUnlockModal({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  noteSlug,
  pricePoints,
  allowShareUnlock,
  isAuthenticated,
  onPurchase,
}: ShareUnlockModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                {/* ヘッダー */}
                <div className="flex items-start justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-slate-900"
                  >
                    この記事を読む
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* コンテンツ */}
                <div className="mt-6 space-y-6">
                  {/* オプション1: Xシェアで無料 */}
                  {allowShareUnlock && (
                    <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          1
                        </div>
                        <h4 className="text-base font-bold text-blue-900">
                          Xでシェアして無料で読む
                        </h4>
                      </div>
                      
                      <div className="space-y-3 text-sm text-blue-700">
                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <span>X（Twitter）と連携</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <span>記事をシェア（自動投稿）</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <span>7日間無料で読める</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <ShareToUnlockButton
                          noteId={noteId}
                          noteTitle={noteTitle}
                          noteSlug={noteSlug}
                          pricePoints={pricePoints}
                          allowShareUnlock={allowShareUnlock}
                          onShareSuccess={onClose}
                        />
                      </div>

                      <p className="mt-3 text-xs text-blue-600/80">
                        ※ シェアから7日間、記事を読むことができます
                      </p>
                    </div>
                  )}

                  {/* 区切り */}
                  {allowShareUnlock && (
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative bg-white px-4">
                        <span className="text-sm font-medium text-slate-500">または</span>
                      </div>
                    </div>
                  )}

                  {/* オプション2: ポイントで購入 */}
                  <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                        {allowShareUnlock ? '2' : '1'}
                      </div>
                      <h4 className="text-base font-bold text-amber-900">
                        ポイントで購入
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-amber-700">価格</span>
                        <span className="text-2xl font-bold text-amber-900">
                          {pricePoints.toLocaleString()}P
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-amber-700">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                        <span>購入後は無期限で読める</span>
                      </div>
                    </div>

                    <button
                      onClick={onPurchase}
                      disabled={!isAuthenticated}
                      className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAuthenticated ? 'ポイントで購入' : 'ログインして購入'}
                    </button>
                  </div>
                </div>

                {/* フッター */}
                <div className="mt-6 text-center">
                  <button
                    onClick={onClose}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    キャンセル
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
