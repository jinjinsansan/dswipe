"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";
import { salonApi, salonFeedApi } from "@/lib/api";
import type {
  Salon,
  SalonComment,
  SalonCommentListResult,
  SalonPost,
  SalonPostLikeResult,
  SalonPostListResult,
} from "@/types/api";
import { useAuthStore } from "@/store/authStore";

type CommentState = Record<string, SalonComment[]>;
type CommentLoadingState = Record<string, boolean>;
type CommentInputState = Record<string, string>;
type ExpandedState = Record<string, boolean>;

export default function SalonFeedPage() {
  const params = useParams<{ salonId: string }>();
  const salonId = params?.salonId;
  const { user } = useAuthStore();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [posts, setPosts] = useState<SalonPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [expandedComments, setExpandedComments] = useState<ExpandedState>({});
  const [comments, setComments] = useState<CommentState>({});
  const [commentsLoading, setCommentsLoading] = useState<CommentLoadingState>({});
  const [commentInputs, setCommentInputs] = useState<CommentInputState>({});

  const loadSalon = useCallback(async () => {
    if (!salonId) return;
    try {
      const response = await salonApi.get(salonId);
      setSalon(response.data as Salon);
    } catch (err) {
      console.error("Failed to load salon", err);
    }
  }, [salonId]);

  const loadPosts = useCallback(async () => {
    if (!salonId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await salonFeedApi.listPosts(salonId, { limit: 50, offset: 0 });
      const payload = response.data as SalonPostListResult;
      setPosts(payload.data ?? []);
      setTotalPosts(payload.total ?? 0);
    } catch (err: any) {
      console.error("Failed to load posts", err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "投稿一覧を読み込めませんでした");
    } finally {
      setIsLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    loadSalon();
  }, [loadSalon]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const resetPostForm = () => {
    setPostTitle("");
    setPostBody("");
    setIsPublished(true);
  };

  const handleCreatePost = async () => {
    if (!salonId || !postBody.trim()) {
      setError("本文を入力してください");
      return;
    }
    setIsSubmittingPost(true);
    setError(null);
    try {
      const payload = {
        title: postTitle.trim() ? postTitle.trim() : undefined,
        body: postBody.trim(),
        is_published: isPublished,
      };
      const response = await salonFeedApi.createPost(salonId, payload);
      const created = response.data as SalonPost;
      setPosts((prev) => [created, ...prev]);
      setTotalPosts((prev) => prev + 1);
      resetPostForm();
    } catch (err: any) {
      console.error("Failed to create post", err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "投稿の作成に失敗しました");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const refreshPost = useCallback(
    async (postId: string) => {
      if (!salonId) return;
      try {
        const response = await salonFeedApi.getPost(salonId, postId);
        const updated = response.data as SalonPost;
        setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)));
      } catch (err) {
        console.error("Failed to refresh post", err);
      }
    },
    [salonId]
  );

  const handleToggleLike = async (postId: string) => {
    if (!salonId) return;
    try {
      const response = await salonFeedApi.toggleLike(salonId, postId);
      const payload = response.data as SalonPostLikeResult;
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, like_count: payload.like_count, liked_by_me: payload.liked }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!salonId) return;
    const confirmed = confirm("この投稿を削除しますか？");
    if (!confirmed) return;
    try {
      await salonFeedApi.deletePost(salonId, postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setExpandedComments((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setComments((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setCommentInputs((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setCommentsLoading((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setTotalPosts((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Failed to delete post", err);
      const detail = err?.response?.data?.detail;
      alert(typeof detail === "string" ? detail : "投稿の削除に失敗しました");
    }
  };

  const fetchComments = useCallback(
    async (postId: string) => {
      if (!salonId) return;
      setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
      try {
        const response = await salonFeedApi.listComments(salonId, postId, { limit: 100, offset: 0 });
        const payload = response.data as SalonCommentListResult;
        setComments((prev) => ({ ...prev, [postId]: payload.data ?? [] }));
      } catch (err) {
        console.error("Failed to load comments", err);
        alert("コメントの読み込みに失敗しました");
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [salonId]
  );

  const handleToggleComments = async (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!expandedComments[postId] && !comments[postId]) {
      await fetchComments(postId);
    }
  };

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCreateComment = async (postId: string) => {
    if (!salonId) return;
    const body = (commentInputs[postId] ?? "").trim();
    if (!body) return;
    try {
      await salonFeedApi.createComment(salonId, postId, { body });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      await fetchComments(postId);
      await refreshPost(postId);
    } catch (err) {
      console.error("Failed to create comment", err);
      alert("コメントの投稿に失敗しました");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!salonId) return;
    const confirmed = confirm("このコメントを削除しますか？");
    if (!confirmed) return;
    try {
      await salonFeedApi.deleteComment(salonId, postId, commentId);
      await fetchComments(postId);
      await refreshPost(postId);
    } catch (err) {
      console.error("Failed to delete comment", err);
      alert("コメントの削除に失敗しました");
    }
  };

  const formattedPosts = useMemo(() => posts, [posts]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!salonId) {
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="サロンコミュニティフィード"
      pageSubtitle={salon ? `${salon.title} の会員向け投稿` : "オンラインサロンの投稿管理"}
      requireAuth
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href={`/salons/${salonId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          サロン詳細に戻る
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={`/salons/${salonId}/events`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300 hover:text-slate-700"
          >
            イベント管理へ
          </Link>
          <Link
            href={`/salons/${salonId}/announcements`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300 hover:text-slate-700"
          >
            お知らせ管理へ
          </Link>
          <Link
            href={`/salons/${salonId}/roles`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300 hover:text-slate-700"
          >
            ロール管理へ
          </Link>
          <Link
            href={`/salons/${salonId}/assets`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-slate-300 hover:text-slate-700"
          >
            アセットライブラリへ
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">新規投稿</h2>
          <p className="mt-1 text-xs text-slate-500">サロン会員に向けた最新情報や特典を共有しましょう。</p>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="タイトル (任意)"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              disabled={isSubmittingPost}
            />
            <textarea
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              rows={6}
              placeholder="本文を入力してください"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              disabled={isSubmittingPost}
            />
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  disabled={isSubmittingPost}
                />
                公開済みにする (オフにすると下書き)
              </label>
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={isSubmittingPost || !postBody.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
                投稿する
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">投稿一覧</h2>
            <span className="text-xs text-slate-500">{totalPosts} 件</span>
          </div>

          {formattedPosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              まだ投稿がありません。最初の投稿を作成してコミュニティを盛り上げましょう。
            </div>
          ) : (
            <div className="space-y-5">
              {formattedPosts.map((post) => {
                const createdAt = post.created_at ? new Date(post.created_at).toLocaleString("ja-JP") : "";
                const commentList = comments[post.id] ?? [];
                const isExpanded = expandedComments[post.id] ?? false;
                const commentInput = commentInputs[post.id] ?? "";
                const isCommentLoading = commentsLoading[post.id] ?? false;

                return (
                  <article key={post.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <header className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{post.title || "(無題)"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {post.author_username ? `投稿者: ${post.author_username}` : "投稿者: ---"} ・ {createdAt}
                        </p>
                      </div>
                      {(user?.id === post.user_id) && (
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-xs font-medium text-rose-500 hover:text-rose-600"
                        >
                          削除
                        </button>
                      )}
                    </header>

                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{post.body}</div>

                    <footer className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
                          post.liked_by_me
                            ? "border-rose-200 bg-rose-50 text-rose-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600"
                        }`}
                      >
                        <HeartIcon className={`h-4 w-4 ${post.liked_by_me ? "fill-rose-500 text-rose-500" : ""}`} aria-hidden="true" />
                        {post.like_count}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComments(post.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4" aria-hidden="true" />
                        {post.comment_count}
                      </button>
                    </footer>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                        <div className="space-y-3">
                          {isCommentLoading ? (
                            <p className="text-xs text-slate-400">コメントを読み込み中です...</p>
                          ) : commentList.length === 0 ? (
                            <p className="text-xs text-slate-500">まだコメントはありません。</p>
                          ) : (
                            <ul className="space-y-3">
                              {commentList.map((comment) => {
                                const commentDate = comment.created_at ? new Date(comment.created_at).toLocaleString("ja-JP") : "";
                                const canDelete = user?.id === comment.user_id || user?.id === salon?.owner_id;
                                return (
                                  <li key={comment.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-700">{comment.author_username ?? "---"}</p>
                                        <p className="mt-0.5 text-[10px] text-slate-400">{commentDate}</p>
                                      </div>
                                      {canDelete ? (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                          className="text-[10px] font-medium text-rose-500 hover:text-rose-600"
                                        >
                                          削除
                                        </button>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600">{comment.body}</p>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <textarea
                            value={commentInput}
                            onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                            rows={3}
                            placeholder="コメントを入力してください"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleCreateComment(post.id)}
                              disabled={!commentInput.trim()}
                              className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <PaperAirplaneIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              コメント送信
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
