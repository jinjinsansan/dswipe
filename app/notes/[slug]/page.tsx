import Link from 'next/link';
import { Metadata } from 'next';
import NoteDetailClient from '@/components/note/NoteDetailClient';

type NoteDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getNoteData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
  try {
    const response = await fetch(`${apiUrl}/notes/public/${slug}`, {
      next: { revalidate: 60 }, // キャッシュを60秒間保持
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch note data for metadata:', error);
  }
  return null;
}

export async function generateMetadata({ params }: NoteDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteData(slug);
  
  if (!note) {
    return {
      title: 'NOTE - D-swipe',
    };
  }

  const title = note.title || 'NOTE';
  const description = note.excerpt || '有料NOTEをXでシェアして無料で読もう！';
  const coverImage = note.cover_image_url || 'https://d-swipe.com/og-default.svg';
  const url = `https://d-swipe.com/notes/${slug}`;
  
  return {
    title: `${title} | D-swipe NOTE`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: url,
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
      title: title,
      description: description,
      images: [coverImage],
      site: '@Dswipe',
      creator: note.author_username ? `@${note.author_username}` : '@Dswipe',
    },
  };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              ← AllNOTEへ戻る
            </Link>
            <Link
              href="/note"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              NOTE編集
            </Link>
          </nav>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-6 shadow-sm sm:px-6">
          <NoteDetailClient slug={slug} />
        </section>
      </div>
    </main>
  );
}
