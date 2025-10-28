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
  create: (data: any) =>
    api.post('/products', data),
  
  list: (params?: any) =>
    api.get('/products', { params }),
  
  get: (id: string) =>
    api.get(`/products/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/products/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/products/${id}`),
  
  purchase: (id: string, data: { quantity: number }) =>
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

  purchase: (noteId: string) =>
    api.post<NotePurchaseResult>(`/notes/${noteId}/purchase`),

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
