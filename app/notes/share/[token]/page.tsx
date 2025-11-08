import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import NoteDetailClient from '@/components/note/NoteDetailClient';

type NoteSharePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const revalidate = 180;

async function getNoteData(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
  try {
    const response = await fetch(`${apiUrl}/notes/share/${token}`, {
      next: { revalidate },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch limited note data for metadata:', error);
  }
  return null;
}

export async function generateMetadata({ params }: NoteSharePageProps): Promise<Metadata> {
  const { token } = await params;
  const note = await getNoteData(token);
  const locale = await getLocale();
  const t = await getTranslations('noteShare.metadata');
  const localeCode = locale === 'en' ? 'en_US' : 'ja_JP';
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://d-swipe.com').replace(/\/$/, '');
  const url = `${origin}/notes/share/${token}`;

  if (!note) {
    return {
      title: t('notFoundTitle'),
      description: t('notFoundDescription'),
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: t('notFoundTitle'),
        description: t('notFoundDescription'),
        url,
        siteName: t('siteName'),
        locale: localeCode,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: t('notFoundTitle'),
        description: t('notFoundDescription'),
      },
    };
  }

  const title = note.title || t('defaultTitle');
  const description = note.excerpt || t('defaultDescription');
  const coverImage = note.cover_image_url || 'https://d-swipe.com/og-default.svg';

  return {
    title: t('titleTemplate', { title }),
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: t('siteName'),
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: localeCode,
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

export default async function NoteSharePage({ params }: NoteSharePageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:bg-slate-50 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-4xl px-0 py-0 sm:px-4">
        <NoteDetailClient shareToken={token} />
      </div>
    </main>
  );
}
