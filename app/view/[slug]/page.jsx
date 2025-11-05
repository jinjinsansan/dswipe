import LPViewerClient from './LPViewerClient';

export const revalidate = 300;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://swipe.dlogicai.in';

async function fetchLPMetadata(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/public/${slug}?track_view=false`, {
      next: { revalidate },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to load LP metadata:', error);
    return null;
  }
}

function normalizeLpPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const steps = Array.isArray(payload.steps) ? payload.steps : [];
  const sortedSteps = [...steps].sort((a, b) => {
    const orderA = typeof a?.step_order === 'number' ? a.step_order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b?.step_order === 'number' ? b.step_order : Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const validSteps = sortedSteps.filter((step) => {
    const hasValidBlockType = typeof step?.block_type === 'string' && step.block_type.trim().length > 0;
    const hasValidImageUrl = typeof step?.image_url === 'string' && step.image_url.trim().length > 0;
    return hasValidBlockType || hasValidImageUrl;
  });

  return {
    ...payload,
    steps: validSteps,
    ctas: Array.isArray(payload.ctas) ? payload.ctas : [],
  };
}

function mapPublicProducts(rawList) {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item) => {
      if (!item) return null;

      const pricePointsRaw = item.price_in_points;
      const priceYenRaw = item.price_jpy;
      const taxRateRaw = item.tax_rate;
      const stockRaw = item.stock_quantity;
      const createdAt = typeof item.created_at === 'string' ? item.created_at : new Date().toISOString();
      const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : createdAt;

      return {
        id: String(item.id ?? ''),
        seller_id: String(item.seller_id ?? ''),
        lp_id: item.lp_id ?? undefined,
        product_type: (item.product_type === 'salon' ? 'salon' : 'points'),
        salon_id: item.salon_id ?? undefined,
        title: item.title ?? '',
        description: item.description ?? undefined,
        price_in_points: Number.isFinite(Number(pricePointsRaw)) ? Number(pricePointsRaw) : 0,
        price_jpy: Number.isFinite(Number(priceYenRaw)) ? Number(priceYenRaw) : null,
        allow_point_purchase: Boolean(item.allow_point_purchase ?? false),
        allow_jpy_purchase: Boolean(item.allow_jpy_purchase ?? false),
        tax_rate: taxRateRaw === null || taxRateRaw === undefined ? undefined : Number(taxRateRaw),
        tax_inclusive: Boolean(item.tax_inclusive ?? true),
        stock_quantity:
          stockRaw === null || stockRaw === undefined || stockRaw === ''
            ? null
            : Number(stockRaw),
        is_available: Boolean(item.is_available ?? false),
        is_featured: Boolean(item.is_featured ?? false),
        total_sales: Number.isFinite(Number(item.total_sales)) ? Number(item.total_sales) : 0,
        created_at: createdAt,
        updated_at: updatedAt,
      };
    })
    .filter((product) => product && product.is_available);
}

async function fetchInitialBundle(slug) {
  const lpData = await fetchLPMetadata(slug);
  if (!lpData) {
    return { lp: null, products: [] };
  }

  let products = [];
  const lpId = lpData?.id;
  if (lpId) {
    try {
      const query = new URLSearchParams({ lp_id: String(lpId), limit: '20' });
      const response = await fetch(`${API_BASE_URL}/products/public?${query.toString()}`, {
        next: { revalidate },
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        products = mapPublicProducts(list);
      }
    } catch (error) {
      console.error('Failed to prefetch LP products:', error);
    }
  }

  return {
    lp: normalizeLpPayload(lpData),
    products,
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const lpData = await fetchLPMetadata(slug);

  if (!lpData) {
    return {
      title: 'ランディングページ',
      description: 'D-swipeで作成されたランディングページ',
      openGraph: {
        title: 'ランディングページ',
        description: 'D-swipeで作成されたランディングページ',
        url: `${SITE_ORIGIN}/view/${slug}`,
        siteName: 'D-swipe',
      },
      twitter: {
        card: 'summary',
        title: 'ランディングページ',
        description: 'D-swipeで作成されたランディングページ',
      },
    };
  }

  const fallbackTitle = `${lpData.title ?? 'ランディングページ'} | D-swipe`;
  const fallbackDescription = lpData.description || lpData.meta_description || 'デジタルコンテンツ向けランディングページをD-swipeで作成。';

  const heroStep = Array.isArray(lpData.steps)
    ? lpData.steps.find((step) => {
        const type = step?.block_type || step?.content_data?.block_type;
        return typeof type === 'string' && type.includes('hero');
      }) || lpData.steps[0]
    : null;

  const heroImageCandidates = heroStep
    ? [
        heroStep?.content_data?.imageUrl,
        heroStep?.content_data?.image_url,
        heroStep?.content_data?.heroImage,
        heroStep?.image_url,
        heroStep?.imageUrl,
      ]
    : [];

  let resolvedImage = lpData.meta_image_url || null;
  if (!resolvedImage) {
    for (const candidate of heroImageCandidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        resolvedImage = candidate;
        break;
      }
    }
  }

  const metaTitle = lpData.meta_title || fallbackTitle;
  const metaDescription = lpData.meta_description || fallbackDescription;
  const metaSiteName = lpData.meta_site_name || 'D-swipe';

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${SITE_ORIGIN}/view/${slug}`,
      siteName: metaSiteName,
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
    },
    twitter: {
      card: resolvedImage ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export default async function LPViewerPageComponent({ params }) {
  const resolvedParams = await params;
  const slugParam = resolvedParams?.slug;
  const slug = typeof slugParam === 'string' ? slugParam : '';

  const { lp: initialLp, products: initialProducts } = await fetchInitialBundle(slug);

  return <LPViewerClient slug={slug} initialLp={initialLp} initialProducts={initialProducts} />;
}
