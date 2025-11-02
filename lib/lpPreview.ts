import { lpApi, publicApi } from '@/lib/api';
import { TEMPLATE_LIBRARY } from '@/lib/templates';
import type { LandingPage, LPStep } from '@/types';

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

const safeGet = (source: unknown, key: string): unknown => {
  return typeof source === 'object' && source !== null ? (source as Record<string, unknown>)[key] : undefined;
};

const getNestedString = (source: unknown, path: string[]): string | null => {
  let current: unknown = source;
  for (const key of path) {
    if (current === undefined || current === null) {
      return null;
    }
    current = safeGet(current, key);
  }
  return asString(current);
};

const normalizeContent = (raw: unknown): Record<string, unknown> => {
  if (!raw) {
    return {};
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return asRecord(parsed) ?? {};
    } catch {
      return {};
    }
  }
  return asRecord(raw) ?? {};
};

const resolveBlockType = (step: StepLike | null | undefined): string | null => {
  if (!step) {
    return null;
  }
  const direct = asString(step.block_type);
  if (direct) {
    return direct;
  }
  return getNestedString(step.content_data, ['block_type']);
};

const pickFirstString = (candidates: unknown[]): string | null => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
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

  const contentData = normalizeContent(step.content_data);

  const imageUrl = pickFirstString([
    getNestedString(contentData, ['imageUrl']),
    getNestedString(contentData, ['image_url']),
    getNestedString(contentData, ['heroImage']),
    getNestedString(contentData, ['hero_image']),
    getNestedString(contentData, ['primaryImageUrl']),
    getNestedString(contentData, ['primary_image_url']),
    getNestedString(contentData, ['backgroundImageUrl']),
    getNestedString(contentData, ['background_image_url']),
    getNestedString(contentData, ['media', 'imageUrl']),
    getNestedString(contentData, ['media', 'image_url']),
    getNestedString(contentData, ['visual', 'imageUrl']),
    getNestedString(contentData, ['visual', 'image_url']),
    asString(step.image_url),
    asString(step.imageUrl),
    asString(step.heroImage),
    asString(step.hero_image),
    asString(step.primaryImageUrl),
    asString(step.primary_image_url),
  ]);

  if (imageUrl && imageUrl !== '/placeholder.jpg') {
    return { type: 'image', url: imageUrl };
  }

  const videoUrl = pickFirstString([
    getNestedString(contentData, ['backgroundVideoUrl']),
    getNestedString(contentData, ['background_video_url']),
    getNestedString(contentData, ['videoUrl']),
    getNestedString(contentData, ['video_url']),
    getNestedString(contentData, ['media', 'videoUrl']),
    getNestedString(contentData, ['media', 'video_url']),
    getNestedString(contentData, ['visual', 'videoUrl']),
    getNestedString(contentData, ['visual', 'video_url']),
    asString(step.backgroundVideoUrl),
    asString(step.background_video_url),
    asString(step.videoUrl),
    asString(step.video_url),
  ]);

  if (videoUrl) {
    return { type: 'video', url: videoUrl };
  }

  const blockType = resolveBlockType(step);
  if (blockType) {
    const template = TEMPLATE_LIBRARY.find((item) => item.id === blockType || item.templateId === blockType);
    if (template?.defaultContent) {
      const defaultContent = normalizeContent(template.defaultContent);
      const templateImage = pickFirstString([
        getNestedString(defaultContent, ['backgroundImageUrl']),
        getNestedString(defaultContent, ['background_image_url']),
        getNestedString(defaultContent, ['heroImage']),
        getNestedString(defaultContent, ['imageUrl']),
      ]);
      if (templateImage) {
        return { type: 'image', url: templateImage };
      }
      const templateVideo = pickFirstString([
        getNestedString(defaultContent, ['backgroundVideoUrl']),
        getNestedString(defaultContent, ['background_video_url']),
        getNestedString(defaultContent, ['videoUrl']),
      ]);
      if (templateVideo) {
        return { type: 'video', url: templateVideo };
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
