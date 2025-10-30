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
  last_login_at?: string | null;
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
  product_type: 'points' | 'salon';
  salon_id?: string | null;
  title: string;
  description?: string;
  price_in_points: number;
  stock_quantity?: number;
  is_available: boolean;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

export type NoteStatus = 'draft' | 'published';
export type NoteAccessLevel = 'public' | 'paid';
export type NoteBlockType = 'paragraph' | 'heading' | 'quote' | 'image' | 'divider' | 'list' | 'link';

export interface NoteBlock {
  id?: string;
  type: NoteBlockType;
  access: NoteAccessLevel;
  data: Record<string, unknown>;
}

export interface NoteSummary {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  cover_image_url?: string | null;
  excerpt?: string | null;
  is_paid: boolean;
  price_points: number;
  status: NoteStatus;
  published_at?: string | null;
  updated_at: string;
  categories: string[];
  allow_share_unlock?: boolean;
  official_share_tweet_id?: string | null;
  official_share_tweet_url?: string | null;
  official_share_x_user_id?: string | null;
  official_share_x_username?: string | null;
  official_share_set_at?: string | null;
}

export interface NoteDetail extends NoteSummary {
  content_blocks: NoteBlock[];
  salon_access_ids: string[];
}

export interface NoteListResult {
  data: NoteSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface NoteMetricsTopNote {
  note_id: string;
  title: string;
  slug?: string | null;
  purchase_count: number;
  points_earned: number;
}

export interface NoteMetrics {
  total_notes: number;
  published_notes: number;
  draft_notes: number;
  paid_notes: number;
  free_notes: number;
  total_sales_count: number;
  total_sales_points: number;
  monthly_sales_count: number;
  monthly_sales_points: number;
  recent_published_count: number;
  average_paid_price: number;
  latest_published_at?: string | null;
  top_categories: string[];
  top_note?: NoteMetricsTopNote | null;
}

export interface PublicNoteSummary {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string | null;
  excerpt?: string | null;
  is_paid: boolean;
  price_points: number;
  author_username?: string | null;
  published_at?: string | null;
  categories: string[];
  allow_share_unlock?: boolean;
  official_share_tweet_id?: string | null;
  official_share_tweet_url?: string | null;
  official_share_x_username?: string | null;
}

export interface PublicNoteListResult {
  data: PublicNoteSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface PublicNoteDetail {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  author_username?: string | null;
  cover_image_url?: string | null;
  excerpt?: string | null;
  is_paid: boolean;
  price_points: number;
  has_access: boolean;
  content_blocks: NoteBlock[];
  published_at?: string | null;
  categories: string[];
  allow_share_unlock?: boolean;
  official_share_tweet_id?: string | null;
  official_share_tweet_url?: string | null;
  official_share_x_username?: string | null;
  official_share_x_user_id?: string | null;
  official_share_set_at?: string | null;
  salon_access_ids: string[];
}

export interface NotePurchaseResult {
  note_id: string;
  points_spent: number;
  remaining_points: number;
  purchased_at: string;
}

export interface NoteCreateRequest {
  title: string;
  cover_image_url?: string | null;
  excerpt?: string | null;
  content_blocks: NoteBlock[];
  is_paid: boolean;
  price_points?: number | null;
  categories: string[];
  salon_ids: string[];
}

export interface NoteUpdateRequest {
  title?: string;
  cover_image_url?: string | null;
  excerpt?: string | null;
  content_blocks?: NoteBlock[];
  is_paid?: boolean;
  price_points?: number | null;
  categories?: string[];
  salon_ids?: string[];
}

export interface OfficialShareConfig {
  note_id: string;
  tweet_id?: string | null;
  tweet_url?: string | null;
  tweet_text?: string | null;
  author_x_user_id?: string | null;
  author_x_username?: string | null;
  configured_at?: string | null;
}

export interface Salon {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  subscription_plan_id: string;
  subscription_external_id?: string | null;
  is_active: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface SalonListResult {
  data: Salon[];
}

export interface SalonMember {
  id: string;
  salon_id: string;
  user_id: string;
  status: string;
  recurrent_payment_id?: string | null;
  subscription_session_external_id?: string | null;
  last_event_type?: string | null;
  joined_at: string;
  last_charged_at?: string | null;
  next_charge_at?: string | null;
  canceled_at?: string | null;
}

export interface SalonMemberListResult {
  data: SalonMember[];
  total: number;
  limit: number;
  offset: number;
}

export interface NoteSalonAccessResponse {
  salon_ids: string[];
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
  total_note_count: number;
  published_note_count: number;
  latest_note_title?: string | null;
  latest_note_updated_at?: string | null;
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

export interface AdminUserNote {
  id: string;
  title: string;
  status: NoteStatus;
  slug: string;
  is_paid: boolean;
  price_points: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  total_purchases: number;
  categories: string[];
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
  notes: AdminUserNote[];
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
