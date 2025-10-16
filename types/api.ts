// API レスポンス型定義
// Note: 既存のtypes/index.tsの型を使用することを推奨

import type { LandingPage } from './index';

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

export interface AIGenerationRequest {
  theme?: string;
  outline?: string[];
  product: {
    name: string;
    description?: string;
    category?: string;
    pricePoint?: string;
    keyBenefits?: string[];
  };
  audience?: {
    persona?: string;
    painPoints?: string[];
    desiredOutcome?: string;
  };
  goals?: string[];
  requiredBlocks?: Array<{ type: string; mustInclude?: boolean }>;
}

export interface AIGenerationResponse {
  theme: string;
  palette: {
    primary: string;
    accent: string;
    secondary?: string;
    background: string;
    surface: string;
    text: string;
  };
  outline: string[];
  blocks: Array<{
    blockType: string;
    content: Record<string, unknown>;
    reason?: string;
  }>;
}

export interface AIReviewRequest {
  theme?: string;
  blocks: Array<{
    blockType: string;
    content: Record<string, unknown>;
  }>;
}

export interface AIReviewIssue {
  severity: 'info' | 'warn' | 'error';
  message: string;
  target: {
    blockIndex: number;
    field?: string;
  };
}

export interface AIReviewResponse {
  score: number;
  issues: AIReviewIssue[];
  suggestions: string[];
}

export interface CreateLPRequest {
  title: string;
  slug: string;
  description?: string;
  swipe_direction: 'vertical' | 'horizontal';
  is_fullscreen: boolean;
  show_swipe_hint?: boolean;
  fullscreen_media?: boolean;
  floating_cta?: boolean;
  product_id?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_image_url?: string | null;
  meta_site_name?: string | null;
}

export interface UpdateLPRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
  swipe_direction?: 'vertical' | 'horizontal';
  is_fullscreen?: boolean;
  show_swipe_hint?: boolean;
  fullscreen_media?: boolean;
  floating_cta?: boolean;
  product_id?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_image_url?: string | null;
  meta_site_name?: string | null;
  custom_theme_hex?: string | null;
  custom_theme_shades?: Record<string, string> | null;
}

// LP一覧レスポンス
export interface LPListResponse {
  data: LandingPage[];
  total: number;
  limit: number;
  offset: number;
}

// API エラーレスポンス
export interface APIError {
  detail: string;
}
