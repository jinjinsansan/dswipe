import { Metadata } from 'next';

import NoteDetailClient from '@/components/note/NoteDetailClient';
import {getNoteDetailMetadata} from '@/components/note/noteDetailPageFactory';

type NoteDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: NoteDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getNoteDetailMetadata(slug, 'en', '/en');
}

export default async function NoteDetailPageEn({ params }: NoteDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-6 shadow-sm sm:px-6">
          <NoteDetailClient slug={slug} basePath="/en" />
        </section>
      </div>
    </main>
  );
}
