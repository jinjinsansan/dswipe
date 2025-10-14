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
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  register: (data: { email: string; username: string; password: string; user_type: 'seller' | 'buyer' }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
};

// LP管理API
export const lpApi = {
  create: (data: CreateLPRequest) =>
    api.post<LP>('/lp', data),
  
  list: (params?: Record<string, unknown>) =>
    api.get<LP[]>('/lp', { params }),
  
  get: (id: string) =>
    api.get<LPDetail>(`/lp/${id}`),
  
  update: (id: string, data: UpdateLPRequest) =>
    api.put<LP>(`/lp/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/lp/${id}`),
  
  publish: (id: string) =>
    api.post(`/lp/${id}/publish`),
  
  // ステップ管理
  addStep: (lpId: string, data: any) =>
    api.post(`/lp/${lpId}/steps`, data),
  
  updateStep: (lpId: string, stepId: string, data: any) =>
    api.put(`/lp/${lpId}/steps/${stepId}`, data),
  
  deleteStep: (lpId: string, stepId: string) =>
    api.delete(`/lp/${lpId}/steps/${stepId}`),
  
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
  getLP: (slug: string) =>
    axios.get(`${API_URL}/public/${slug}`),
  
  recordStepView: (slug: string, data: { step_id: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/step-view`, data),
  
  recordStepExit: (slug: string, data: { step_id: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/step-exit`, data),
  
  recordCtaClick: (slug: string, data: { cta_id: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/cta-click`, data),
  
  submitEmail: (slug: string, data: { email: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/submit-email`, data),
  
  confirmLine: (slug: string, data: { line_user_id?: string; session_id?: string }) =>
    axios.post(`${API_URL}/public/${slug}/confirm-line`, data),
  
  getRequiredActions: (slug: string, sessionId?: string) =>
    axios.get(`${API_URL}/public/${slug}/required-actions`, {
      params: sessionId ? { session_id: sessionId } : undefined,
    }),
};
