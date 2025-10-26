import { lpApi, publicApi } from '@/lib/api';
import { TEMPLATE_LIBRARY } from '@/lib/templates';
import type { LandingPage, LPStep } from '@/types';
import type { BlockType } from '@/types/templates';

export type HeroMedia = { type: 'image' | 'video'; url: string };

type StepLike = Partial<LPStep> & {
  block_type?: string | null;
  content_data?: Record<string, unknown>;
  image_url?: string | null;
  imageUrl?: string | null;
  video_url?: string | null;
  videoUrl?: string | null;
  backgroundVideoUrl?: string | null;
  background_video_url?: string | null;
  backgroundImageUrl?: string | null;
  background_image_url?: string | null;
  heroImage?: string | null;
  hero_image?: string | null;
  primaryImageUrl?: string | null;
  primary_image_url?: string | null;
  media?: Record<string, unknown>;
  visual?: Record<string, unknown>;
};

type SellerInfo = { username?: string | null } | null | undefined;

type LandingPageLike = LandingPage & {
  heroMedia?: HeroMedia;
  heroImage?: string | null;
  heroVideo?: string | null;
  image_url?: string | null;
  owner?: SellerInfo;
  user?: SellerInfo;
  seller_username?: string | null;
  username?: string | null;
  steps?: StepLike[];
};

const pickFirstString = (values: Array<string | null | undefined>): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
};

const asStepArray = (value: unknown): StepLike[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is StepLike => typeof item === 'object' && item !== null);
};

const asString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const createPlaceholderThumbnail = (title: string, accentHex?: string | null): HeroMedia => {
  const safeTitle = (title || '').trim() || 'Launch Page';
  const initials = safeTitle.replace(/\s+/g, '').slice(0, 2).toUpperCase() || 'LP';
  const sanitizedAccent = (accentHex || '').trim();
  const accent = /^#([0-9A-Fa-f]{3}){1,2}$/.test(sanitizedAccent) ? sanitizedAccent : '#2563EB';
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.65" />
    </linearGradient>
  </defs>
  <rect width="600" height="360" fill="url(#grad)" rx="32" ry="32" />
  <text x="48" y="118" font-family="'Inter', 'Noto Sans JP', sans-serif" font-weight="600" font-size="40" fill="rgba(248, 250, 252, 0.92)">
    ${safeTitle.replace(/[<>]/g, '')}
  </text>
  <text x="48" y="204" font-family="'Inter', 'Noto Sans JP', sans-serif" font-weight="300" font-size="24" fill="rgba(248, 250, 252, 0.78)">
    Custom LP Preview
  </text>
  <circle cx="520" cy="86" r="52" fill="rgba(248, 250, 252, 0.2)" />
  <text x="520" y="100" text-anchor="middle" font-family="'Inter', 'Noto Sans JP', sans-serif" font-weight="700" font-size="34" fill="#0F172A">
    ${initials}
  </text>
</svg>`;

  return {
    type: 'image',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
  };
};

const extractMediaFromStep = (step: StepLike | null | undefined, title: string, accent?: string | null): HeroMedia => {
  if (!step) {
    return createPlaceholderThumbnail(title, accent);
  }

  // SIMPLE APPROACH: Direct access to content_data (same as dashboard)
  const contentData = step?.content_data;

  // Check 1: content_data.backgroundVideoUrl (most common for hero blocks)
  if (contentData?.backgroundVideoUrl && typeof contentData.backgroundVideoUrl === 'string') {
    return { type: 'video', url: contentData.backgroundVideoUrl };
  }

  // Check 2: content_data.backgroundImageUrl (for image-based heroes)
  if (contentData?.backgroundImageUrl && typeof contentData.backgroundImageUrl === 'string') {
    return { type: 'image', url: contentData.backgroundImageUrl };
  }

  // Check 3: step.video_url (direct DB field)
  if (step.video_url && typeof step.video_url === 'string') {
    return { type: 'video', url: step.video_url };
  }

  // Check 4: step.image_url (direct DB field, but skip placeholder)
  if (step.image_url && typeof step.image_url === 'string' && step.image_url !== '/placeholder.jpg') {
    return { type: 'image', url: step.image_url };
  }

  // Check 5: Fallback to template default media by ID
  const blockType = step?.block_type;
  if (blockType) {
    const template = TEMPLATE_LIBRARY.find((item) => item.id === blockType || item.templateId === blockType);
    if (template?.defaultContent) {
      const defaultContent = template.defaultContent as any;
      if (defaultContent.backgroundVideoUrl) {
        return { type: 'video', url: defaultContent.backgroundVideoUrl };
      }
      if (defaultContent.backgroundImageUrl) {
        return { type: 'image', url: defaultContent.backgroundImageUrl };
      }
    }
  }

  // Last resort: placeholder
  return createPlaceholderThumbnail(title, accent);
};

const selectHeroStep = (steps: StepLike[]): StepLike | null => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  const heroStep = steps.find((step) => {
    const directType = asString(step.block_type);
    const contentType = asString(asRecord(step.content_data)?.block_type);
    const candidate = directType ?? contentType;
    return typeof candidate === 'string' && candidate.includes('hero');
  });

  if (heroStep) {
    return heroStep;
  }

  const auroraStep = steps.find((step) => asString(step.block_type) === 'image-aurora-1');
  if (auroraStep) {
    return auroraStep;
  }

  return steps[0];
};

const extractSellerUsername = (source: SellerInfo): string | null => {
  if (!source || typeof source !== 'object') {
    return null;
  }
  return asString(source.username);
};

export const resolveSellerUsername = (lp: LandingPageLike | null | undefined): string | null => {
  if (!lp) {
    return null;
  }

  return (
    extractSellerUsername(lp.owner) ??
    extractSellerUsername(lp.user) ??
    asString(lp.seller_username) ??
    asString(lp.username)
  );
};

type EnrichedLandingPage = LandingPageLike & {
  heroMedia: HeroMedia;
  heroImage: string | null;
  heroVideo: string | null;
  seller_username?: string;
};

export const enrichLpsWithHeroMedia = async (
  lps: LandingPageLike[]
): Promise<EnrichedLandingPage[]> => {
  const results = await Promise.all(
    lps.map(async (lp) => {
      try {
        let detailData: LandingPageLike | null = null;
        let steps: StepLike[] = [];

        if (lp.slug) {
          try {
            const publicResponse = await publicApi.getLP(lp.slug, { trackView: false });
            const publicData = publicResponse.data as LandingPageLike;
            detailData = publicData;
            steps = asStepArray(publicData.steps);
          } catch (publicError) {
            console.warn('Failed to fetch public LP data for preview:', publicError);
          }
        }

        if (!detailData) {
          const detailResponse = await lpApi.get(lp.id);
          detailData = detailResponse.data as LandingPageLike;
          steps = asStepArray(detailData.steps);
        }

        const heroStep = selectHeroStep(steps);
        const media = extractMediaFromStep(heroStep, lp.title, lp.custom_theme_hex ?? null);
        const sellerUsername = resolveSellerUsername(detailData) ?? resolveSellerUsername(lp);
        const fallbackImage = asString(lp.heroImage) ?? asString(lp.image_url);
        const sellerSlug = sellerUsername ?? asString(lp.seller_username) ?? undefined;

        const enriched: EnrichedLandingPage = {
          ...lp,
          heroMedia: media,
          heroImage: media.type === 'image' ? media.url : fallbackImage,
          heroVideo: media.type === 'video' ? media.url : null,
          seller_username: sellerSlug,
        };
        return enriched;
      } catch {
        const media = createPlaceholderThumbnail(lp.title, lp.custom_theme_hex ?? null);
        const sellerUsername = resolveSellerUsername(lp);
        const sellerSlug = sellerUsername ?? asString(lp.seller_username) ?? undefined;
        const enriched: EnrichedLandingPage = {
          ...lp,
          heroMedia: media,
          heroImage: media.url,
          heroVideo: null,
          seller_username: sellerSlug,
        };
        return enriched;
      }
    })
  );

  return results;
};
