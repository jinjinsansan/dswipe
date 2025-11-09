// API レスポンス型定義
// Note: 既存のtypes/index.tsの型を使用することを推奨

import type {
  LandingPage,
  SalonAnnouncementCreatePayload,
  SalonAnnouncementUpdatePayload,
  SalonAssetMetadataPayload,
  SalonAssetUploadPayload,
  SalonRoleAssignPayload,
  SalonRoleCreatePayload,
  SalonRoleUpdatePayload,
} from './index';

export type { LinkedSalonSummary } from './index';

export type {
  User,
  AuthResponse,
  LandingPage as LP,
  LPDetail,
  LPStep,
  CTA,
  PublicUserProfile,
  NoteBlock,
  NoteSummary,
  NoteDetail,
  NoteListResult,
  NoteMetrics,
  NoteMetricsTopNote,
  PublicNoteSummary,
  PublicNoteListResult,
  PublicNoteDetail,
  NotePurchaseResult,
  NotePurchaseStatusResponse,
  ProductOrderStatusResponse,
  NoteCreateRequest,
  NoteUpdateRequest,
  OfficialShareConfig,
  Product,
  Salon,
  SalonListResult,
  SalonPublicDetail,
  SalonPublicListItem,
  SalonPublicListResult,
  SalonPublicOwner,
  SalonPublicPlan,
  PurchaseHistoryResponse,
  PurchaseHistorySummary,
  PurchaseHistoryProduct,
  PurchaseHistoryNote,
  PurchaseHistorySalon,
  SalesHistoryResponse,
  SalesSummary,
  SalesProductRecord,
  SalesNoteRecord,
  SalesSalonRecord,
  PayoutSettings,
  PayoutDashboardResponse,
  PayoutLedgerSummary,
  PayoutLedgerEntry,
  PayoutLineItem,
  PayoutEvent,
  AdminPayoutListResponse,
  AdminPayoutListItem,
  AdminRiskOrder,
  AdminRiskOrderListResponse,
  PayoutSettingsUpsertPayload,
  AdminPayoutGeneratePayload,
  AdminPayoutStatusUpdatePayload,
  AdminPayoutTxRecordPayload,
  AdminPayoutEventPayload,
  PlatformPaymentSettings,
  PlatformPaymentSettingsUpdatePayload,
  AdminMarketplaceLP,
  FeaturedProductSummary,
  FeaturedProductListResponse,
  FeaturedNoteSummary,
  FeaturedNoteListResponse,
  FeaturedSalonSummary,
  FeaturedSalonListResponse,
  FeaturedToggleRequest,
  FeaturedToggleResponse,
  OperatorMessage,
  OperatorMessageListResponse,
  OperatorMessageSegment,
  OperatorMessageRecipient,
  OperatorMessageFeedResponse,
  OperatorMessageUnreadCountResponse,
  OperatorMessageCreatePayload,
  OperatorMessageUpdatePayload,
  OperatorMessageHideRequest,
  OperatorMessageArchiveRequest,
  OperatorMessageReadRequest,
  SalonMember,
  SalonMemberListResult,
  NoteSalonAccessResponse,
  SalonPost,
  SalonPostListResult,
  SalonComment,
  SalonCommentListResult,
  SalonPostLikeResult,
  SalonEvent,
  SalonEventListResult,
  SalonEventAttendee,
  SalonEventAttendeeListResult,
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
  SubscriptionSessionStatusResponse,
  AccountShareOwnerShare,
  AccountShareDelegateShare,
  AccountShareOwnerListResponse,
  AccountShareDelegateListResponse,
  AccountShareInviteRequest,
  AccountShareInviteResponse,
  AccountShareAcceptResponse,
  AccountAccessibleOwner,
  AccountAccessibleOwnersResponse,
  AccountShareSessionRequest,
  AccountShareSessionResponse,
} from './index';

export interface PointsBalance {
  point_balance: number;
}

export interface AIWizardBonus {
  title: string;
  description?: string;
  value?: string;
}

export interface AIWizardPrice {
  original?: string;
  special?: string;
  currency?: string;
  payment_plan?: string;
  deadline?: string;
}

export interface AIWizardGuarantee {
  headline?: string;
  description?: string;
  conditions?: string;
}

export interface AIWizardTestimonial {
  name?: string;
  role?: string;
  quote: string;
  result?: string;
}

export interface AIWizardProductDetails {
  name: string;
  description?: string;
  format?: string;
  duration?: string;
  delivery?: string;
  transformation?: string;
  promise?: string;
  key_features?: string[];
  deliverables?: string[];
}

export interface AIWizardAudienceDetails {
  persona?: string;
  desired_outcome?: string;
  pain_points?: string[];
  objections?: string[];
  aspirations?: string[];
}

export interface AIWizardOfferDetails {
  price?: AIWizardPrice;
  bonuses?: AIWizardBonus[];
  guarantee?: AIWizardGuarantee;
  call_to_action?: string;
  scarcity?: string;
}

export interface AIWizardProofDetails {
  authority_headline?: string;
  authority_name?: string;
  authority_title?: string;
  authority_bio?: string;
  achievements?: string[];
  testimonials?: AIWizardTestimonial[];
  media_mentions?: string[];
  social_proof?: string[];
}

export interface AIWizardNarrativeDetails {
  origin_story?: string;
  unique_mechanism?: string;
  roadmap?: string;
}

export interface AIWizardRequest {
  business: string;
  target: string;
  goal: string;
  theme?: string;
  tone?: string;
  language?: string;
  product: AIWizardProductDetails;
  audience: AIWizardAudienceDetails;
  offer: AIWizardOfferDetails;
  proof?: AIWizardProofDetails;
  narrative?: AIWizardNarrativeDetails;
  additional_notes?: string;
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

export interface NoteAIBlockPayload {
  id: string;
  type: string;
  access?: string | null;
  text?: string | null;
  data: Record<string, unknown>;
}

export interface NoteAIContextPayload {
  title: string;
  excerpt?: string | null;
  categories: string[];
  tone?: string | null;
  audience?: string | null;
  language: 'ja' | 'en';
  blocks: NoteAIBlockPayload[];
}

export interface NoteRewriteRequest {
  context: NoteAIContextPayload;
  target_block_id: string;
  instructions?: string;
  style_hint?: string;
}

export interface NoteRewriteMetrics {
  paragraph_count: number;
  sentence_count: number;
  length: number;
  length_ratio: number;
  bullet_count: number;
  reading_time_seconds: number;
}

export interface NoteRewriteExperiment {
  experiment_id: string;
  variant_id: string;
  cohort_id?: string | null;
  parameters: Record<string, unknown>;
}

export interface NoteRewriteQuality {
  scoring_version: string;
  evaluated_at: string;
  global_score: number;
  summary?: string | null;
  alerts: string[];
  thresholds: Record<string, boolean>;
  ready_for_release: boolean;
}

export interface NoteRewriteCompliance {
  status: 'pass' | 'caution' | 'block';
  categories: string[];
  reasons: string[];
  allow_application: boolean;
}

export interface NoteRewriteCandidate {
  id: string;
  title: string;
  revised_text: string;
  reasoning?: string | null;
  tone_applied?: string | null;
  score: number;
  metrics: NoteRewriteMetrics;
  strengths: string[];
  warnings: string[];
  compliance?: NoteRewriteCompliance | null;
}

export interface NoteRewriteResponse {
  block_id: string;
  original_text: string;
  candidates: NoteRewriteCandidate[];
  recommended_candidate_id: string;
  evaluation_notes?: string | null;
  quality?: NoteRewriteQuality | null;
  experiment?: NoteRewriteExperiment | null;
}

export type NoteRewriteFeedbackRating = 'positive' | 'neutral' | 'negative';

export interface NoteRewriteFeedbackRequest {
  block_id: string;
  candidate_id: string;
  rating: NoteRewriteFeedbackRating;
  issues?: string[];
  comment?: string;
  applied?: boolean;
  duration_seconds?: number;
  experiment_id?: string;
  variant_id?: string;
}

export interface NoteRewriteFeedbackResponse {
  status: 'ok';
}

export interface ExperimentAssignmentRequest {
  user_id?: string;
  note_id?: string;
  seed?: string;
}

export interface ExperimentAssignmentResponse {
  experiment: NoteRewriteExperiment;
}

export type NoteProofreadFocus = 'spelling' | 'style' | 'consistency';

export interface NoteProofreadRequest {
  context: NoteAIContextPayload;
  focus?: NoteProofreadFocus;
}

export interface NoteProofreadCorrection {
  block_id: string;
  original: string;
  suggestion: string;
  explanation?: string;
}

export interface NoteProofreadResponse {
  summary?: string;
  corrections: NoteProofreadCorrection[];
}

export type NoteStructureAction = 'insert' | 'reorder' | 'expand' | 'trim';

export interface NoteStructureSuggestionItem {
  title: string;
  description: string;
  action: NoteStructureAction;
  block_id?: string;
  suggested_text?: string;
}

export interface NoteStructureRequest {
  context: NoteAIContextPayload;
  desired_outcome?: string;
}

export interface NoteStructureResponse {
  outline?: string[];
  suggestions: NoteStructureSuggestionItem[];
}

export interface NoteReviewRequest {
  context: NoteAIContextPayload;
}

export type NoteReviewSeverity = 'info' | 'warn' | 'error';

export interface NoteReviewIssueItem {
  severity: NoteReviewSeverity;
  message: string;
  block_id?: string;
  field?: string;
}

export interface NoteReviewResponse {
  score: number;
  summary: string;
  issues: NoteReviewIssueItem[];
  recommended_actions: string[];
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
    templateId?: string;
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
  salon_id?: string | null;
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
  salon_id?: string | null;
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

export interface SubscriptionPlan {
  plan_key: string;
  label: string;
  points: number;
  usd_amount: number;
  subscription_plan_id: string;
}

export interface SubscriptionPlanListResponse {
  data: SubscriptionPlan[];
}

export interface SubscriptionCheckoutResponse {
  checkout_url: string;
  checkout_preference_id: string;
  external_id: string;
}

export interface SubscriptionCheckoutPayload {
  plan_key: string;
  seller_id?: string;
  seller_username?: string;
  success_path?: string;
  error_path?: string;
  metadata?: Record<string, unknown>;
  salon_id?: string;
}

export interface UserSubscription {
  id: string;
  plan_key: string;
  label: string;
  status: string;
  points_per_cycle: number;
  usd_amount: number;
  subscription_plan_id: string;
  recurrent_payment_id?: string;
  next_charge_at?: string;
  last_charge_at?: string;
  last_event_type?: string;
  seller_id?: string;
  seller_username?: string;
  salon_id?: string;
  metadata?: Record<string, unknown>;
  cancelable: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscriptionListResponse {
  data: UserSubscription[];
}

export interface ProductCreatePayload {
  lp_id?: string | null;
  title: string;
  description?: string | null;
  price_in_points?: number | null;
  price_jpy?: number | null;
  allow_point_purchase?: boolean;
  allow_jpy_purchase?: boolean;
  tax_rate?: number | null;
  tax_inclusive?: boolean;
  stock_quantity?: number | null;
  is_available?: boolean;
  redirect_url?: string | null;
  thanks_lp_id?: string | null;
  product_type?: 'points' | 'salon';
  salon_id?: string | null;
}

export type ProductUpdatePayload = Partial<ProductCreatePayload> & {
  title?: string;
};

export interface ProductPurchasePayload {
  quantity?: number;
  payment_method: 'points' | 'yen';
}

export interface NoteSalonAccessPayload {
  salon_ids: string[];
}

export interface SalonPostCreatePayload {
  title?: string | null;
  body: string;
  is_published?: boolean;
}

export interface SalonPostUpdatePayload {
  title?: string | null;
  body?: string | null;
  is_published?: boolean;
  is_pinned?: boolean;
}

export interface SalonCommentCreatePayload {
  body: string;
  parent_id?: string | null;
}

export interface SalonCommentUpdatePayload {
  body: string;
}

export interface SalonEventCreatePayload {
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  is_public?: boolean;
  capacity?: number | null;
}

export interface SalonEventUpdatePayload {
  title?: string | null;
  description?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  is_public?: boolean | null;
  capacity?: number | null;
}

export interface SalonEventAttendPayload {
  status?: string | null;
  note?: string | null;
}

export type SalonAssetUploadRequest = SalonAssetUploadPayload;
export type SalonAssetMetadataRequest = SalonAssetMetadataPayload;

export type SalonAnnouncementCreateRequest = SalonAnnouncementCreatePayload;
export type SalonAnnouncementUpdateRequest = SalonAnnouncementUpdatePayload;

export type SalonRoleCreateRequest = SalonRoleCreatePayload;
export type SalonRoleUpdateRequest = SalonRoleUpdatePayload;
export type SalonRoleAssignRequest = SalonRoleAssignPayload;
