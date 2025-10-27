// ユーザー型
export interface User {
  id: string;
  email: string;
  username: string;
  user_type: 'seller' | 'buyer';
  point_balance: number;
  created_at: string;
  bio?: string | null;
  sns_url?: string | null;
  line_url?: string | null;
  profile_image_url?: string | null;
}

export interface PublicUserProfile {
  username: string;
  bio?: string | null;
  sns_url?: string | null;
  line_url?: string | null;
  profile_image_url?: string | null;
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
  user_id?: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  swipe_direction: 'vertical' | 'horizontal';
  is_fullscreen: boolean;
  show_swipe_hint: boolean;
  fullscreen_media: boolean;
  floating_cta: boolean;
  total_views: number;
  total_cta_clicks: number;
  product_id?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_image_url?: string | null;
  meta_site_name?: string | null;
  custom_theme_hex?: string | null;
  custom_theme_shades?: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  // ユーザー情報（APIレスポンスに含まれる場合）
  owner?: { username?: string; email?: string } | null;
  user?: { username?: string; email?: string } | null;
  seller_username?: string | null;
  username?: string | null;
}

// LPステップ型
export interface LPStep {
  id: string;
  lp_id: string;
  step_order: number;
  image_url: string;
  video_url?: string;
  animation_type?: string;
  block_type?: string;
  content_data?: Record<string, any>;
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
  cta_id?: string | null;
  step_id?: string | null;
  cta_type?: string | null;
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

export interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
  user_type: 'seller' | 'buyer';
  point_balance: number;
  created_at: string;
  is_blocked: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
  total_lp_count: number;
  line_connected?: boolean;
  line_display_name?: string | null;
  line_bonus_awarded?: boolean;
  total_product_count: number;
  total_point_purchased: number;
  total_point_spent: number;
  total_point_granted: number;
  latest_activity?: string | null;
}

export interface AdminPointTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description?: string | null;
  created_at: string;
  related_product_id?: string | null;
}

export interface AdminUserLandingPage {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  slug: string;
  total_views: number;
  total_cta_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserPurchase {
  transaction_id: string;
  product_id?: string | null;
  product_title?: string | null;
  amount: number;
  created_at: string;
  description?: string | null;
}

export interface AdminUserDetail extends AdminUserSummary {
  transactions: AdminPointTransaction[];
  landing_pages: AdminUserLandingPage[];
  purchase_history: AdminUserPurchase[];
}

export interface AdminMarketplaceLP {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  seller_id: string;
  seller_username: string;
  seller_email: string;
  total_views: number;
  total_cta_clicks: number;
  created_at: string;
  updated_at: string;
  product_count: number;
}

export interface AdminPointAnalyticsTotals {
  purchased: number;
  spent: number;
  granted: number;
  other: number;
  net: number;
}

export interface AdminPointAnalyticsBreakdown {
  label: string;
  purchased: number;
  spent: number;
  granted: number;
  other: number;
  net: number;
}

export interface AdminPointAnalytics {
  totals: AdminPointAnalyticsTotals;
  daily: AdminPointAnalyticsBreakdown[];
  monthly: AdminPointAnalyticsBreakdown[];
}

export interface ModerationEvent {
  id: string;
  action: string;
  reason?: string | null;
  target_lp_id?: string | null;
  target_user_id?: string | null;
  performed_by?: string | null;
  performed_by_username?: string | null;
  performed_by_email?: string | null;
  created_at: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  summary: string;
  body: string;
  is_published: boolean;
  highlight: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  created_by_email?: string | null;
  created_by_username?: string | null;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  summary: string;
  body: string;
  highlight: boolean;
  published_at: string;
}
