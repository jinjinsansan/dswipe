import LPViewerClient from './LPViewerClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://swipe.dlogicai.in';

async function fetchLPMetadata(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/public/${slug}?track_view=false`, {
      next: { revalidate: 60 },
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
  return <LPViewerClient slug={slug} />;
}
