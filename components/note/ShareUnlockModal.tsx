'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ShareToUnlockButton from './ShareToUnlockButton';
import { noteApi, api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

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

interface OfficialPost {
  official_post_id: string;
  tweet_id: string;
  tweet_url: string;
  tweet_text: string;
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
  const { token } = useAuthStore();
  const [officialPost, setOfficialPost] = useState<OfficialPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [reposting, setReposting] = useState(false);
  const [repostError, setRepostError] = useState<string | null>(null);
  const [repostSuccess, setRepostSuccess] = useState(false);

  // 公式シェア投稿を取得
  useEffect(() => {
    if (isOpen && allowShareUnlock) {
      fetchOfficialPost();
    }
  }, [isOpen, noteId, allowShareUnlock]);

  const fetchOfficialPost = async () => {
    setLoadingPost(true);
    try {
      const response = await api.get(`/notes/${noteId}/official-share-post`);
      const data = response.data as unknown as OfficialPost | null;
      if (data && data.tweet_id) {
        setOfficialPost(data);
      } else {
        setOfficialPost(null);
      }
    } catch (error) {
      console.error('Failed to fetch official post:', error);
      setOfficialPost(null);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleRepost = async () => {
    if (!token || !isAuthenticated) {
      return;
    }

    setReposting(true);
    setRepostError(null);

    try {
      const response = await api.post(
        `/notes/${noteId}/share-by-repost`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setRepostSuccess(true);
        // 1.5秒後にページリロード
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || 'リポストに失敗しました';
      setRepostError(errorMsg);
    } finally {
      setReposting(false);
    }
  };

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

                      {loadingPost ? (
                        <div className="flex items-center justify-center py-4 text-sm text-blue-600">
                          <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                          読み込み中...
                        </div>
                      ) : officialPost ? (
                        // リポスト方式（公式投稿あり）
                        <>
                          <div className="space-y-3 text-sm text-blue-700">
                            <div className="flex items-start gap-2">
                              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                              <span>X（Twitter）と連携</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                              <span>↓の投稿をリポスト</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                              <span>7日間無料で読める</span>
                            </div>
                          </div>

                          {/* 対象の投稿を表示 */}
                          <a
                            href={officialPost.tweet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            対象の投稿を表示
                          </a>

                          {/* リポストボタン */}
                          {repostSuccess ? (
                            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                              <CheckCircleIcon className="mx-auto mb-1 h-6 w-6" />
                              リポスト完了！記事を読み込んでいます...
                            </div>
                          ) : (
                            <button
                              onClick={handleRepost}
                              disabled={reposting || !isAuthenticated}
                              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {reposting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                  リポスト中...
                                </span>
                              ) : (
                                'リポストして無料で読む'
                              )}
                            </button>
                          )}

                          {repostError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                              {repostError}
                            </div>
                          )}

                          <p className="mt-3 text-xs text-blue-600/80">
                            ※ シェアから7日間、記事を読むことができます
                          </p>
                        </>
                      ) : (
                        // 従来のツイート投稿方式（公式投稿なし）
                        <>
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
                        </>
                      )}
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
