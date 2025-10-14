// API レスポンス型定義
// Note: 既存のtypes/index.tsの型を使用することを推奨

export type {
  User,
  AuthResponse,
  LandingPage as LP,
  LPDetail,
  LPStep,
  CTA,
} from './index';

export interface PointsBalance {
  point_balance: number;
}

export interface AIWizardRequest {
  product_name: string;
  business_type: string;
  target_audience: string;
  key_features: string[];
  goal: string;
}

export interface AITextGenerationRequest {
  type: 'headline' | 'subtitle' | 'description' | 'cta';
  context: {
    product?: string;
    target?: string;
    business?: string;
    goal?: string;
    headline?: string;
    features?: string[];
  };
  options?: {
    count?: number;
  };
}

export interface AIImprovementRequest {
  lp_id: string;
  analytics_data: {
    total_views: number;
    cta_conversion_rate: number;
    step_funnel: Array<{
      step: number;
      views: number;
      exits: number;
    }>;
  };
}

export interface AIImprovementSuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  expected_impact: string;
}

export interface AIImprovementResponse {
  suggestions: AIImprovementSuggestion[];
  overall_score: number;
  reasoning: string;
}

export interface CreateLPRequest {
  title: string;
  slug: string;
  description?: string;
  swipe_direction: 'vertical' | 'horizontal';
  is_fullscreen: boolean;
}

export interface UpdateLPRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
}

// LP一覧レスポンス
export interface LPListResponse {
  data: LP[];
  total: number;
  limit: number;
  offset: number;
}

// API エラーレスポンス
export interface APIError {
  detail: string;
}
