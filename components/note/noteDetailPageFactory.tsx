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
  ja: '有料NOTEをXでシェアして無料で読もう！',
  en: 'Share premium NOTE articles on X and unlock them for free!',
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
      title: locale === 'ja' ? 'NOTE - D-swipe' : 'NOTE | D-swipe',
    };
  }

  const title = note.title || 'NOTE';
  const description = note.excerpt || fallbackDescription[locale];
  const coverImage = note.cover_image_url || 'https://d-swipe.com/og-default.svg';

  return {
    title: `${title} | D-swipe NOTE`,
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
import type { Metadata } from 'next';

import NoteDetailClient from '@/components/note/NoteDetailClient';
import { getNoteDetailMessages } from '@/lib/i18n/noteMessages';
import { Locale } from '@/lib/i18n/locales';

type NoteDetailPageProps = {
  params: Promise<{ slug: string }>;
};

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

export function createNoteDetailPage(locale: Locale, options?: { basePath?: string }) {
  const basePath = options?.basePath ?? '';
  const messages = getNoteDetailMessages(locale);

  const makeCanonicalUrl = (slug: string) => {
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://d-swipe.com').replace(/\/$/, '');
    const normalizedBase = basePath && basePath !== '/' ? basePath : '';
    return `${origin}${normalizedBase}/notes/${slug}`;
  };

  async function generateMetadata({ params }: NoteDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const note = await getNoteData(slug);

    if (!note) {
      return {
        title: locale === 'ja' ? 'NOTE - D-swipe' : 'NOTE | D-swipe',
      };
    }

    const title = note.title || 'NOTE';
    const description = note.excerpt || (locale === 'ja' ? '有料NOTEをXでシェアして無料で読もう！' : 'Share premium NOTE articles on X and unlock them for free!');
    const coverImage = note.cover_image_url || 'https://d-swipe.com/og-default.svg';
    const url = makeCanonicalUrl(slug);

    return {
      title: `${title} | D-swipe NOTE`,
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
        locale: locale === 'ja' ? 'ja_JP' : 'en_US',
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

  async function Page({ params }: NoteDetailPageProps) {
    const { slug } = await params;

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <NoteDetailClient.Header locale={locale} basePath={basePath} />
          </header>

          <section className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-6 shadow-sm sm:px-6">
            <NoteDetailClient slug={slug} locale={locale} basePath={basePath} messages={messages} />
          </section>
        </div>
      </main>
    );
  }

  return { generateMetadata, Page };
}
