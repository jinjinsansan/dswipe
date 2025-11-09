import type { Metadata } from 'next';

type SupportedLocale = 'ja' | 'en';

export const revalidate = 300;

async function getNoteData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
  try {
    const response = await fetch(`${apiUrl}/notes/public/${slug}`, {
      next: { revalidate },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch note data for metadata:', error);
  }
  return null;
}

const fallbackDescription: Record<SupportedLocale, string> = {
  ja: '有料SwipeコラムをXでシェアして無料で読もう！',
  en: 'Share premium Swipe Columns on X and unlock them for free!',
};

const localeCode: Record<SupportedLocale, string> = {
  ja: 'ja_JP',
  en: 'en_US',
};

export async function getNoteDetailMetadata(
  slug: string,
  locale: SupportedLocale,
  basePath = ''
): Promise<Metadata> {
  const note = await getNoteData(slug);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://d-swipe.com').replace(/\/$/, '');
  const normalizedBase = basePath && basePath !== '/' ? basePath : '';
  const url = `${origin}${normalizedBase}/notes/${slug}`;

  if (!note) {
    return {
      title: locale === 'ja' ? 'Swipeコラム - D-swipe' : 'Swipe Column | D-swipe',
    };
  }

  const fallbackTitle = locale === 'ja' ? 'Swipeコラム' : 'Swipe Column';
  const brandSuffix = locale === 'ja' ? 'D-swipe Swipeコラム' : 'D-swipe Swipe Column';

  const title = note.title || fallbackTitle;
  const description = note.excerpt || fallbackDescription[locale];
  const coverImage = note.cover_image_url || 'https://d-swipe.com/og-default.svg';

  return {
    title: `${title} | ${brandSuffix}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'D-swipe',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: localeCode[locale],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImage],
      site: '@Dswipe',
      creator: note.author_username ? `@${note.author_username}` : '@Dswipe',
    },
  };
}
