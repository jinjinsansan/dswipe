import Link from 'next/link';
import NoteDetailClient from '@/components/note/NoteDetailClient';

type NoteDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
              NOTEダッシュボード
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
