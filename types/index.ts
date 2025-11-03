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
  salon_id?: string | null;
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

export interface LinkedSalonSummary {
  id: string;
  title: string;
  public_path: string;
  category?: string | null;
  owner_username?: string | null;
  thumbnail_url?: string | null;
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
  content_data?: Record<string, unknown>;
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
  linked_salon?: LinkedSalonSummary | null;
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
  price_jpy?: number | null;
  allow_point_purchase: boolean;
  allow_jpy_purchase: boolean;
  tax_rate?: number | null;
  tax_inclusive: boolean;
  stock_quantity?: number | null;
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
  price_jpy?: number | null;
  allow_point_purchase: boolean;
  allow_jpy_purchase: boolean;
  tax_rate?: number | null;
  tax_inclusive: boolean;
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
  price_jpy?: number | null;
  allow_point_purchase: boolean;
  allow_jpy_purchase: boolean;
  tax_rate?: number | null;
  tax_inclusive: boolean;
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
  price_jpy?: number | null;
  allow_point_purchase: boolean;
  allow_jpy_purchase: boolean;
  tax_rate?: number | null;
  tax_inclusive: boolean;
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
  amount_jpy?: number | null;
  purchased_at: string;
  payment_method: 'points' | 'yen';
  payment_status: 'completed' | 'pending';
  checkout_url?: string | null;
  external_id?: string | null;
}

export interface NoteCreateRequest {
  title: string;
  cover_image_url?: string | null;
  excerpt?: string | null;
  content_blocks: NoteBlock[];
  is_paid: boolean;
  price_points?: number | null;
  price_jpy?: number | null;
  allow_point_purchase?: boolean;
  allow_jpy_purchase?: boolean;
  tax_rate?: number | null;
  tax_inclusive?: boolean;
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
  price_jpy?: number | null;
  allow_point_purchase?: boolean;
  allow_jpy_purchase?: boolean;
  tax_rate?: number | null;
  tax_inclusive?: boolean;
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
  category?: string | null;
  subscription_plan_id: string;
  subscription_external_id?: string | null;
  monthly_price_jpy?: number | null;
  allow_point_subscription: boolean;
  allow_jpy_subscription: boolean;
  tax_rate?: number | null;
  tax_inclusive: boolean;
  is_active: boolean;
  status?: string;
  moderation_notes?: string | null;
  member_count: number;
  lp_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalonListResult {
  data: Salon[];
}

export interface SalonPublicOwner {
  id: string;
  username: string;
  display_name?: string | null;
  profile_image_url?: string | null;
}

export interface SalonPublicPlan {
  key: string;
  label: string;
  points: number;
  usd_amount: number;
  subscription_plan_id: string;
  monthly_price_jpy?: number | null;
  allow_point_subscription: boolean;
  allow_jpy_subscription: boolean;
  tax_rate?: number | null;
  tax_inclusive: boolean;
}

export interface SalonPublicDetail {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  is_active: boolean;
  owner: SalonPublicOwner;
  plan: SalonPublicPlan;
  member_count: number;
  is_member: boolean;
  membership_status?: string | null;
  allow_point_subscription: boolean;
  allow_jpy_subscription: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalonPublicListItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  owner_username: string;
  owner_display_name?: string | null;
  owner_profile_image_url?: string | null;
  plan_label: string;
  plan_points: number;
  plan_usd_amount: number;
  monthly_price_jpy?: number | null;
  allow_jpy_subscription: boolean;
  created_at: string;
}

export interface SalonPublicListResult {
  data: SalonPublicListItem[];
  total: number;
  limit: number;
  offset: number;
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

export interface SalonPost {
  id: string;
  salon_id: string;
  user_id: string;
  title?: string | null;
  body: string;
  is_pinned: boolean;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  created_at: string;
  updated_at: string;
  author_username?: string | null;
}

export interface SalonPostListResult {
  data: SalonPost[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonComment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  author_username?: string | null;
}

export interface SalonCommentListResult {
  data: SalonComment[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonPostLikeResult {
  post_id: string;
  user_id: string;
  liked: boolean;
  like_count: number;
}

export interface SalonEvent {
  id: string;
  salon_id: string;
  organizer_id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  is_public: boolean;
  capacity?: number | null;
  attendee_count: number;
  is_attending: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalonEventListResult {
  data: SalonEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonEventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  username?: string | null;
}

export interface SalonEventAttendeeListResult {
  data: SalonEventAttendee[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonAsset {
  id: string;
  salon_id: string;
  uploader_id: string;
  asset_type: string;
  title?: string | null;
  description?: string | null;
  file_url: string;
  thumbnail_url?: string | null;
  content_type: string;
  file_size: number;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface SalonAssetListResult {
  data: SalonAsset[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonAssetUploadPayload {
  file: File;
  title?: string | null;
  description?: string | null;
  asset_type?: string | null;
  visibility?: string | null;
  thumbnail?: File | null;
}

export interface SalonAssetMetadataPayload {
  title?: string | null;
  description?: string | null;
  asset_type?: string | null;
  visibility?: string | null;
}

export interface SalonAnnouncement {
  id: string;
  salon_id: string;
  author_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_published: boolean;
  start_at?: string | null;
  end_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalonAnnouncementListResult {
  data: SalonAnnouncement[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonAnnouncementCreatePayload {
  title: string;
  body: string;
  is_pinned?: boolean;
  is_published?: boolean;
  start_at?: string | null;
  end_at?: string | null;
}

export interface SalonAnnouncementUpdatePayload {
  title?: string | null;
  body?: string | null;
  is_pinned?: boolean | null;
  is_published?: boolean | null;
  start_at?: string | null;
  end_at?: string | null;
}

export interface SalonRole {
  id: string;
  salon_id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  manage_feed: boolean;
  manage_events: boolean;
  manage_assets: boolean;
  manage_announcements: boolean;
  manage_members: boolean;
  manage_roles: boolean;
  assigned_member_count: number;
  created_at: string;
  updated_at: string;
}

export interface SalonRoleListResult {
  data: SalonRole[];
  total: number;
}

export interface SalonRoleCreatePayload {
  name: string;
  description?: string | null;
  is_default?: boolean;
  manage_feed?: boolean;
  manage_events?: boolean;
  manage_assets?: boolean;
  manage_announcements?: boolean;
  manage_members?: boolean;
  manage_roles?: boolean;
}

export interface SalonRoleUpdatePayload {
  name?: string | null;
  description?: string | null;
  is_default?: boolean | null;
  manage_feed?: boolean | null;
  manage_events?: boolean | null;
  manage_assets?: boolean | null;
  manage_announcements?: boolean | null;
  manage_members?: boolean | null;
  manage_roles?: boolean | null;
}

export interface SalonRoleAssignPayload {
  user_id: string;
}

// ポイント残高型
export interface PointBalance {
  user_id: string;
  username: string;
  point_balance: number;
  last_updated: string;
}

export interface PurchaseHistorySummary {
  product_purchases: number;
  note_purchases: number;
  active_salon_memberships: number;
}

export interface PurchaseHistoryProduct {
  transaction_id: string;
  product_id?: string | null;
  product_title?: string | null;
  amount_points: number;
  amount_jpy?: number | null;
  purchased_at: string;
  description?: string | null;
  seller_username?: string | null;
  seller_display_name?: string | null;
  seller_profile_image_url?: string | null;
  lp_slug?: string | null;
  payment_method: 'points' | 'yen';
}

export interface PurchaseHistoryNote {
  purchase_id: string;
  note_id: string;
  note_title?: string | null;
  note_slug?: string | null;
  cover_image_url?: string | null;
  author_username?: string | null;
  author_display_name?: string | null;
  points_spent: number;
  amount_jpy?: number | null;
  purchased_at: string;
  payment_method: 'points' | 'yen';
}

export interface PurchaseHistorySalon {
  membership_id: string;
  salon_id: string;
  salon_title?: string | null;
  salon_category?: string | null;
  salon_thumbnail_url?: string | null;
  owner_username?: string | null;
  owner_display_name?: string | null;
  plan_label?: string | null;
  plan_points?: number | null;
  plan_usd_amount?: number | null;
  joined_at: string;
  status: string;
  next_charge_at?: string | null;
  last_charged_at?: string | null;
}

export interface PurchaseHistoryResponse {
  summary: PurchaseHistorySummary;
  products: PurchaseHistoryProduct[];
  notes: PurchaseHistoryNote[];
  active_salons: PurchaseHistorySalon[];
}

export interface SalesSummary {
  product_orders: number;
  note_orders: number;
  salon_memberships: number;
  total_points_revenue: number;
  total_yen_revenue: number;
}

export interface SalesProductRecord {
  sale_id: string;
  product_id?: string | null;
  product_title?: string | null;
  buyer_id?: string | null;
  buyer_username?: string | null;
  buyer_profile_image_url?: string | null;
  payment_method: 'points' | 'yen';
  amount_points: number;
  amount_jpy?: number | null;
  purchased_at: string;
  lp_slug?: string | null;
  description?: string | null;
  clearing_state?: string | null;
  risk_level?: string | null;
  risk_score?: number | null;
  risk_factors?: Record<string, unknown> | null;
  ready_for_payout_at?: string | null;
  chargeback_hold_until?: string | null;
  dispute_flag?: boolean;
  dispute_status?: string | null;
  reserve_amount_usd?: number | null;
}

export interface SalesNoteRecord {
  sale_id: string;
  note_id: string;
  note_title?: string | null;
  note_slug?: string | null;
  buyer_id?: string | null;
  buyer_username?: string | null;
  buyer_profile_image_url?: string | null;
  payment_method: 'points' | 'yen';
  points_spent: number;
  amount_jpy?: number | null;
  purchased_at: string;
  clearing_state?: string | null;
  risk_level?: string | null;
  risk_score?: number | null;
  risk_factors?: Record<string, unknown> | null;
  ready_for_payout_at?: string | null;
  chargeback_hold_until?: string | null;
  dispute_flag?: boolean;
  dispute_status?: string | null;
  reserve_amount_usd?: number | null;
}

export interface SalesSalonRecord {
  membership_id: string;
  salon_id: string;
  salon_title?: string | null;
  buyer_id?: string | null;
  buyer_username?: string | null;
  buyer_profile_image_url?: string | null;
  status: string;
  joined_at: string;
  next_charge_at?: string | null;
  last_charged_at?: string | null;
}

export interface SalesHistoryResponse {
  summary: SalesSummary;
  products: SalesProductRecord[];
  notes: SalesNoteRecord[];
  salons: SalesSalonRecord[];
}

export interface PayoutSettings {
  user_id: string;
  usdt_address: string;
  address_label?: string | null;
  preferred_network: string;
  payout_cycle_days: number;
  address_verified_at?: string | null;
  payout_note?: string | null;
  last_reviewed_at?: string | null;
  reviewer_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PayoutLedgerSummary {
  id: string;
  period_start: string;
  period_end: string;
  settlement_due_at: string;
  status: string;
  gross_amount_usd: number;
  net_amount_usdt?: number | null;
  currency: string;
  admin_tx_hash?: string | null;
  admin_tx_confirmed_at?: string | null;
  last_status_change_at?: string | null;
}

export interface PayoutLineItem {
  id: string;
  payout_id: string;
  source_type: string;
  source_id: string;
  occurred_at?: string | null;
  description?: string | null;
  gross_amount_usd?: number | null;
  gross_amount_jpy?: number | null;
  gross_amount_points?: number | null;
  gross_amount_usdt?: number | null;
  fee_amount_usd?: number | null;
  fee_amount_usdt?: number | null;
  net_amount_usd?: number | null;
  net_amount_usdt?: number | null;
  metadata: Record<string, unknown>;
  created_at?: string | null;
}

export interface PayoutEvent {
  id: string;
  payout_id: string;
  event_type: string;
  title?: string | null;
  body?: string | null;
  actor_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PayoutLedgerEntry {
  id: string;
  seller_id: string;
  seller_username?: string | null;
  seller_email?: string | null;
  period_start: string;
  period_end: string;
  settlement_due_at: string;
  funds_expected_at?: string | null;
  payout_cycle_days: number;
  one_lat_batch_id?: string | null;
  currency: string;
  gross_amount_usd: number;
  gross_amount_usdt?: number | null;
  gross_amount_points?: number | null;
  fee_amount_usd?: number | null;
  fee_amount_usdt?: number | null;
  net_amount_usd?: number | null;
  net_amount_usdt?: number | null;
  status: string;
  seller_wallet_snapshot?: string | null;
  admin_tx_hash?: string | null;
  admin_tx_network?: string | null;
  admin_tx_memo?: string | null;
  admin_tx_confirmed_at?: string | null;
  notes?: string | null;
  metadata: Record<string, unknown>;
  last_status_change_at?: string | null;
  last_status_changed_by?: string | null;
  created_at: string;
  updated_at: string;
  line_items: PayoutLineItem[];
  events: PayoutEvent[];
}

export interface PayoutDashboardResponse {
  settings?: PayoutSettings | null;
  next_settlement_at?: string | null;
  pending_net_amount_usdt: number;
  pending_records: PayoutLedgerSummary[];
  recent_records: PayoutLedgerSummary[];
}

export interface AdminPayoutListItem {
  id: string;
  seller_id: string;
  seller_username?: string | null;
  seller_email?: string | null;
  status: string;
  net_amount_usdt?: number | null;
  gross_amount_usd: number;
  settlement_due_at: string;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPayoutListResponse {
  total: number;
  data: AdminPayoutListItem[];
}

export interface AdminRiskOrder {
  order_id: string;
  seller_id: string;
  seller_username?: string | null;
  seller_email?: string | null;
  buyer_id?: string | null;
  buyer_username?: string | null;
  amount_jpy: number;
  currency: string;
  risk_level?: string | null;
  risk_score?: number | null;
  clearing_state?: string | null;
  dispute_flag: boolean;
  dispute_status?: string | null;
  ready_for_payout_at?: string | null;
  chargeback_hold_until?: string | null;
  reserve_amount_usd?: number | null;
  created_at: string;
  completed_at?: string | null;
  metadata: Record<string, unknown>;
}

export interface AdminRiskOrderListResponse {
  total: number;
  data: AdminRiskOrder[];
}

export interface PayoutSettingsUpsertPayload {
  usdt_address: string;
  address_label?: string | null;
  preferred_network?: string | null;
  payout_note?: string | null;
}

export interface AdminPayoutGeneratePayload {
  reference_date?: string | null;
  lookback_days?: number;
  fee_percent?: number;
  min_net_threshold_usd?: number;
}

export interface AdminPayoutStatusUpdatePayload {
  status: string;
  note?: string | null;
}

export interface AdminPayoutTxRecordPayload {
  tx_hash: string;
  tx_network?: string | null;
  tx_memo?: string | null;
  confirmed_at?: string | null;
}

export interface AdminPayoutEventPayload {
  event_type: string;
  title?: string | null;
  body?: string | null;
  metadata?: Record<string, unknown>;
}

// 運営メッセージ
export interface OperatorMessageSegment {
  segment_type: string;
  segment_payload: Record<string, unknown>;
}

export interface OperatorMessage {
  id: string;
  title: string;
  body_text?: string | null;
  body_html?: string | null;
  category: string;
  priority: string;
  status: string;
  send_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  admin_hidden: boolean;
  admin_archived_at?: string | null;
  segment_summary: OperatorMessageSegment[];
}

export interface OperatorMessageListResponse {
  data: OperatorMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface OperatorMessageRecipient {
  id: string;
  message_id: string;
  user_id: string;
  title: string;
  body_text?: string | null;
  body_html?: string | null;
  category: string;
  priority: string;
  delivery_status: string;
  read_at?: string | null;
  archived: boolean;
  send_at?: string | null;
  created_at: string;
}

export interface OperatorMessageFeedResponse {
  data: OperatorMessageRecipient[];
  total: number;
  limit: number;
  offset: number;
}

export interface OperatorMessageUnreadCountResponse {
  unread_count: number;
}

export interface OperatorMessageCreatePayload {
  title: string;
  body_text?: string | null;
  body_html?: string | null;
  category?: string;
  priority?: string;
  send_at?: string | null;
  send_now?: boolean;
  target_segments?: OperatorMessageSegment[];
}

export interface OperatorMessageUpdatePayload {
  title?: string;
  body_text?: string | null;
  body_html?: string | null;
  category?: string;
  priority?: string;
  send_at?: string | null;
  target_segments?: OperatorMessageSegment[];
}

export interface OperatorMessageReadRequest {
  read: boolean;
  archive?: boolean | null;
}

export interface OperatorMessageHideRequest {
  hidden: boolean;
}

export interface OperatorMessageArchiveRequest {
  archived: boolean;
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
  action_config?: Record<string, unknown>;
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

export interface NoteModerationItem {
  id: string;
  title: string;
  status: string;
  author_id: string;
  author_username?: string | null;
  author_email?: string | null;
  author_user_type?: string | null;
  price_points?: number | null;
  price_jpy?: number | null;
  is_paid: boolean;
  allow_point_purchase: boolean;
  allow_jpy_purchase: boolean;
  total_purchases: number;
  total_shares: number;
  suspicious_shares: number;
  total_refunds: number;
  risk_score: number;
  risk_indicators: string[];
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  categories: string[];
}

export interface NoteModerationListResponse {
  data: NoteModerationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface NoteModerationDetail extends NoteModerationItem {
  excerpt?: string | null;
  content_blocks: unknown[];
  official_share_tweet_url?: string | null;
  official_share_x_username?: string | null;
}

export interface SalonModerationItem {
  id: string;
  title: string;
  status: string;
  is_active: boolean;
  owner_id: string;
  owner_username?: string | null;
  owner_email?: string | null;
  monthly_price_jpy?: number | null;
  allow_point_subscription: boolean;
  allow_jpy_subscription: boolean;
  active_members: number;
  pending_members: number;
  canceled_members: number;
  total_members: number;
  risk_score: number;
  risk_indicators: string[];
  created_at: string;
  updated_at: string;
}

export interface SalonModerationListResponse {
  data: SalonModerationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalonMemberModeration {
  id: string;
  user_id: string;
  username?: string | null;
  email?: string | null;
  status: string;
  joined_at?: string | null;
  last_charged_at?: string | null;
  next_charge_at?: string | null;
  canceled_at?: string | null;
}

export interface SalonModerationDetail extends SalonModerationItem {
  description?: string | null;
  moderation_notes?: string | null;
  owner_user_type?: string | null;
  members: SalonMemberModeration[];
  announcements_count: number;
  events_count: number;
  posts_count: number;
}

export interface SalonStatusUpdateRequest {
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  reason?: string | null;
  moderation_notes?: string | null;
}

export interface SalonMemberActionRequest {
  action: 'approve' | 'cancel';
  reason?: string | null;
}

export interface MaintenanceMode {
  id: string;
  scope: 'global' | 'lp' | 'note' | 'salon' | 'points' | 'products' | 'ai' | 'payments';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  title: string;
  message?: string | null;
  planned_start?: string | null;
  planned_end?: string | null;
  activated_at?: string | null;
  deactivated_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceModeListResponse {
  data: MaintenanceMode[];
}

export interface MaintenanceModeCreateRequest {
  scope: MaintenanceMode['scope'];
  title: string;
  message?: string | null;
  planned_start?: string | null;
  planned_end?: string | null;
}

export interface MaintenanceModeStatusUpdateRequest {
  status: MaintenanceMode['status'];
  message?: string | null;
}

export interface MaintenanceOverview {
  active: MaintenanceMode[];
  scheduled: MaintenanceMode[];
  history: MaintenanceMode[];
}

export interface SystemStatusCheck {
  id: string;
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms?: number | null;
  message?: string | null;
  checked_at: string;
  created_by?: string | null;
}

export interface SystemStatusCheckListResponse {
  data: SystemStatusCheck[];
}

export interface SystemStatusCheckCreateRequest {
  component: string;
  status: SystemStatusCheck['status'];
  response_time_ms?: number | null;
  message?: string | null;
}

export interface ShareOverviewStats {
  total_shares: number;
  total_reward_points: number;
  today_shares: number;
  this_week_shares: number;
  this_month_shares: number;
}

export interface ShareTopCreator {
  user_id: string;
  username: string;
  email: string;
  total_shares: number;
  total_reward_points: number;
}

export interface ShareTopNote {
  note_id: string;
  title: string;
  author_username: string;
  share_count: number;
  total_reward_points: number;
}

export interface ShareLogItem {
  id: string;
  note_id: string;
  note_title: string;
  author_username: string;
  shared_by_user_id: string;
  shared_by_username: string;
  tweet_id: string;
  tweet_url: string;
  shared_at: string;
  verified: boolean;
  points_amount: number;
  is_suspicious: boolean;
  ip_address?: string | null;
  admin_notes?: string | null;
}

export interface ShareFraudAlert {
  id: string;
  alert_type: string;
  severity: string;
  description?: string | null;
  note_id?: string | null;
  note_title?: string | null;
  user_id?: string | null;
  username?: string | null;
  resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface ShareRewardSettings {
  id: string;
  points_per_share: number;
  updated_by?: string | null;
  updated_at: string;
}

export interface ShareRewardSettingsUpdateRequest {
  points_per_share: number;
}
