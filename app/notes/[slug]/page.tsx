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
  return getNoteDetailMetadata(slug, 'ja');
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-4xl px-0 py-0 sm:px-4">
        <NoteDetailClient slug={slug} />
      </div>
    </main>
  );
}
