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
      <div className="mx-auto w-full max-w-4xl">
        <NoteDetailClient slug={slug} basePath="/en" />
      </div>
    </main>
  );
}
