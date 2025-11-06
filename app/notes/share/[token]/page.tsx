import Link from 'next/link';
import { Metadata } from 'next';
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

  if (!note) {
    return {
      title: '限定公開NOTE | D-swipe',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = note.title || '限定公開NOTE';
  const description = note.excerpt || '限定共有リンクを知っている人だけが閲覧できるNOTEです。';
  const coverImage = note.cover_image_url || 'https://d-swipe.com/og-default.svg';
  const url = `https://d-swipe.com/notes/share/${token}`;

  return {
    title: `${title} | 限定公開NOTE`,
    description,
    robots: {
      index: false,
      follow: false,
    },
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
      locale: 'ja_JP',
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
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            ← NOTE一覧に戻る
          </Link>
        </header>
        <section className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-6 shadow-sm sm:px-6">
          <NoteDetailClient shareToken={token} />
        </section>
      </div>
    </main>
  );
}
