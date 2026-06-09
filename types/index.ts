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

// ===== 管理者パネル型（バックエンド api.d-swipe.com のスキーマに準拠）=====

// ユーザー一覧の各行
export interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
  user_type: string;
  point_balance: number;
  created_at: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
  total_lp_count: number;
  total_product_count: number;
  total_point_purchased: number;
  total_point_spent: number;
  total_point_granted: number;
  latest_activity: string | null;
  line_connected: boolean;
  line_display_name: string | null;
  line_bonus_awarded: boolean;
  total_note_count: number;
  published_note_count: number;
  latest_note_title: string | null;
  latest_note_updated_at: string | null;
  billing_full_name: string | null;
  billing_email: string | null;
  billing_phone_number: string | null;
  billing_updated_at: string | null;
}

export interface AdminUserListResponse {
  data: AdminUserSummary[];
  total: number;
}

// ユーザー詳細に含まれるネスト型
export interface AdminPointTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  created_at: string;
  related_product_id: string | null;
}

export interface AdminUserLandingPage {
  id: string;
  title: string;
  status: string;
  slug: string;
  total_views: number;
  total_cta_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserPurchase {
  transaction_id: string;
  product_id: string | null;
  product_title: string | null;
  amount: number;
  created_at: string;
  description: string | null;
}

export interface AdminUserNote {
  id: string;
  title: string;
  status: string;
  slug: string;
  is_paid: boolean;
  price_points: number;
  editor_type?: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  total_purchases?: number;
  categories?: string[];
}

export interface AdminUserDetail {
  id: string;
  username: string;
  email: string;
  user_type: string;
  point_balance: number;
  created_at: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
  total_lp_count: number;
  total_product_count: number;
  total_point_purchased: number;
  total_point_spent: number;
  total_point_granted: number;
  latest_activity: string | null;
  line_connected: boolean;
  line_display_name: string | null;
  line_bonus_awarded: boolean;
  total_note_count: number;
  published_note_count: number;
  latest_note_title: string | null;
  latest_note_updated_at: string | null;
  billing_full_name: string | null;
  billing_email: string | null;
  billing_phone_number: string | null;
  billing_updated_at: string | null;
  transactions: AdminPointTransaction[];
  landing_pages: AdminUserLandingPage[];
  purchase_history: AdminUserPurchase[];
  notes: AdminUserNote[];
}

// マーケット監視
export interface AdminMarketplaceLP {
  id: string;
  title: string;
  slug: string;
  status: string;
  seller_id: string;
  seller_username: string;
  seller_email: string;
  total_views: number;
  total_cta_clicks: number;
  created_at: string;
  updated_at: string;
  product_count: number;
}

export interface AdminMarketplaceResponse {
  data: AdminMarketplaceLP[];
  total: number;
}

// ポイント分析
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

// モデレーションログ
export interface ModerationEvent {
  id: string;
  action: string;
  reason: string | null;
  target_user_id: string | null;
  target_lp_id: string | null;
  performed_by: string | null;
  performed_by_username: string | null;
  performed_by_email: string | null;
  created_at: string;
}

export interface ModerationLogListResponse {
  data: ModerationEvent[];
}

// お知らせ管理
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
  created_by: string | null;
  created_by_email: string | null;
  created_by_username: string | null;
}

export interface AdminAnnouncementListResponse {
  data: AdminAnnouncement[];
  total: number;
}

export interface AnnouncementCreateRequest {
  title: string;
  summary: string;
  body: string;
  published_at?: string | null;
  is_published?: boolean;
  highlight?: boolean;
}

export interface AnnouncementUpdateRequest {
  title?: string | null;
  summary?: string | null;
  body?: string | null;
  published_at?: string | null;
  is_published?: boolean | null;
  highlight?: boolean | null;
}
