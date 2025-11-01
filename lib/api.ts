import axios from 'axios';
import type {
  AuthResponse,
  LP,
  LPDetail,
  CreateLPRequest,
  UpdateLPRequest,
  PointsBalance,
  AIWizardRequest,
  AITextGenerationRequest,
  AIImprovementRequest,
  AIImprovementResponse,
  LPListResponse,
  NoteDetail,
  NoteListResult,
  NoteMetrics,
  NoteCreateRequest,
  NoteUpdateRequest,
  NotePurchaseResult,
  PublicNoteListResult,
  PublicNoteDetail,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductPurchasePayload,
  SubscriptionCheckoutPayload,
  Salon,
  SalonListResult,
  SalonPublicDetail,
  SalonPublicListResult,
  PurchaseHistoryResponse,
  SalonMemberListResult,
  NoteSalonAccessPayload,
  NoteSalonAccessResponse,
  SalonPost,
  SalonPostListResult,
  SalonPostCreatePayload,
  SalonPostUpdatePayload,
  SalonComment,
  SalonCommentListResult,
  SalonCommentCreatePayload,
  SalonCommentUpdatePayload,
  SalonPostLikeResult,
  SalonEvent,
  SalonEventListResult,
  SalonEventAttendeeListResult,
  SalonEventCreatePayload,
  SalonEventUpdatePayload,
  SalonEventAttendPayload,
  SalonAsset,
  SalonAssetListResult,
  SalonAssetUploadPayload,
  SalonAssetMetadataPayload,
  SalonAnnouncement,
  SalonAnnouncementListResult,
  SalonAnnouncementCreatePayload,
  SalonAnnouncementUpdatePayload,
  SalonRole,
  SalonRoleListResult,
  SalonRoleCreatePayload,
  SalonRoleUpdatePayload,
  SalonRoleAssignPayload,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークンを自動で付与）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー時はローカルストレージをクリア
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証API
export const authApi = {
  loginWithGoogle: (credential: string) =>
    api.post<AuthResponse>('/auth/google', { credential }),

  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: {
    username?: string;
    bio?: string | null;
    sns_url?: string | null;
    line_url?: string | null;
    profile_image_url?: string | null;
  }) =>
    api.put('/auth/profile', data),
};

// LP管理API
export const lpApi = {
  create: (data: CreateLPRequest) =>
    api.post<LP>('/lp', data),
  
  list: (params?: Record<string, unknown>) =>
    api.get<LPListResponse>('/lp', { params }),
  
  get: (id: string) =>
    api.get<LPDetail>(`/lp/${id}`),
  
  update: (id: string, data: UpdateLPRequest) =>
    api.put<LP>(`/lp/${id}`, data),

  duplicate: (id: string) =>
    api.post<LPDetail>(`/lp/${id}/duplicate`),
  
  delete: (id: string) =>
    api.delete(`/lp/${id}`),
  
  publish: (id: string) =>
    api.post(`/lp/${id}/publish`),
  
  // ステップ管理
  addStep: (lpId: string, data: { step_order: number; image_url: string; block_type?: string; content_data?: Record<string, unknown> }) =>
    api.post(`/lp/${lpId}/steps`, data),
  
  updateStep: (lpId: string, stepId: string, data: { step_order?: number; image_url?: string; block_type?: string; content_data?: Record<string, unknown> }) =>
    api.put(`/lp/${lpId}/steps/${stepId}`, data),
  
  deleteStep: (lpId: string, stepId: string) =>
    api.delete(`/lp/${lpId}/steps/${stepId}`),
  
  // ブロック一括更新（テンプレートシステム用）
  updateBlocks: (
    lpId: string,
    blocks: Array<{
      id?: string;
      block_type?: string;
      content_data: Record<string, unknown>;
      step_order: number;
      image_url?: string | null;
      video_url?: string | null;
    }>,
  ) => api.post(`/lp/${lpId}/blocks`, { steps: blocks }),
  
  // CTA管理
  addCta: (lpId: string, data: any) =>
    api.post(`/lp/${lpId}/ctas`, data),
  
  updateCta: (ctaId: string, data: any) =>
    api.put(`/lp/ctas/${ctaId}`, data),
  
  deleteCta: (ctaId: string) =>
    api.delete(`/lp/ctas/${ctaId}`),
};

// メディアAPI
export const mediaApi = {
  upload: (file: File, options?: { optimize?: boolean; max_width?: number; max_height?: number }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', 'image');
    if (options?.optimize !== undefined) formData.append('optimize', String(options.optimize));
    if (options?.max_width) formData.append('max_width', String(options.max_width));
    if (options?.max_height) formData.append('max_height', String(options.max_height));
    
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (url: string) =>
    api.delete('/media', { params: { url } }),
};

// 分析API
export const analyticsApi = {
  getLPAnalytics: (lpId: string, params?: { date_from?: string; date_to?: string }) =>
    api.get(`/lp/${lpId}/analytics`, { params }),
  
  getEvents: (lpId: string, params?: any) =>
    api.get(`/lp/${lpId}/events`, { params }),
};

// 商品API
export const productApi = {
  create: (data: ProductCreatePayload) =>
    api.post('/products', data),
  
  list: (params?: Record<string, unknown>) =>
    api.get('/products', { params }),
  
  get: (id: string) =>
    api.get(`/products/${id}`),
  
  update: (id: string, data: ProductUpdatePayload) =>
    api.put(`/products/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/products/${id}`),
  
  purchase: (id: string, data: ProductPurchasePayload) =>
    api.post(`/products/${id}/purchase`, data),
  
  getPublic: (params?: { sort?: 'popular' | 'latest'; limit?: number; offset?: number; seller_username?: string }) =>
    axios.get(`${API_URL}/products/public`, { params }),
};

// NOTE API
export const noteApi = {
  create: (data: NoteCreateRequest) =>
    api.post<NoteDetail>('/notes', data),

  list: (params?: { status_filter?: 'draft' | 'published'; limit?: number; offset?: number; categories?: string[] }) =>
    api.get<NoteListResult>('/notes', { params }),

  get: (noteId: string) =>
    api.get<NoteDetail>(`/notes/${noteId}`),

  update: (noteId: string, data: NoteUpdateRequest) =>
    api.put<NoteDetail>(`/notes/${noteId}`, data),

  delete: (noteId: string) =>
    api.delete(`/notes/${noteId}`),

  publish: (noteId: string) =>
    api.post<NoteDetail>(`/notes/${noteId}/publish`),

  unpublish: (noteId: string) =>
    api.post<NoteDetail>(`/notes/${noteId}/unpublish`),

  purchase: (noteId: string, paymentMethod: 'points' | 'yen' = 'points') =>
    api.post<NotePurchaseResult>(`/notes/${noteId}/purchase`, null, { params: { payment_method: paymentMethod } }),

  getMetrics: () =>
    api.get<NoteMetrics>('/notes/metrics'),
};

// ポイントAPI
export const pointsApi = {
  purchase: (amount: number) =>
    api.post('/points/purchase', { amount }),
  
  getBalance: () =>
    api.get<PointsBalance>('/points/balance'),
  
  getTransactions: (params?: Record<string, unknown>) =>
    api.get('/points/transactions', { params }),
};

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getSubscriptions: () => api.get('/subscriptions'),
  createCheckout: (data: SubscriptionCheckoutPayload) => api.post('/subscriptions/checkout', data),
  cancel: (subscriptionId: string) => api.post(`/subscriptions/${subscriptionId}/cancel`),
};

export const salonApi = {
  list: () => api.get<SalonListResult>('/salons'),
  create: (data: {
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
    subscription_plan_id: string;
    subscription_external_id?: string | null;
    allow_point_subscription?: boolean;
    allow_jpy_subscription?: boolean;
    monthly_price_jpy?: number | null;
    tax_rate?: number | null;
    tax_inclusive?: boolean;
  }) =>
    api.post<Salon>('/salons', data),
  get: (salonId: string) => api.get<Salon>(`/salons/${salonId}`),
  update: (salonId: string, data: {
    title?: string;
    description?: string | null;
    thumbnail_url?: string | null;
    is_active?: boolean;
    allow_point_subscription?: boolean;
    allow_jpy_subscription?: boolean;
    monthly_price_jpy?: number | null;
    tax_rate?: number | null;
    tax_inclusive?: boolean;
  }) =>
    api.patch<Salon>(`/salons/${salonId}`, data),
  getMembers: (salonId: string, params?: { status_filter?: string; limit?: number; offset?: number }) =>
    api.get<SalonMemberListResult>(`/salons/${salonId}/members`, { params }),
  setNoteAccess: (salonId: string, noteId: string, data: NoteSalonAccessPayload) =>
    api.post<NoteSalonAccessResponse>(`/salons/${salonId}/notes/${noteId}/access`, data),
};

export const salonPublicApi = {
  get: (salonId: string) => api.get<SalonPublicDetail>(`/public/salons/${salonId}`),
  list: (params?: {
    limit?: number;
    offset?: number;
    category?: string;
    price_range?: string;
    seller_username?: string;
    sort?: string;
  }) => api.get<SalonPublicListResult>(`/public/salons`, { params }),
};

export const purchasesApi = {
  getHistory: (params?: {
    product_limit?: number;
    note_limit?: number;
    salon_limit?: number;
  }) => api.get<PurchaseHistoryResponse>(`/purchases/history`, { params }),
};

export const salonFeedApi = {
  listPosts: (salonId: string, params?: { limit?: number; offset?: number }) =>
    api.get<SalonPostListResult>(`/salons/${salonId}/posts`, { params }),
  createPost: (salonId: string, data: SalonPostCreatePayload) =>
    api.post<SalonPost>(`/salons/${salonId}/posts`, data),
  getPost: (salonId: string, postId: string) =>
    api.get<SalonPost>(`/salons/${salonId}/posts/${postId}`),
  updatePost: (salonId: string, postId: string, data: SalonPostUpdatePayload) =>
    api.patch<SalonPost>(`/salons/${salonId}/posts/${postId}`, data),
  deletePost: (salonId: string, postId: string) =>
    api.delete(`/salons/${salonId}/posts/${postId}`),
  listComments: (salonId: string, postId: string, params?: { limit?: number; offset?: number }) =>
    api.get<SalonCommentListResult>(`/salons/${salonId}/posts/${postId}/comments`, { params }),
  createComment: (salonId: string, postId: string, data: SalonCommentCreatePayload) =>
    api.post<SalonComment>(`/salons/${salonId}/posts/${postId}/comments`, data),
  updateComment: (salonId: string, postId: string, commentId: string, data: SalonCommentUpdatePayload) =>
    api.patch<SalonComment>(`/salons/${salonId}/posts/${postId}/comments/${commentId}`, data),
  deleteComment: (salonId: string, postId: string, commentId: string) =>
    api.delete(`/salons/${salonId}/posts/${postId}/comments/${commentId}`),
  toggleLike: (salonId: string, postId: string) =>
    api.post<SalonPostLikeResult>(`/salons/${salonId}/posts/${postId}/like`, {}),
};

export const salonEventApi = {
  listEvents: (salonId: string, params?: { limit?: number; offset?: number }) =>
    api.get<SalonEventListResult>(`/salons/${salonId}/events`, { params }),
  createEvent: (salonId: string, data: SalonEventCreatePayload) =>
    api.post<SalonEvent>(`/salons/${salonId}/events`, data),
  getEvent: (salonId: string, eventId: string) =>
    api.get<SalonEvent>(`/salons/${salonId}/events/${eventId}`),
  updateEvent: (salonId: string, eventId: string, data: SalonEventUpdatePayload) =>
    api.patch<SalonEvent>(`/salons/${salonId}/events/${eventId}`, data),
  deleteEvent: (salonId: string, eventId: string) =>
    api.delete(`/salons/${salonId}/events/${eventId}`),
  listAttendees: (salonId: string, eventId: string, params?: { limit?: number; offset?: number }) =>
    api.get<SalonEventAttendeeListResult>(`/salons/${salonId}/events/${eventId}/attendees`, { params }),
  attendEvent: (salonId: string, eventId: string, data?: SalonEventAttendPayload) =>
    api.post(`/salons/${salonId}/events/${eventId}/attend`, data ?? {}),
  cancelAttendance: (salonId: string, eventId: string) =>
    api.delete(`/salons/${salonId}/events/${eventId}/attend`),
};

export const salonAssetApi = {
  listAssets: (
    salonId: string,
    params?: { limit?: number; offset?: number; visibility?: string; asset_type?: string },
  ) => api.get<SalonAssetListResult>(`/salons/${salonId}/assets`, { params }),

  uploadAsset: (salonId: string, payload: SalonAssetUploadPayload) => {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.title) formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.asset_type) formData.append('asset_type', payload.asset_type);
    if (payload.visibility) formData.append('visibility', payload.visibility);
    if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail);

    return api.post<SalonAsset>(`/salons/${salonId}/assets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateAsset: (salonId: string, assetId: string, data: SalonAssetMetadataPayload) =>
    api.patch<SalonAsset>(`/salons/${salonId}/assets/${assetId}`, data),

  deleteAsset: (salonId: string, assetId: string) =>
    api.delete(`/salons/${salonId}/assets/${assetId}`),
};

export const salonAnnouncementApi = {
  listAnnouncements: (
    salonId: string,
    params?: { limit?: number; offset?: number; include_unpublished?: boolean },
  ) => api.get<SalonAnnouncementListResult>(`/salons/${salonId}/announcements`, { params }),

  createAnnouncement: (salonId: string, data: SalonAnnouncementCreatePayload) =>
    api.post<SalonAnnouncement>(`/salons/${salonId}/announcements`, data),

  updateAnnouncement: (salonId: string, announcementId: string, data: SalonAnnouncementUpdatePayload) =>
    api.patch<SalonAnnouncement>(`/salons/${salonId}/announcements/${announcementId}`, data),

  deleteAnnouncement: (salonId: string, announcementId: string) =>
    api.delete(`/salons/${salonId}/announcements/${announcementId}`),
};

export const salonRoleApi = {
  listRoles: (salonId: string, params?: { limit?: number; offset?: number }) =>
    api.get<SalonRoleListResult>(`/salons/${salonId}/roles`, { params }),

  createRole: (salonId: string, data: SalonRoleCreatePayload) =>
    api.post<SalonRole>(`/salons/${salonId}/roles`, data),

  updateRole: (salonId: string, roleId: string, data: SalonRoleUpdatePayload) =>
    api.patch<SalonRole>(`/salons/${salonId}/roles/${roleId}`, data),

  deleteRole: (salonId: string, roleId: string) =>
    api.delete(`/salons/${salonId}/roles/${roleId}`),

  assignRole: (salonId: string, roleId: string, data: SalonRoleAssignPayload) =>
    api.post(`/salons/${salonId}/roles/${roleId}/assign`, data),

  unassignRole: (salonId: string, roleId: string, userId: string) =>
    api.delete(`/salons/${salonId}/roles/${roleId}/assign/${userId}`),
};

// 管理者API
export const adminApi = {
  grantPoints: (data: { user_id: string; amount: number; description?: string }) =>
    api.post('/admin/points/grant', data),
  
  searchUsers: (params?: { query?: string; user_type?: string; limit?: number; offset?: number }) =>
    api.get('/admin/users/search', { params }),

  listUsers: (params?: { search?: string; user_type?: string; limit?: number; offset?: number }) =>
    api.get('/admin/users', { params }),

  getUserDetail: (userId: string) =>
    api.get(`/admin/users/${userId}`),

  blockUser: (userId: string, data?: { reason?: string }) =>
    api.post(`/admin/users/${userId}/block`, data ?? {}),

  unblockUser: (userId: string) =>
    api.post(`/admin/users/${userId}/unblock`, {}),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),

  unpublishUserNote: (userId: string, noteId: string, data?: { reason?: string }) =>
    api.post(`/admin/users/${userId}/notes/${noteId}/unpublish`, data ?? {}),

  deleteUserNote: (userId: string, noteId: string, data?: { reason?: string }) =>
    api.post(`/admin/users/${userId}/notes/${noteId}/delete`, data ?? {}),

  listMarketplaceLPs: (params?: { status?: string; search?: string; limit?: number; offset?: number }) =>
    api.get('/admin/marketplace/lps', { params }),

  updateLPStatus: (lpId: string, data: { status: 'published' | 'archived'; reason?: string }) =>
    api.post(`/admin/marketplace/lps/${lpId}/status`, data),

  getPointAnalytics: (params?: { date_from?: string; date_to?: string; limit_days?: number }) =>
    api.get('/admin/analytics/points', { params }),

  getModerationLogs: (params?: { limit?: number }) =>
    api.get('/admin/moderation/logs', { params }),

  listAnnouncements: (params?: { include_unpublished?: boolean; limit?: number; offset?: number }) =>
    api.get('/admin/announcements', { params }),

  createAnnouncement: (data: { title: string; summary: string; body: string; published_at?: string; is_published?: boolean; highlight?: boolean }) =>
    api.post('/admin/announcements', data),

  updateAnnouncement: (announcementId: string, data: { title?: string; summary?: string; body?: string; published_at?: string; is_published?: boolean; highlight?: boolean }) =>
    api.put(`/admin/announcements/${announcementId}`, data),

  deleteAnnouncement: (announcementId: string) =>
    api.delete(`/admin/announcements/${announcementId}`),
};

export const announcementApi = {
  list: (params?: { limit?: number }) =>
    api.get('/announcements', { params }),

  get: (announcementId: string) =>
    api.get(`/announcements/${announcementId}`),
};

// AI API
export const aiApi = {
  wizard: (data: AIWizardRequest) =>
    api.post('/ai/wizard', data),
  
  generateText: (data: AITextGenerationRequest) =>
    api.post<{ generated_text: string[] }>('/ai/generate-text', data),
  
  improve: (data: AIImprovementRequest) =>
    api.post<AIImprovementResponse>('/ai/improve', data),
  
  getTemplates: () =>
    api.get('/ai/templates'),
  
  getCtaStyles: () =>
    api.get('/ai/cta-styles'),
};

// 公開API（認証不要）
export const publicApi = {
  getLP: (
    slug: string,
    options?: { trackView?: boolean; sessionId?: string }
  ) =>
    axios.get(`${API_URL}/public/${slug}`, {
      params: {
        track_view: options?.trackView ?? undefined,
        session_id: options?.sessionId ?? undefined,
      },
    }),
  
  getUserProfile: (username: string) =>
    axios.get(`${API_URL}/public/users/${username}`),
  
  recordStepView: (slug: string, data: { step_id: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/step-view`, data),
  
  recordStepExit: (slug: string, data: { step_id: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/step-exit`, data),
  
  recordCtaClick: (slug: string, data: { cta_id?: string; step_id?: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/cta-click`, data),
  
  submitEmail: (slug: string, data: { email: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/submit-email`, data),
  
  confirmLine: (slug: string, data: { line_user_id?: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/confirm-line`, data),
  
  getRequiredActions: (slug: string, sessionId?: string) =>
    axios.get(`${API_URL}/public/${slug}/required-actions`, {
      params: sessionId ? { session_id: sessionId } : undefined,
    }),

  listNotes: (params?: { limit?: number; offset?: number; search?: string; categories?: string[]; author_username?: string }) =>
    axios.get<PublicNoteListResult>(`${API_URL}/notes/public`, { params }),

  getNote: (slug: string, options?: { accessToken?: string }) =>
    axios.get<PublicNoteDetail>(`${API_URL}/notes/public/${slug}`, {
      headers: options?.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : undefined,
    }),
};
