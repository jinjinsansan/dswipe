import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export default function SEOHead({
  title,
  description = 'Ｄ－swipe - スワイプ操作で魅せるランディングページ作成プラットフォーム',
  image = '/og-image.png',
  url,
  type = 'website',
}: SEOHeadProps) {
  const siteName = 'Ｄ－swipe';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Head>
      {/* 基本メタタグ */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta charSet="utf-8" />

      {/* OGP (Open Graph Protocol) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* その他 */}
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Head>
  );
}
