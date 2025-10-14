// ユーザー型
export interface User {
  id: string;
  email: string;
  username: string;
  user_type: 'seller' | 'buyer';
  point_balance: number;
  created_at: string;
}

// 認証レスポンス
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// LP型
export interface LandingPage {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  swipe_direction: 'vertical' | 'horizontal';
  is_fullscreen: boolean;
  total_views: number;
  total_cta_clicks: number;
  created_at: string;
  updated_at: string;
}

// LPステップ型
export interface LPStep {
  id: string;
  lp_id: string;
  step_order: number;
  image_url: string;
  video_url?: string;
  animation_type?: string;
  step_views: number;
  step_exits: number;
  created_at: string;
}

// CTA型
export interface CTA {
  id: string;
  lp_id: string;
  step_id?: string;
  cta_type: 'link' | 'form' | 'product' | 'newsletter' | 'line';
  button_image_url: string;
  button_position: 'top' | 'bottom' | 'floating';
  link_url?: string;
  is_required: boolean;
  click_count: number;
  created_at: string;
}

// LP詳細型
export interface LPDetail extends LandingPage {
  steps: LPStep[];
  ctas: CTA[];
  public_url: string;
}

// 商品型
export interface Product {
  id: string;
  seller_id: string;
  lp_id?: string;
  title: string;
  description?: string;
  price_in_points: number;
  stock_quantity?: number;
  is_available: boolean;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

// ポイント残高型
export interface PointBalance {
  user_id: string;
  username: string;
  point_balance: number;
  last_updated: string;
}

// トランザクション型
export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  related_product_id?: string;
  description?: string;
  created_at: string;
}

// 分析データ型
export interface LPAnalytics {
  lp_id: string;
  title: string;
  slug: string;
  status: string;
  total_views: number;
  total_cta_clicks: number;
  total_sessions: number;
  cta_conversion_rate: number;
  step_funnel: StepFunnelData[];
  cta_clicks: CTAClickData[];
  period_start?: string;
  period_end?: string;
}

export interface StepFunnelData {
  step_id: string;
  step_order: number;
  step_views: number;
  step_exits: number;
  conversion_rate: number;
}

export interface CTAClickData {
  cta_id: string;
  cta_type: string;
  click_count: number;
}

// 必須アクション型
export interface RequiredAction {
  id: string;
  action_type: 'email' | 'line' | 'form';
  step_id?: string;
  is_required: boolean;
  action_config?: any;
}

export interface RequiredActionsStatus {
  lp_id: string;
  session_id?: string;
  required_actions: RequiredAction[];
  completed_actions: string[];
  all_completed: boolean;
}
