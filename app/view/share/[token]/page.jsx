import LPViewerClient from '@/app/view/[slug]/LPViewerClient';

export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  'https://swipe.dlogicai.in';

async function fetchLPMetadata(token) {
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/public/share/${token}?track_view=false`, {
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
    console.error('Failed to load limited LP metadata:', error);
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
        product_type: item.product_type === 'salon' ? 'salon' : 'points',
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

async function fetchInitialBundle(token) {
  const lpData = await fetchLPMetadata(token);
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
      console.error('Failed to prefetch limited LP products:', error);
    }
  }

  return {
    lp: normalizeLpPayload(lpData),
    products,
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const tokenParam = resolvedParams?.token;
  const token = typeof tokenParam === 'string' ? tokenParam : '';

  const lpData = await fetchLPMetadata(token);

  const baseMeta = {
    title: '限定公開ランディングページ',
    description: '限定公開用LPページ',
    robots: {
      index: false,
      follow: false,
    },
  };

  if (!lpData) {
    return {
      ...baseMeta,
      openGraph: {
        title: baseMeta.title,
        description: baseMeta.description,
        url: `${SITE_ORIGIN}/view/share/${token}`,
        siteName: 'D-swipe',
      },
      twitter: {
        card: 'summary',
        title: baseMeta.title,
        description: baseMeta.description,
      },
    };
  }

  const fallbackTitle = `${lpData.title ?? '限定公開LP'} | D-swipe`;
  const fallbackDescription =
    lpData.description || lpData.meta_description || 'D-swipeで作成された限定公開のランディングページです。';

  const heroStep = Array.isArray(lpData.steps)
    ? lpData.steps.find((step) => {
        const type = step?.block_type || step?.content_data?.block_type;
        return typeof type === 'string' && type.includes('hero');
      }) || lpData.steps[0]
    : null;

  const ogImageFromStep = (() => {
    if (!heroStep) return null;
    const contentData = heroStep?.content_data ?? {};
    if (typeof heroStep?.image_url === 'string' && heroStep.image_url.trim().length > 0) {
      return heroStep.image_url;
    }
    if (typeof contentData?.image === 'string' && contentData.image.trim().length > 0) {
      return contentData.image;
    }
    if (typeof contentData?.backgroundImage === 'string' && contentData.backgroundImage.trim().length > 0) {
      return contentData.backgroundImage;
    }
    return null;
  })();

  const ogImage = lpData.meta_image_url || ogImageFromStep || `${SITE_ORIGIN}/ogp-default.png`;

  return {
    ...baseMeta,
    title: fallbackTitle,
    description: fallbackDescription,
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
      url: `${SITE_ORIGIN}/view/share/${token}`,
      siteName: 'D-swipe',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: fallbackTitle,
      description: fallbackDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function LimitedLPViewerPage({ params }) {
  const resolvedParams = await params;
  const tokenParam = resolvedParams?.token;
  const token = typeof tokenParam === 'string' ? tokenParam : '';

  const { lp: initialLp, products: initialProducts } = await fetchInitialBundle(token);
  const slug = typeof initialLp?.slug === 'string' ? initialLp.slug : '';

  return (
    <LPViewerClient
      slug={slug}
      shareToken={token}
      initialLp={initialLp}
      initialProducts={initialProducts}
    />
  );
}
